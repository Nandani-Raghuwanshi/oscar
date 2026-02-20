import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
    {
        advocateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        referrerName: {
            type: String,
            required: true,
            trim: true
        },
        referrerPhone: {
            type: String,
            required: true,
            trim: true
        },
        referrerEmail: {
            type: String,
            sparse: true,
            lowercase: true,
            trim: true
        },
        referrerCity: {
            type: String,
            sparse: true,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'qualified', 'converted', 'lost'],
            default: 'pending'
        },
        qualifiedAt: Date,
        convertedAt: Date,
        lostAt: Date,
        lostReason: String,

        // Reward tracking
        rewardAmount: {
            type: Number,
            default: 0
        },
        rewardStatus: {
            type: String,
            enum: ['not_earned', 'earned', 'processed', 'claimed'],
            default: 'not_earned'
        },
        rewardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reward',
            sparse: true
        },

        // Payment tracking
        paymentStatus: {
            type: String,
            enum: ['pending', 'processed', 'failed'],
            default: 'pending'
        },

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
referralSchema.index({ advocateId: 1, projectId: 1 });
referralSchema.index({ advocateId: 1, status: 1 });
referralSchema.index({ projectId: 1, status: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ isDeleted: 1 });

// Virtual for days active
referralSchema.virtual('daysActive').get(function () {
    return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included when converting to JSON
referralSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Referral', referralSchema);
