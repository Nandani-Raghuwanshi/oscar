import express from 'express';
import { body, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Referral from '../models/Referral.js';
import Reward from '../models/Reward.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Middleware: Verify advocate role
const verifyAdvocate = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== USER_ROLES.PROJECT_ADVOCATE) {
            return errorResponse(res, 403, 'Access denied. Project Advocate role required.');
        }
        if (!user.projectId) {
            return errorResponse(res, 400, 'Advocate not assigned to any project.');
        }
        next();
    } catch (error) {
        errorResponse(res, 500, 'Server error');
    }
};

// ============ PROFILE & DASHBOARD ============

// GET /advocate/profile - Get advocate profile with project details
router.get('/profile', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocate = await User.findById(req.user.id)
            .populate('projectId', 'name description status certifications')
            .select('-password');

        if (!advocate) {
            return errorResponse(res, 404, 'Advocate not found');
        }

        successResponse(res, 200, 'Profile retrieved successfully', advocate);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /advocate/dashboard - Get dashboard stats
router.get('/dashboard', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocateId = req.user.id;
        const projectId = (await User.findById(advocateId)).projectId;

        // Fetch referral stats
        const totalReferrals = await Referral.countDocuments({
            advocateId,
            projectId,
            isDeleted: false
        });

        const convertedReferrals = await Referral.countDocuments({
            advocateId,
            projectId,
            status: 'converted',
            isDeleted: false
        });

        const pendingReferrals = await Referral.countDocuments({
            advocateId,
            projectId,
            status: 'pending',
            isDeleted: false
        });

        // Fetch reward stats
        const earnedRewards = await Reward.aggregate([
            {
                $match: {
                    advocateId: new mongoose.Types.ObjectId(advocateId),
                    projectId: new mongoose.Types.ObjectId(projectId),
                    status: { $in: ['earned', 'processed', 'claimed'] },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarned: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const claimedRewards = await Reward.aggregate([
            {
                $match: {
                    advocateId: new mongoose.Types.ObjectId(advocateId),
                    projectId: new mongoose.Types.ObjectId(projectId),
                    status: 'claimed',
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalClaimed: { $sum: '$amount' }
                }
            }
        ]);

        const pendingRewards = await Reward.aggregate([
            {
                $match: {
                    advocateId: new mongoose.Types.ObjectId(advocateId),
                    projectId: new mongoose.Types.ObjectId(projectId),
                    status: 'earned',
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const dashboard = {
            referrals: {
                total: totalReferrals,
                converted: convertedReferrals,
                pending: pendingReferrals,
                conversionRate: totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(2) : 0
            },
            rewards: {
                totalEarned: earnedRewards[0]?.totalEarned || 0,
                totalClaimed: claimedRewards[0]?.totalClaimed || 0,
                pendingAmount: pendingRewards[0]?.totalPending || 0,
                pendingCount: pendingRewards[0]?.count || 0
            }
        };

        successResponse(res, 200, 'Dashboard retrieved successfully', dashboard);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ REFERRALS ============

// POST /advocate/referrals - Submit a new referral
router.post(
    '/referrals',
    authenticateToken,
    verifyAdvocate,
    [
        body('referrerName').trim().notEmpty().withMessage('Referrer name is required'),
        body('referrerPhone').trim().notEmpty().withMessage('Referrer phone is required'),
        body('referrerEmail').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
        body('referrerCity').optional({ checkFalsy: true }).trim(),
        body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Notes too long')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const advocateId = req.user.id;
            const advocate = await User.findById(advocateId);

            if (!advocate || advocate.role !== USER_ROLES.PROJECT_ADVOCATE) {
                return errorResponse(res, 403, 'Access denied');
            }

            const { referrerName, referrerPhone, referrerEmail, referrerCity, notes } = req.body;

            // Check for duplicate referral from same advocate
            const existingReferral = await Referral.findOne({
                advocateId,
                referrerPhone,
                isDeleted: false
            });

            if (existingReferral) {
                return errorResponse(res, 400, 'This contact has already been referred by you');
            }

            const referral = new Referral({
                advocateId,
                projectId: advocate.projectId,
                referrerName,
                referrerPhone,
                referrerEmail: referrerEmail?.toLowerCase(),
                referrerCity,
                notes,
                status: 'pending'
            });

            await referral.save();

            successResponse(res, 201, 'Referral submitted successfully', referral);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /advocate/referrals - List advocate's referrals
router.get(
    '/referrals',
    authenticateToken,
    verifyAdvocate,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
        query('status').optional().isIn(['pending', 'contacted', 'qualified', 'converted', 'lost']).withMessage('Invalid status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const advocateId = req.user.id;
            const advocate = await User.findById(advocateId);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filter = {
                advocateId,
                projectId: advocate.projectId,
                isDeleted: false
            };

            if (req.query.status) {
                filter.status = req.query.status;
            }

            const referrals = await Referral.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Referral.countDocuments(filter);

            successResponse(res, 200, 'Referrals retrieved successfully', {
                data: referrals,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /advocate/referrals/:id - Get referral details
router.get('/referrals/:id', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 400, 'Invalid referral ID');
        }

        const advocateId = req.user.id;
        const referral = await Referral.findOne({
            _id: req.params.id,
            advocateId,
            isDeleted: false
        });

        if (!referral) {
            return errorResponse(res, 404, 'Referral not found');
        }

        // Get associated reward if converted
        let reward = null;
        if (referral.rewardId) {
            reward = await Reward.findById(referral.rewardId);
        }

        successResponse(res, 200, 'Referral retrieved successfully', {
            referral,
            reward
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// PATCH /advocate/referrals/:id/status - Update referral status (for internal use/CRM later)
router.patch(
    '/referrals/:id/status',
    authenticateToken,
    verifyAdvocate,
    [
        body('status').isIn(['pending', 'contacted', 'qualified', 'converted', 'lost']).withMessage('Invalid status'),
        body('lostReason').optional({ checkFalsy: true }).trim()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return errorResponse(res, 400, 'Invalid referral ID');
            }

            const advocateId = req.user.id;
            const { status, lostReason } = req.body;

            const referral = await Referral.findOne({
                _id: req.params.id,
                advocateId,
                isDeleted: false
            });

            if (!referral) {
                return errorResponse(res, 404, 'Referral not found');
            }

            // Update status with timestamps
            referral.status = status;

            if (status === 'qualified') {
                referral.qualifiedAt = new Date();
            } else if (status === 'converted') {
                referral.convertedAt = new Date();
            } else if (status === 'lost') {
                referral.lostAt = new Date();
                referral.lostReason = lostReason || '';
            }

            await referral.save();

            successResponse(res, 200, 'Referral status updated successfully', referral);
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// ============ REWARDS ============

// GET /advocate/rewards - List advocate's rewards
router.get(
    '/rewards',
    authenticateToken,
    verifyAdvocate,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
        query('status').optional().isIn(['earned', 'processed', 'claimed', 'expired']).withMessage('Invalid status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const advocateId = req.user.id;
            const advocate = await User.findById(advocateId);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filter = {
                advocateId,
                projectId: advocate.projectId,
                isDeleted: false
            };

            if (req.query.status) {
                filter.status = req.query.status;
            }

            const rewards = await Reward.find(filter)
                .populate('referralId', 'referrerName referrerPhone status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Reward.countDocuments(filter);

            successResponse(res, 200, 'Rewards retrieved successfully', {
                data: rewards,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            errorResponse(res, 500, 'Server error', error.message);
        }
    }
);

// GET /advocate/rewards/summary - Get reward summary
router.get('/rewards/summary', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocateId = req.user.id;
        const advocate = await User.findById(advocateId);

        const summary = await Reward.aggregate([
            {
                $match: {
                    advocateId: new mongoose.Types.ObjectId(advocateId),
                    projectId: new mongoose.Types.ObjectId(advocate.projectId),
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            earned: { total: 0, count: 0 },
            processed: { total: 0, count: 0 },
            claimed: { total: 0, count: 0 },
            expired: { total: 0, count: 0 },
            grandTotal: 0
        };

        summary.forEach(item => {
            if (result[item._id]) {
                result[item._id] = { total: item.total, count: item.count };
                result.grandTotal += item.total;
            }
        });

        successResponse(res, 200, 'Reward summary retrieved successfully', result);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// ============ PROJECT & DOCUMENTATION ============

// GET /advocate/project - Get advocate's project details
router.get('/project', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocate = await User.findById(req.user.id)
            .populate('projectId');

        if (!advocate || !advocate.projectId) {
            return errorResponse(res, 404, 'Project not found');
        }

        successResponse(res, 200, 'Project retrieved successfully', advocate.projectId);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /advocate/project/certifications - Get project certifications
router.get('/project/certifications', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocate = await User.findById(req.user.id)
            .populate('projectId', 'certifications');

        if (!advocate || !advocate.projectId) {
            return errorResponse(res, 404, 'Project not found');
        }

        const certifications = advocate.projectId.certifications || [];

        successResponse(res, 200, 'Certifications retrieved successfully', certifications);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

// GET /advocate/project/documents - Get project documentation
router.get('/project/documents', authenticateToken, verifyAdvocate, async (req, res) => {
    try {
        const advocate = await User.findById(req.user.id)
            .populate('projectId', 'documents description');

        if (!advocate || !advocate.projectId) {
            return errorResponse(res, 404, 'Project not found');
        }

        const documents = {
            description: advocate.projectId.description,
            documents: advocate.projectId.documents || []
        };

        successResponse(res, 200, 'Documentation retrieved successfully', documents);
    } catch (error) {
        errorResponse(res, 500, 'Server error', error.message);
    }
});

export default router;
