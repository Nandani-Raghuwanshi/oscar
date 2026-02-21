import User from '../models/User.js';
import Project from '../models/Project.js';
import Customer from '../models/Customer.js';
import Referral from '../models/Referral.js';
import BrandReferral from '../models/BrandReferral.js';
import Lead from '../models/Lead.js';
import CallLog from '../models/CallLog.js';
import Reward from '../models/Reward.js';
import BrandReward from '../models/BrandReward.js';
import Escalation from '../models/Escalation.js';
import Notification from '../models/Notification.js';

/**
 * Analytics Service
 * Provides comprehensive data aggregation and analysis across all modules
 */

class AnalyticsService {
    /**
     * Get overall system statistics
     */
    async getSystemOverview(filters = {}) {
        const { startDate, endDate, projectId } = filters;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const projectFilter = projectId ? { project: projectId } : {};

        const [
            totalUsers,
            activeUsers,
            totalProjects,
            activeProjects,
            totalCustomers,
            totalReferrals,
            totalLeads,
            convertedLeads,
            totalRevenue
        ] = await Promise.all([
            User.countDocuments({ ...dateFilter }),
            User.countDocuments({ isActive: true, ...dateFilter }),
            Project.countDocuments({ ...dateFilter }),
            Project.countDocuments({ status: 'active', ...dateFilter }),
            Customer.countDocuments({ ...projectFilter, ...dateFilter }),
            Referral.countDocuments({ ...projectFilter, ...dateFilter }),
            Lead.countDocuments({ ...projectFilter, ...dateFilter }),
            Lead.countDocuments({ status: 'converted', ...projectFilter, ...dateFilter }),
            Lead.aggregate([
                { $match: { status: 'converted', ...projectFilter, ...dateFilter } },
                { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
            ])
        ]);

        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

        return {
            users: { total: totalUsers, active: activeUsers },
            projects: { total: totalProjects, active: activeProjects },
            customers: totalCustomers,
            referrals: totalReferrals,
            leads: { total: totalLeads, converted: convertedLeads, conversionRate: parseFloat(conversionRate) },
            revenue: totalRevenue[0]?.total || 0
        };
    }

    /**
     * Get user analytics by role
     */
    async getUserAnalytics(filters = {}) {
        const { startDate, endDate } = filters;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const usersByRole = await User.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: { $sum: { $cond: ['$isActive', 1, 0] } },
                    inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return usersByRole;
    }

    /**
     * Get project performance analytics
     */
    async getProjectAnalytics(filters = {}) {
        const { startDate, endDate, projectId } = filters;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const projectMatch = projectId ? { _id: projectId } : {};

        const projectStats = await Project.aggregate([
            { $match: { ...projectMatch, ...dateFilter } },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'customers'
                }
            },
            {
                $lookup: {
                    from: 'referrals',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'referrals'
                }
            },
            {
                $lookup: {
                    from: 'leads',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'leads'
                }
            },
            {
                $project: {
                    name: 1,
                    status: 1,
                    builder: 1,
                    totalCustomers: { $size: '$customers' },
                    totalReferrals: { $size: '$referrals' },
                    totalLeads: { $size: '$leads' },
                    convertedLeads: {
                        $size: {
                            $filter: {
                                input: '$leads',
                                as: 'lead',
                                cond: { $eq: ['$$lead.status', 'converted'] }
                            }
                        }
                    },
                    revenue: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$leads',
                                        as: 'lead',
                                        cond: { $eq: ['$$lead.status', 'converted'] }
                                    }
                                },
                                as: 'lead',
                                in: '$$lead.paymentAmount'
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    conversionRate: {
                        $cond: [
                            { $gt: ['$totalLeads', 0] },
                            { $multiply: [{ $divide: ['$convertedLeads', '$totalLeads'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        return projectStats;
    }

    /**
     * Get referral performance analytics
     */
    async getReferralAnalytics(filters = {}) {
        const { startDate, endDate, projectId, status } = filters;

        const matchFilter = {};
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }
        if (projectId) matchFilter.project = projectId;
        if (status) matchFilter.status = status;

        const referralStats = await Referral.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const referralsByAdvocate = await Referral.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$advocate',
                    totalReferrals: { $sum: 1 },
                    converted: {
                        $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'advocateInfo'
                }
            },
            { $unwind: { path: '$advocateInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    advocateId: '$_id',
                    advocateName: '$advocateInfo.name',
                    advocateEmail: '$advocateInfo.email',
                    totalReferrals: 1,
                    converted: 1,
                    pending: 1,
                    conversionRate: {
                        $cond: [
                            { $gt: ['$totalReferrals', 0] },
                            { $multiply: [{ $divide: ['$converted', '$totalReferrals'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalReferrals: -1 } },
            { $limit: 20 }
        ]);

        return {
            byStatus: referralStats,
            topAdvocates: referralsByAdvocate
        };
    }

    /**
     * Get sales pipeline analytics
     */
    async getSalesPipelineAnalytics(filters = {}) {
        const { startDate, endDate, projectId, assignedTo } = filters;

        const matchFilter = {};
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }
        if (projectId) matchFilter.project = projectId;
        if (assignedTo) matchFilter.assignedTo = assignedTo;

        const pipelineStats = await Lead.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$paymentAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const salesPerformance = await Lead.aggregate([
            { $match: { ...matchFilter, assignedTo: { $exists: true } } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalLeads: { $sum: 1 },
                    converted: {
                        $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
                    },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'converted'] },
                                '$paymentAmount',
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: '$_id',
                    userName: '$userInfo.name',
                    userEmail: '$userInfo.email',
                    totalLeads: 1,
                    converted: 1,
                    revenue: 1,
                    conversionRate: {
                        $cond: [
                            { $gt: ['$totalLeads', 0] },
                            { $multiply: [{ $divide: ['$converted', '$totalLeads'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 20 }
        ]);

        return {
            byStatus: pipelineStats,
            topPerformers: salesPerformance
        };
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(filters = {}) {
        const { startDate, endDate, projectId, groupBy = 'month' } = filters;

        const matchFilter = { status: 'converted' };
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }
        if (projectId) matchFilter.project = projectId;

        let dateGrouping;
        switch (groupBy) {
            case 'day':
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case 'week':
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                break;
            case 'year':
                dateGrouping = {
                    year: { $year: '$createdAt' }
                };
                break;
            default: // month
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
        }

        const revenueOverTime = await Lead.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: dateGrouping,
                    totalRevenue: { $sum: '$paymentAmount' },
                    conversions: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        const totalRevenue = await Lead.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$paymentAmount' },
                    count: { $sum: 1 },
                    average: { $avg: '$paymentAmount' }
                }
            }
        ]);

        return {
            overTime: revenueOverTime,
            summary: totalRevenue[0] || { total: 0, count: 0, average: 0 }
        };
    }

    /**
     * Get activity timeline
     */
    async getActivityTimeline(filters = {}) {
        const { startDate, endDate, projectId, limit = 50 } = filters;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const projectFilter = projectId ? { project: projectId } : {};

        // Aggregate activities from multiple collections
        const [referralActivities, leadActivities, callActivities, escalationActivities] = await Promise.all([
            Referral.find({ ...projectFilter, ...dateFilter })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('advocate referredCustomer status createdAt')
                .populate('advocate', 'name email')
                .lean(),
            Lead.find({ ...projectFilter, ...dateFilter })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('customerName status assignedTo createdAt')
                .populate('assignedTo', 'name email')
                .lean(),
            CallLog.find({ ...dateFilter })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('lead callType outcome createdAt')
                .populate('lead', 'customerName')
                .lean(),
            Escalation.find({ ...projectFilter, ...dateFilter })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('customer reason status priority createdAt')
                .populate('customer', 'name')
                .lean()
        ]);

        // Combine and format activities
        const activities = [
            ...referralActivities.map(a => ({
                type: 'referral',
                description: `${a.advocate?.name || 'Unknown'} referred ${a.referredCustomer?.name || 'a customer'}`,
                status: a.status,
                timestamp: a.createdAt,
                details: a
            })),
            ...leadActivities.map(a => ({
                type: 'lead',
                description: `Lead ${a.customerName} status changed to ${a.status}`,
                status: a.status,
                timestamp: a.createdAt,
                details: a
            })),
            ...callActivities.map(a => ({
                type: 'call',
                description: `${a.callType} call - ${a.outcome}`,
                status: a.outcome,
                timestamp: a.createdAt,
                details: a
            })),
            ...escalationActivities.map(a => ({
                type: 'escalation',
                description: `Escalation for ${a.customer?.name || 'customer'} - ${a.reason}`,
                status: a.status,
                timestamp: a.createdAt,
                details: a
            }))
        ];

        // Sort by timestamp and limit
        activities.sort((a, b) => b.timestamp - a.timestamp);
        return activities.slice(0, limit);
    }

    /**
     * Get ROI calculation
     */
    async getROIAnalytics(filters = {}) {
        const { startDate, endDate, projectId } = filters;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const projectFilter = projectId ? { project: projectId } : {};

        // Calculate total revenue
        const revenueData = await Lead.aggregate([
            { $match: { status: 'converted', ...projectFilter, ...dateFilter } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$paymentAmount' },
                    conversions: { $sum: 1 }
                }
            }
        ]);

        // Calculate total rewards paid
        const rewardsData = await Promise.all([
            Reward.aggregate([
                { $match: { status: { $in: ['processed', 'claimed'] }, ...projectFilter, ...dateFilter } },
                { $group: { _id: null, totalRewards: { $sum: '$amount' } } }
            ]),
            BrandReward.aggregate([
                { $match: { status: { $in: ['processed', 'claimed'] }, ...projectFilter, ...dateFilter } },
                { $group: { _id: null, totalRewards: { $sum: '$amount' } } }
            ])
        ]);

        const totalRevenue = revenueData[0]?.totalRevenue || 0;
        const totalRewards = (rewardsData[0][0]?.totalRewards || 0) + (rewardsData[1][0]?.totalRewards || 0);
        const conversions = revenueData[0]?.conversions || 0;

        // Calculate ROI
        const roi = totalRewards > 0 ? (((totalRevenue - totalRewards) / totalRewards) * 100).toFixed(2) : 0;
        const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalRewards) / totalRevenue) * 100).toFixed(2) : 0;

        return {
            totalRevenue,
            totalRewards,
            netProfit: totalRevenue - totalRewards,
            roi: parseFloat(roi),
            profitMargin: parseFloat(profitMargin),
            conversions,
            averageRevenuePerConversion: conversions > 0 ? (totalRevenue / conversions).toFixed(2) : 0
        };
    }

    /**
     * Get custom report data based on parameters
     */
    async generateCustomReport(reportConfig) {
        const { metrics, dimensions, filters, sort } = reportConfig;

        // Build aggregation pipeline dynamically
        const pipeline = [];

        // Add filters
        if (filters) {
            const matchStage = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) matchStage[key] = filters[key];
            });
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
        }

        // Add grouping by dimensions
        if (dimensions && dimensions.length > 0) {
            const groupStage = { _id: {} };
            dimensions.forEach(dim => {
                groupStage._id[dim] = `$${dim}`;
            });

            // Add metrics
            if (metrics && metrics.length > 0) {
                metrics.forEach(metric => {
                    switch (metric.aggregation) {
                        case 'count':
                            groupStage[metric.name] = { $sum: 1 };
                            break;
                        case 'sum':
                            groupStage[metric.name] = { $sum: `$${metric.field}` };
                            break;
                        case 'avg':
                            groupStage[metric.name] = { $avg: `$${metric.field}` };
                            break;
                        case 'min':
                            groupStage[metric.name] = { $min: `$${metric.field}` };
                            break;
                        case 'max':
                            groupStage[metric.name] = { $max: `$${metric.field}` };
                            break;
                    }
                });
            }

            pipeline.push({ $group: groupStage });
        }

        // Add sorting
        if (sort) {
            pipeline.push({ $sort: sort });
        }

        return pipeline;
    }
}

const analyticsServiceInstance = new AnalyticsService();
export default analyticsServiceInstance;
