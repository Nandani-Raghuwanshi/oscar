import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: [
                'USER_CREATE',
                'USER_UPDATE',
                'USER_DELETE',
                'USER_ROLE_CHANGE',
                'PROJECT_CREATE',
                'PROJECT_UPDATE',
                'PROJECT_DELETE',
                'BULK_USER_IMPORT',
                'LOGIN',
                'LOGOUT'
            ]
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        targetProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        },
        ipAddress: String,
        userAgent: String
    },
    {
        timestamps: true
    }
);

// Index for efficient querying
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
