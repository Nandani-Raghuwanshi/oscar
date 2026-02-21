import Notification from '../models/Notification.js';
import NotificationTemplate from '../models/NotificationTemplate.js';

/**
 * Notification Service - Handles all notification operations
 * Current implementation: Logs to console/server (no WhatsApp integration)
 * Ready for WhatsApp integration in future phases
 */

export const notificationService = {
    /**
     * Send a notification to a user
     * @param {string} userId - Target user ID
     * @param {string} templateId - Notification template ID
     * @param {object} variables - Template variables for substitution
     * @returns {object} Notification document
     */
    async sendNotification(userId, templateId, variables = {}) {
        try {
            // Fetch template
            const template = await NotificationTemplate.findById(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            // Substitute variables
            let content = template.subject;
            let message = template.message;

            Object.keys(variables).forEach(key => {
                const value = variables[key];
                content = content.replace(`{{${key}}}`, value);
                message = message.replace(`{{${key}}}`, value);
            });

            // Create notification record
            const notification = new Notification({
                userId,
                templateId,
                type: template.type,
                subject: content,
                message,
                variables,
                status: 'delivered', // Mark as delivered since we're just logging
                channel: 'log',
                deliveredAt: new Date(),
            });

            await notification.save();

            // Log to server console (Phase 8 - logging, no WhatsApp yet)
            this.logNotification(userId, template.type, message);

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    },

    /**
     * Send notification to multiple users (bulk)
     * @param {array} userIds - Array of user IDs
     * @param {string} templateId - Template ID
     * @param {object} variables - Template variables
     * @returns {array} Array of notification documents
     */
    async sendBulkNotification(userIds, templateId, variables = {}) {
        try {
            const notifications = await Promise.all(
                userIds.map(userId => this.sendNotification(userId, templateId, variables))
            );
            return notifications;
        } catch (error) {
            console.error('Error sending bulk notification:', error);
            throw new Error(`Failed to send bulk notification: ${error.message}`);
        }
    },

    /**
     * Send scheduled notification (queue-based in future)
     * @param {string} userId - Target user ID
     * @param {string} templateId - Template ID
     * @param {date} scheduledFor - When to send
     * @param {object} variables - Template variables
     * @returns {object} Notification document
     */
    async scheduleNotification(userId, templateId, scheduledFor, variables = {}) {
        try {
            const template = await NotificationTemplate.findById(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            let content = template.subject;
            let message = template.message;

            Object.keys(variables).forEach(key => {
                const value = variables[key];
                content = content.replace(`{{${key}}}`, value);
                message = message.replace(`{{${key}}}`, value);
            });

            const notification = new Notification({
                userId,
                templateId,
                type: template.type,
                subject: content,
                message,
                variables,
                status: 'scheduled',
                channel: 'log',
                scheduledFor,
            });

            await notification.save();

            // Log scheduled notification
            console.log(`[NOTIFICATION SCHEDULED] User: ${userId} | Template: ${template.name} | Scheduled for: ${scheduledFor}`);

            return notification;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw new Error(`Failed to schedule notification: ${error.message}`);
        }
    },

    /**
     * Get user's notifications with filtering
     * @param {string} userId - User ID
     * @param {object} filters - Filter options (status, type, limit, page)
     * @returns {object} Paginated notifications
     */
    async getUserNotifications(userId, filters = {}) {
        try {
            const { status, type, limit = 20, page = 1 } = filters;
            const skip = (page - 1) * limit;

            const query = { userId };
            if (status) query.status = status;
            if (type) query.type = type;

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('templateId');

            const total = await Notification.countDocuments(query);

            return {
                notifications,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: notifications.length,
                    total: total,
                },
            };
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw new Error(`Failed to fetch notifications: ${error.message}`);
        }
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {object} Updated notification
     */
    async markAsRead(notificationId) {
        try {
            const notification = await Notification.findByIdAndUpdate(
                notificationId,
                {
                    status: 'read',
                    readAt: new Date(),
                },
                { new: true }
            );

            if (!notification) {
                throw new Error('Notification not found');
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
    },

    /**
     * Mark all user notifications as read
     * @param {string} userId - User ID
     * @returns {object} Update result
     */
    async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId, status: { $ne: 'read' } },
                {
                    status: 'read',
                    readAt: new Date(),
                }
            );
            return result;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error(`Failed to mark all notifications as read: ${error.message}`);
        }
    },

    /**
     * Get unread notification count
     * @param {string} userId - User ID
     * @returns {number} Count of unread notifications
     */
    async getUnreadCount(userId) {
        try {
            const count = await Notification.countDocuments({
                userId,
                status: { $ne: 'read' },
            });
            return count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw new Error(`Failed to fetch unread count: ${error.message}`);
        }
    },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {object} Deleted notification
     */
    async deleteNotification(notificationId) {
        try {
            const notification = await Notification.findByIdAndDelete(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }
            return notification;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error(`Failed to delete notification: ${error.message}`);
        }
    },

    /**
     * Get or create notification preferences
     * @param {string} userId - User ID
     * @returns {object} User preferences
     */
    async getUserPreferences(userId) {
        try {
            let preferences = await Notification.findOne({ userId, isPreference: true });

            if (!preferences) {
                // Create default preferences
                preferences = new Notification({
                    userId,
                    isPreference: true,
                    preferences: {
                        emailNotifications: true,
                        smsNotifications: true,
                        pushNotifications: true,
                        escalationAlerts: true,
                        dailyDigest: false,
                        marketing: false,
                    },
                });
                await preferences.save();
            }

            return preferences;
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            throw new Error(`Failed to fetch preferences: ${error.message}`);
        }
    },

    /**
     * Update notification preferences
     * @param {string} userId - User ID
     * @param {object} preferences - New preferences
     * @returns {object} Updated preferences
     */
    async updateUserPreferences(userId, preferences) {
        try {
            let userPrefs = await Notification.findOne({ userId, isPreference: true });

            if (!userPrefs) {
                userPrefs = new Notification({
                    userId,
                    isPreference: true,
                    preferences,
                });
            } else {
                userPrefs.preferences = { ...userPrefs.preferences, ...preferences };
            }

            await userPrefs.save();
            return userPrefs;
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw new Error(`Failed to update preferences: ${error.message}`);
        }
    },

    /**
     * Create or get notification template
     * @param {object} templateData - Template data
     * @returns {object} Template document
     */
    async createTemplate(templateData) {
        try {
            const existing = await NotificationTemplate.findOne({ name: templateData.name });

            if (existing) {
                return existing;
            }

            const template = new NotificationTemplate(templateData);
            await template.save();
            return template;
        } catch (error) {
            console.error('Error creating template:', error);
            throw new Error(`Failed to create template: ${error.message}`);
        }
    },

    /**
     * Get all templates
     * @param {object} filters - Filter options
     * @returns {array} Templates list
     */
    async getTemplates(filters = {}) {
        try {
            const { type, limit = 50, page = 1 } = filters;
            const skip = (page - 1) * limit;

            const query = {};
            if (type) query.type = type;

            const templates = await NotificationTemplate.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await NotificationTemplate.countDocuments(query);

            return {
                templates,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: templates.length,
                    total: total,
                },
            };
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw new Error(`Failed to fetch templates: ${error.message}`);
        }
    },

    /**
     * Log notification to server console
     * Phase 8: Currently logs to console; ready for WhatsApp/SMS integration
     * @param {string} userId - User ID
     * @param {string} type - Notification type
     * @param {string} message - Notification message
     */
    logNotification(userId, type, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[NOTIFICATION ${timestamp}] Type: ${type} | User: ${userId} | Message: ${message.substring(0, 100)}...`;
        console.log(logMessage);

        // In production, this could log to a file or external service
        // For Phase 8, it's logged to server console
    },

    /**
     * Trigger notification for common events
     * @param {string} event - Event type
     * @param {string} userId - User ID
     * @param {object} data - Event data
     */
    async triggerEventNotification(event, userId, data = {}) {
        try {
            const events = {
                'referral_submitted': {
                    templateId: null,
                    type: 'referral',
                    message: `New referral submitted for project: ${data.projectName}`,
                },
                'referral_converted': {
                    templateId: null,
                    type: 'reward',
                    message: `Congratulations! Your referral has been converted. Reward: ${data.rewardAmount}`,
                },
                'escalation_assigned': {
                    templateId: null,
                    type: 'escalation',
                    message: `New escalation assigned to you: ${data.lead}`,
                },
                'daily_status_reminder': {
                    templateId: null,
                    type: 'reminder',
                    message: 'Reminder: Please submit your daily status update',
                },
                'payment_processed': {
                    templateId: null,
                    type: 'payment',
                    message: `Payment of ${data.amount} has been processed`,
                },
            };

            const eventData = events[event];
            if (!eventData) {
                throw new Error('Unknown event type');
            }

            const notification = new Notification({
                userId,
                type: eventData.type,
                subject: eventData.message,
                message: eventData.message,
                channel: 'log',
                status: 'delivered',
                deliveredAt: new Date(),
                eventType: event,
                eventData: data,
            });

            await notification.save();
            this.logNotification(userId, eventData.type, eventData.message);

            return notification;
        } catch (error) {
            console.error('Error triggering event notification:', error);
            throw new Error(`Failed to trigger notification: ${error.message}`);
        }
    },
};

export default notificationService;
