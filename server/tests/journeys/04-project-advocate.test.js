import request from 'supertest';
import app from '../../src/index.js';
import Referral from '../../src/models/Referral.js';
import Reward from '../../src/models/Reward.js';
import { seedComplete } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Journey 8: Project Advocate - Profile and Dashboard', () => {
    let advocateUser, advocateToken, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        advocateUser = seeded.users.projectAdvocate;
        advocateToken = generateToken(advocateUser);
        project = seeded.projects[0];
    });

    describe('GET /api/advocate/profile', () => {
        it('should fetch advocate profile with project linkage', async () => {
            const response = await request(app)
                .get('/api/advocate/profile')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body.email).toBe(advocateUser.email);
            expect(response.body.role).toBe('project_advocate');
            expect(response.body.project).toBeTruthy();
            expect(response.body.project._id.toString()).toBe(project._id.toString());
        });

        it('should fail for advocate without assigned project', async () => {
            // Create advocate without project
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('NoProject123!');
            const noProjectAdvocate = await User.create({
                name: 'No Project Advocate',
                email: 'noproject-adv@test.com',
                phone: '9998887777',
                password: hashedPassword,
                role: 'project_advocate',
                isActive: true,
            });

            const token = generateToken(noProjectAdvocate);

            const response = await request(app)
                .get('/api/advocate/profile')
                .set(authHeader(token))
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/advocate/dashboard', () => {
        it('should fetch dashboard metrics', async () => {
            const response = await request(app)
                .get('/api/advocate/dashboard')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalReferrals');
            expect(response.body).toHaveProperty('qualifiedReferrals');
            expect(response.body).toHaveProperty('convertedReferrals');
            expect(response.body).toHaveProperty('pendingRewards');
            expect(response.body).toHaveProperty('statusDistribution');
            expect(typeof response.body.totalReferrals).toBe('number');
        });

        it('should verify counts align with actual data', async () => {
            const response = await request(app)
                .get('/api/advocate/dashboard')
                .set(authHeader(advocateToken))
                .expect(200);

            const actualReferrals = await Referral.countDocuments({
                advocate: advocateUser._id,
            });

            expect(response.body.totalReferrals).toBe(actualReferrals);
        });
    });
});

describe('Journey 9: Project Advocate - Referrals', () => {
    let advocateUser, advocateToken, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        advocateUser = seeded.users.projectAdvocate;
        advocateToken = generateToken(advocateUser);
        project = seeded.projects[0];
    });

    describe('POST /api/advocate/referrals', () => {
        it('should submit referral and create lead', async () => {
            const newReferral = {
                referredName: 'New Referral Person',
                referredPhone: '6667778888',
                referredEmail: 'newreferral@test.com',
                notes: 'This is a test referral submission',
            };

            const response = await request(app)
                .post('/api/advocate/referrals')
                .set(authHeader(advocateToken))
                .send(newReferral)
                .expect(201);

            expect(response.body.referredName).toBe(newReferral.referredName);
            expect(response.body.status).toBe('pending');
            expect(response.body.advocate.toString()).toBe(advocateUser._id.toString());
            expect(response.body.project.toString()).toBe(project._id.toString());
        });

        it('should fail with invalid phone format', async () => {
            const invalidReferral = {
                referredName: 'Invalid Phone',
                referredPhone: 'not-a-phone',
                referredEmail: 'invalid@test.com',
                notes: 'Invalid phone number',
            };

            await request(app)
                .post('/api/advocate/referrals')
                .set(authHeader(advocateToken))
                .send(invalidReferral)
                .expect(400);
        });

        it('should fail with invalid email format', async () => {
            const invalidReferral = {
                referredName: 'Invalid Email',
                referredPhone: '7778889999',
                referredEmail: 'not-an-email',
                notes: 'Invalid email address',
            };

            await request(app)
                .post('/api/advocate/referrals')
                .set(authHeader(advocateToken))
                .send(invalidReferral)
                .expect(400);
        });

        it('should deny access for unauthorized roles', async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('Builder123!');
            const builder = await User.create({
                name: 'Builder User',
                email: 'builder-unauth@test.com',
                phone: '8889990000',
                password: hashedPassword,
                role: 'builder',
                isActive: true,
            });

            const builderToken = generateToken(builder);

            await request(app)
                .post('/api/advocate/referrals')
                .set(authHeader(builderToken))
                .send({
                    referredName: 'Unauthorized',
                    referredPhone: '1112223333',
                    referredEmail: 'unauth@test.com',
                    notes: 'Should not work',
                })
                .expect(403);
        });
    });

    describe('GET /api/advocate/referrals', () => {
        it('should list referrals with pagination', async () => {
            const response = await request(app)
                .get('/api/advocate/referrals')
                .query({ page: 1, limit: 10 })
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('referrals');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
            expect(Array.isArray(response.body.referrals)).toBe(true);
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/advocate/referrals')
                .query({ status: 'pending' })
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body.referrals.every(r => r.status === 'pending')).toBe(true);
        });

        it('should only return own referrals', async () => {
            const response = await request(app)
                .get('/api/advocate/referrals')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body.referrals.every(
                r => r.advocate._id.toString() === advocateUser._id.toString()
            )).toBe(true);
        });
    });

    describe('PUT /api/advocate/referrals/:id', () => {
        let referral;

        beforeEach(async () => {
            referral = await Referral.create({
                advocate: advocateUser._id,
                project: project._id,
                referredName: 'Update Test',
                referredPhone: '4445556666',
                referredEmail: 'updatetest@test.com',
                status: 'pending',
                notes: 'Original notes',
            });
        });

        it('should update referral status', async () => {
            const updates = {
                notes: 'Updated notes with more information',
            };

            const response = await request(app)
                .put(`/api/advocate/referrals/${referral._id}`)
                .set(authHeader(advocateToken))
                .send(updates)
                .expect(200);

            expect(response.body.notes).toBe(updates.notes);
        });

        it('should enforce status transition rules', async () => {
            // Try to set invalid status directly
            const invalidUpdate = {
                status: 'converted', // Should require CRM manager
            };

            await request(app)
                .put(`/api/advocate/referrals/${referral._id}`)
                .set(authHeader(advocateToken))
                .send(invalidUpdate)
                .expect(403);
        });
    });
});

describe('Journey 10: Project Advocate - Rewards', () => {
    let advocateUser, advocateToken, rewards;

    beforeEach(async () => {
        const seeded = await seedComplete();
        advocateUser = seeded.users.projectAdvocate;
        advocateToken = generateToken(advocateUser);
        rewards = [seeded.reward];
    });

    describe('GET /api/advocate/rewards', () => {
        it('should list rewards with filters', async () => {
            const response = await request(app)
                .get('/api/advocate/rewards')
                .query({ status: 'pending' })
                .set(authHeader(advocateToken))
                .expect(200);

            expect(Array.isArray(response.body.rewards)).toBe(true);
            expect(response.body.rewards.every(r => r.status === 'pending')).toBe(true);
        });

        it('should only return own rewards', async () => {
            const response = await request(app)
                .get('/api/advocate/rewards')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body.rewards.every(
                r => r.advocate._id.toString() === advocateUser._id.toString()
            )).toBe(true);
        });
    });

    describe('GET /api/advocate/rewards/summary', () => {
        it('should return reward summary by status', async () => {
            const response = await request(app)
                .get('/api/advocate/rewards/summary')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalEarned');
            expect(response.body).toHaveProperty('pending');
            expect(response.body).toHaveProperty('approved');
            expect(response.body).toHaveProperty('paid');
            expect(typeof response.body.totalEarned).toBe('number');
        });

        it('should validate calculation accuracy', async () => {
            const rewards = await Reward.find({ advocate: advocateUser._id });
            const expectedTotal = rewards.reduce((sum, r) => sum + r.amount, 0);

            const response = await request(app)
                .get('/api/advocate/rewards/summary')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body.totalEarned).toBe(expectedTotal);
        });
    });

    describe('GET /api/advocate/rewards - Unauthorized Access', () => {
        it('should deny access for unauthorized roles', async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('Admin123!');
            const admin = await User.create({
                name: 'Admin User Unauth',
                email: 'admin-unauth-rewards@test.com',
                phone: '7776665555',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
            });

            const adminToken = generateToken(admin);

            await request(app)
                .get('/api/advocate/rewards')
                .set(authHeader(adminToken))
                .expect(403);
        });
    });
});

describe('Journey 11: Project Advocate - Project Docs', () => {
    let advocateUser, advocateToken, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        advocateUser = seeded.users.projectAdvocate;
        advocateToken = generateToken(advocateUser);
        project = seeded.projects[0];
    });

    describe('GET /api/advocate/project', () => {
        it('should fetch project details and documents', async () => {
            const response = await request(app)
                .get('/api/advocate/project')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body._id.toString()).toBe(project._id.toString());
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('location');
            expect(response.body).toHaveProperty('certifications');
            expect(response.body).toHaveProperty('documents');
        });

        it('should handle empty certifications gracefully', async () => {
            const response = await request(app)
                .get('/api/advocate/project')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('certifications');
            expect(Array.isArray(response.body.certifications)).toBe(true);
        });

        it('should handle empty documents gracefully', async () => {
            const response = await request(app)
                .get('/api/advocate/project')
                .set(authHeader(advocateToken))
                .expect(200);

            expect(response.body).toHaveProperty('documents');
            expect(Array.isArray(response.body.documents)).toBe(true);
        });
    });
});
