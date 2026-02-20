import mongoose from 'mongoose';

const escalationSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
            index: true,
        },
        builderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Escalation Details
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
            index: true,
        },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'resolved', 'closed'],
            default: 'open',
            index: true,
        },

        // Assignment & History
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        assignedAt: Date,
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Metadata
        tags: [String],
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Compound indexes for common queries
escalationSchema.index({ projectId: 1, status: 1 });
escalationSchema.index({ builderId: 1, priority: 1, status: 1 });
escalationSchema.index({ customerId: 1 });

export default mongoose.model('Escalation', escalationSchema);
