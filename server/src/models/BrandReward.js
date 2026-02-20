import mongoose from 'mongoose';

const brandRewardSchema = new mongoose.Schema(
    {
        advocateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        targetProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandReferral',
            required: true
        },

        // Reward details
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR']
        },
        type: {
            type: String,
            enum: ['commission', 'bonus', 'incentive', 'milestone'],
            default: 'commission'
        },
        description: {
            type: String,
            required: true,
            trim: true
        },

        // Status workflow
        status: {
            type: String,
            enum: ['earned', 'processed', 'claimed', 'expired'],
            default: 'earned',
            index: true
        },

        // Redemption methods
        redemptionMethod: {
            type: String,
            enum: ['bank_transfer', 'wallet', 'check', 'pending'],
            default: 'pending',
            sparse: true
        },
        redemptionDetails: {
            bankAccount: String,
            accountHolder: String,
            ifscCode: String,
            bankName: String,
            upiId: String
        },

        // Timeline
        earnedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date,
            sparse: true
        },
        claimedAt: {
            type: Date,
            sparse: true
        },
        expiresAt: {
            type: Date,
            sparse: true
        },

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'brand_rewards'
    }
);

// Compound indexes for query optimization
brandRewardSchema.index({ advocateId: 1, targetProjectId: 1 });
brandRewardSchema.index({ targetProjectId: 1, status: 1 });
brandRewardSchema.index({ advocateId: 1, status: 1 });
brandRewardSchema.index({ expiresAt: 1, status: 1 });
brandRewardSchema.index({ createdAt: -1 });

// Virtual to check if reward is expired
brandRewardSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt && this.status !== 'claimed';
});

// Instance method: Mark as processed
brandRewardSchema.methods.markProcessed = function () {
    this.status = 'processed';
    this.processedAt = new Date();
    return this.save();
};

// Instance method: Claim reward
brandRewardSchema.methods.claimReward = function (redemptionMethod, details) {
    if (this.status !== 'processed') {
        throw new Error('Reward must be in processed status to claim');
    }
    this.status = 'claimed';
    this.claimedAt = new Date();
    this.redemptionMethod = redemptionMethod;
    if (details) {
        this.redemptionDetails = { ...this.redemptionDetails, ...details };
    }
    return this.save();
};

// Instance method: Soft delete
brandRewardSchema.methods.softDelete = function () {
    this.isDeleted = true;
    return this.save();
};

// Query helper to exclude soft deleted
brandRewardSchema.query.active = function () {
    return this.where({ isDeleted: false });
};

// Static method: Get reward summary
brandRewardSchema.statics.getRewardSummary = async function (advocateId, targetProjectId) {
    const result = await this.aggregate([
        {
            $match: {
                advocateId: mongoose.Types.ObjectId(advocateId),
                targetProjectId: mongoose.Types.ObjectId(targetProjectId),
                isDeleted: false
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    const summary = {
        earned: { count: 0, amount: 0 },
        processed: { count: 0, amount: 0 },
        claimed: { count: 0, amount: 0 },
        expired: { count: 0, amount: 0 }
    };

    result.forEach(item => {
        if (summary[item._id]) {
            summary[item._id].count = item.count;
            summary[item._id].amount = item.totalAmount || 0;
        }
    });

    const totalEarned = summary.earned.amount;
    const totalClaimed = summary.claimed.amount;
    const totalProcessing = summary.processed.amount;

    return {
        ...summary,
        totalEarned,
        totalClaimed,
        totalProcessing
    };
};

// JSON serialization
brandRewardSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export default mongoose.model('BrandReward', brandRewardSchema);
