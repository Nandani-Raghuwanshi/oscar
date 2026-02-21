import request from 'supertest';
import app from '../../src/index.js';
import BrandReferral from '../../src/models/BrandReferral.js';
import BrandReward from '../../src/models/BrandReward.js';
import { seedComplete } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Journey 12: Brand Advocate - Profile and Dashboard', () => {
    let brandAdvocateUser, brandAdvocateToken, sourceProject, targetProject;

    beforeEach(async () => {
        const seeded = await seedComplete();
        brandAdvocateUser = seeded.users.brandAdvocate;
        brandAdvocateToken = generateToken(brandAdvocateUser);
        sourceProject = seeded.projects[0];
        targetProject = seeded.projects[1];
    });

    describe('GET /api/brand/profile', () => {
        it('should fetch brand advocate profile with projects', async () => {
            const response = await request(app)
                .get('/api/brand/profile')
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(response.body.email).toBe(brandAdvocateUser.email);
            expect(response.body.role).toBe('brand_advocate');
            expect(response.body).toHaveProperty('sourceProject');
            expect(response.body).toHaveProperty('targetProject');
            expect(response.body.sourceProject._id.toString()).toBe(sourceProject._id.toString());
            expect(response.body.targetProject._id.toString()).toBe(targetProject._id.toString());
        });

        it('should fail for advocate without target project', async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('NoTarget123!');
            const noTargetAdvocate = await User.create({
                name: 'No Target Advocate',
                email: 'notarget@test.com',
                phone: '6665554444',
                password: hashedPassword,
                role: 'brand_advocate',
                sourceProject: sourceProject._id,
                isActive: true,
            });

            const token = generateToken(noTargetAdvocate);

            const response = await request(app)
                .get('/api/brand/profile')
                .set(authHeader(token))
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/brand/dashboard', () => {
        it('should fetch dashboard metrics', async () => {
            const response = await request(app)
                .get('/api/brand/dashboard')
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalReferrals');
            expect(response.body).toHaveProperty('qualifiedReferrals');
            expect(response.body).toHaveProperty('convertedReferrals');
            expect(response.body).toHaveProperty('totalRewards');
            expect(response.body).toHaveProperty('statusDistribution');
            expect(typeof response.body.totalReferrals).toBe('number');
        });

        it('should verify counts align with actual data', async () => {
            const response = await request(app)
                .get('/api/brand/dashboard')
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            const actualReferrals = await BrandReferral.countDocuments({
                advocate: brandAdvocateUser._id,
            });

            expect(response.body.totalReferrals).toBe(actualReferrals);
        });
    });
});

describe('Journey 13: Brand Advocate - Referrals and Rewards', () => {
    let brandAdvocateUser, brandAdvocateToken, sourceProject, targetProject;

    beforeEach(async () => {
        const seeded = await seedComplete();
        brandAdvocateUser = seeded.users.brandAdvocate;
        brandAdvocateToken = generateToken(brandAdvocateUser);
        sourceProject = seeded.projects[0];
        targetProject = seeded.projects[1];
    });

    describe('POST /api/brand/referrals', () => {
        it('should submit brand referral', async () => {
            const newReferral = {
                referredName: 'Brand Referral Person',
                referredPhone: '9998887777',
                referredEmail: 'brandreferral@test.com',
                notes: 'This is a brand referral test',
            };

            const response = await request(app)
                .post('/api/brand/referrals')
                .set(authHeader(brandAdvocateToken))
                .send(newReferral)
                .expect(201);

            expect(response.body.referredName).toBe(newReferral.referredName);
            expect(response.body.status).toBe('pending');
            expect(response.body.advocate.toString()).toBe(brandAdvocateUser._id.toString());
            expect(response.body.sourceProject.toString()).toBe(sourceProject._id.toString());
            expect(response.body.targetProject.toString()).toBe(targetProject._id.toString());
        });

        it('should fail with invalid target project', async () => {
            const invalidReferral = {
                referredName: 'Invalid Target',
                referredPhone: '8887776666',
                referredEmail: 'invalidtarget@test.com',
                notes: 'Invalid target project',
                targetProject: '000000000000000000000000',
            };

            await request(app)
                .post('/api/brand/referrals')
                .set(authHeader(brandAdvocateToken))
                .send(invalidReferral)
                .expect(400);
        });

        it('should detect duplicate referrals', async () => {
            const referral = {
                referredName: 'Duplicate Brand',
                referredPhone: '7776665555',
                referredEmail: 'dupbrand@test.com',
                notes: 'First submission',
            };

            // First submission
            await request(app)
                .post('/api/brand/referrals')
                .set(authHeader(brandAdvocateToken))
                .send(referral)
                .expect(201);

            // Duplicate submission
            await request(app)
                .post('/api/brand/referrals')
                .set(authHeader(brandAdvocateToken))
                .send(referral)
                .expect(400);
        });
    });

    describe('GET /api/brand/referrals', () => {
        it('should list brand referrals with filters', async () => {
            const response = await request(app)
                .get('/api/brand/referrals')
                .query({ status: 'pending' })
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(Array.isArray(response.body.referrals)).toBe(true);
            expect(response.body.referrals.every(r => r.status === 'pending')).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/brand/referrals')
                .query({ page: 1, limit: 10 })
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('referrals');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
        });
    });

    describe('PUT /api/brand/referrals/:id', () => {
        let brandReferral;

        beforeEach(async () => {
            brandReferral = await BrandReferral.create({
                advocate: brandAdvocateUser._id,
                sourceProject: sourceProject._id,
                targetProject: targetProject._id,
                referredName: 'Update Test Brand',
                referredPhone: '6665554444',
                referredEmail: 'updatebrand@test.com',
                status: 'pending',
                notes: 'Original notes',
            });
        });

        it('should update brand referral where allowed', async () => {
            const updates = {
                notes: 'Updated brand referral notes',
            };

            const response = await request(app)
                .put(`/api/brand/referrals/${brandReferral._id}`)
                .set(authHeader(brandAdvocateToken))
                .send(updates)
                .expect(200);

            expect(response.body.notes).toBe(updates.notes);
        });

        it('should prevent invalid status transitions', async () => {
            const invalidUpdate = {
                status: 'converted', // Should require CRM manager
            };

            await request(app)
                .put(`/api/brand/referrals/${brandReferral._id}`)
                .set(authHeader(brandAdvocateToken))
                .send(invalidUpdate)
                .expect(403);
        });
    });

    describe('GET /api/brand/rewards', () => {
        it('should list brand rewards', async () => {
            const response = await request(app)
                .get('/api/brand/rewards')
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(Array.isArray(response.body.rewards)).toBe(true);
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/brand/rewards')
                .query({ status: 'pending' })
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(response.body.rewards.every(r => r.status === 'pending')).toBe(true);
        });
    });

    describe('POST /api/brand/rewards/:id/claim', () => {
        let brandReward;

        beforeEach(async () => {
            brandReward = await BrandReward.create({
                advocate: brandAdvocateUser._id,
                brandReferral: (await BrandReferral.findOne({ advocate: brandAdvocateUser._id }))._id,
                targetProject: targetProject._id,
                amount: 1500,
                type: 'brand_referral',
                status: 'approved',
            });
        });

        it('should claim reward', async () => {
            const response = await request(app)
                .post(`/api/brand/rewards/${brandReward._id}/claim`)
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            expect(response.body.status).toBe('claimed');
            expect(response.body).toHaveProperty('claimedAt');
        });

        it('should enforce claim constraints', async () => {
            // Try to claim pending reward
            const pendingReward = await BrandReward.create({
                advocate: brandAdvocateUser._id,
                brandReferral: (await BrandReferral.findOne({ advocate: brandAdvocateUser._id }))._id,
                targetProject: targetProject._id,
                amount: 800,
                type: 'brand_referral',
                status: 'pending',
            });

            await request(app)
                .post(`/api/brand/rewards/${pendingReward._id}/claim`)
                .set(authHeader(brandAdvocateToken))
                .expect(400);
        });

        it('should prevent double claim', async () => {
            // First claim
            await request(app)
                .post(`/api/brand/rewards/${brandReward._id}/claim`)
                .set(authHeader(brandAdvocateToken))
                .expect(200);

            // Second claim
            await request(app)
                .post(`/api/brand/rewards/${brandReward._id}/claim`)
                .set(authHeader(brandAdvocateToken))
                .expect(400);
        });
    });
});
