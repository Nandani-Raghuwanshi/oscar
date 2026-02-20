import mongoose from 'mongoose';

const paymentRecordSchema = new mongoose.Schema(
    {
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral',
            required: true,
            index: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },
        advocateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        // Payment details
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'check', 'cash', 'online', 'other'],
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        // Status workflow
        status: {
            type: String,
            enum: ['pending', 'processing', 'processed', 'failed', 'completed'],
            default: 'pending',
            index: true
        },
        // Processing information
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Sales Associate who marked the payment
            required: true
        },
        processedAt: {
            type: Date,
            default: Date.now
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // CRM Manager or Admin who approves
        },
        approvedAt: Date,
        // Additional details
        notes: {
            type: String,
            trim: true
        },
        receiptUrl: {
            type: String,
            trim: true
        },
        // Reward generation tracking
        rewardGenerated: {
            type: Boolean,
            default: false
        },
        rewardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reward',
            sparse: true
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

// Indexes for faster queries
paymentRecordSchema.index({ referralId: 1 });
paymentRecordSchema.index({ projectId: 1, status: 1 });
paymentRecordSchema.index({ advocateId: 1 });
paymentRecordSchema.index({ processedBy: 1, createdAt: -1 });
paymentRecordSchema.index({ status: 1, createdAt: -1 });
paymentRecordSchema.index({ isDeleted: 1 });

// Virtual to check if payment is recent (within 30 days)
paymentRecordSchema.virtual('isRecent').get(function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt > thirtyDaysAgo;
});

// Ensure virtuals are included when converting to JSON
paymentRecordSchema.set('toJSON', { virtuals: true });
paymentRecordSchema.set('toObject', { virtuals: true });

export default mongoose.model('PaymentRecord', paymentRecordSchema);
