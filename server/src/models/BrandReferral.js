import mongoose from 'mongoose';

const brandReferralSchema = new mongoose.Schema(
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
        sourceProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: false
        },

        // Referral details
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
            lowercase: true,
            trim: true,
            sparse: true
        },
        referrerCity: {
            type: String,
            trim: true,
            sparse: true
        },
        referrerNotes: {
            type: String,
            trim: true,
            maxlength: 500
        },

        // Status tracking
        status: {
            type: String,
            enum: ['pending', 'contacted', 'qualified', 'converted', 'lost'],
            default: 'pending',
            index: true
        },
        conversionDate: {
            type: Date,
            sparse: true
        },

        // Reward linkage
        rewardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandReward',
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
        collection: 'brand_referrals'
    }
);

// Compound indexes for query optimization
brandReferralSchema.index({ advocateId: 1, targetProjectId: 1 });
brandReferralSchema.index({ targetProjectId: 1, status: 1 });
brandReferralSchema.index({ advocateId: 1, status: 1 });
brandReferralSchema.index({ createdAt: -1 });

// Ensure phone uniqueness per advocate per project
brandReferralSchema.index(
    { advocateId: 1, targetProjectId: 1, referrerPhone: 1 },
    { unique: true, sparse: true }
);

// Virtual for days since creation
brandReferralSchema.virtual('daysActive').get(function () {
    if (!this.createdAt) return 0;
    const now = new Date();
    const diff = now - this.createdAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method: Mark as converted
brandReferralSchema.methods.markConverted = function () {
    this.status = 'converted';
    this.conversionDate = new Date();
    return this.save();
};

// Instance method: Update status
brandReferralSchema.methods.updateStatus = function (newStatus) {
    if (!['pending', 'contacted', 'qualified', 'converted', 'lost'].includes(newStatus)) {
        throw new Error('Invalid status');
    }
    this.status = newStatus;
    if (newStatus === 'converted') {
        this.conversionDate = new Date();
    }
    return this.save();
};

// Instance method: Soft delete
brandReferralSchema.methods.softDelete = function () {
    this.isDeleted = true;
    return this.save();
};

// Query helper to exclude soft deleted
brandReferralSchema.query.active = function () {
    return this.where({ isDeleted: false });
};

// Static method: Get referral summary
brandReferralSchema.statics.getReferralSummary = async function (advocateId, targetProjectId) {
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
                count: { $sum: 1 }
            }
        }
    ]);

    const summary = {
        total: 0,
        pending: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
    };

    result.forEach(item => {
        summary[item._id] = item.count;
        summary.total += item.count;
    });

    return summary;
};

// JSON serialization
brandReferralSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export default mongoose.model('BrandReferral', brandReferralSchema);
