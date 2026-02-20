import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
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
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral',
            sparse: true
        },

        // Reward details
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        type: {
            type: String,
            enum: ['referral_commission', 'bonus', 'incentive', 'milestone'],
            default: 'referral_commission'
        },
        description: {
            type: String,
            trim: true
        },

        // Status workflow
        status: {
            type: String,
            enum: ['earned', 'processed', 'claimed', 'expired'],
            default: 'earned'
        },

        // Dates for status transitions
        earnedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: Date,
        claimedAt: Date,
        expiresAt: Date,

        // Redemption details
        redemptionMethod: {
            type: String,
            enum: ['bank_transfer', 'wallet', 'check', 'other'],
            sparse: true
        },
        bankAccountDetails: {
            accountName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String
        },
        remarks: String,

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
rewardSchema.index({ advocateId: 1, projectId: 1 });
rewardSchema.index({ advocateId: 1, status: 1 });
rewardSchema.index({ status: 1, expiresAt: 1 });
rewardSchema.index({ createdAt: -1 });
rewardSchema.index({ isDeleted: 1 });

// Virtual to check if reward is expired
rewardSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt && this.status !== 'claimed';
});

// Ensure virtuals are included when converting to JSON
rewardSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Reward', rewardSchema);
