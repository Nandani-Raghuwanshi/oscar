import User from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';

// Middleware to verify CRM Manager role
export const verifyCRMManager = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== USER_ROLES.CRM_MANAGER) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. CRM Manager role required.'
            });
        }

        req.crmUser = user;
        next();
    } catch (error) {
        console.error('CRM Manager verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during role verification'
        });
    }
};

// Middleware to verify Sales Associate role
export const verifySalesAssociate = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== USER_ROLES.SALES_ASSOCIATE) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Sales Associate role required.'
            });
        }

        req.salesAssociate = user;
        next();
    } catch (error) {
        console.error('Sales Associate verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during role verification'
        });
    }
};

// Middleware to verify CRM access (either CRM Manager or Sales Associate)
export const verifyCRMAccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== USER_ROLES.CRM_MANAGER && user.role !== USER_ROLES.SALES_ASSOCIATE) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. CRM role required.'
            });
        }

        req.crmUser = user;
        next();
    } catch (error) {
        console.error('CRM access verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during role verification'
        });
    }
};
