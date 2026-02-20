import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import BrandReferral from '../models/BrandReferral.js';
import BrandReward from '../models/BrandReward.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { HTTP_STATUS } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Verify brand advocate and project assignment
const verifyBrandAdvocate = async (req, res, next) => {
    try {
        const user = req.user;

        // Check role
        if (user.role !== 'brand_advocate') {
            return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Access denied: Brand advocate role required');
        }

        // Check project assignment
        if (!user.targetProjectId) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Brand advocate not assigned to a target project');
        }

        // Fetch and attach project info
        const project = await Project.findById(user.targetProjectId);
        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Assigned target project not found');
        }

        req.advocateProject = project;
        next();
    } catch (error) {
        console.error('Middleware error:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Middleware error', error.message);
    }
};

// === 1. PROFILE & DASHBOARD (2 endpoints) ===

// GET /api/brand/profile
router.get('/profile', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user profile
        const user = await User.findById(userId)
            .select('-password')
            .populate('targetProjectId', 'name location status')
            .populate('sourceProjectId', 'name location status');

        if (!user) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'Profile retrieved successfully', {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            targetProject: user.targetProjectId,
            sourceProject: user.sourceProjectId
        });
    } catch (error) {
        console.error('Error in GET /profile:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving profile', error.message);
    }
});

// GET /api/brand/dashboard
router.get('/dashboard', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.user.targetProjectId;

        // Get referral statistics
        const referralStats = await BrandReferral.aggregate([
            {
                $match: {
                    advocateId: mongoose.Types.ObjectId(userId),
                    targetProjectId: mongoose.Types.ObjectId(projectId),
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        let referralData = {
            total: 0,
            pending: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
            lost: 0,
            conversionRate: 0
        };

        referralStats.forEach(stat => {
            if (referralData.hasOwnProperty(stat._id)) {
                referralData[stat._id] = stat.count;
                referralData.total += stat.count;
            }
        });

        if (referralData.total > 0) {
            referralData.conversionRate = parseFloat(
                ((referralData.converted / referralData.total) * 100).toFixed(2)
            );
        }

        // Get reward statistics
        const rewardStats = await BrandReward.getReferralSummary ?
            await BrandReward.aggregate([
                {
                    $match: {
                        advocateId: mongoose.Types.ObjectId(userId),
                        targetProjectId: mongoose.Types.ObjectId(projectId),
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ])
            : [];

        let rewardData = {
            totalEarned: 0,
            totalClaimed: 0,
            totalProcessing: 0,
            pendingAmount: 0,
            pendingCount: 0
        };

        rewardStats.forEach(stat => {
            const amount = stat.totalAmount || 0;
            if (stat._id === 'earned') {
                rewardData.totalEarned += amount;
            } else if (stat._id === 'claimed') {
                rewardData.totalClaimed += amount;
            } else if (stat._id === 'processed') {
                rewardData.totalProcessing += amount;
                rewardData.pendingAmount += amount;
                rewardData.pendingCount += stat.count || 0;
            }
        });

        successResponse(res, HTTP_STATUS.OK, 'Dashboard data retrieved', {
            referrals: referralData,
            rewards: rewardData
        });
    } catch (error) {
        console.error('Error in GET /dashboard:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving dashboard', error.message);
    }
});

// === 2. BRAND REFERRALS (5 endpoints) ===

// POST /api/brand/referrals
const brandReferralValidation = [
    body('referrerName')
        .trim()
        .notEmpty().withMessage('Referrer name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
    body('referrerPhone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .matches(/^[+]?[\d\s\-()]{10,}$/).withMessage('Valid phone number required'),
    body('referrerEmail')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Valid email required if provided'),
    body('referrerCity')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage('City must be max 50 characters'),
    body('referrerNotes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
];

router.post('/referrals', authenticateToken, verifyBrandAdvocate, brandReferralValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const userId = req.user._id;
        const projectId = req.user.targetProjectId;
        const { referrerName, referrerPhone, referrerEmail, referrerCity, referrerNotes } = req.body;

        // Check for duplicate referral (same phone per advocate per project)
        const existingReferral = await BrandReferral.findOne({
            advocateId: userId,
            targetProjectId: projectId,
            referrerPhone,
            isDeleted: false
        });

        if (existingReferral) {
            return errorResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                'You have already referred this contact'
            );
        }

        // Create referral
        const referral = new BrandReferral({
            advocateId: userId,
            targetProjectId: projectId,
            referrerName,
            referrerPhone,
            referrerEmail: referrerEmail?.toLowerCase(),
            referrerCity,
            referrerNotes
        });

        await referral.save();

        successResponse(res, HTTP_STATUS.CREATED, 'Referral submitted successfully', {
            _id: referral._id,
            advocateId: referral.advocateId,
            targetProjectId: referral.targetProjectId,
            referrerName: referral.referrerName,
            referrerPhone: referral.referrerPhone,
            status: referral.status,
            createdAt: referral.createdAt
        });
    } catch (error) {
        console.error('Error in POST /referrals:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error submitting referral', error.message);
    }
});

// GET /api/brand/referrals
router.get('/referrals', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.user.targetProjectId;
        const { page = 1, limit = 10, status } = req.query;

        const skip = (page - 1) * limit;
        const query = {
            advocateId: userId,
            targetProjectId: projectId,
            isDeleted: false
        };

        if (status) {
            query.status = status;
        }

        const referrals = await BrandReferral.find(query)
            .populate('rewardId', 'amount status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BrandReferral.countDocuments(query);

        successResponse(res, HTTP_STATUS.OK, 'Referrals retrieved', {
            referrals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in GET /referrals:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving referrals', error.message);
    }
});

// GET /api/brand/referrals/:id
router.get('/referrals/:id', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const referral = await BrandReferral.findOne({
            _id: id,
            advocateId: userId,
            isDeleted: false
        }).populate('rewardId');

        if (!referral) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Referral not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'Referral details retrieved', referral);
    } catch (error) {
        console.error('Error in GET /referrals/:id:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving referral', error.message);
    }
});

// PATCH /api/brand/referrals/:id/status
router.patch('/referrals/:id/status', authenticateToken, verifyBrandAdvocate, [
    body('status').isIn(['pending', 'contacted', 'qualified', 'converted', 'lost']).withMessage('Invalid status'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes max 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const userId = req.user._id;
        const { id } = req.params;
        const { status } = req.body;

        const referral = await BrandReferral.findOne({
            _id: id,
            advocateId: userId,
            isDeleted: false
        });

        if (!referral) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Referral not found');
        }

        await referral.updateStatus(status);

        successResponse(res, HTTP_STATUS.OK, 'Status updated successfully', {
            _id: referral._id,
            status: referral.status,
            updatedAt: referral.updatedAt
        });
    } catch (error) {
        console.error('Error in PATCH /referrals/:id/status:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error updating status', error.message);
    }
});

// GET /api/brand/referrals/summary/count
router.get('/referrals/summary/count', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.user.targetProjectId;

        const summary = await BrandReferral.getReferralSummary(userId, projectId);

        successResponse(res, HTTP_STATUS.OK, 'Referral summary retrieved', summary);
    } catch (error) {
        console.error('Error in GET /referrals/summary/count:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving summary', error.message);
    }
});

// === 3. BRAND REWARDS (3 endpoints) ===

// GET /api/brand/rewards
router.get('/rewards', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.user.targetProjectId;
        const { page = 1, limit = 10, status } = req.query;

        const skip = (page - 1) * limit;
        const query = {
            advocateId: userId,
            targetProjectId: projectId,
            isDeleted: false
        };

        if (status) {
            query.status = status;
        }

        const rewards = await BrandReward.find(query)
            .populate('referralId', 'referrerName referrerPhone status')
            .sort({ earnedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BrandReward.countDocuments(query);

        successResponse(res, HTTP_STATUS.OK, 'Rewards retrieved', {
            rewards,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in GET /rewards:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving rewards', error.message);
    }
});

// GET /api/brand/rewards/summary
router.get('/rewards/summary', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.user.targetProjectId;

        const summary = await BrandReward.aggregate([
            {
                $match: {
                    advocateId: mongoose.Types.ObjectId(userId),
                    targetProjectId: mongoose.Types.ObjectId(projectId),
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        let rewardSummary = {
            earned: { count: 0, amount: 0 },
            processed: { count: 0, amount: 0 },
            claimed: { count: 0, amount: 0 },
            expired: { count: 0, amount: 0 },
            totalEarned: 0,
            totalClaimed: 0
        };

        summary.forEach(item => {
            if (rewardSummary[item._id]) {
                rewardSummary[item._id].count = item.count;
                rewardSummary[item._id].amount = item.totalAmount || 0;
            }
        });

        rewardSummary.totalEarned = rewardSummary.earned.amount;
        rewardSummary.totalClaimed = rewardSummary.claimed.amount;

        successResponse(res, HTTP_STATUS.OK, 'Reward summary retrieved', rewardSummary);
    } catch (error) {
        console.error('Error in GET /rewards/summary:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving summary', error.message);
    }
});

// PATCH /api/brand/rewards/:id/claim
router.patch('/rewards/:id/claim', authenticateToken, verifyBrandAdvocate, [
    body('redemptionMethod').isIn(['bank_transfer', 'wallet', 'check']).withMessage('Invalid redemption method'),
    body('accountDetails').optional().isObject().withMessage('Account details must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
        }

        const userId = req.user._id;
        const { id } = req.params;
        const { redemptionMethod, accountDetails } = req.body;

        const reward = await BrandReward.findOne({
            _id: id,
            advocateId: userId,
            isDeleted: false
        });

        if (!reward) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Reward not found');
        }

        if (reward.status !== 'processed') {
            return errorResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                'Only processed rewards can be claimed'
            );
        }

        await reward.claimReward(redemptionMethod, accountDetails);

        successResponse(res, HTTP_STATUS.OK, 'Reward claimed successfully', {
            _id: reward._id,
            status: reward.status,
            claimedAt: reward.claimedAt,
            redemptionMethod: reward.redemptionMethod
        });
    } catch (error) {
        console.error('Error in PATCH /rewards/:id/claim:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error claiming reward', error.message);
    }
});

// === 4. TARGET PROJECT INFO (3 endpoints) ===

// GET /api/brand/project
router.get('/project', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const projectId = req.user.targetProjectId;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'Project details retrieved', {
            _id: project._id,
            name: project.name,
            description: project.description,
            location: project.location,
            status: project.status,
            launchDate: project.launchDate,
            completionDate: project.completionDate,
            totalUnits: project.totalUnits,
            availableUnits: project.availableUnits,
            priceRange: project.priceRange
        });
    } catch (error) {
        console.error('Error in GET /project:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving project', error.message);
    }
});

// GET /api/brand/project/certifications
router.get('/project/certifications', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const projectId = req.user.targetProjectId;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'Certifications retrieved', {
            certifications: project.certifications || []
        });
    } catch (error) {
        console.error('Error in GET /project/certifications:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving certifications', error.message);
    }
});

// GET /api/brand/project/documents
router.get('/project/documents', authenticateToken, verifyBrandAdvocate, async (req, res) => {
    try {
        const projectId = req.user.targetProjectId;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found');
        }

        successResponse(res, HTTP_STATUS.OK, 'Documents retrieved', {
            documents: project.documents || []
        });
    } catch (error) {
        console.error('Error in GET /project/documents:', error);
        errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error retrieving documents', error.message);
    }
});

export default router;
