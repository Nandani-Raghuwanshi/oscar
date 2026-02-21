import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import EscalationRule from '../models/EscalationRule.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';
import { triggerEscalationNow } from '../jobs/escalationCron.js';

const router = express.Router();

// Middleware: Admin only
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== USER_ROLES.ADMIN) {
            return errorResponse(res, 403, 'Admin access required');
        }
        next();
    } catch (error) {
        errorResponse(res, 500, 'Server error');
    }
};

// GET /api/admin/escalation-rules - List all rules
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
    try {
        const { enabled, sourceStatus } = req.query;
        
        let filter = {};
        if (enabled !== undefined) filter.enabled = enabled === 'true';
        if (sourceStatus) filter.sourceStatus = sourceStatus;
        
        const rules = await EscalationRule.find(filter)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        
        successResponse(res, 200, 'Escalation rules retrieved', {
            data: rules,
            count: rules.length
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /api/admin/escalation-rules/:id - Get single rule
router.get('/:id', authenticateToken, verifyAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 400, 'Invalid rule ID');
        }
        
        const rule = await EscalationRule.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('projectId', 'name');
        
        if (!rule) {
            return errorResponse(res, 404, 'Rule not found');
        }
        
        successResponse(res, 200, 'Escalation rule retrieved', rule);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// POST /api/admin/escalation-rules - Create new rule
router.post(
    '/',
    authenticateToken,
    verifyAdmin,
    [
        body('ruleName').trim().notEmpty().withMessage('Rule name is required'),
        body('sourceStatus').isIn(['new', 'contacted', 'site_visit', 'qualified', 
                                    'negotiating', 'proposal_sent'])
            .withMessage('Invalid source status'),
        body('stages').isArray({ min: 1 }).withMessage('At least one stage required'),
        body('stages.*.waitHours').isInt({ min: 1 }).withMessage('Wait hours must be positive')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }
            
            const ruleData = {
                ...req.body,
                createdBy: req.user.id
            };
            
            const rule = new EscalationRule(ruleData);
            await rule.save();
            
            successResponse(res, 201, 'Escalation rule created', rule);
        } catch (error) {
            if (error.code === 11000) {
                return errorResponse(res, 409, 'Rule name already exists');
            }
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// PUT /api/admin/escalation-rules/:id - Update rule
router.put(
    '/:id',
    authenticateToken,
    verifyAdmin,
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return errorResponse(res, 400, 'Invalid rule ID');
            }
            
            const rule = await EscalationRule.findById(req.params.id);
            if (!rule) {
                return errorResponse(res, 404, 'Rule not found');
            }
            
            // Increment version on update
            const updateData = {
                ...req.body,
                updatedBy: req.user.id,
                version: rule.version + 1
            };
            
            const updated = await EscalationRule.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).populate('createdBy', 'firstName lastName email')
             .populate('updatedBy', 'firstName lastName email');
            
            successResponse(res, 200, 'Escalation rule updated', updated);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// PATCH /api/admin/escalation-rules/:id/toggle - Enable/disable rule
router.patch(
    '/:id/toggle',
    authenticateToken,
    verifyAdmin,
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return errorResponse(res, 400, 'Invalid rule ID');
            }
            
            const rule = await EscalationRule.findById(req.params.id);
            if (!rule) {
                return errorResponse(res, 404, 'Rule not found');
            }
            
            rule.enabled = !rule.enabled;
            rule.updatedBy = req.user.id;
            await rule.save();
            
            successResponse(res, 200, `Rule ${rule.enabled ? 'enabled' : 'disabled'}`, rule);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// DELETE /api/admin/escalation-rules/:id - Delete rule
router.delete(
    '/:id',
    authenticateToken,
    verifyAdmin,
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return errorResponse(res, 400, 'Invalid rule ID');
            }
            
            const rule = await EscalationRule.findByIdAndDelete(req.params.id);
            if (!rule) {
                return errorResponse(res, 404, 'Rule not found');
            }
            
            successResponse(res, 200, 'Escalation rule deleted', rule);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// POST /api/admin/escalation-rules/trigger - Manually trigger escalation processing
router.post(
    '/trigger',
    authenticateToken,
    verifyAdmin,
    async (req, res) => {
        try {
            await triggerEscalationNow();
            successResponse(res, 200, 'Escalation processing triggered successfully');
        } catch (error) {
            errorResponse(res, 500, 'Failed to trigger escalation processing', error.message);
        }
    }
);

export default router;
