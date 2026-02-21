import express from 'express';
import { body, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import Project from '../models/Project.js';
import Lead from '../models/Lead.js';
import CallLog from '../models/CallLog.js';
import DailyStatusUpdate from '../models/DailyStatusUpdate.js';
import Customer from '../models/Customer.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Middleware: Verify CRM/Sales role
const verifyCRMUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const allowedRoles = [USER_ROLES.CRM_MANAGER, USER_ROLES.SALES_ASSOCIATE];
        if (!user || !allowedRoles.includes(user.role)) {
            return errorResponse(res, 403, 'Access denied. CRM/Sales role required.');
        }
        next();
    } catch (error) {
        errorResponse(res, 500, 'Server error');
    }
};

// ============ ADVOCATE MANAGEMENT ============

// GET /crm/advocates - List all advocates with performance metrics
router.get('/advocates', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { projectId, page = 1, limit = 20, search } = req.query;

        let filter = { role: USER_ROLES.PROJECT_ADVOCATE };
        if (projectId) filter.projectId = projectId;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const advocates = await User.find(filter)
            .select('name email phone role projectId createdAt')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Enrich with referral count
        const advocatesWithStats = await Promise.all(
            advocates.map(async (advocate) => {
                const refCount = await Referral.countDocuments({
                    advocateId: advocate._id,
                    isDeleted: false
                });
                const leadCount = await Lead.countDocuments({
                    sourceAdvocateId: advocate._id,
                    deletedAt: null
                });
                return {
                    ...advocate,
                    referralCount: refCount,
                    leadCount
                };
            })
        );

        const total = await User.countDocuments(filter);

        successResponse(res, 200, 'Advocates retrieved successfully', {
            data: advocatesWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /crm/advocates/:id/performance - Get advocate performance metrics
router.get('/advocates/:id/performance', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const advocateId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(advocateId)) {
            return errorResponse(res, 400, 'Invalid advocate ID');
        }

        const advocate = await User.findById(advocateId)
            .select('name email phone projectId')
            .lean();

        if (!advocate || advocate.role !== USER_ROLES.PROJECT_ADVOCATE) {
            return errorResponse(res, 404, 'Advocate not found');
        }

        // Get referral stats
        const totalReferrals = await Referral.countDocuments({
            advocateId: advocateId,
            isDeleted: false
        });

        const convertedReferrals = await Referral.countDocuments({
            advocateId: advocateId,
            status: 'converted',
            isDeleted: false
        });

        // Get lead stats
        const leadsManaged = await Lead.countDocuments({
            sourceAdvocateId: advocateId,
            deletedAt: null
        });

        const leadsConverted = await Lead.countDocuments({
            sourceAdvocateId: advocateId,
            status: 'converted',
            deletedAt: null
        });

        const conversionRate = totalReferrals > 0
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(2)
            : 0;

        successResponse(res, 200, 'Performance metrics retrieved', {
            advocate,
            referrals: {
                total: totalReferrals,
                converted: convertedReferrals,
                pending: totalReferrals - convertedReferrals
            },
            leads: {
                managed: leadsManaged,
                converted: leadsConverted
            },
            conversionRate: parseFloat(conversionRate)
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ REFERRAL ASSIGNMENT ============

// PATCH /crm/referrals/:id/assign - Assign referral to sales associate
router.patch(
    '/referrals/:id/assign',
    authenticateToken,
    verifyCRMUser,
    [
        body('assignedToId').isMongoId().withMessage('Invalid sales associate ID'),
        body('notes').optional().trim()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const referralId = req.params.id;
            const { assignedToId, notes } = req.body;

            if (!mongoose.Types.ObjectId.isValid(referralId)) {
                return errorResponse(res, 400, 'Invalid referral ID');
            }

            // Verify sales associate exists
            const salesAssociate = await User.findById(assignedToId);
            const allowedRoles = [USER_ROLES.CRM_MANAGER, USER_ROLES.SALES_ASSOCIATE];
            if (!salesAssociate || !allowedRoles.includes(salesAssociate.role)) {
                return errorResponse(res, 404, 'Sales associate not found');
            }

            // Find referral and create/update lead
            const referral = await Referral.findById(referralId);
            if (!referral) {
                return errorResponse(res, 404, 'Referral not found');
            }
            
            referral.assignedToId = assignedToId;
            referral.assignedDate = new Date();
            await referral.save();

            // Create or update lead
            let lead = await Lead.findOne({ referralId: referralId });
            if (!lead) {
                lead = new Lead({
                    referralId: referralId,
                    projectId: referral.projectId,
                    sourceAdvocateId: referral.advocateId
                });
            }

            lead.assignedToId = assignedToId;
            lead.assignedDate = new Date();
            lead.status = 'new';
            lead.statusHistory.push({
                status: 'new',
                updatedBy: req.user.id,
                updatedDate: new Date(),
                notes: notes || 'Assigned to sales associate'
            });

            await lead.save();

            successResponse(res, 200, 'Referral assigned successfully', lead);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// ============ SALES PIPELINE ============

// PATCH /crm/leads/:id/status - Update lead status in pipeline
router.patch(
    '/leads/:id/status',
    authenticateToken,
    verifyCRMUser,
    [
        body('status')
            .isIn(['new', 'contacted', 'site_visit', 'qualified', 'negotiating', 'proposal_sent', 'converted', 'lost'])
            .withMessage('Invalid status'),
        body('notes').trim().notEmpty().withMessage('Notes are required')
            .custom((value) => {
                const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
                if (wordCount < 50) {
                    throw new Error(`Notes must be at least 50 words. Current: ${wordCount} words.`);
                }
                return true;
            })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const leadId = req.params.id;
            const { status, notes } = req.body;

            if (!mongoose.Types.ObjectId.isValid(leadId)) {
                return errorResponse(res, 400, 'Invalid lead ID');
            }

            const lead = await Lead.findById(leadId);
            if (!lead) {
                return errorResponse(res, 404, 'Lead not found');
            }

            // Auto-escalation detection: If lead has been in status for > 7 days without update
            const daysSinceLastUpdate = (new Date() - lead.updatedAt) / (1000 * 60 * 60 * 24);
            if (daysSinceLastUpdate > 7 && !lead.isEscalated && status !== 'converted' && status !== 'lost') {
                lead.isEscalated = true;
                lead.escalationReason = 'No progress for 7+ days';
                lead.escalatedDate = new Date();
                lead.escalatedBy = req.user.id;
            }

            lead.status = status;
            lead.updatedAt = new Date();
            lead.statusHistory.push({
                status,
                updatedBy: req.user.id,
                notes: notes || ''
            });

            if (status === 'contacted' && !lead.firstContactDate) {
                lead.firstContactDate = new Date();
            }
            
            // Track site visit
            if (status === 'site_visit' && !lead.siteVisitDate) {
                lead.siteVisitDate = new Date();
                lead.siteVisitScheduled = true;
            }
            
            lead.lastContactDate = new Date();

            // Clear escalation if lead is converted or lost
            if (status === 'converted' || status === 'lost') {
                lead.isEscalated = false;
                lead.escalationStage = 0;
            }

            await lead.save();

            successResponse(res, 200, 'Lead status updated', lead);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /crm/leads - Get leads with filtering by status, assignee, priority
router.get('/leads', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { status, assignedToId, priority, projectId, page = 1, limit = 20 } = req.query;

        let filter = { deletedAt: null };
        if (status) filter.status = status;
        if (assignedToId) filter.assignedToId = assignedToId;
        if (priority) filter.priority = priority;
        if (projectId) filter.projectId = projectId;

        const skip = (page - 1) * limit;
        const leads = await Lead.find(filter)
            .populate('assignedToId', 'firstName lastName email phone')
            .populate('sourceAdvocateId', 'firstName lastName email phone')
            .populate('referralId', 'referrerName referrerPhone referrerEmail')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(filter);

        successResponse(res, 200, 'Leads retrieved', {
            data: leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ CALL LOGGING ============

// POST /crm/call-logs - Log a call
router.post(
    '/call-logs',
    authenticateToken,
    verifyCRMUser,
    [
        body('leadId').isMongoId().withMessage('Invalid lead ID'),
        body('callType').isIn(['inbound', 'outbound', 'video', 'voicemail']).withMessage('Invalid call type'),
        body('outcome').isIn(['completed', 'missed', 'declined', 'no_answer', 'voicemail_left']).withMessage('Invalid outcome'),
        body('notes').trim().notEmpty().withMessage('Notes are required'),
        body('callDuration').optional().isInt({ min: 0 }).withMessage('Invalid duration'),
        body('sentiment').optional().isIn(['very_positive', 'positive', 'neutral', 'negative', 'very_negative'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const { leadId, callType, outcome, notes, callDuration, sentiment, purpose, nextAction, nextActionDate } = req.body;

            if (!mongoose.Types.ObjectId.isValid(leadId)) {
                return errorResponse(res, 400, 'Invalid lead ID');
            }

            const lead = await Lead.findById(leadId)
                .populate('referralId');

            if (!lead) {
                return errorResponse(res, 404, 'Lead not found');
            }

            const callLog = new CallLog({
                leadId,
                referralId: lead.referralId._id,
                initiatedBy: req.user.id,
                callType,
                outcome,
                notes,
                callDuration: callDuration || 0,
                sentiment,
                purpose: purpose || [],
                nextAction,
                nextActionDate,
                callStartTime: new Date(),
                customerName: lead.referralId.name,
                phoneNumber: lead.referralId.phone
            });

            await callLog.save();

            // Update lead last contact
            lead.lastContactDate = new Date();
            await lead.save();

            successResponse(res, 201, 'Call logged successfully', callLog);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /crm/leads/:id/call-logs - Get call logs for a lead
router.get('/leads/:id/call-logs', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const leadId = req.params.id;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return errorResponse(res, 400, 'Invalid lead ID');
        }

        const skip = (page - 1) * limit;
        const callLogs = await CallLog.find({ leadId, deletedAt: null })
            .populate('initiatedBy', 'name email')
            .sort({ callStartTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CallLog.countDocuments({ leadId, deletedAt: null });

        successResponse(res, 200, 'Call logs retrieved', {
            data: callLogs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ DAILY STATUS UPDATES ============

// POST /crm/daily-status - Submit daily status update
router.post(
    '/daily-status',
    authenticateToken,
    [
        body('reportDate').isISO8601().withMessage('Invalid date'),
        body('summary').trim().notEmpty().isLength({ min: 10 }).withMessage('Summary must be at least 10 characters'),
        body('callsMade').optional().isInt({ min: 0 }).withMessage('Invalid calls made'),
        body('leadsContacted').optional().isInt({ min: 0 }).withMessage('Invalid leads contacted'),
        body('leadsQualified').optional().isInt({ min: 0 }).withMessage('Invalid leads qualified'),
        body('closedDeals').optional().isInt({ min: 0 }).withMessage('Invalid closed deals')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const {
                reportDate,
                summary,
                callsMade,
                leadsContacted,
                leadsQualified,
                proposalsSent,
                followUpsDone,
                closedDeals,
                challenges,
                achievements,
                nextDayPlan,
                projectId
            } = req.body;

            const dailyStatus = new DailyStatusUpdate({
                salesAssociateId: req.user.id,
                reportDate: new Date(reportDate),
                summary,
                callsMade: callsMade || 0,
                leadsContacted: leadsContacted || 0,
                leadsQualified: leadsQualified || 0,
                proposalsSent: proposalsSent || 0,
                followUpsDone: followUpsDone || 0,
                closedDeals: closedDeals || 0,
                challenges,
                achievements,
                nextDayPlan,
                projectId
            });

            await dailyStatus.save();

            successResponse(res, 201, 'Daily status submitted', dailyStatus);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /crm/my-daily-status - Get own daily status history
router.get('/my-daily-status', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate } = req.query;

        let filter = { salesAssociateId: req.user.id, deletedAt: null };

        if (startDate || endDate) {
            filter.reportDate = {};
            if (startDate) filter.reportDate.$gte = new Date(startDate);
            if (endDate) filter.reportDate.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const updates = await DailyStatusUpdate.find(filter)
            .sort({ reportDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DailyStatusUpdate.countDocuments(filter);

        successResponse(res, 200, 'Daily status history retrieved', {
            data: updates,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /crm/referrals - Get all referrals (unassigned and assigned)
router.get('/referrals', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, projectId, search } = req.query;

        let filter = { isDeleted: false };
        if (status) filter.status = status;
        if (projectId) filter.projectId = projectId;

        if (search) {
            filter.$or = [
                { referrerName: { $regex: search, $options: 'i' } },
                { referrerPhone: { $regex: search, $options: 'i' } },
                { referrerEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const referrals = await Referral.find(filter)
            .populate('advocateId', 'firstName lastName email phone')
            .populate('projectId', 'name')
            .populate('assignedToId', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Referral.countDocuments(filter);

        successResponse(res, 200, 'Referrals retrieved', {
            data: referrals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /crm/referral-summary - Get referral summary stats
router.get('/referral-summary', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { projectId } = req.query;

        let matchStage = { deletedAt: null };
        let referralMatch = { isDeleted: false };
        if (projectId) {
            matchStage.projectId = mongoose.Types.ObjectId(projectId);
            referralMatch.projectId = mongoose.Types.ObjectId(projectId);
        }

        // Lead stats
        const summary = await Lead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const prioritySummary = await Lead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        let statusCounts = {};
        summary.forEach(s => {
            statusCounts[s._id] = s.count;
        });

        let priorityCounts = {};
        prioritySummary.forEach(p => {
            priorityCounts[p._id] = p.count;
        });

        const totalLeads = await Lead.countDocuments(matchStage);
        const escalated = await Lead.countDocuments({ ...matchStage, isEscalated: true });

        // Referral stats (unassigned)
        const totalReferrals = await Referral.countDocuments(referralMatch);
        const referralsByStatus = await Referral.aggregate([
            { $match: referralMatch },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        let referralStatusCounts = {};
        referralsByStatus.forEach(r => {
            referralStatusCounts[r._id] = r.count;
        });

        successResponse(res, 200, 'Summary retrieved', {
            total: totalLeads + totalReferrals,
            totalLeads,
            totalReferrals,
            escalated,
            byStatus: statusCounts,
            byPriority: priorityCounts,
            referralsByStatus: referralStatusCounts
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ SALES ASSOCIATES MANAGEMENT ============

// GET /crm/sales-associates - Get all sales associates
router.get('/sales-associates', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const salesAssociates = await User.find({
            role: { $in: [USER_ROLES.CRM_MANAGER, USER_ROLES.SALES_ASSOCIATE] },
            isActive: true
        })
            .select('firstName lastName email phone role')
            .sort({ firstName: 1 })
            .lean();

        // Get assignment counts for each associate
        const associatesWithStats = await Promise.all(
            salesAssociates.map(async (associate) => {
                const assignedCount = await Lead.countDocuments({
                    assignedToId: associate._id,
                    deletedAt: null,
                    status: { $nin: ['converted', 'lost'] }
                });
                return {
                    ...associate,
                    assignedCount
                };
            })
        );

        successResponse(res, 200, 'Sales associates retrieved successfully', {
            data: associatesWithStats
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// POST /crm/referrals/batch-assign - Auto-split referrals among sales associates
router.post(
    '/referrals/batch-assign',
    authenticateToken,
    verifyCRMUser,
    [
        body('referralIds').isArray({ min: 1 }).withMessage('referralIds must be a non-empty array'),
        body('referralIds.*').isMongoId().withMessage('Invalid referral ID'),
        body('assignmentStrategy').optional().isIn(['round-robin', 'load-balanced']).withMessage('Invalid strategy')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const { referralIds, assignmentStrategy = 'round-robin' } = req.body;

            // Get all active sales associates
            const salesAssociates = await User.find({
                role: USER_ROLES.SALES_ASSOCIATE,
                isActive: true
            }).select('_id firstName lastName');

            if (salesAssociates.length === 0) {
                return errorResponse(res, 400, 'No active sales associates found');
            }

            // Get current workload for load-balanced strategy
            let associateWorkloads = [];
            if (assignmentStrategy === 'load-balanced') {
                associateWorkloads = await Promise.all(
                    salesAssociates.map(async (associate) => {
                        const count = await Lead.countDocuments({
                            assignedToId: associate._id,
                            deletedAt: null,
                            status: { $nin: ['converted', 'lost'] }
                        });
                        return { associateId: associate._id, count };
                    })
                );
                associateWorkloads.sort((a, b) => a.count - b.count);
            }

            const assignments = [];
            let currentIndex = 0;

            for (const referralId of referralIds) {
                // Find referral
                const referral = await Referral.findById(referralId);
                if (!referral) {
                    continue;
                }

                // Determine which associate to assign to
                let assignedToId;
                if (assignmentStrategy === 'load-balanced') {
                    // Assign to the associate with the least workload
                    assignedToId = associateWorkloads[0].associateId;
                    // Increment workload and re-sort
                    associateWorkloads[0].count++;
                    associateWorkloads.sort((a, b) => a.count - b.count);
                } else {
                    // Round-robin assignment
                    assignedToId = salesAssociates[currentIndex]._id;
                    currentIndex = (currentIndex + 1) % salesAssociates.length;
                }

                // Create or update lead
                let lead = await Lead.findOne({ referralId: referralId });
                if (!lead) {
                    lead = new Lead({
                        referralId: referralId,
                        customerId: referral.customerId,
                        projectId: referral.projectId,
                        sourceAdvocateId: referral.advocateId,
                        status: 'new'
                    });
                }

                lead.assignedToId = assignedToId;
                lead.assignedDate = new Date();
                if (lead.status === 'new') {
                    lead.statusHistory.push({
                        status: 'new',
                        updatedBy: req.user.id,
                        updatedDate: new Date(),
                        notes: `Auto-assigned via ${assignmentStrategy}`
                    });
                }

                await lead.save();
                assignments.push({
                    referralId: referralId,
                    assignedToId: assignedToId
                });
            }

            successResponse(res, 200, 'Referrals assigned successfully', {
                assigned: assignments.length,
                total: referralIds.length,
                assignments
            });
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// ============ PAYMENT TRACKING ============

// POST /crm/leads/:id/payment - Record payment for a lead
router.post(
    '/leads/:id/payment',
    authenticateToken,
    verifyCRMUser,
    [
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
        body('transactionId').trim().optional(),
        body('status').isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status'),
        body('notes').trim().optional()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const leadId = req.params.id;
            const { amount, paymentMethod, transactionId, status, notes } = req.body;

            if (!mongoose.Types.ObjectId.isValid(leadId)) {
                return errorResponse(res, 400, 'Invalid lead ID');
            }

            const lead = await Lead.findById(leadId);
            if (!lead) {
                return errorResponse(res, 404, 'Lead not found');
            }

            // Add to payment history
            lead.paymentHistory.push({
                amount,
                paymentDate: new Date(),
                paymentMethod,
                transactionId,
                status,
                notes,
                recordedBy: req.user.id
            });

            // Update total payment amount if completed
            if (status === 'completed') {
                lead.paymentAmount += parseFloat(amount);
            }

            // Update payment status based on history
            const totalPaid = lead.paymentHistory
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0);

            if (totalPaid === 0) {
                lead.paymentStatus = 'pending';
            } else if (totalPaid > 0 && lead.status !== 'converted') {
                lead.paymentStatus = 'partial';
            } else if (lead.status === 'converted') {
                lead.paymentStatus = 'completed';
            }

            await lead.save();

            successResponse(res, 201, 'Payment recorded successfully', lead);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /crm/leads/:id/payment-history - Get payment history for a lead
router.get('/leads/:id/payment-history', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const leadId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return errorResponse(res, 400, 'Invalid lead ID');
        }

        const lead = await Lead.findById(leadId)
            .select('paymentHistory paymentAmount paymentStatus')
            .populate('paymentHistory.recordedBy', 'name email');

        if (!lead) {
            return errorResponse(res, 404, 'Lead not found');
        }

        successResponse(res, 200, 'Payment history retrieved', {
            paymentHistory: lead.paymentHistory,
            paymentAmount: lead.paymentAmount,
            paymentStatus: lead.paymentStatus
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /crm/payment-summary - Get payment summary statistics
router.get('/payment-summary', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;

        let filter = { deletedAt: null };
        if (projectId) filter.projectId = projectId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const leads = await Lead.find(filter);

        const summary = {
            totalRevenue: 0,
            byStatus: {
                pending: { count: 0, amount: 0 },
                partial: { count: 0, amount: 0 },
                completed: { count: 0, amount: 0 },
                failed: { count: 0, amount: 0 },
                refunded: { count: 0, amount: 0 }
            },
            recentPayments: []
        };

        leads.forEach(lead => {
            summary.totalRevenue += lead.paymentAmount || 0;
            const status = lead.paymentStatus || 'pending';
            summary.byStatus[status].count++;
            summary.byStatus[status].amount += lead.paymentAmount || 0;

            // Collect recent payments
            if (lead.paymentHistory && lead.paymentHistory.length > 0) {
                lead.paymentHistory.forEach(payment => {
                    summary.recentPayments.push({
                        leadId: lead._id,
                        amount: payment.amount,
                        date: payment.paymentDate,
                        method: payment.paymentMethod,
                        status: payment.status
                    });
                });
            }
        });

        // Sort recent payments by date (newest first) and limit to 10
        summary.recentPayments.sort((a, b) => b.date - a.date);
        summary.recentPayments = summary.recentPayments.slice(0, 10);

        successResponse(res, 200, 'Payment summary retrieved', summary);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ ESCALATION MANAGEMENT ============

// GET /crm/escalations - Get all escalated leads
router.get('/escalations', authenticateToken, verifyCRMUser, async (req, res) => {
    try {
        const { page = 1, limit = 20, priority, status } = req.query;

        let filter = { isEscalated: true, deletedAt: null };
        if (priority) filter.priority = priority;
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const escalations = await Lead.find(filter)
            .populate('assignedToId', 'name email')
            .populate('sourceAdvocateId', 'name')
            .populate('customerId', 'name email phone')
            .populate('escalatedBy', 'name email')
            .sort({ escalatedDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(filter);

        successResponse(res, 200, 'Escalations retrieved', {
            data: escalations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// PATCH /crm/escalations/:id/resolve - Resolve an escalation
router.patch(
    '/escalations/:id/resolve',
    authenticateToken,
    verifyCRMUser,
    [
        body('resolution').trim().notEmpty().withMessage('Resolution notes are required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation error', errors.array());
            }

            const leadId = req.params.id;
            const { resolution } = req.body;

            if (!mongoose.Types.ObjectId.isValid(leadId)) {
                return errorResponse(res, 400, 'Invalid lead ID');
            }

            const lead = await Lead.findById(leadId);
            if (!lead) {
                return errorResponse(res, 404, 'Lead not found');
            }

            if (!lead.isEscalated) {
                return errorResponse(res, 400, 'Lead is not escalated');
            }

            lead.isEscalated = false;
            lead.statusHistory.push({
                status: lead.status,
                updatedBy: req.user.id,
                notes: `Escalation resolved: ${resolution}`
            });

            await lead.save();

            successResponse(res, 200, 'Escalation resolved', lead);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

export default router;
