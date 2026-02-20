import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(Object.values(USER_ROLES)).withMessage('Invalid role')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const { firstName, lastName, email, phone, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User already exists');
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        successResponse(res, HTTP_STATUS.CREATED, 'User registered successfully', {
            user: user.toJSON(),
            token
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        successResponse(res, HTTP_STATUS.OK, 'Login successful', {
            user: user.toJSON(),
            token
        });
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('projectId');
        if (!user) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'User details retrieved', user.toJSON());
    } catch (error) {
        errorResponse(res, HTTP_STATUS.INTERNAL_ERROR, error.message);
    }
});

export default router;
