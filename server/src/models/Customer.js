import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        builderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Customer Information
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            // E.164 format for WhatsApp integration
        },

        // Status & Tracking
        status: {
            type: String,
            enum: ['active', 'inactive', 'converted', 'blacklist'],
            default: 'active',
            index: true,
        },
        inviteSentAt: Date,
        inviteDeliveredAt: Date,
        inviteReadAt: Date,

        // Referral Tracking
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        // Metadata
        source: {
            type: String,
            enum: ['csv_upload', 'manual', 'bulk_import'],
            default: 'manual',
        },
        tags: [String],
        notes: String,

        // Soft Delete
        deletedAt: {
            type: Date,
            default: null,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for queries
customerSchema.index({ projectId: 1, builderId: 1, status: 1 });
customerSchema.index({ projectId: 1, phone: 1, deletedAt: 1 });

// Pre-hook to exclude soft-deleted documents
customerSchema.pre(/^find/, function () {
    if (!this.options.includeDeleted) {
        this.find({ deletedAt: null });
    }
});

export default mongoose.model('Customer', customerSchema);
