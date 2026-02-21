import express from 'express';
import analyticsService from '../services/analyticsService.js';
import exportService from '../utils/exportService.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Referral from '../models/Referral.js';
import BrandReferral from '../models/BrandReferral.js';
import Customer from '../models/Customer.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * @route GET /api/analytics/overview
 * @desc Get overall system statistics
 * @access Admin, Builder, CRM Manager
 */
router.get('/overview', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { startDate, endDate, projectId } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;

        const overview = await analyticsService.getSystemOverview(filters);
        successResponse(res, 200, 'System overview retrieved successfully', overview);
    } catch (error) {
        console.error('Error fetching system overview:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/users
 * @desc Get user analytics by role
 * @access Admin
 */
router.get('/users', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const userAnalytics = await analyticsService.getUserAnalytics(filters);
        successResponse(res, 200, 'User analytics retrieved successfully', userAnalytics);
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/projects
 * @desc Get project performance analytics
 * @access Admin, Builder
 */
router.get('/projects', authenticateToken, authorize('admin', 'builder'), async (req, res) => {
    try {
        const { startDate, endDate, projectId } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;

        const projectAnalytics = await analyticsService.getProjectAnalytics(filters);
        successResponse(res, 200, 'Project analytics retrieved successfully', projectAnalytics);
    } catch (error) {
        console.error('Error fetching project analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/referrals
 * @desc Get referral performance analytics
 * @access Admin, Builder, CRM Manager
 */
router.get('/referrals', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { startDate, endDate, projectId, status } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;
        if (status) filters.status = status;

        const referralAnalytics = await analyticsService.getReferralAnalytics(filters);
        successResponse(res, 200, 'Referral analytics retrieved successfully', referralAnalytics);
    } catch (error) {
        console.error('Error fetching referral analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/sales-pipeline
 * @desc Get sales pipeline analytics
 * @access Admin, CRM Manager, Sales Associate
 */
router.get('/sales-pipeline', authenticateToken, authorize('admin', 'crm_manager', 'sales_associate'), async (req, res) => {
    try {
        const { startDate, endDate, projectId, assignedTo } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;
        if (assignedTo) filters.assignedTo = assignedTo;

        const pipelineAnalytics = await analyticsService.getSalesPipelineAnalytics(filters);
        successResponse(res, 200, 'Sales pipeline analytics retrieved successfully', pipelineAnalytics);
    } catch (error) {
        console.error('Error fetching sales pipeline analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/revenue
 * @desc Get revenue analytics
 * @access Admin, Builder, CRM Manager
 */
router.get('/revenue', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { startDate, endDate, projectId, groupBy } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;
        if (groupBy) filters.groupBy = groupBy;

        const revenueAnalytics = await analyticsService.getRevenueAnalytics(filters);
        successResponse(res, 200, 'Revenue analytics retrieved successfully', revenueAnalytics);
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/roi
 * @desc Get ROI analytics
 * @access Admin, Builder
 */
router.get('/roi', authenticateToken, authorize('admin', 'builder'), async (req, res) => {
    try {
        const { startDate, endDate, projectId } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;

        const roiAnalytics = await analyticsService.getROIAnalytics(filters);
        successResponse(res, 200, 'ROI analytics retrieved successfully', roiAnalytics);
    } catch (error) {
        console.error('Error fetching ROI analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/activity-timeline
 * @desc Get activity timeline
 * @access Admin, Builder, CRM Manager
 */
router.get('/activity-timeline', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { startDate, endDate, projectId, limit } = req.query;

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (projectId) filters.projectId = projectId;
        if (limit) filters.limit = parseInt(limit);

        const timeline = await analyticsService.getActivityTimeline(filters);
        successResponse(res, 200, 'Activity timeline retrieved successfully', timeline);
    } catch (error) {
        console.error('Error fetching activity timeline:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route POST /api/analytics/custom-report
 * @desc Generate custom report
 * @access Admin, Builder, CRM Manager
 */
router.post('/custom-report', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { metrics, dimensions, filters, sort } = req.body;

        const reportConfig = { metrics, dimensions, filters, sort };
        const pipeline = await analyticsService.generateCustomReport(reportConfig);

        successResponse(res, 200, 'Custom report generated successfully', { pipeline, config: reportConfig });
    } catch (error) {
        console.error('Error generating custom report:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/export/leads
 * @desc Export leads data
 * @access Admin, CRM Manager
 */
router.get('/export/leads', authenticateToken, authorize('admin', 'crm_manager'), async (req, res) => {
    try {
        const { format = 'csv', ...filters } = req.query;

        // Build query
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.projectId) query.project = filters.projectId;
        if (filters.assignedTo) query.assignedTo = filters.assignedTo;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        const exportData = await exportService.exportLeads(leads, format);

        res.setHeader('Content-Type', exportService.getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename=leads_${Date.now()}${exportService.getFileExtension(format)}`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exporting leads:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/export/referrals
 * @desc Export referrals data
 * @access Admin, Builder, CRM Manager
 */
router.get('/export/referrals', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { format = 'csv', type = 'project', ...filters } = req.query;

        // Build query
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.projectId) query.project = filters.projectId;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }

        let referrals;
        if (type === 'brand') {
            referrals = await BrandReferral.find(query)
                .populate('advocate', 'name email')
                .populate('project', 'name')
                .populate('reward')
                .sort({ createdAt: -1 });
        } else {
            referrals = await Referral.find(query)
                .populate('advocate', 'name email')
                .populate('project', 'name')
                .populate('reward')
                .sort({ createdAt: -1 });
        }

        const exportData = await exportService.exportReferrals(referrals, format);

        res.setHeader('Content-Type', exportService.getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename=referrals_${Date.now()}${exportService.getFileExtension(format)}`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exporting referrals:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/export/users
 * @desc Export users data
 * @access Admin
 */
router.get('/export/users', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const { format = 'csv', ...filters } = req.query;

        // Build query
        const query = {};
        if (filters.role) query.role = filters.role;
        if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
        if (filters.projectId) query.project = filters.projectId;

        const users = await User.find(query)
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        const exportData = await exportService.exportUsers(users, format);

        res.setHeader('Content-Type', exportService.getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename=users_${Date.now()}${exportService.getFileExtension(format)}`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exporting users:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/export/customers
 * @desc Export customers data
 * @access Admin, Builder
 */
router.get('/export/customers', authenticateToken, authorize('admin', 'builder'), async (req, res) => {
    try {
        const { format = 'csv', ...filters } = req.query;

        // Build query
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.projectId) query.project = filters.projectId;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }

        const customers = await Customer.find(query)
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        const exportData = await exportService.exportCustomers(customers, format);

        res.setHeader('Content-Type', exportService.getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename=customers_${Date.now()}${exportService.getFileExtension(format)}`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exporting customers:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * @route GET /api/analytics/export/analytics
 * @desc Export analytics report
 * @access Admin, Builder, CRM Manager
 */
router.get('/export/analytics', authenticateToken, authorize('admin', 'builder', 'crm_manager'), async (req, res) => {
    try {
        const { format = 'csv', reportType = 'general', ...filters } = req.query;

        let analyticsData;
        switch (reportType) {
            case 'revenue':
                analyticsData = await analyticsService.getRevenueAnalytics(filters);
                break;
            case 'sales':
                analyticsData = await analyticsService.getSalesPipelineAnalytics(filters);
                break;
            case 'project':
                analyticsData = await analyticsService.getProjectAnalytics(filters);
                break;
            case 'roi':
                analyticsData = await analyticsService.getROIAnalytics(filters);
                break;
            default:
                analyticsData = await analyticsService.getSystemOverview(filters);
        }

        const exportData = await exportService.exportAnalytics(analyticsData, format, reportType);

        res.setHeader('Content-Type', exportService.getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}_analytics_${Date.now()}${exportService.getFileExtension(format)}`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exporting analytics:', error);
        errorResponse(res, 500, error.message);
    }
});

export default router;
