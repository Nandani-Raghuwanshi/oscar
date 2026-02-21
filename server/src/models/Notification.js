import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NotificationTemplate',
        },
        type: {
            type: String,
            enum: [
                'referral',
                'reward',
                'escalation',
                'reminder',
                'payment',
                'message',
                'alert',
                'info',
            ],
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        channel: {
            type: String,
            enum: ['email', 'sms', 'whatsapp', 'push', 'log', 'in-app'],
            default: 'log',
        },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'sent', 'delivered', 'read', 'failed'],
            default: 'pending',
            index: true,
        },
        variables: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        eventType: {
            type: String,
            index: true,
        },
        eventData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        deliveredAt: {
            type: Date,
        },
        readAt: {
            type: Date,
        },
        scheduledFor: {
            type: Date,
        },
        sentAttempts: {
            type: Number,
            default: 0,
        },
        lastAttemptAt: {
            type: Date,
        },
        failureReason: {
            type: String,
        },
        isPreference: {
            type: Boolean,
            default: false,
        },
        preferences: {
            emailNotifications: {
                type: Boolean,
                default: true,
            },
            smsNotifications: {
                type: Boolean,
                default: true,
            },
            pushNotifications: {
                type: Boolean,
                default: true,
            },
            whatsappNotifications: {
                type: Boolean,
                default: true,
            },
            escalationAlerts: {
                type: Boolean,
                default: true,
            },
            dailyDigest: {
                type: Boolean,
                default: false,
            },
            marketing: {
                type: Boolean,
                default: false,
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for common queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });

// Virtual for days since creation
notificationSchema.virtual('daysSinceCreation').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for time until scheduled
notificationSchema.virtual('timeUntilScheduled').get(function () {
    if (!this.scheduledFor) return null;
    return this.scheduledFor - Date.now();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
