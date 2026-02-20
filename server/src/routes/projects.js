import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects (with filtering for non-admins)
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status'),
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

        const query = {};

        // Non-admins can only see their own project
        if (req.user.role !== USER_ROLES.ADMIN) {
            const user = await User.findById(req.user.id);
            if (user?.projectId) {
                query._id = user.projectId;
            } else {
                // User has no project assigned
                return successResponse(res, HTTP_STATUS.OK, 'No projects found', {
                    projects: [],
                    pagination: { page, limit, total: 0, pages: 0 }
                });
            }
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { location: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const [projects, total] = await Promise.all([
            Project.find(query)
                .populate('builder', 'firstName lastName email')
                .populate('createdBy', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            Project.countDocuments(query)
        ]);

        successResponse(res, HTTP_STATUS.OK, 'Projects retrieved successfully', {
            projects,
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

// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('builder', 'firstName lastName email phone')
            .populate('createdBy', 'firstName lastName email');

        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        // Non-admins can only see their own project
        if (req.user.role !== USER_ROLES.ADMIN) {
            const user = await User.findById(req.user.id);
            if (!user?.projectId || user.projectId.toString() !== project._id.toString()) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Access denied');
            }
        }

        successResponse(res, HTTP_STATUS.OK, 'Project retrieved successfully', { project });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Create project (Admin only)
router.post('/', authorize(USER_ROLES.ADMIN), [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
    body('builder').isMongoId().withMessage('Valid builder ID is required'),
    body('location').optional().trim(),
    body('documentation').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const { name, description, builder, location, documentation, status } = req.body;

        // Verify builder exists and has builder role
        const builderUser = await User.findById(builder);
        if (!builderUser) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Builder not found');
        }
        if (builderUser.role !== USER_ROLES.BUILDER) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User is not a builder');
        }

        const project = new Project({
            name,
            description,
            builder,
            location,
            documentation,
            status: status || 'active',
            createdBy: req.user.id
        });

        await project.save();

        // Log audit
        await logAudit('PROJECT_CREATE', req.user.id, {
            targetProject: project._id,
            details: { name, builder }
        }, req);

        const populatedProject = await Project.findById(project._id)
            .populate('builder', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');

        successResponse(res, HTTP_STATUS.CREATED, 'Project created successfully', { project: populatedProject });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Update project (Admin only)
router.put('/:id', authorize(USER_ROLES.ADMIN), [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().trim(),
    body('builder').optional().isMongoId().withMessage('Invalid builder ID'),
    body('location').optional().trim(),
    body('documentation').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        // If builder is being updated, verify the new builder
        if (req.body.builder && req.body.builder !== project.builder.toString()) {
            const builderUser = await User.findById(req.body.builder);
            if (!builderUser) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Builder not found');
            }
            if (builderUser.role !== USER_ROLES.BUILDER) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User is not a builder');
            }
        }

        const updates = {};
        const allowedUpdates = ['name', 'description', 'builder', 'location', 'documentation', 'status'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        Object.assign(project, updates);
        await project.save();

        // Log audit
        await logAudit('PROJECT_UPDATE', req.user.id, {
            targetProject: project._id,
            details: updates
        }, req);

        const populatedProject = await Project.findById(project._id)
            .populate('builder', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');

        successResponse(res, HTTP_STATUS.OK, 'Project updated successfully', { project: populatedProject });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Delete project (Admin only - soft delete by setting status to inactive)
router.delete('/:id', authorize(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        // Check if any users are still assigned to this project
        const assignedUsers = await User.countDocuments({ projectId: project._id, isActive: true });
        if (assignedUsers > 0) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, `Cannot delete project with ${assignedUsers} active users`);
        }

        project.status = 'inactive';
        await project.save();

        // Log audit
        await logAudit('PROJECT_DELETE', req.user.id, {
            targetProject: project._id,
            details: { name: project.name }
        }, req);

        successResponse(res, HTTP_STATUS.OK, 'Project deactivated successfully');
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Add certification to project (Admin and Builder)
router.post('/:id/certifications', authorize(USER_ROLES.ADMIN, USER_ROLES.BUILDER), [
    body('name').trim().notEmpty().withMessage('Certification name is required'),
    body('url').trim().isURL().withMessage('Valid URL is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        // Builders can only update their own projects
        if (req.user.role === USER_ROLES.BUILDER) {
            if (project.builder.toString() !== req.user.id) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Access denied');
            }
        }

        project.certifications.push({
            name: req.body.name,
            url: req.body.url,
            uploadedAt: new Date()
        });

        await project.save();

        successResponse(res, HTTP_STATUS.OK, 'Certification added successfully', { project });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

export default router;
