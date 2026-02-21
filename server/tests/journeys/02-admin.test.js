import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/User.js';
import Project from '../../src/models/Project.js';
import AuditLog from '../../src/models/AuditLog.js';
import { seedUsers, seedProjects } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Journey 2: Admin - User Management', () => {
    let adminUser, adminToken, builderUser;

    beforeEach(async () => {
        const users = await seedUsers();
        adminUser = users.admin;
        builderUser = users.builder;
        adminToken = generateToken(adminUser);
    });

    describe('POST /api/admin/users', () => {
        it('should create user for each role', async () => {
            const newUser = {
                name: 'New Sales Associate',
                email: 'newsales@test.com',
                phone: '7777777777',
                password: 'NewSales123!',
                role: 'sales_associate',
            };

            const response = await request(app)
                .post('/api/admin/users')
                .set(authHeader(adminToken))
                .send(newUser)
                .expect(201);

            expect(response.body.email).toBe(newUser.email);
            expect(response.body.role).toBe(newUser.role);
            expect(response.body.isActive).toBe(true);

            // Verify audit log entry
            const auditLog = await AuditLog.findOne({
                action: 'user_created',
                actor: adminUser._id,
            });
            expect(auditLog).toBeTruthy();
        });

        it('should fail with missing required fields', async () => {
            const incompleteUser = {
                email: 'missingfields@test.com',
            };

            await request(app)
                .post('/api/admin/users')
                .set(authHeader(adminToken))
                .send(incompleteUser)
                .expect(400);
        });

        it('should fail with invalid role', async () => {
            const invalidUser = {
                name: 'Invalid Role User',
                email: 'invalid@test.com',
                phone: '6666666666',
                password: 'Invalid123!',
                role: 'super_admin',
            };

            await request(app)
                .post('/api/admin/users')
                .set(authHeader(adminToken))
                .send(invalidUser)
                .expect(400);
        });

        it('should deny access for non-admin', async () => {
            const builderToken = generateToken(builderUser);

            const newUser = {
                name: 'Unauthorized User',
                email: 'unauth@test.com',
                phone: '5555555555',
                password: 'Unauth123!',
                role: 'sales_associate',
            };

            await request(app)
                .post('/api/admin/users')
                .set(authHeader(builderToken))
                .send(newUser)
                .expect(403);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        it('should update user role and permissions', async () => {
            const updates = {
                role: 'crm_manager',
                permissions: ['view_reports', 'manage_team'],
            };

            const response = await request(app)
                .put(`/api/admin/users/${builderUser._id}`)
                .set(authHeader(adminToken))
                .send(updates)
                .expect(200);

            expect(response.body.role).toBe('crm_manager');
            expect(response.body.permissions).toEqual(updates.permissions);

            // Verify audit log
            const auditLog = await AuditLog.findOne({
                action: 'user_updated',
                targetUser: builderUser._id,
            });
            expect(auditLog).toBeTruthy();
        });

        it('should deny access for non-admin', async () => {
            const builderToken = generateToken(builderUser);

            await request(app)
                .put(`/api/admin/users/${builderUser._id}`)
                .set(authHeader(builderToken))
                .send({ role: 'admin' })
                .expect(403);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should list and filter users by role', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .query({ role: 'builder' })
                .set(authHeader(adminToken))
                .expect(200);

            expect(Array.isArray(response.body.users)).toBe(true);
            expect(response.body.users.every(u => u.role === 'builder')).toBe(true);
        });

        it('should filter users by status', async () => {
            await User.updateOne(
                { _id: builderUser._id },
                { isActive: false }
            );

            const response = await request(app)
                .get('/api/admin/users')
                .query({ isActive: false })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.users.length).toBeGreaterThan(0);
            expect(response.body.users.every(u => u.isActive === false)).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .query({ page: 1, limit: 2 })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
            expect(response.body.users.length).toBeLessThanOrEqual(2);
        });
    });

    describe('POST /api/admin/users/:id/deactivate', () => {
        it('should deactivate user', async () => {
            const response = await request(app)
                .post(`/api/admin/users/${builderUser._id}/deactivate`)
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.isActive).toBe(false);

            // Verify user cannot login when inactive
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: builderUser.email,
                    password: 'Builder123!',
                })
                .expect(403);

            expect(loginResponse.body).toHaveProperty('error');
        });
    });

    describe('POST /api/admin/users/:id/activate', () => {
        it('should reactivate user', async () => {
            // First deactivate
            await User.updateOne(
                { _id: builderUser._id },
                { isActive: false }
            );

            // Then reactivate
            const response = await request(app)
                .post(`/api/admin/users/${builderUser._id}/activate`)
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.isActive).toBe(true);
        });
    });
});

describe('Journey 3: Admin - Project Management', () => {
    let adminUser, adminToken, builderUser;

    beforeEach(async () => {
        const users = await seedUsers();
        adminUser = users.admin;
        builderUser = users.builder;
        adminToken = generateToken(adminUser);
    });

    describe('POST /api/admin/projects', () => {
        it('should create project and assign builder', async () => {
            const newProject = {
                name: 'New Test Project',
                location: 'Test Location',
                status: 'active',
                description: 'Test project description',
                builder: builderUser._id,
            };

            const response = await request(app)
                .post('/api/admin/projects')
                .set(authHeader(adminToken))
                .send(newProject)
                .expect(201);

            expect(response.body.name).toBe(newProject.name);
            expect(response.body.builder.toString()).toBe(builderUser._id.toString());

            // Verify readback
            const project = await Project.findById(response.body._id);
            expect(project.name).toBe(newProject.name);
        });

        it('should fail with invalid builder id', async () => {
            const invalidProject = {
                name: 'Invalid Project',
                location: 'Test',
                builder: '000000000000000000000000',
            };

            await request(app)
                .post('/api/admin/projects')
                .set(authHeader(adminToken))
                .send(invalidProject)
                .expect(400);
        });

        it('should deny access for non-admin', async () => {
            const builderToken = generateToken(builderUser);

            await request(app)
                .post('/api/admin/projects')
                .set(authHeader(builderToken))
                .send({ name: 'Unauthorized Project' })
                .expect(403);
        });
    });

    describe('PUT /api/admin/projects/:id', () => {
        let project;

        beforeEach(async () => {
            const projects = await seedProjects(builderUser._id);
            project = projects[0];
        });

        it('should update project settings and status', async () => {
            const updates = {
                status: 'completed',
                description: 'Updated description',
            };

            const response = await request(app)
                .put(`/api/admin/projects/${project._id}`)
                .set(authHeader(adminToken))
                .send(updates)
                .expect(200);

            expect(response.body.status).toBe('completed');
            expect(response.body.description).toBe(updates.description);
        });
    });

    describe('GET /api/admin/projects', () => {
        beforeEach(async () => {
            await seedProjects(builderUser._id);
        });

        it('should list projects with filters', async () => {
            const response = await request(app)
                .get('/api/admin/projects')
                .query({ status: 'active' })
                .set(authHeader(adminToken))
                .expect(200);

            expect(Array.isArray(response.body.projects)).toBe(true);
            expect(response.body.projects.every(p => p.status === 'active')).toBe(true);
        });

        it('should filter by builder', async () => {
            const response = await request(app)
                .get('/api/admin/projects')
                .query({ builder: builderUser._id })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.projects.length).toBeGreaterThan(0);
            expect(response.body.projects.every(
                p => p.builder._id.toString() === builderUser._id.toString()
            )).toBe(true);
        });
    });
});

describe('Journey 4: Admin - Audit Trail', () => {
    let adminUser, adminToken, builderUser;

    beforeEach(async () => {
        const users = await seedUsers();
        adminUser = users.admin;
        builderUser = users.builder;
        adminToken = generateToken(adminToken);
    });

    describe('GET /api/admin/audit-logs', () => {
        beforeEach(async () => {
            // Create some audit entries
            await AuditLog.create({
                action: 'user_created',
                actor: adminUser._id,
                targetUser: builderUser._id,
                details: { role: 'builder' },
            });

            await AuditLog.create({
                action: 'user_updated',
                actor: adminUser._id,
                targetUser: builderUser._id,
                details: { field: 'role', oldValue: 'builder', newValue: 'admin' },
            });
        });

        it('should query audit logs with filters', async () => {
            const response = await request(app)
                .get('/api/admin/audit-logs')
                .query({ action: 'user_created' })
                .set(authHeader(adminToken))
                .expect(200);

            expect(Array.isArray(response.body.logs)).toBe(true);
            expect(response.body.logs.every(log => log.action === 'user_created')).toBe(true);
        });

        it('should filter by date range', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const response = await request(app)
                .get('/api/admin/audit-logs')
                .query({
                    startDate: yesterday.toISOString(),
                    endDate: tomorrow.toISOString(),
                })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.logs.length).toBeGreaterThan(0);
        });

        it('should filter by actor', async () => {
            const response = await request(app)
                .get('/api/admin/audit-logs')
                .query({ actor: adminUser._id })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.logs.every(
                log => log.actor._id.toString() === adminUser._id.toString()
            )).toBe(true);
        });

        it('should deny access for non-admin', async () => {
            const builderToken = generateToken(builderUser);

            await request(app)
                .get('/api/admin/audit-logs')
                .set(authHeader(builderToken))
                .expect(403);
        });
    });
});
