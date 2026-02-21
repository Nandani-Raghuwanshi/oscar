import mongoose from 'mongoose';

const dailyStatusUpdateSchema = new mongoose.Schema({
    // Reference to Sales Associate
    salesAssociateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        index: true
    },

    // Date (separate field for grouping by day)
    reportDate: {
        type: Date,
        required: true,
        index: true
    },

    // Activity Summary
    callsMade: {
        type: Number,
        default: 0,
        min: 0
    },

    leadsContacted: {
        type: Number,
        default: 0,
        min: 0
    },

    leadsQualified: {
        type: Number,
        default: 0,
        min: 0
    },

    proposalsSent: {
        type: Number,
        default: 0,
        min: 0
    },

    followUpsDone: {
        type: Number,
        default: 0,
        min: 0
    },

    // Performance Metrics
    conversionRate: Number, // percentage

    averageCallDuration: Number, // in minutes

    closedDeals: {
        type: Number,
        default: 0,
        min: 0
    },

    // Status
    status: {
        type: String,
        enum: ['submitted', 'pending_review', 'approved', 'rejected'],
        default: 'submitted',
        index: true
    },

    // Narrative
    summary: {
        type: String,
        required: true,
        minlength: 10
    },

    challenges: String,
    achievements: String,
    nextDayPlan: String,

    // Linked Leads
    activeLeads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    }],

    // Manager Review (if applicable)
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewDate: Date,
    managerFeedback: String,

    // Timestamps
    submittedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date
});

// Compound indexes
dailyStatusUpdateSchema.index({ salesAssociateId: 1, reportDate: -1 });
dailyStatusUpdateSchema.index({ projectId: 1, reportDate: -1 });
dailyStatusUpdateSchema.index({ status: 1, reportDate: -1 });

// Hide deleted records
dailyStatusUpdateSchema.query.active = function () {
    return this.where({ deletedAt: null });
};

const DailyStatusUpdate = mongoose.model('DailyStatusUpdate', dailyStatusUpdateSchema);
export default DailyStatusUpdate;
