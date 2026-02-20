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
            enum: ['pending', 'assigned', 'contacted', 'site_visit', 'qualified', 'booking', 'converted', 'dropped'],
            default: 'pending',
            index: true
        },
        
        // CRM Assignment fields
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Sales Associate
            sparse: true,
            index: true
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // CRM Manager who assigned
            sparse: true
        },
        assignedAt: Date,
        
        // Interaction tracking
        lastContactedAt: Date,
        lastInteractionAt: Date,
        nextFollowUpDate: Date,
        
        // Status date tracking
        contactedAt: Date,
        siteVisitAt: Date,
        qualifiedAt: Date,
        bookingAt: Date,
        convertedAt: Date,
        droppedAt: Date,
        lostAt: Date,
        lostReason: String,
        
        // Escalation tracking
        escalationLevel: {
            type: Number,
            default: 0, // 0: none, 1: 24hr warning, 2: 48hr escalation, 3: 72hr auto-drop
            index: true
        },
        escalationFlag: {
            type: Boolean,
            default: false,
            index: true
        },
        escalationReason: String,
        escalatedAt: Date,

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
referralSchema.index({ assignedTo: 1, status: 1 });
referralSchema.index({ assignedTo: 1, escalationFlag: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ isDeleted: 1 });
referralSchema.index({ escalationLevel: 1, assignedAt: 1 });

// Virtual for days active
referralSchema.virtual('daysActive').get(function () {
    return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days in current status
referralSchema.virtual('daysInCurrentStatus').get(function () {
    const statusDate = this.contactedAt || this.assignedAt || this.createdAt;
    return Math.floor((new Date() - statusDate) / (1000 * 60 * 60 * 24));
});

// Virtual for hours since assignment (for escalation)
referralSchema.virtual('hoursSinceAssignment').get(function () {
    if (!this.assignedAt) return 0;
    return Math.floor((new Date() - this.assignedAt) / (1000 * 60 * 60));
});

// Virtual for hours since last interaction (for escalation)
referralSchema.virtual('hoursSinceLastInteraction').get(function () {
    if (!this.lastInteractionAt) {
        return this.assignedAt ? Math.floor((new Date() - this.assignedAt) / (1000 * 60 * 60)) : 0;
    }
    return Math.floor((new Date() - this.lastInteractionAt) / (1000 * 60 * 60));
});

// Ensure virtuals are included when converting to JSON
referralSchema.set('toJSON', { virtuals: true });
referralSchema.set('toObject', { virtuals: true });

export default mongoose.model('Referral', referralSchema);
