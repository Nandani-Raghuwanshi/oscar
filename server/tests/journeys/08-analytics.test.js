import request from 'supertest';
import app from '../../src/index.js';
import { seedComplete } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Journey 22: Analytics and Reports', () => {
    let adminUser, adminToken, crmManager, crmToken;

    beforeEach(async () => {
        const seeded = await seedComplete();
        adminUser = seeded.users.admin;
        adminToken = generateToken(adminUser);
        crmManager = seeded.users.crmManager;
        crmToken = generateToken(crmManager);
    });

    describe('GET /api/analytics/dashboard', () => {
        it('should fetch analytics dashboard aggregates', async () => {
            const response = await request(app)
                .get('/api/analytics/dashboard')
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body).toHaveProperty('overview');
            expect(response.body).toHaveProperty('referrals');
            expect(response.body).toHaveProperty('leads');
            expect(response.body).toHaveProperty('revenue');
            expect(response.body).toHaveProperty('advocates');

            expect(typeof response.body.overview.totalUsers).toBe('number');
            expect(typeof response.body.referrals.total).toBe('number');
            expect(typeof response.body.leads.total).toBe('number');
        });

        it('should filter by date range', async () => {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);

            const endDate = new Date();

            const response = await request(app)
                .get('/api/analytics/dashboard')
                .query({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body).toHaveProperty('dateRange');
            expect(response.body.dateRange.start).toBeTruthy();
            expect(response.body.dateRange.end).toBeTruthy();
        });

        it('should filter by project', async () => {
            const seeded = await seedComplete();
            const project = seeded.projects[0];

            const response = await request(app)
                .get('/api/analytics/dashboard')
                .query({ projectId: project._id })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body).toHaveProperty('project');
            expect(response.body.project._id.toString()).toBe(project._id.toString());
        });

        it('should deny access for unauthorized roles', async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('Sales123!');
            const sales = await User.create({
                name: 'Unauthorized Sales',
                email: 'unauth-analytics@test.com',
                phone: '3332221111',
                password: hashedPassword,
                role: 'sales_associate',
                isActive: true,
            });

            const salesToken = generateToken(sales);

            await request(app)
                .get('/api/analytics/dashboard')
                .set(authHeader(salesToken))
                .expect(403);
        });
    });

    describe('GET /api/analytics/referrals', () => {
        it('should fetch referral analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/referrals')
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('byStatus');
            expect(response.body).toHaveProperty('conversionRate');
            expect(response.body).toHaveProperty('topAdvocates');
            expect(Array.isArray(response.body.topAdvocates)).toBe(true);
        });

        it('should provide accurate conversion metrics', async () => {
            const Referral = (await import('../../src/models/Referral.js')).default;

            const total = await Referral.countDocuments();
            const converted = await Referral.countDocuments({ status: 'converted' });

            const response = await request(app)
                .get('/api/analytics/referrals')
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body.total).toBe(total);

            const expectedRate = total > 0 ? (converted / total) * 100 : 0;
            expect(response.body.conversionRate).toBeCloseTo(expectedRate, 1);
        });
    });

    describe('GET /api/analytics/leads', () => {
        it('should fetch lead analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/leads')
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('byStatus');
            expect(response.body).toHaveProperty('byPriority');
            expect(response.body).toHaveProperty('conversionFunnel');
            expect(response.body).toHaveProperty('averageResponseTime');
        });
    });

    describe('GET /api/analytics/revenue', () => {
        it('should fetch revenue analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/revenue')
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalRevenue');
            expect(response.body).toHaveProperty('revenueByProject');
            expect(response.body).toHaveProperty('revenueByMonth');
            expect(response.body).toHaveProperty('averageDealSize');
            expect(Array.isArray(response.body.revenueByMonth)).toBe(true);
        });
    });

    describe('GET /api/analytics/advocates', () => {
        it('should fetch advocate performance analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/advocates')
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('active');
            expect(response.body).toHaveProperty('topPerformers');
            expect(response.body).toHaveProperty('averageReferralsPerAdvocate');
            expect(Array.isArray(response.body.topPerformers)).toBe(true);
        });
    });

    describe('POST /api/analytics/reports/generate', () => {
        it('should generate report with filters', async () => {
            const reportConfig = {
                type: 'referrals',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-02-28'),
                groupBy: 'month',
                filters: {
                    status: 'converted',
                },
            };

            const response = await request(app)
                .post('/api/analytics/reports/generate')
                .set(authHeader(adminToken))
                .send(reportConfig)
                .expect(200);

            expect(response.body).toHaveProperty('reportId');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata.type).toBe(reportConfig.type);
        });

        it('should fail with invalid date range', async () => {
            const invalidConfig = {
                type: 'leads',
                startDate: new Date('2026-12-31'),
                endDate: new Date('2026-01-01'), // End before start
            };

            await request(app)
                .post('/api/analytics/reports/generate')
                .set(authHeader(adminToken))
                .send(invalidConfig)
                .expect(400);
        });
    });

    describe('POST /api/analytics/reports/:id/export', () => {
        let reportId;

        beforeEach(async () => {
            const reportResponse = await request(app)
                .post('/api/analytics/reports/generate')
                .set(authHeader(adminToken))
                .send({
                    type: 'referrals',
                    startDate: new Date('2026-01-01'),
                    endDate: new Date('2026-02-28'),
                });

            reportId = reportResponse.body.reportId;
        });

        it('should export report as CSV', async () => {
            const response = await request(app)
                .post(`/api/analytics/reports/${reportId}/export`)
                .set(authHeader(adminToken))
                .send({ format: 'csv' })
                .expect(200);

            expect(response.headers['content-type']).toContain('text/csv');
            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.text.length).toBeGreaterThan(0);
        });

        it('should export report as PDF', async () => {
            const response = await request(app)
                .post(`/api/analytics/reports/${reportId}/export`)
                .set(authHeader(adminToken))
                .send({ format: 'pdf' })
                .expect(200);

            expect(response.headers['content-type']).toContain('application/pdf');
            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should verify file response data contents', async () => {
            const response = await request(app)
                .post(`/api/analytics/reports/${reportId}/export`)
                .set(authHeader(adminToken))
                .send({ format: 'csv' })
                .expect(200);

            // Verify CSV contains headers
            expect(response.text).toContain('date');
            expect(response.text).toContain('count');
        });
    });

    describe('GET /api/analytics/reports', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/analytics/reports/generate')
                .set(authHeader(adminToken))
                .send({
                    type: 'leads',
                    startDate: new Date('2026-01-01'),
                    endDate: new Date('2026-01-31'),
                });
        });

        it('should list generated reports', async () => {
            const response = await request(app)
                .get('/api/analytics/reports')
                .set(authHeader(adminToken))
                .expect(200);

            expect(Array.isArray(response.body.reports)).toBe(true);
            expect(response.body.reports.length).toBeGreaterThan(0);
            expect(response.body.reports[0]).toHaveProperty('reportId');
            expect(response.body.reports[0]).toHaveProperty('type');
            expect(response.body.reports[0]).toHaveProperty('createdAt');
        });
    });

    describe('Cross-Cutting: Data Integrity', () => {
        it('should validate aggregates match actual data', async () => {
            const Referral = (await import('../../src/models/Referral.js')).default;
            const Lead = (await import('../../src/models/Lead.js')).default;

            const actualReferrals = await Referral.countDocuments();
            const actualLeads = await Lead.countDocuments();

            const response = await request(app)
                .get('/api/analytics/dashboard')
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.referrals.total).toBe(actualReferrals);
            expect(response.body.leads.total).toBe(actualLeads);
        });
    });
});
