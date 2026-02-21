import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Escalation from '../models/Escalation.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const normalizeEmail = (email) => {
    const trimmed = email?.trim();
    return trimmed ? trimmed.toLowerCase() : undefined;
};

const normalizePhone = (phone) => phone?.trim();

const splitCustomerName = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || 'Customer';
    const lastName = parts.slice(1).join(' ') || 'Customer';
    return { firstName, lastName };
};

const buildAdvocatePassword = (name, phone) => {
    const digits = (phone || '').replace(/\D/g, '');
    const last4 = digits.slice(-4).padStart(4, '0');
    const namePart = (name || '').trim().split(/\s+/)[0] || 'Customer';
    const safeName = namePart.replace(/[^a-zA-Z0-9]/g, '') || 'Customer';
    let password = `${safeName}${last4}`;
    if (password.length < 6) {
        password = `${password}Adv`;
    }
    return password;
};

const buildAdvocateUserPayload = (customer, projectId, builderId) => {
    const normalizedEmail = normalizeEmail(customer.email);
    const normalizedPhone = normalizePhone(customer.phone);
    const { firstName, lastName } = splitCustomerName(customer.name);

    return {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: buildAdvocatePassword(customer.name, normalizedPhone),
        role: USER_ROLES.PROJECT_ADVOCATE,
        projectId,
        createdBy: builderId,
    };
};

const findExistingUser = async (email, phone) => {
    const query = [];
    if (email) {
        query.push({ email });
    }
    if (phone) {
        query.push({ phone });
    }
    if (query.length === 0) {
        return null;
    }

    return User.findOne({ $or: query });
};

// Middleware: Verify builder access
const verifyBuilder = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'builder') {
            return errorResponse(res, 403, 'Access denied. Builder role required.');
        }
        next();
    } catch (error) {
        errorResponse(res, 500, 'Server error');
    }
};

// Setup multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Only CSV files are allowed'));
        }
        cb(null, true);
    },
});

// ============ PROJECT ENDPOINTS ============

// GET /builder/projects - Get builder's projects
router.get('/projects', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const builderId = new mongoose.Types.ObjectId(req.user.id);

        // Query by builder field OR createdBy — covers all assignment patterns
        const projects = await Project.find({
            $or: [
                { builder: builderId },
                { createdBy: builderId }
            ]
        }).sort({ createdAt: -1 });

        const project = projects.length > 0 ? projects[0] : null;

        successResponse(res, 200, 'Projects retrieved successfully', {
            projects,
            project,
        });
    } catch (error) {
        console.error('Get projects error:', error);
        errorResponse(res, 500, 'Failed to retrieve project');
    }
});

// ============ CUSTOMER ENDPOINTS ============

// POST /builder/customers - Create single customer
router.post('/customers', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId, name, email, phone, tags, notes } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);

        // Verify project exists and builder has access
        const project = await Project.findById(projectId);
        if (!project || project.builder.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }

        const existingUser = await findExistingUser(normalizedEmail, normalizedPhone);
        if (existingUser) {
            return errorResponse(res, 409, 'Customer login already exists for this phone or email', {
                existingUser: {
                    id: existingUser._id,
                    email: existingUser.email,
                    phone: existingUser.phone,
                },
            });
        }

        // Generate unique referral code
        const referralCode = `${projectId.slice(-8)}_${Date.now()}`.toUpperCase();

        const advocateUser = new User(
            buildAdvocateUserPayload(
                { name, email: normalizedEmail, phone: normalizedPhone },
                projectId,
                req.user.id
            )
        );

        await advocateUser.save();

        const customer = new Customer({
            projectId,
            builderId: req.user.id,
            name,
            email: normalizedEmail,
            phone: normalizedPhone,
            referralCode,
            tags: tags || [],
            notes,
            source: 'manual',
        });

        try {
            await customer.save();
        } catch (error) {
            await User.deleteOne({ _id: advocateUser._id });
            throw error;
        }

        successResponse(res, 201, 'Customer created successfully', {
            customer,
            loginCreated: true,
        });
    } catch (error) {
        console.error('Create customer error:', error);
        errorResponse(res, 500, 'Failed to create customer');
    }
});

// GET /builder/customers - List customers
router.get('/customers', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId, status, search, page = 1, limit = 20 } = req.query;

        if (!projectId) {
            return errorResponse(res, 400, 'projectId is required');
        }

        // Verify project access
        const project = await Project.findById(projectId);
        if (!project || project.builder.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }

        const filter = { projectId, builderId: req.user.id };

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const customers = await Customer.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(filter);

        successResponse(res, 200, 'Customers retrieved successfully', {
            customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('List customers error:', error);
        errorResponse(res, 500, 'Failed to retrieve customers');
    }
});

// GET /builder/customers/:id - Get customer details
router.get('/customers/:id', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('projectId', 'name')
            .populate('builderId', 'name email');

        if (!customer || customer.builderId._id.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Customer not found or access denied');
        }

        successResponse(res, 200, 'Customer retrieved successfully', customer);
    } catch (error) {
        console.error('Get customer error:', error);
        errorResponse(res, 500, 'Failed to retrieve customer');
    }
});

// PUT /builder/customers/:id - Update customer
router.put('/customers/:id', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { name, email, phone, status, tags, notes } = req.body;

        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.builderId.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Customer not found or access denied');
        }

        // Update fields
        if (name) customer.name = name;
        if (email) customer.email = email;
        if (phone) customer.phone = phone;
        if (status) customer.status = status;
        if (tags) customer.tags = tags;
        if (notes) customer.notes = notes;

        await customer.save();
        successResponse(res, 200, 'Customer updated successfully', customer);
    } catch (error) {
        console.error('Update customer error:', error);
        errorResponse(res, 500, 'Failed to update customer');
    }
});

// DELETE /builder/customers/:id - Soft delete customer
router.delete('/customers/:id', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.builderId.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Customer not found or access denied');
        }

        customer.deletedAt = new Date();
        await customer.save();

        successResponse(res, 200, 'Customer deleted successfully');
    } catch (error) {
        console.error('Delete customer error:', error);
        errorResponse(res, 500, 'Failed to delete customer');
    }
});

// ============ CSV UPLOAD ENDPOINTS ============

// POST /builder/customers/upload - Upload CSV file
router.post(
    '/customers-upload',
    authenticateToken,
    verifyBuilder,
    upload.single('file'),
    async (req, res) => {
        try {
            const { projectId } = req.body;

            if (!projectId) {
                return errorResponse(res, 400, 'projectId is required');
            }

            // Verify project access
            const project = await Project.findById(projectId);
            if (!project || project.builder.toString() !== req.user.id) {
                return errorResponse(res, 404, 'Project not found or access denied');
            }

            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            // Simple CSV parsing (expects: name, email, phone columns)
            const csvContent = fs.readFileSync(req.file.path, 'utf-8');
            const lines = csvContent.split('\n').filter((line) => line.trim());

            if (lines.length < 2) {
                return errorResponse(res, 400, 'CSV file must contain at least header and one data row');
            }

            // Parse header
            const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
            const nameIdx = headers.indexOf('name');
            const emailIdx = headers.indexOf('email');
            const phoneIdx = headers.indexOf('phone');

            if (nameIdx === -1 || phoneIdx === -1) {
                return errorResponse(res, 400, 'CSV must contain "name" and "phone" columns');
            }

            // Parse data rows
            const customers = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map((v) => v.trim());
                if (values.length > 1 && values[0]) {
                    const referralCode = `${projectId.slice(-8)}_${Date.now()}_${i}`.toUpperCase();
                    customers.push({
                        projectId,
                        builderId: req.user.id,
                        name: values[nameIdx] || 'Unnamed',
                        email: emailIdx >= 0 ? values[emailIdx] : '',
                        phone: values[phoneIdx],
                        referralCode,
                        source: 'csv_upload',
                    });
                }
            }

            // Clean up temp file
            fs.unlinkSync(req.file.path);

            successResponse(res, 200, 'CSV parsed successfully', {
                count: customers.length,
                preview: customers.slice(0, 5),
                customers, // Return all for import
            });
        } catch (error) {
            console.error('CSV upload error:', error);
            errorResponse(res, 500, 'Failed to process CSV file');
        }
    }
);

// POST /builder/customers/import - Import validated customers
router.post('/customers-import', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId, customers } = req.body;

        if (!projectId || !customers || !Array.isArray(customers)) {
            return errorResponse(res, 400, 'projectId and customers array required');
        }

        // Verify project access
        const project = await Project.findById(projectId);
        if (!project || project.builder.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }
        const normalizedCustomers = customers.map((customer, index) => ({
            ...customer,
            name: customer.name?.trim() || 'Unnamed',
            email: normalizeEmail(customer.email),
            phone: normalizePhone(customer.phone),
            projectId,
            builderId: req.user.id,
            referralCode: customer.referralCode || `${projectId.slice(-8)}_${Date.now()}_${index}`.toUpperCase(),
            source: customer.source || 'bulk_import',
        }));

        const missingPhones = normalizedCustomers
            .filter((customer) => !customer.phone)
            .map((customer, index) => ({ index, name: customer.name }));

        if (missingPhones.length > 0) {
            return errorResponse(res, 400, 'Some customers are missing phone numbers', {
                missingPhones,
            });
        }

        const phones = normalizedCustomers.map((customer) => customer.phone);
        const emails = normalizedCustomers
            .map((customer) => customer.email)
            .filter(Boolean);

        const duplicatePhones = phones.filter((phone, index) => phones.indexOf(phone) !== index);
        const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);

        if (duplicatePhones.length > 0 || duplicateEmails.length > 0) {
            return errorResponse(res, 409, 'Duplicate phone or email found in import', {
                duplicatePhones: [...new Set(duplicatePhones)],
                duplicateEmails: [...new Set(duplicateEmails)],
            });
        }

        const existingUsers = await User.find({
            $or: [
                { phone: { $in: phones } },
                ...(emails.length > 0 ? [{ email: { $in: emails } }] : []),
            ],
        }, 'email phone');

        if (existingUsers.length > 0) {
            return errorResponse(res, 409, 'Customer logins already exist for some entries', {
                existingUsers: existingUsers.map((user) => ({
                    email: user.email,
                    phone: user.phone,
                })),
            });
        }

        let createdUsers = [];
        try {
            const usersToCreate = normalizedCustomers.map((customer) =>
                buildAdvocateUserPayload(customer, projectId, req.user.id)
            );
            createdUsers = await User.insertMany(usersToCreate);

            const inserted = await Customer.insertMany(normalizedCustomers);

            successResponse(res, 201, `${inserted.length} customers imported successfully`, {
                count: inserted.length,
                loginsCreated: createdUsers.length,
            });
        } catch (error) {
            if (createdUsers.length > 0) {
                await User.deleteMany({ _id: { $in: createdUsers.map((user) => user._id) } });
            }
            throw error;
        }
    } catch (error) {
        console.error('Import customers error:', error);
        errorResponse(res, 500, 'Failed to import customers');
    }
});

// ============ REPORTS & STATISTICS ============

// GET /builder/reports/dashboard - Dashboard statistics
router.get('/reports/dashboard', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return errorResponse(res, 400, 'projectId is required');
        }

        // Verify project access — allow if builder OR createdBy matches
        const projectObjId = new mongoose.Types.ObjectId(projectId);
        const builderObjId = new mongoose.Types.ObjectId(req.user.id);
        const project = await Project.findOne({
            _id: projectObjId,
            $or: [{ builder: builderObjId }, { createdBy: builderObjId }]
        });
        if (!project) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }

        // Calculate statistics — filter only by projectId so we don't miss records
        const totalCustomers = await Customer.countDocuments({ projectId: projectObjId });

        const statusBreakdown = await Customer.aggregate([
            { $match: { projectId: projectObjId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const inviteStats = await Customer.aggregate([
            { $match: { projectId: projectObjId } },
            {
                $group: {
                    _id: null,
                    sentCount: { $sum: { $cond: ['$inviteSentAt', 1, 0] } },
                    deliveredCount: { $sum: { $cond: ['$inviteDeliveredAt', 1, 0] } },
                    readCount: { $sum: { $cond: ['$inviteReadAt', 1, 0] } },
                },
            },
        ]);

        // Count open/in-progress customer escalations for this project
        const openEscalations = await Escalation.countDocuments({
            projectId: projectObjId,
            status: { $in: ['open', 'in_progress'] },
        });

        // Count CRM/sales escalated leads for this project
        const crmEscalations = await Lead.countDocuments({
            projectId: projectObjId,
            isEscalated: true,
            deletedAt: null,
        });

        // Count converted leads for this project
        const convertedLeads = await Lead.countDocuments({
            projectId: projectObjId,
            status: 'converted',
            deletedAt: null,
        });

        successResponse(res, 200, 'Dashboard stats retrieved', {
            totalCustomers,
            statusBreakdown: statusBreakdown || [],
            inviteStats: inviteStats[0] || {
                sentCount: 0,
                deliveredCount: 0,
                readCount: 0,
            },
            activeEscalations: openEscalations + crmEscalations,
            openEscalations,
            crmEscalations,
            convertedLeads,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        errorResponse(res, 500, 'Failed to retrieve dashboard stats');
    }
});

// ============ ESCALATION ENDPOINTS ============

// GET /builder/escalations - List escalations
router.get('/escalations', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId, status, priority, page = 1, limit = 20 } = req.query;

        if (!projectId) {
            return errorResponse(res, 400, 'projectId is required');
        }

        // Verify project access
        const pObjId = new mongoose.Types.ObjectId(projectId);
        const bObjId = new mongoose.Types.ObjectId(req.user.id);
        const project = await Project.findOne({
            _id: pObjId,
            $or: [{ builder: bObjId }, { createdBy: bObjId }]
        });
        if (!project) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }

        // Filter by projectId only — escalations may not always have builderId
        const filter = { projectId: pObjId };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const escalations = await Escalation.find(filter)
            .populate('customerId', 'name phone')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ priority: -1, createdAt: -1 });

        const total = await Escalation.countDocuments(filter);

        successResponse(res, 200, 'Escalations retrieved', {
            escalations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('List escalations error:', error);
        errorResponse(res, 500, 'Failed to retrieve escalations');
    }
});

// GET /builder/escalations/:id - Get escalation details
router.get('/escalations/:id', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const escalation = await Escalation.findById(req.params.id)
            .populate('customerId')
            .populate('assignedTo', 'name email')
            .populate('resolvedBy', 'name email');

        if (!escalation || escalation.builderId.toString() !== req.user.id) {
            return errorResponse(res, 404, 'Escalation not found or access denied');
        }

        successResponse(res, 200, 'Escalation retrieved', escalation);
    } catch (error) {
        console.error('Get escalation error:', error);
        errorResponse(res, 500, 'Failed to retrieve escalation');
    }
});


// GET /builder/crm-escalations - Get CRM/sales escalated leads for builder's project
router.get('/crm-escalations', authenticateToken, verifyBuilder, async (req, res) => {
    try {
        const { projectId, page = 1, limit = 20, status, priority } = req.query;

        if (!projectId) {
            return errorResponse(res, 400, 'projectId is required');
        }

        // Verify project access
        const crmProjId = new mongoose.Types.ObjectId(projectId);
        const crmBuilderId = new mongoose.Types.ObjectId(req.user.id);
        const project = await Project.findOne({
            _id: crmProjId,
            $or: [{ builder: crmBuilderId }, { createdBy: crmBuilderId }]
        });
        if (!project) {
            return errorResponse(res, 404, 'Project not found or access denied');
        }

        const filter = {
            projectId: crmProjId,
            isEscalated: true,
            deletedAt: null,
        };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const leads = await Lead.find(filter)
            .populate('assignedToId', 'firstName lastName email')
            .populate('sourceAdvocateId', 'firstName lastName')
            .populate('referralId', 'referrerName referrerPhone referrerEmail')
            .sort({ escalatedDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(filter);

        successResponse(res, 200, 'CRM escalations retrieved', {
            escalations: leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('CRM escalations error:', error);
        errorResponse(res, 500, 'Failed to retrieve CRM escalations');
    }
});

export default router;
