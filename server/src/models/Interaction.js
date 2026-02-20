import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema(
    {
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral',
            required: true,
            index: true
        },
        salesAssociateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        interactionType: {
            type: String,
            enum: ['call', 'email', 'whatsapp', 'meeting', 'site_visit', 'note'],
            default: 'call'
        },
        outcome: {
            type: String,
            enum: ['answered', 'no_answer', 'busy', 'callback_requested', 'interested', 'not_interested', 'other'],
            required: true
        },
        duration: {
            type: Number, // Duration in seconds
            min: 0
        },
        notes: {
            type: String,
            required: true,
            trim: true,
            minlength: [50, 'Notes must be at least 50 words for quality assurance']
        },
        nextFollowUpDate: {
            type: Date
        },
        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
interactionSchema.index({ referralId: 1, createdAt: -1 });
interactionSchema.index({ salesAssociateId: 1, createdAt: -1 });
interactionSchema.index({ createdAt: -1 });

// Virtual to count words in notes
interactionSchema.virtual('wordCount').get(function () {
    if (!this.notes) return 0;
    return this.notes.trim().split(/\s+/).filter(word => word.length > 0).length;
});

// Validation: Ensure notes have at least 50 words
interactionSchema.pre('save', function (next) {
    if (this.notes) {
        const wordCount = this.notes.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 50) {
            const error = new Error(`Notes must contain at least 50 words. Current word count: ${wordCount}`);
            error.name = 'ValidationError';
            return next(error);
        }
    }
    next();
});

// Ensure virtuals are included when converting to JSON
interactionSchema.set('toJSON', { virtuals: true });
interactionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Interaction', interactionSchema);
