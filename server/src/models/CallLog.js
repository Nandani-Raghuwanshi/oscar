import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
    // Reference
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
        index: true
    },

    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral',
        required: true,
        index: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },

    // Call Participant
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Call Details
    callType: {
        type: String,
        enum: ['inbound', 'outbound', 'video', 'voicemail'],
        required: true
    },

    callDuration: Number, // in seconds

    callStartTime: {
        type: Date,
        required: true,
        index: true
    },

    callEndTime: Date,

    // Call Outcome
    outcome: {
        type: String,
        enum: ['completed', 'missed', 'declined', 'no_answer', 'voicemail_left'],
        required: true
    },

    // Call Details
    summary: String,

    nextAction: String,
    nextActionDate: Date,

    // Tags
    purpose: [String], // e.g., ['follow_up', 'negotiation', 'objection_handling']

    sentiment: {
        type: String,
        enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
    },

    // Recording & Notes
    recordingUrl: String,
    notes: {
        type: String,
        required: true,
        minlength: 1
    },

    // Metadata
    phoneNumber: String,
    customerName: String,

    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date
});

// Compound indexes
callLogSchema.index({ leadId: 1, callStartTime: -1 });
callLogSchema.index({ initiatedBy: 1, callStartTime: -1 });
callLogSchema.index({ customerId: 1, callStartTime: -1 });

// Hide deleted records
callLogSchema.query.active = function () {
    return this.where({ deletedAt: null });
};

const CallLog = mongoose.model('CallLog', callLogSchema);
export default CallLog;
