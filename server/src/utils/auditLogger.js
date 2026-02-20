import AuditLog from '../models/AuditLog.js';

export const logAudit = async (action, performedBy, details = {}, req = null) => {
    try {
        const auditData = {
            action,
            performedBy,
            ...details,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent']
        };

        await AuditLog.create(auditData);
    } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw - audit failures shouldn't break main operations
    }
};
