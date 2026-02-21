import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import AuditLog from '../models/AuditLog.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorize(USER_ROLES.ADMIN));

// Configure multer for CSV upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Get all users with filtering and search
router.get('/users', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    query('search').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (req.query.role) {
            query.role = req.query.role;
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .populate('projectId', 'name')
                .populate('createdBy', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            User.countDocuments(query)
        ]);

        successResponse(res, HTTP_STATUS.OK, 'Users retrieved successfully', {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('projectId')
            .populate('createdBy', 'firstName lastName email');

        if (!user) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'User retrieved successfully', { user });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Create user
router.post('/users', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
    body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const { firstName, lastName, email, phone, password, role, projectId, isActive } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User with this email or phone already exists');
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
            projectId,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user.id
        });

        await user.save();

        // Log audit
        await logAudit('USER_CREATE', req.user.id, {
            targetUser: user._id,
            details: { role, email }
        }, req);

        successResponse(res, HTTP_STATUS.CREATED, 'User created successfully', { user: user.toJSON() });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Update user
router.put('/users/:id', [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('role').optional().isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
    body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        const updates = {};
        const auditDetails = {};

        // Check for email/phone uniqueness if being updated
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Email already in use');
            }
            updates.email = req.body.email;
            auditDetails.emailChanged = true;
        }

        if (req.body.phone && req.body.phone !== user.phone) {
            const existingUser = await User.findOne({ phone: req.body.phone });
            if (existingUser) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Phone already in use');
            }
            updates.phone = req.body.phone;
            auditDetails.phoneChanged = true;
        }

        // Update allowed fields
        const allowedUpdates = ['firstName', 'lastName', 'role', 'projectId', 'isActive'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
                if (field === 'role') {
                    auditDetails.roleChanged = { from: user.role, to: req.body[field] };
                }
            }
        });

        Object.assign(user, updates);
        await user.save();

        // Log audit
        const action = auditDetails.roleChanged ? 'USER_ROLE_CHANGE' : 'USER_UPDATE';
        await logAudit(action, req.user.id, {
            targetUser: user._id,
            details: auditDetails
        }, req);

        successResponse(res, HTTP_STATUS.OK, 'User updated successfully', { user: user.toJSON() });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user.id) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Cannot delete your own account');
        }

        user.isActive = false;
        await user.save();

        // Log audit
        await logAudit('USER_DELETE', req.user.id, {
            targetUser: user._id,
            details: { email: user.email, role: user.role }
        }, req);

        successResponse(res, HTTP_STATUS.OK, 'User deactivated successfully');
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Bulk user import from CSV
router.post('/users/bulk-import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'CSV file is required');
        }

        const users = [];
        const errors = [];
        let lineNumber = 1;

        // Parse CSV
        const stream = Readable.from(req.file.buffer.toString());

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (row) => {
                    lineNumber++;

                    // Validate required fields
                    if (!row.firstName || !row.lastName || !row.email || !row.phone || !row.password || !row.role) {
                        errors.push({ line: lineNumber, error: 'Missing required fields', row });
                        return;
                    }

                    // Validate role
                    if (!Object.values(USER_ROLES).includes(row.role)) {
                        errors.push({ line: lineNumber, error: 'Invalid role', row });
                        return;
                    }

                    users.push({
                        firstName: row.firstName.trim(),
                        lastName: row.lastName.trim(),
                        email: row.email.trim().toLowerCase(),
                        phone: row.phone.trim(),
                        password: row.password.trim(),
                        role: row.role.trim(),
                        projectId: row.projectId?.trim() || undefined,
                        createdBy: req.user.id
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (users.length === 0) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'No valid users found in CSV', { errors });
        }

        // Check for duplicate emails/phones in the CSV
        const emails = users.map(u => u.email);
        const phones = users.map(u => u.phone);
        const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
        const duplicatePhones = phones.filter((phone, index) => phones.indexOf(phone) !== index);

        if (duplicateEmails.length > 0) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Duplicate emails found in CSV', { duplicateEmails });
        }

        if (duplicatePhones.length > 0) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Duplicate phones found in CSV', { duplicatePhones });
        }

        // Check for existing users in database
        const existingUsers = await User.find({
            $or: [
                { email: { $in: emails } },
                { phone: { $in: phones } }
            ]
        }, 'email phone');

        if (existingUsers.length > 0) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Some users already exist', {
                existingUsers: existingUsers.map(u => ({ email: u.email, phone: u.phone }))
            });
        }

        // Insert users
        const createdUsers = await User.insertMany(users);

        // Log audit
        await logAudit('BULK_USER_IMPORT', req.user.id, {
            details: { count: createdUsers.length, errors: errors.length }
        }, req);

        successResponse(res, HTTP_STATUS.CREATED, 'Bulk import completed', {
            created: createdUsers.length,
            errors: errors.length,
            errorDetails: errors
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            usersByRole,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('createdBy', 'firstName lastName')
        ]);

        const roleStats = {};
        usersByRole.forEach(item => {
            roleStats[item._id] = item.count;
        });

        successResponse(res, HTTP_STATUS.OK, 'Dashboard stats retrieved successfully', {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            roleStats,
            recentUsers
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Get audit logs
router.get('/audit-logs', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('action').optional().trim(),
    query('userId').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.action) {
            query.action = req.query.action;
        }
        if (req.query.userId) {
            query.$or = [
                { performedBy: req.query.userId },
                { targetUser: req.query.userId }
            ];
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('performedBy', 'firstName lastName email')
                .populate('targetUser', 'firstName lastName email')
                .populate('targetProject', 'name')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            AuditLog.countDocuments(query)
        ]);

        successResponse(res, HTTP_STATUS.OK, 'Audit logs retrieved successfully', {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// GET /admin/escalations - Get all escalated leads across all projects
router.get('/escalations', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('projectId').optional().isMongoId().withMessage('Invalid project ID'),
    query('status').optional().trim(),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter for escalated leads
        const filter = { 
            deletedAt: null,
            $or: [
                { isEscalated: true },
                { escalationStage: { $gt: 0 } }
            ]
        };

        if (req.query.projectId) filter.projectId = req.query.projectId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;

        const [escalations, total, projects] = await Promise.all([
            Lead.find(filter)
                .populate('referralId', 'referrerName referrerPhone')
                .populate('assignedToId', 'firstName lastName email')
                .populate('sourceAdvocateId', 'firstName lastName')
                .populate('projectId', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ priority: -1, escalationStage: -1, escalatedDate: -1 }),
            Lead.countDocuments(filter),
            Project.find({}).select('name')
        ]);

        // Format escalations for frontend
        const formattedEscalations = escalations.map(lead => ({
            _id: lead._id,
            customerName: lead.referralId?.referrerName || 'Unknown',
            phone: lead.referralId?.referrerPhone || lead.phoneNumber || 'N/A',
            status: lead.status,
            priority: lead.priority,
            escalationStage: lead.escalationStage,
            escalatedDate: lead.escalatedDate,
            escalationReason: lead.escalationReason,
            assignedTo: lead.assignedToId ? `${lead.assignedToId.firstName} ${lead.assignedToId.lastName}` : 'Unassigned',
            sourceAdvocate: lead.sourceAdvocateId ? `${lead.sourceAdvocateId.firstName} ${lead.sourceAdvocateId.lastName}` : 'N/A',
            projectName: lead.projectId?.name || 'Unknown Project',
            projectId: lead.projectId?._id,
            createdAt: lead.createdAt,
            escalationHistory: lead.escalationHistory || []
        }));

        successResponse(res, HTTP_STATUS.OK, 'Escalations retrieved successfully', {
            escalations: formattedEscalations,
            projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin escalations error:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

export default router;
