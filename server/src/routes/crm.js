import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { verifyCRMManager, verifySalesAssociate, verifyCRMAccess } from '../middleware/crm.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import Interaction from '../models/Interaction.js';
import PaymentRecord from '../models/PaymentRecord.js';
import Reward from '../models/Reward.js';
import Escalation from '../models/Escalation.js';
import Project from '../models/Project.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// ============ CRM MANAGER ENDPOINTS ============

// GET /api/crm/dashboard/stats - CRM Manager Dashboard Statistics
router.get('/dashboard/stats', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        // Count all advocates (project + brand)
        const totalAdvocates = await User.countDocuments({
            role: { $in: [USER_ROLES.PROJECT_ADVOCATE, USER_ROLES.BRAND_ADVOCATE] },
            isActive: true
        });

        // Count active referrals (not converted or dropped)
        const activeReferrals = await Referral.countDocuments({
            status: { $in: ['pending', 'assigned', 'contacted', 'site_visit', 'qualified', 'booking'] },
            isDeleted: false
        });

        // Count pending assignments (unassigned referrals)
        const pendingAssignments = await Referral.countDocuments({
            status: 'pending',
            assignedTo: null,
            isDeleted: false
        });

        // Calculate conversion rate
        const totalReferrals = await Referral.countDocuments({ isDeleted: false });
        const convertedReferrals = await Referral.countDocuments({ 
            status: 'converted',
            isDeleted: false 
        });
        const conversionRate = totalReferrals > 0 
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(2) 
            : 0;

        // Count escalated referrals
        const escalatedReferrals = await Referral.countDocuments({
            escalationFlag: true,
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        });

        // Get recent activity (last 10 interactions)
        const recentActivity = await Interaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('salesAssociateId', 'firstName lastName')
            .populate('referralId', 'referrerName status')
            .lean();

        // Get sales associate performance summary
        const salesAssociates = await User.find({ 
            role: USER_ROLES.SALES_ASSOCIATE,
            isActive: true 
        }).select('firstName lastName');

        const salesAssociateStats = await Promise.all(
            salesAssociates.map(async (associate) => {
                const assigned = await Referral.countDocuments({
                    assignedTo: associate._id,
                    isDeleted: false
                });
                const converted = await Referral.countDocuments({
                    assignedTo: associate._id,
                    status: 'converted',
                    isDeleted: false
                });
                return {
                    id: associate._id,
                    name: `${associate.firstName} ${associate.lastName}`,
                    assigned,
                    converted,
                    conversionRate: assigned > 0 ? ((converted / assigned) * 100).toFixed(2) : 0
                };
            })
        );

        successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
            totalAdvocates,
            activeReferrals,
            pendingAssignments,
            conversionRate: parseFloat(conversionRate),
            escalatedReferrals,
            totalReferrals,
            convertedReferrals,
            recentActivity,
            salesAssociateStats
        });
    } catch (error) {
        console.error('Get CRM dashboard stats error:', error);
        errorResponse(res, 500, 'Failed to retrieve dashboard statistics');
    }
});

// GET /api/crm/advocates - List all advocates with performance metrics
router.get('/advocates', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { projectId, search, page = 1, limit = 20 } = req.query;

        const filter = {
            role: { $in: [USER_ROLES.PROJECT_ADVOCATE, USER_ROLES.BRAND_ADVOCATE] },
            isActive: true
        };

        if (projectId) {
            filter.projectId = projectId;
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const advocates = await User.find(filter)
            .select('firstName lastName email phone role projectId createdAt')
            .populate('projectId', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Calculate performance metrics for each advocate
        const advocatesWithPerformance = await Promise.all(
            advocates.map(async (advocate) => {
                const totalReferrals = await Referral.countDocuments({
                    advocateId: advocate._id,
                    isDeleted: false
                });

                const convertedReferrals = await Referral.countDocuments({
                    advocateId: advocate._id,
                    status: 'converted',
                    isDeleted: false
                });

                const totalRewards = await Reward.aggregate([
                    {
                        $match: {
                            advocateId: advocate._id,
                            isDeleted: false
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const rewardsEarned = totalRewards.length > 0 ? totalRewards[0].total : 0;
                const conversionRate = totalReferrals > 0 
                    ? ((convertedReferrals / totalReferrals) * 100).toFixed(2) 
                    : 0;

                // Determine tier based on performance
                let tier = 'inactive';
                if (totalReferrals >= 10) tier = 'gold';
                else if (totalReferrals >= 5) tier = 'silver';
                else if (totalReferrals >= 1) tier = 'bronze';

                return {
                    ...advocate,
                    performance: {
                        totalReferrals,
                        convertedReferrals,
                        conversionRate: parseFloat(conversionRate),
                        rewardsEarned,
                        tier
                    }
                };
            })
        );

        const total = await User.countDocuments(filter);

        successResponse(res, 200, 'Advocates retrieved successfully', {
            advocates: advocatesWithPerformance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get advocates error:', error);
        errorResponse(res, 500, 'Failed to retrieve advocates');
    }
});

// GET /api/crm/advocates/:id - Get advocate details with full performance
router.get('/advocates/:id', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const advocate = await User.findById(req.params.id)
            .populate('projectId', 'name location')
            .lean();

        if (!advocate) {
            return errorResponse(res, 404, 'Advocate not found');
        }

        // Get referrals with status breakdown
        const referralsByStatus = await Referral.aggregate([
            {
                $match: {
                    advocateId: advocate._id,
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusBreakdown = {};
        referralsByStatus.forEach(item => {
            statusBreakdown[item._id] = item.count;
        });

        // Get rewards summary
        const rewardsSummary = await Reward.aggregate([
            {
                $match: {
                    advocateId: advocate._id,
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const rewards = {};
        rewardsSummary.forEach(item => {
            rewards[item._id] = {
                count: item.count,
                amount: item.totalAmount
            };
        });

        // Get recent referrals
        const recentReferrals = await Referral.find({
            advocateId: advocate._id,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('referrerName status createdAt')
            .lean();

        successResponse(res, 200, 'Advocate details retrieved successfully', {
            advocate,
            statusBreakdown,
            rewards,
            recentReferrals
        });
    } catch (error) {
        console.error('Get advocate details error:', error);
        errorResponse(res, 500, 'Failed to retrieve advocate details');
    }
});

// GET /api/crm/referrals - Master referrals list (all referrals)
router.get('/referrals', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { 
            status, 
            projectId, 
            assignedTo, 
            search, 
            escalationFlag,
            page = 1, 
            limit = 20 
        } = req.query;

        const filter = { isDeleted: false };

        if (status) {
            filter.status = status;
        }

        if (projectId) {
            filter.projectId = projectId;
        }

        if (assignedTo) {
            if (assignedTo === 'unassigned') {
                filter.assignedTo = null;
            } else {
                filter.assignedTo = assignedTo;
            }
        }

        if (escalationFlag === 'true') {
            filter.escalationFlag = true;
        }

        if (search) {
            filter.$or = [
                { referrerName: { $regex: search, $options: 'i' } },
                { referrerPhone: { $regex: search, $options: 'i' } },
                { referrerEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const referrals = await Referral.find(filter)
            .populate('advocateId', 'firstName lastName phone email')
            .populate('projectId', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        const total = await Referral.countDocuments(filter);

        successResponse(res, 200, 'Referrals retrieved successfully', {
            referrals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        errorResponse(res, 500, 'Failed to retrieve referrals');
    }
});

// GET /api/crm/referrals/:id - Get single referral details
router.get('/referrals/:id', authenticateToken, verifyCRMAccess, async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id)
            .populate('advocateId', 'firstName lastName phone email')
            .populate('projectId', 'name location')
            .populate('assignedTo', 'firstName lastName email phone')
            .populate('assignedBy', 'firstName lastName')
            .lean();

        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        // Get interaction history
        const interactions = await Interaction.find({ referralId: referral._id })
            .populate('salesAssociateId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        // Get payment record if converted
        let payment = null;
        if (referral.status === 'converted') {
            payment = await PaymentRecord.findOne({ referralId: referral._id })
                .populate('processedBy', 'firstName lastName')
                .lean();
        }

        successResponse(res, 200, 'Referral details retrieved successfully', {
            referral,
            interactions,
            payment
        });
    } catch (error) {
        console.error('Get referral details error:', error);
        errorResponse(res, 500, 'Failed to retrieve referral details');
    }
});

// POST /api/crm/referrals/:id/assign - Assign referral to sales associate
router.post('/referrals/:id/assign', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { salesAssociateId } = req.body;

        if (!salesAssociateId) {
            return errorResponse(res, 400, 'Sales Associate ID is required');
        }

        // Verify sales associate exists and has correct role
        const salesAssociate = await User.findById(salesAssociateId);
        if (!salesAssociate || salesAssociate.role !== USER_ROLES.SALES_ASSOCIATE) {
            return errorResponse(res, 404, 'Sales Associate not found');
        }

        // Get referral
        const referral = await Referral.findById(req.params.id);
        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        if (referral.isDeleted) {
            return errorResponse(res, 400, 'Cannot assign deleted referral');
        }

        // Update referral assignment
        referral.assignedTo = salesAssociateId;
        referral.assignedBy = req.user.id;
        referral.assignedAt = new Date();
        referral.status = 'assigned';
        referral.escalationLevel = 0; // Reset escalation on assignment
        referral.escalationFlag = false;

        await referral.save();

        // Populate for response
        await referral.populate('assignedTo', 'firstName lastName');
        await referral.populate('assignedBy', 'firstName lastName');

        successResponse(res, 200, 'Referral assigned successfully', {
            referral
        });
    } catch (error) {
        console.error('Assign referral error:', error);
        errorResponse(res, 500, 'Failed to assign referral');
    }
});

// PUT /api/crm/referrals/:id/reassign - Reassign referral to different sales associate
router.put('/referrals/:id/reassign', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { salesAssociateId, reason } = req.body;

        if (!salesAssociateId) {
            return errorResponse(res, 400, 'Sales Associate ID is required');
        }

        // Verify sales associate exists
        const salesAssociate = await User.findById(salesAssociateId);
        if (!salesAssociate || salesAssociate.role !== USER_ROLES.SALES_ASSOCIATE) {
            return errorResponse(res, 404, 'Sales Associate not found');
        }

        // Get referral
        const referral = await Referral.findById(req.params.id);
        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        // Update reassignment
        const previousAssignee = referral.assignedTo;
        referral.assignedTo = salesAssociateId;
        referral.assignedBy = req.user.id;
        referral.assignedAt = new Date();
        referral.escalationLevel = 0; // Reset escalation
        referral.escalationFlag = false;

        await referral.save();

        // Log reassignment as interaction
        const interaction = new Interaction({
            referralId: referral._id,
            salesAssociateId: req.user.id,
            interactionType: 'note',
            outcome: 'other',
            notes: `Referral reassigned from ${previousAssignee} to ${salesAssociateId}. Reason: ${reason || 'Not specified'}. This reassignment was made by the CRM Manager to ensure better lead handling and improve conversion probability.`,
            createdBy: req.user.id
        });
        await interaction.save();

        await referral.populate('assignedTo', 'firstName lastName');
        await referral.populate('assignedBy', 'firstName lastName');

        successResponse(res, 200, 'Referral reassigned successfully', {
            referral
        });
    } catch (error) {
        console.error('Reassign referral error:', error);
        errorResponse(res, 500, 'Failed to reassign referral');
    }
});

// GET /api/crm/pipeline - Get pipeline view data (referrals grouped by status)
router.get('/pipeline', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { projectId, salesAssociateId } = req.query;

        const filter = { isDeleted: false };

        if (projectId) {
            filter.projectId = projectId;
        }

        if (salesAssociateId) {
            filter.assignedTo = salesAssociateId;
        }

        // Get all referrals grouped by status
        const pipeline = {
            pending: [],
            assigned: [],
            contacted: [],
            site_visit: [],
            qualified: [],
            booking: [],
            converted: [],
            dropped: []
        };

        const referrals = await Referral.find(filter)
            .populate('advocateId', 'firstName lastName phone')
            .populate('assignedTo', 'firstName lastName')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Group referrals by status
        referrals.forEach(referral => {
            if (pipeline[referral.status]) {
                pipeline[referral.status].push({
                    ...referral,
                    daysInStatus: Math.floor((new Date() - new Date(referral.assignedAt || referral.createdAt)) / (1000 * 60 * 60 * 24))
                });
            }
        });

        // Get counts for each status
        const counts = {
            pending: pipeline.pending.length,
            assigned: pipeline.assigned.length,
            contacted: pipeline.contacted.length,
            site_visit: pipeline.site_visit.length,
            qualified: pipeline.qualified.length,
            booking: pipeline.booking.length,
            converted: pipeline.converted.length,
            dropped: pipeline.dropped.length
        };

        successResponse(res, 200, 'Pipeline data retrieved successfully', {
            pipeline,
            counts
        });
    } catch (error) {
        console.error('Get pipeline error:', error);
        errorResponse(res, 500, 'Failed to retrieve pipeline data');
    }
});

// GET /api/crm/payments - Get all payment records
router.get('/payments', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const { status, projectId, search, page = 1, limit = 20 } = req.query;

        const filter = { isDeleted: false };

        if (status) {
            filter.status = status;
        }

        if (projectId) {
            filter.projectId = projectId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let payments = await PaymentRecord.find(filter)
            .populate('referralId', 'referrerName referrerPhone')
            .populate('advocateId', 'firstName lastName phone')
            .populate('projectId', 'name')
            .populate('processedBy', 'firstName lastName')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Apply search filter if provided
        if (search) {
            payments = payments.filter(payment => 
                payment.referralId?.referrerName?.toLowerCase().includes(search.toLowerCase()) ||
                payment.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
                payment.advocateId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                payment.advocateId?.lastName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await PaymentRecord.countDocuments(filter);

        // Calculate summary
        const summary = await PaymentRecord.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const summaryObj = {
            pending: { count: 0, amount: 0 },
            processing: { count: 0, amount: 0 },
            processed: { count: 0, amount: 0 },
            completed: { count: 0, amount: 0 },
            failed: { count: 0, amount: 0 }
        };

        summary.forEach(item => {
            if (summaryObj[item._id]) {
                summaryObj[item._id] = {
                    count: item.count,
                    amount: item.totalAmount
                };
            }
        });

        successResponse(res, 200, 'Payment records retrieved successfully', {
            payments,
            summary: summaryObj,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        errorResponse(res, 500, 'Failed to retrieve payment records');
    }
});

// GET /api/crm/sales-associates - Get all sales associates with stats
router.get('/sales-associates', authenticateToken, verifyCRMManager, async (req, res) => {
    try {
        const salesAssociates = await User.find({
            role: USER_ROLES.SALES_ASSOCIATE,
            isActive: true
        }).select('firstName lastName email phone createdAt').lean();

        const associatesWithStats = await Promise.all(
            salesAssociates.map(async (associate) => {
                const assignedCount = await Referral.countDocuments({
                    assignedTo: associate._id,
                    isDeleted: false
                });

                const convertedCount = await Referral.countDocuments({
                    assignedTo: associate._id,
                    status: 'converted',
                    isDeleted: false
                });

                const activeCount = await Referral.countDocuments({
                    assignedTo: associate._id,
                    status: { $in: ['assigned', 'contacted', 'site_visit', 'qualified', 'booking'] },
                    isDeleted: false
                });

                return {
                    ...associate,
                    stats: {
                        assigned: assignedCount,
                        converted: convertedCount,
                        active: activeCount,
                        conversionRate: assignedCount > 0 
                            ? ((convertedCount / assignedCount) * 100).toFixed(2) 
                            : 0
                    }
                };
            })
        );

        successResponse(res, 200, 'Sales associates retrieved successfully', {
            salesAssociates: associatesWithStats
        });
    } catch (error) {
        console.error('Get sales associates error:', error);
        errorResponse(res, 500, 'Failed to retrieve sales associates');
    }
});

// ============ SALES ASSOCIATE ENDPOINTS ============

// GET /api/crm/associate/dashboard - Sales Associate Dashboard
router.get('/associate/dashboard', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const associateId = req.user.id;

        // Count assigned referrals
        const myReferralsCount = await Referral.countDocuments({
            assignedTo: associateId,
            status: { $in: ['assigned', 'contacted', 'site_visit', 'qualified', 'booking'] },
            isDeleted: false
        });

        // Count pending actions (referrals needing follow-up)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pendingActionsCount = await Referral.countDocuments({
            assignedTo: associateId,
            $or: [
                { nextFollowUpDate: { $lte: new Date() } },
                { 
                    status: 'assigned',
                    assignedAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            ],
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        });

        // Get today's activity
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const dailyActivity = await Interaction.aggregate([
            {
                $match: {
                    salesAssociateId: associateId,
                    createdAt: { $gte: todayStart }
                }
            },
            {
                $group: {
                    _id: '$interactionType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const activitySummary = {
            callsMade: 0,
            siteVisits: 0,
            notesAdded: 0
        };

        dailyActivity.forEach(item => {
            if (item._id === 'call') activitySummary.callsMade = item.count;
            if (item._id === 'site_visit') activitySummary.siteVisits = item.count;
            if (item._id === 'note') activitySummary.notesAdded = item.count;
        });

        // Status updates made today
        const statusUpdatesToday = await Referral.countDocuments({
            assignedTo: associateId,
            updatedAt: { $gte: todayStart }
        });

        activitySummary.statusUpdates = statusUpdatesToday;

        // Monthly performance
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyConversions = await Referral.countDocuments({
            assignedTo: associateId,
            status: 'converted',
            convertedAt: { $gte: monthStart },
            isDeleted: false
        });

        const totalAssignedThisMonth = await Referral.countDocuments({
            assignedTo: associateId,
            assignedAt: { $gte: monthStart },
            isDeleted: false
        });

        const monthlyConversionRate = totalAssignedThisMonth > 0
            ? ((monthlyConversions / totalAssignedThisMonth) * 100).toFixed(2)
            : 0;

        // Get upcoming follow-ups
        const upcomingFollowUps = await Referral.find({
            assignedTo: associateId,
            nextFollowUpDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        })
            .populate('advocateId', 'firstName lastName')
            .select('referrerName referrerPhone status nextFollowUpDate')
            .sort({ nextFollowUpDate: 1 })
            .limit(5)
            .lean();

        successResponse(res, 200, 'Dashboard data retrieved successfully', {
            myReferrals: myReferralsCount,
            pendingActions: pendingActionsCount,
            dailyActivity: activitySummary,
            monthlyPerformance: {
                conversions: monthlyConversions,
                conversionRate: parseFloat(monthlyConversionRate),
                totalAssigned: totalAssignedThisMonth
            },
            upcomingFollowUps
        });
    } catch (error) {
        console.error('Get associate dashboard error:', error);
        errorResponse(res, 500, 'Failed to retrieve dashboard data');
    }
});

// GET /api/crm/associate/referrals - Get sales associate's assigned referrals
router.get('/associate/referrals', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const associateId = req.user.id;

        const filter = {
            assignedTo: associateId,
            isDeleted: false
        };

        if (status) {
            filter.status = status;
        } else {
            // By default, exclude converted and dropped
            filter.status = { $in: ['assigned', 'contacted', 'site_visit', 'qualified', 'booking'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const referrals = await Referral.find(filter)
            .populate('advocateId', 'firstName lastName phone email')
            .populate('projectId', 'name location')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ nextFollowUpDate: 1, createdAt: -1 })
            .lean();

        // Add days since assignment for each
        const referralsWithMeta = referrals.map(ref => ({
            ...ref,
            daysSinceAssignment: Math.floor((new Date() - new Date(ref.assignedAt)) / (1000 * 60 * 60 * 24)),
            isOverdue: ref.nextFollowUpDate && new Date(ref.nextFollowUpDate) < new Date()
        }));

        const total = await Referral.countDocuments(filter);

        successResponse(res, 200, 'Referrals retrieved successfully', {
            referrals: referralsWithMeta,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get associate referrals error:', error);
        errorResponse(res, 500, 'Failed to retrieve referrals');
    }
});

// POST /api/crm/associate/interactions - Log interaction/call
router.post('/associate/interactions', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const {
            referralId,
            interactionType,
            outcome,
            duration,
            notes,
            nextFollowUpDate
        } = req.body;

        // Validation
        if (!referralId || !interactionType || !outcome || !notes) {
            return errorResponse(res, 400, 'Missing required fields');
        }

        // Check word count in notes (minimum 50 words)
        const wordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 50) {
            return errorResponse(res, 400, `Notes must contain at least 50 words. Current word count: ${wordCount}`);
        }

        // Verify referral exists and is assigned to this associate
        const referral = await Referral.findById(referralId);
        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        if (referral.assignedTo.toString() !== req.user.id) {
            return errorResponse(res, 403, 'You can only log interactions for your assigned referrals');
        }

        // Create interaction
        const interaction = new Interaction({
            referralId,
            salesAssociateId: req.user.id,
            interactionType,
            outcome,
            duration: duration || 0,
            notes,
            nextFollowUpDate: nextFollowUpDate || null,
            createdBy: req.user.id
        });

        await interaction.save();

        // Update referral
        referral.lastInteractionAt = new Date();
        if (interactionType === 'call' || interactionType === 'meeting') {
            referral.lastContactedAt = new Date();
        }
        if (nextFollowUpDate) {
            referral.nextFollowUpDate = nextFollowUpDate;
        }
        // Reset escalation on interaction
        referral.escalationLevel = 0;
        referral.escalationFlag = false;

        await referral.save();

        await interaction.populate('salesAssociateId', 'firstName lastName');

        successResponse(res, 201, 'Interaction logged successfully', {
            interaction
        });
    } catch (error) {
        console.error('Log interaction error:', error);
        if (error.name === 'ValidationError') {
            return errorResponse(res, 400, error.message);
        }
        errorResponse(res, 500, 'Failed to log interaction');
    }
});

// GET /api/crm/associate/interactions/:referralId - Get interaction history for a referral
router.get('/associate/interactions/:referralId', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const { referralId } = req.params;

        // Verify referral is assigned to this associate
        const referral = await Referral.findById(referralId);
        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        if (referral.assignedTo.toString() !== req.user.id) {
            return errorResponse(res, 403, 'You can only view interactions for your assigned referrals');
        }

        const interactions = await Interaction.find({ referralId })
            .populate('salesAssociateId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        successResponse(res, 200, 'Interaction history retrieved successfully', {
            interactions
        });
    } catch (error) {
        console.error('Get interaction history error:', error);
        errorResponse(res, 500, 'Failed to retrieve interaction history');
    }
});

// PATCH /api/crm/associate/referrals/:id/status - Update referral status
router.patch('/associate/referrals/:id/status', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status) {
            return errorResponse(res, 400, 'Status is required');
        }

        const validStatuses = ['contacted', 'site_visit', 'qualified', 'booking', 'converted', 'dropped'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 400, 'Invalid status');
        }

        // Verify referral is assigned to this associate
        const referral = await Referral.findById(req.params.id);
        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        if (referral.assignedTo.toString() !== req.user.id) {
            return errorResponse(res, 403, 'You can only update your assigned referrals');
        }

        // If marking as dropped, notes are required
        if (status === 'dropped' && (!notes || notes.trim().split(/\s+/).length < 50)) {
            return errorResponse(res, 400, 'When marking as dropped, please provide detailed notes (minimum 50 words) explaining the reason');
        }

        // Update status
        const oldStatus = referral.status;
        referral.status = status;

        // Update status-specific date fields
        if (status === 'contacted' && !referral.contactedAt) {
            referral.contactedAt = new Date();
        } else if (status === 'site_visit' && !referral.siteVisitAt) {
            referral.siteVisitAt = new Date();
        } else if (status === 'qualified' && !referral.qualifiedAt) {
            referral.qualifiedAt = new Date();
        } else if (status === 'booking' && !referral.bookingAt) {
            referral.bookingAt = new Date();
        } else if (status === 'converted' && !referral.convertedAt) {
            referral.convertedAt = new Date();
        } else if (status === 'dropped' && !referral.droppedAt) {
            referral.droppedAt = new Date();
            referral.lostReason = notes || 'Dropped by sales associate';
        }

        await referral.save();

        // Log status change as interaction if notes provided
        if (notes) {
            const interaction = new Interaction({
                referralId: referral._id,
                salesAssociateId: req.user.id,
                interactionType: 'note',
                outcome: 'other',
                notes: `Status updated from '${oldStatus}' to '${status}'. Details: ${notes}`,
                createdBy: req.user.id
            });
            await interaction.save();
        }

        await referral.populate('advocateId', 'firstName lastName');
        await referral.populate('projectId', 'name');

        successResponse(res, 200, 'Referral status updated successfully', {
            referral
        });
    } catch (error) {
        console.error('Update referral status error:', error);
        errorResponse(res, 500, 'Failed to update referral status');
    }
});

// POST /api/crm/associate/payments - Mark payment for converted referral
router.post('/associate/payments', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const {
            referralId,
            amount,
            paymentMethod,
            paymentDate,
            transactionId,
            notes
        } = req.body;

        // Validation
        if (!referralId || !amount || !paymentMethod || !paymentDate) {
            return errorResponse(res, 400, 'Missing required fields: referralId, amount, paymentMethod, paymentDate');
        }

        // Verify referral
        const referral = await Referral.findById(referralId)
            .populate('advocateId')
            .populate('projectId');

        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        if (referral.assignedTo.toString() !== req.user.id) {
            return errorResponse(res, 403, 'You can only mark payments for your assigned referrals');
        }

        if (referral.status !== 'converted') {
            return errorResponse(res, 400, 'Payment can only be marked for converted referrals');
        }

        // Check if payment already exists
        const existingPayment = await PaymentRecord.findOne({ referralId });
        if (existingPayment) {
            return errorResponse(res, 400, 'Payment already recorded for this referral');
        }

        // Create payment record
        const payment = new PaymentRecord({
            referralId: referral._id,
            customerId: referral.customerId || null,
            projectId: referral.projectId._id,
            advocateId: referral.advocateId._id,
            amount: parseFloat(amount),
            currency: 'INR',
            paymentMethod,
            paymentDate: new Date(paymentDate),
            transactionId: transactionId || null,
            status: 'processing',
            processedBy: req.user.id,
            notes: notes || null
        });

        await payment.save();

        // Update referral payment status
        referral.paymentStatus = 'processed';
        await referral.save();

        // Generate reward for advocate
        const rewardAmount = amount * 0.02; // 2% commission (configurable)
        
        const reward = new Reward({
            advocateId: referral.advocateId._id,
            projectId: referral.projectId._id,
            referralId: referral._id,
            amount: rewardAmount,
            currency: 'INR',
            type: 'referral_commission',
            description: `Commission for successful referral: ${referral.referrerName}`,
            status: 'earned',
            earnedAt: new Date()
        });

        await reward.save();

        // Update referral reward info
        referral.rewardAmount = rewardAmount;
        referral.rewardStatus = 'earned';
        referral.rewardId = reward._id;
        await referral.save();

        // Update payment record with reward info
        payment.rewardGenerated = true;
        payment.rewardId = reward._id;
        await payment.save();

        await payment.populate('processedBy', 'firstName lastName');

        successResponse(res, 201, 'Payment recorded and reward generated successfully', {
            payment,
            reward
        });
    } catch (error) {
        console.error('Mark payment error:', error);
        errorResponse(res, 500, 'Failed to record payment');
    }
});

// GET /api/crm/associate/payments - Get sales associate's payment records
router.get('/associate/payments', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const filter = {
            processedBy: req.user.id,
            isDeleted: false
        };

        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const payments = await PaymentRecord.find(filter)
            .populate('referralId', 'referrerName referrerPhone')
            .populate('advocateId', 'firstName lastName')
            .populate('projectId', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        const total = await PaymentRecord.countDocuments(filter);

        successResponse(res, 200, 'Payment records retrieved successfully', {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get associate payments error:', error);
        errorResponse(res, 500, 'Failed to retrieve payment records');
    }
});

// GET /api/crm/associate/performance - Get sales associate's performance stats
router.get('/associate/performance', authenticateToken, verifySalesAssociate, async (req, res) => {
    try {
        const associateId = req.user.id;

        // Overall stats
        const totalAssigned = await Referral.countDocuments({
            assignedTo: associateId,
            isDeleted: false
        });

        const converted = await Referral.countDocuments({
            assignedTo: associateId,
            status: 'converted',
            isDeleted: false
        });

        const dropped = await Referral.countDocuments({
            assignedTo: associateId,
            status: 'dropped',
            isDeleted: false
        });

        const active = await Referral.countDocuments({
            assignedTo: associateId,
            status: { $in: ['assigned', 'contacted', 'site_visit', 'qualified', 'booking'] },
            isDeleted: false
        });

        const conversionRate = totalAssigned > 0 
            ? ((converted / totalAssigned) * 100).toFixed(2) 
            : 0;

        // Monthly breakdown
        const monthlyStats = await Referral.aggregate([
            {
                $match: {
                    assignedTo: associateId,
                    isDeleted: false,
                    assignedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$assignedAt' },
                        month: { $month: '$assignedAt' }
                    },
                    assigned: { $sum: 1 },
                    converted: {
                        $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Total interactions logged
        const totalInteractions = await Interaction.countDocuments({
            salesAssociateId: associateId
        });

        // Total payments processed
        const totalPayments = await PaymentRecord.countDocuments({
            processedBy: associateId
        });

        const totalPaymentAmount = await PaymentRecord.aggregate([
            { $match: { processedBy: associateId, isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        successResponse(res, 200, 'Performance stats retrieved successfully', {
            overall: {
                totalAssigned,
                converted,
                dropped,
                active,
                conversionRate: parseFloat(conversionRate)
            },
            interactions: totalInteractions,
            payments: {
                count: totalPayments,
                totalAmount: totalPaymentAmount.length > 0 ? totalPaymentAmount[0].total : 0
            },
            monthlyStats
        });
    } catch (error) {
        console.error('Get performance stats error:', error);
        errorResponse(res, 500, 'Failed to retrieve performance stats');
    }
});

export default router;
