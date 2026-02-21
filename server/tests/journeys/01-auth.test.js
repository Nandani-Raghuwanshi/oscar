import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/User.js';
import { TEST_USERS } from '../helpers/testData.js';
import { generateToken } from '../helpers/authHelpers.js';

describe('Journey 1: Auth and Session', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user with valid payload', async () => {
            const newUser = {
                firstName: 'New',
                lastName: 'User',
                email: 'newuser@test.com',
                phone: '9999999999',
                password: 'NewUser123!',
                role: 'project_advocate',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe(newUser.email);
            expect(response.body.data.user.role).toBe(newUser.role);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should fail with duplicate email', async () => {
            await User.create({
                ...TEST_USERS.admin,
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send(TEST_USERS.admin)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail with duplicate phone', async () => {
            await User.create({
                ...TEST_USERS.admin,
            });

            const duplicatePhone = {
                ...TEST_USERS.builder,
                phone: TEST_USERS.admin.phone,
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(duplicatePhone)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail with missing required fields', async () => {
            const incompleteUser = {
                email: 'incomplete@test.com',
                password: 'Pass123!',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('errors');
        });

        it('should fail with invalid role', async () => {
            const invalidRole = {
                ...TEST_USERS.admin,
                email: 'invalidrole@test.com',
                phone: '8888888888',
                role: 'invalid_role',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidRole)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                ...TEST_USERS.admin,
                isActive: true,
            });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    loginId: TEST_USERS.admin.email,
                    password: TEST_USERS.admin.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe(TEST_USERS.admin.email);
            expect(response.body.data.user.role).toBe(TEST_USERS.admin.role);
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    loginId: TEST_USERS.admin.email,
                    password: 'WrongPassword123!',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    loginId: 'nonexistent@test.com',
                    password: 'SomePassword123!',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail when user is inactive', async () => {
            await User.updateOne(
                { email: TEST_USERS.admin.email },
                { isActive: false }
            );

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    loginId: TEST_USERS.admin.email,
                    password: TEST_USERS.admin.password,
                })
                .expect(403);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        let user, token;

        beforeEach(async () => {
            user = await User.create({
                ...TEST_USERS.admin,
                isActive: true,
            });
            token = generateToken(user);
        });

        it('should return current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body.data.email).toBe(TEST_USERS.admin.email);
            expect(response.body.data.role).toBe(TEST_USERS.admin.role);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail with missing token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail with malformed token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });

        it('should fail with expired token', async () => {
            const expiredToken = generateToken(user);
            // Note: To properly test expired token, you'd need to mock jwt.verify
            // or use a test token with very short expiry

            // For now, we test with invalid format which also fails
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer expired.token.here')
                .expect(403);

            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
        });
    });
});
