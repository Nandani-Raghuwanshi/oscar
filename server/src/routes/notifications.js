import express from 'express';
import { body, validationResult } from 'express-validator';
import notificationService from '../utils/notificationService.js';

import Notification from '../models/Notification.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Verify user is authenticated
router.use(authenticateToken);

// ========== USER ENDPOINTS ==========

/**
 * GET /api/notifications
 * Get user's notifications with pagination and filtering
 */
router.get('/', async (req, res) => {
    try {
        const { status, type, limit = 20, page = 1 } = req.query;

        const result = await notificationService.getUserNotifications(
            req.user.id,
            { status, type, limit: parseInt(limit), page: parseInt(page) }
        );

        res.json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 */
router.get('/unread/count', async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);

        res.json({
            success: true,
            data: { unreadCount: count },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all/all', async (req, res) => {
    try {
        const result = await notificationService.markAllAsRead(req.user.id);

        res.json({
            success: true,
            data: result,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
    try {
        const notification = await notificationService.deleteNotification(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.json({
            success: true,
            data: notification,
            message: 'Notification deleted',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ========== USER PREFERENCES ENDPOINTS ==========

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
router.get('/preferences/user', async (req, res) => {
    try {
        const preferences = await notificationService.getUserPreferences(req.user.id);

        res.json({
            success: true,
            data: preferences.preferences || {},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PATCH /api/notifications/preferences
 * Update user's notification preferences
 */
router.patch(
    '/preferences/update',
    [
        body('emailNotifications').optional().isBoolean(),
        body('smsNotifications').optional().isBoolean(),
        body('pushNotifications').optional().isBoolean(),
        body('whatsappNotifications').optional().isBoolean(),
        body('escalationAlerts').optional().isBoolean(),
        body('dailyDigest').optional().isBoolean(),
        body('marketing').optional().isBoolean(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const preferences = await notificationService.updateUserPreferences(
                req.user.id,
                req.body
            );

            res.json({
                success: true,
                data: preferences.preferences,
                message: 'Preferences updated successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

// ========== ADMIN ENDPOINTS (Send & Schedule) ==========

/**
 * POST /api/notifications/send
 * Send notification to a user (Admin only)
 */
router.post(
    '/send',
    [
        body('userId').isMongoId().withMessage('Invalid user ID'),
        body('templateId').isMongoId().withMessage('Invalid template ID'),
        body('variables').optional().isObject(),
    ],
    async (req, res) => {
        try {
            // Check if user is admin or manager
            if (!['admin', 'crm_manager', 'builder_manager'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to send notifications',
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { userId, templateId, variables } = req.body;

            const notification = await notificationService.sendNotification(
                userId,
                templateId,
                variables
            );

            res.status(201).json({
                success: true,
                data: notification,
                message: 'Notification sent successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * POST /api/notifications/send-bulk
 * Send notification to multiple users (Admin only)
 */
router.post(
    '/send-bulk',
    [
        body('userIds')
            .isArray()
            .withMessage('userIds must be an array')
            .notEmpty()
            .withMessage('userIds cannot be empty'),
        body('templateId').isMongoId().withMessage('Invalid template ID'),
        body('variables').optional().isObject(),
    ],
    async (req, res) => {
        try {
            if (!['admin', 'crm_manager', 'builder_manager'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to send bulk notifications',
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { userIds, templateId, variables } = req.body;

            const notifications = await notificationService.sendBulkNotification(
                userIds,
                templateId,
                variables
            );

            res.status(201).json({
                success: true,
                data: {
                    count: notifications.length,
                    notifications,
                },
                message: `${notifications.length} notifications sent successfully`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * POST /api/notifications/schedule
 * Schedule notification for later (Admin only)
 */
router.post(
    '/schedule',
    [
        body('userId').isMongoId().withMessage('Invalid user ID'),
        body('templateId').isMongoId().withMessage('Invalid template ID'),
        body('scheduledFor').isISO8601().withMessage('Invalid date format'),
        body('variables').optional().isObject(),
    ],
    async (req, res) => {
        try {
            if (!['admin', 'crm_manager', 'builder_manager'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to schedule notifications',
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { userId, templateId, scheduledFor, variables } = req.body;

            const notification = await notificationService.scheduleNotification(
                userId,
                templateId,
                new Date(scheduledFor),
                variables
            );

            res.status(201).json({
                success: true,
                data: notification,
                message: 'Notification scheduled successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

// ========== TEMPLATE MANAGEMENT ENDPOINTS ==========

/**
 * GET /api/notifications/templates
 * Get all notification templates (Admin only)
 */
router.get('/templates/list', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access templates',
            });
        }

        const { type, limit = 50, page = 1 } = req.query;
        const result = await notificationService.getTemplates({
            type,
            limit: parseInt(limit),
            page: parseInt(page),
        });

        res.json({
            success: true,
            data: result.templates,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * POST /api/notifications/templates
 * Create notification template (Admin only)
 */
router.post(
    '/templates/create',
    [
        body('name').trim().notEmpty().withMessage('Template name is required'),
        body('type')
            .isIn([
                'referral',
                'reward',
                'escalation',
                'reminder',
                'payment',
                'message',
                'alert',
                'info',
            ])
            .withMessage('Invalid template type'),
        body('channel')
            .isIn(['email', 'sms', 'whatsapp', 'push', 'in-app'])
            .withMessage('Invalid channel'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
        body('variables').optional().isArray(),
        body('category')
            .isIn([
                'user_management',
                'referral_tracking',
                'reward_management',
                'crm_operations',
                'payment_tracking',
                'escalation_management',
                'system_alerts',
            ])
            .withMessage('Invalid category'),
    ],
    async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to create templates',
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const templateData = {
                ...req.body,
                createdBy: req.user.id,
            };

            const template = await notificationService.createTemplate(templateData);

            res.status(201).json({
                success: true,
                data: template,
                message: 'Template created successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * GET /api/notifications/templates/:id
 * Get single template (Admin only)
 */
router.get('/templates/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access templates',
            });
        }

        const template = await NotificationTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found',
            });
        }

        res.json({
            success: true,
            data: template,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PATCH /api/notifications/templates/:id
 * Update template (Admin only)
 */
router.patch('/templates/:id/update', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update templates',
            });
        }

        const template = await NotificationTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found',
            });
        }

        res.json({
            success: true,
            data: template,
            message: 'Template updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * DELETE /api/notifications/templates/:id
 * Delete template (Admin only)
 */
router.delete('/templates/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete templates',
            });
        }

        const template = await NotificationTemplate.findByIdAndDelete(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found',
            });
        }

        res.json({
            success: true,
            data: template,
            message: 'Template deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
