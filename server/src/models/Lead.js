import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    // Reference to Referral
    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral',
        required: true,
        unique: true,
        index: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },

    sourceAdvocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // CRM Assignment
    assignedToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    assignedDate: Date,

    // Pipeline Status
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'negotiating', 'proposal_sent', 'converted', 'lost'],
        default: 'new',
        index: true
    },

    statusHistory: [{
        status: String,
        updatedBy: mongoose.Schema.Types.ObjectId,
        updatedDate: { type: Date, default: Date.now },
        notes: String
    }],

    // Lead Tracking
    firstContactDate: Date,
    lastContactDate: Date,
    nextFollowUpDate: Date,

    // Notes & Comments
    notes: {
        type: String,
        minlength: 0
    },

    internalComments: [{
        text: String,
        addedBy: mongoose.Schema.Types.ObjectId,
        addedDate: { type: Date, default: Date.now }
    }],

    // Priority & Tags
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    tags: [String],

    // Escalation
    isEscalated: {
        type: Boolean,
        default: false,
        index: true
    },

    escalationReason: String,
    escalatedBy: mongoose.Schema.Types.ObjectId,
    escalatedDate: Date,

    // Payment Tracking
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
        default: 'pending',
        index: true
    },

    paymentAmount: {
        type: Number,
        default: 0
    },

    paymentHistory: [{
        amount: Number,
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: String,
        transactionId: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded']
        },
        notes: String,
        recordedBy: mongoose.Schema.Types.ObjectId
    }],

    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date
});

// Compound indexes for performance
leadSchema.index({ projectId: 1, status: 1 });
leadSchema.index({ assignedToId: 1, status: 1 });
leadSchema.index({ sourceAdvocateId: 1, createdAt: -1 });
leadSchema.index({ isEscalated: 1, createdAt: -1 });

// Virtual for days in current status
leadSchema.virtual('daysInStatus').get(function () {
    const latestStatus = this.statusHistory[this.statusHistory.length - 1];
    if (!latestStatus) return 0;
    return Math.floor((Date.now() - latestStatus.updatedDate) / (1000 * 60 * 60 * 24));
});

// Hide deleted records by default
leadSchema.query.active = function () {
    return this.where({ deletedAt: null });
};

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
