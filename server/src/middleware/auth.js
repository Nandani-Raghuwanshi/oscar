import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../config/constants.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};
