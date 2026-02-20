import { HTTP_STATUS } from '../config/constants.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Default error
    res.status(err.statusCode || HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};

export const notFoundHandler = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Route not found'
    });
};
