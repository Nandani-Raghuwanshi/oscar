import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
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
        channel: {
            type: String,
            enum: ['email', 'sms', 'whatsapp', 'push', 'in-app'],
            default: 'in-app',
        },
        subject: {
            type: String,
            required: true,
            description: 'Template subject with {{variable}} placeholders',
        },
        message: {
            type: String,
            required: true,
            description: 'Template message body with {{variable}} placeholders',
        },
        variables: {
            type: [String],
            default: [],
            description: 'List of variables used in template',
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            enum: [
                'user_management',
                'referral_tracking',
                'reward_management',
                'crm_operations',
                'payment_tracking',
                'escalation_management',
                'system_alerts',
            ],
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        lastUsedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for common queries
notificationTemplateSchema.index({ type: 1, isActive: 1 });
notificationTemplateSchema.index({ category: 1 });

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);

export default NotificationTemplate;
