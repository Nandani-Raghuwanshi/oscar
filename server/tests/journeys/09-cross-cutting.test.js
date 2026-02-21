import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/User.js';
import Project from '../../src/models/Project.js';
import Customer from '../../src/models/Customer.js';
import Referral from '../../src/models/Referral.js';
import Lead from '../../src/models/Lead.js';
import { seedComplete, seedUsers } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Cross-Cutting Validations', () => {
    describe('RBAC: Role-Based Access Control', () => {
        let users, adminToken, builderToken, salesToken, advocateToken;

        beforeEach(async () => {
            users = await seedUsers();
            adminToken = generateToken(users.admin);
            builderToken = generateToken(users.builder);
            salesToken = generateToken(users.salesAssociate);
            advocateToken = generateToken(users.projectAdvocate);
        });

        it('should deny admin routes for non-admin users', async () => {
            await request(app)
                .get('/api/admin/users')
                .set(authHeader(builderToken))
                .expect(403);

            await request(app)
                .get('/api/admin/users')
                .set(authHeader(salesToken))
                .expect(403);
        });

        it('should deny builder routes for non-builder users', async () => {
            await request(app)
                .get('/api/builder/customers')
                .set(authHeader(salesToken))
                .expect(403);

            await request(app)
                .get('/api/builder/customers')
                .set(authHeader(advocateToken))
                .expect(403);
        });

        it('should deny CRM routes for non-CRM users', async () => {
            await request(app)
                .get('/api/crm/leads')
                .set(authHeader(builderToken))
                .expect(403);

            await request(app)
                .get('/api/crm/leads')
                .set(authHeader(advocateToken))
                .expect(403);
        });

        it('should deny advocate routes for non-advocate users', async () => {
            await request(app)
                .get('/api/advocate/referrals')
                .set(authHeader(builderToken))
                .expect(403);

            await request(app)
                .get('/api/advocate/referrals')
                .set(authHeader(salesToken))
                .expect(403);
        });
    });

    describe('Soft Delete: Deleted Items Exclusion', () => {
        let seeded;

        beforeEach(async () => {
            seeded = await seedComplete();
        });

        it('should exclude soft-deleted users from list', async () => {
            const user = seeded.users.builder;
            await User.updateOne({ _id: user._id }, { isDeleted: true });

            const adminToken = generateToken(seeded.users.admin);

            const response = await request(app)
                .get('/api/admin/users')
                .set(authHeader(adminToken))
                .expect(200);

            const deletedUser = response.body.users.find(u => u._id.toString() === user._id.toString());
            expect(deletedUser).toBeUndefined();
        });

        it('should exclude soft-deleted customers from list', async () => {
            const customer = seeded.customers[0];
            await Customer.updateOne({ _id: customer._id }, { isDeleted: true });

            const builderToken = generateToken(seeded.users.builder);

            const response = await request(app)
                .get('/api/builder/customers')
                .set(authHeader(builderToken))
                .expect(200);

            const deletedCustomer = response.body.customers.find(
                c => c._id.toString() === customer._id.toString()
            );
            expect(deletedCustomer).toBeUndefined();
        });

        it('should exclude soft-deleted referrals from list', async () => {
            const referral = seeded.referrals[0];
            await Referral.updateOne({ _id: referral._id }, { isDeleted: true });

            const advocateToken = generateToken(seeded.users.projectAdvocate);

            const response = await request(app)
                .get('/api/advocate/referrals')
                .set(authHeader(advocateToken))
                .expect(200);

            const deletedReferral = response.body.referrals.find(
                r => r._id.toString() === referral._id.toString()
            );
            expect(deletedReferral).toBeUndefined();
        });
    });

    describe('Pagination: Limits and Offsets', () => {
        let adminToken;

        beforeEach(async () => {
            const seeded = await seedComplete();
            adminToken = generateToken(seeded.users.admin);

            // Create additional users for pagination testing
            for (let i = 0; i < 15; i++) {
                const { hashPassword } = await import('../helpers/testData.js');
                const hashedPassword = await hashPassword('Test123!');

                await User.create({
                    name: `Test User ${i}`,
                    email: `test${i}@pagination.com`,
                    phone: `100000${i}`.padEnd(10, '0'),
                    password: hashedPassword,
                    role: 'sales_associate',
                    isActive: true,
                });
            }
        });

        it('should respect limit parameter', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .query({ limit: 5 })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.users.length).toBeLessThanOrEqual(5);
        });

        it('should handle page offset correctly', async () => {
            const page1 = await request(app)
                .get('/api/admin/users')
                .query({ page: 1, limit: 5 })
                .set(authHeader(adminToken));

            const page2 = await request(app)
                .get('/api/admin/users')
                .query({ page: 2, limit: 5 })
                .set(authHeader(adminToken));

            // Verify no overlap
            const page1Ids = page1.body.users.map(u => u._id);
            const page2Ids = page2.body.users.map(u => u._id);

            const overlap = page1Ids.filter(id => page2Ids.includes(id));
            expect(overlap.length).toBe(0);
        });

        it('should return accurate total count', async () => {
            const totalUsers = await User.countDocuments({ isActive: true, isDeleted: { $ne: true } });

            const response = await request(app)
                .get('/api/admin/users')
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.total).toBe(totalUsers);
        });
    });

    describe('Sorting: Stable Sorting', () => {
        let crmToken;

        beforeEach(async () => {
            const seeded = await seedComplete();
            crmToken = generateToken(seeded.users.crmManager);

            // Create leads with different priorities and dates
            const Lead = (await import('../../src/models/Lead.js')).default;
            const Referral = (await import('../../src/models/Referral.js')).default;

            for (let i = 0; i < 5; i++) {
                const referral = await Referral.create({
                    advocate: seeded.users.projectAdvocate._id,
                    project: seeded.projects[0]._id,
                    referredName: `Sort Test ${i}`,
                    referredPhone: `20000000${i}`,
                    referredEmail: `sort${i}@test.com`,
                    status: 'qualified',
                    notes: 'Sort test',
                });

                await Lead.create({
                    referral: referral._id,
                    assignedTo: seeded.users.salesAssociate._id,
                    project: seeded.projects[0]._id,
                    status: 'new',
                    priority: i % 2 === 0 ? 'high' : 'low',
                });
            }
        });

        it('should sort by createdAt descending', async () => {
            const response = await request(app)
                .get('/api/crm/leads')
                .query({ sortBy: 'createdAt', order: 'desc' })
                .set(authHeader(crmToken))
                .expect(200);

            const dates = response.body.leads.map(l => new Date(l.createdAt).getTime());

            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        });

        it('should sort by priority', async () => {
            const response = await request(app)
                .get('/api/crm/leads')
                .query({ sortBy: 'priority', order: 'desc' })
                .set(authHeader(crmToken))
                .expect(200);

            const priorities = response.body.leads.map(l => l.priority);
            expect(priorities.length).toBeGreaterThan(0);
        });
    });

    describe('Data Integrity: Foreign Key Validation', () => {
        let seeded;

        beforeEach(async () => {
            seeded = await seedComplete();
        });

        it('should validate project exists when creating customer', async () => {
            const builderToken = generateToken(seeded.users.builder);

            await request(app)
                .post('/api/builder/customers')
                .set(authHeader(builderToken))
                .send({
                    name: 'Invalid Project Customer',
                    email: 'invalid@test.com',
                    phone: '9998887777',
                    address: 'Test Address',
                    projectId: '000000000000000000000000',
                })
                .expect(400);
        });

        it('should validate user exists when assigning lead', async () => {
            const crmToken = generateToken(seeded.users.crmManager);
            const referral = seeded.referrals[0];

            await request(app)
                .post(`/api/crm/referrals/${referral._id}/assign`)
                .set(authHeader(crmToken))
                .send({
                    salesAssociateId: '000000000000000000000000',
                })
                .expect(400);
        });

        it('should validate referral exists when creating lead', async () => {
            const crmToken = generateToken(seeded.users.crmManager);

            await request(app)
                .post(`/api/crm/referrals/000000000000000000000000/assign`)
                .set(authHeader(crmToken))
                .send({
                    salesAssociateId: seeded.users.salesAssociate._id,
                })
                .expect(404);
        });
    });

    describe('Error Handling: Consistent Error Response', () => {
        let token;

        beforeEach(async () => {
            const users = await seedUsers();
            token = generateToken(users.admin);
        });

        it('should return consistent error structure for validation errors', async () => {
            const response = await request(app)
                .post('/api/admin/users')
                .set(authHeader(token))
                .send({
                    email: 'incomplete@test.com',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(typeof response.body.error).toBe('string');
        });

        it('should return consistent error for not found', async () => {
            const response = await request(app)
                .get('/api/admin/users/000000000000000000000000')
                .set(authHeader(token))
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });

        it('should return consistent error for forbidden access', async () => {
            const users = await seedUsers();
            const builderToken = generateToken(users.builder);

            const response = await request(app)
                .get('/api/admin/users')
                .set(authHeader(builderToken))
                .expect(403);

            expect(response.body).toHaveProperty('error');
        });

        it('should return consistent error for unauthorized', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });
});
