import request from 'supertest';
import app from '../../src/index.js';
import NotificationTemplate from '../../src/models/NotificationTemplate.js';
import Notification from '../../src/models/Notification.js';
import User from '../../src/models/User.js';
import { seedUsers } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('Journey 21: Notifications', () => {
    let adminUser, adminToken, regularUser;

    beforeEach(async () => {
        const users = await seedUsers();
        adminUser = users.admin;
        adminToken = generateToken(adminUser);
        regularUser = users.builder;
    });

    describe('POST /api/notifications/templates', () => {
        it('should create notification template', async () => {
            const template = {
                name: 'Welcome Email',
                subject: 'Welcome {{userName}}',
                body: 'Hello {{userName}}, welcome to {{projectName}}!',
                type: 'email',
                category: 'onboarding',
                isActive: true,
            };

            const response = await request(app)
                .post('/api/notifications/templates')
                .set(authHeader(adminToken))
                .send(template)
                .expect(201);

            expect(response.body.name).toBe(template.name);
            expect(response.body.subject).toBe(template.subject);
            expect(response.body.type).toBe(template.type);
        });

        it('should fail with missing template variables', async () => {
            const incompleteTemplate = {
                name: 'Incomplete',
                subject: 'Test',
                // Missing body
                type: 'email',
            };

            await request(app)
                .post('/api/notifications/templates')
                .set(authHeader(adminToken))
                .send(incompleteTemplate)
                .expect(400);
        });

        it('should deny access for non-admin', async () => {
            const userToken = generateToken(regularUser);

            await request(app)
                .post('/api/notifications/templates')
                .set(authHeader(userToken))
                .send({
                    name: 'Unauthorized',
                    subject: 'Test',
                    body: 'Test body',
                    type: 'email',
                })
                .expect(403);
        });
    });

    describe('GET /api/notifications/templates', () => {
        beforeEach(async () => {
            await NotificationTemplate.create({
                name: 'Template 1',
                subject: 'Subject 1',
                body: 'Body 1',
                type: 'email',
                category: 'general',
                isActive: true,
            });

            await NotificationTemplate.create({
                name: 'Template 2',
                subject: 'Subject 2',
                body: 'Body 2',
                type: 'sms',
                category: 'alerts',
                isActive: false,
            });
        });

        it('should list templates', async () => {
            const response = await request(app)
                .get('/api/notifications/templates')
                .set(authHeader(adminToken))
                .expect(200);

            expect(Array.isArray(response.body.templates)).toBe(true);
            expect(response.body.templates.length).toBe(2);
        });

        it('should filter by active status', async () => {
            const response = await request(app)
                .get('/api/notifications/templates')
                .query({ isActive: true })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.templates.every(t => t.isActive === true)).toBe(true);
        });

        it('should filter by type', async () => {
            const response = await request(app)
                .get('/api/notifications/templates')
                .query({ type: 'sms' })
                .set(authHeader(adminToken))
                .expect(200);

            expect(response.body.templates.every(t => t.type === 'sms')).toBe(true);
        });
    });

    describe('PUT /api/notifications/templates/:id', () => {
        let template;

        beforeEach(async () => {
            template = await NotificationTemplate.create({
                name: 'Original Template',
                subject: 'Original Subject',
                body: 'Original Body',
                type: 'email',
                category: 'general',
                isActive: true,
            });
        });

        it('should update template', async () => {
            const updates = {
                subject: 'Updated Subject',
                body: 'Updated Body with {{newVariable}}',
                isActive: false,
            };

            const response = await request(app)
                .put(`/api/notifications/templates/${template._id}`)
                .set(authHeader(adminToken))
                .send(updates)
                .expect(200);

            expect(response.body.subject).toBe(updates.subject);
            expect(response.body.body).toBe(updates.body);
            expect(response.body.isActive).toBe(false);
        });
    });

    describe('DELETE /api/notifications/templates/:id', () => {
        let template;

        beforeEach(async () => {
            template = await NotificationTemplate.create({
                name: 'Delete Me',
                subject: 'Delete Subject',
                body: 'Delete Body',
                type: 'email',
                category: 'general',
                isActive: true,
            });
        });

        it('should delete template', async () => {
            await request(app)
                .delete(`/api/notifications/templates/${template._id}`)
                .set(authHeader(adminToken))
                .expect(200);

            // Verify deletion
            const deletedTemplate = await NotificationTemplate.findById(template._id);
            expect(deletedTemplate).toBeNull();
        });
    });

    describe('POST /api/notifications/send', () => {
        let template;

        beforeEach(async () => {
            template = await NotificationTemplate.create({
                name: 'Send Template',
                subject: 'Hello {{userName}}',
                body: 'Welcome {{userName}} to our platform',
                type: 'email',
                category: 'general',
                isActive: true,
            });
        });

        it('should send notification to single user', async () => {
            const notificationData = {
                templateId: template._id,
                recipientId: regularUser._id,
                variables: {
                    userName: regularUser.name,
                },
            };

            const response = await request(app)
                .post('/api/notifications/send')
                .set(authHeader(adminToken))
                .send(notificationData)
                .expect(201);

            expect(response.body.recipient.toString()).toBe(regularUser._id.toString());
            expect(response.body.status).toBe('sent');

            // Verify notification was created
            const notification = await Notification.findById(response.body._id);
            expect(notification).toBeTruthy();
            expect(notification.subject).toContain(regularUser.name);
        });

        it('should send bulk notifications', async () => {
            const users = await seedUsers();
            const userIds = [users.builder._id, users.projectAdvocate._id, users.salesAssociate._id];

            const bulkData = {
                templateId: template._id,
                recipientIds: userIds,
                variables: {
                    userName: 'Team Member',
                },
            };

            const response = await request(app)
                .post('/api/notifications/send-bulk')
                .set(authHeader(adminToken))
                .send(bulkData)
                .expect(201);

            expect(response.body.sent).toBe(userIds.length);
            expect(Array.isArray(response.body.notifications)).toBe(true);

            // Verify per-user records created
            const notifications = await Notification.find({
                recipient: { $in: userIds },
            });
            expect(notifications.length).toBe(userIds.length);
        });

        it('should fail with missing variables', async () => {
            const invalidData = {
                templateId: template._id,
                recipientId: regularUser._id,
                // Missing variables
            };

            await request(app)
                .post('/api/notifications/send')
                .set(authHeader(adminToken))
                .send(invalidData)
                .expect(400);
        });
    });

    describe('POST /api/notifications/schedule', () => {
        let template;

        beforeEach(async () => {
            template = await NotificationTemplate.create({
                name: 'Scheduled Template',
                subject: 'Reminder {{userName}}',
                body: 'This is your reminder, {{userName}}',
                type: 'email',
                category: 'reminders',
                isActive: true,
            });
        });

        it('should schedule notification', async () => {
            const scheduleTime = new Date();
            scheduleTime.setHours(scheduleTime.getHours() + 2);

            const scheduleData = {
                templateId: template._id,
                recipientId: regularUser._id,
                scheduledFor: scheduleTime,
                variables: {
                    userName: regularUser.name,
                },
            };

            const response = await request(app)
                .post('/api/notifications/schedule')
                .set(authHeader(adminToken))
                .send(scheduleData)
                .expect(201);

            expect(response.body.status).toBe('scheduled');
            expect(response.body).toHaveProperty('scheduledFor');
            expect(new Date(response.body.scheduledFor).getTime()).toBe(scheduleTime.getTime());
        });

        it('should verify scheduled status and run time', async () => {
            const scheduleTime = new Date();
            scheduleTime.setDate(scheduleTime.getDate() + 1);

            await request(app)
                .post('/api/notifications/schedule')
                .set(authHeader(adminToken))
                .send({
                    templateId: template._id,
                    recipientId: regularUser._id,
                    scheduledFor: scheduleTime,
                    variables: { userName: regularUser.name },
                })
                .expect(201);

            // Verify in database
            const scheduled = await Notification.findOne({
                recipient: regularUser._id,
                status: 'scheduled',
            });

            expect(scheduled).toBeTruthy();
            expect(scheduled.scheduledFor).toBeTruthy();
        });
    });

    describe('GET /api/notifications', () => {
        beforeEach(async () => {
            await Notification.create({
                recipient: regularUser._id,
                subject: 'Test Notification 1',
                body: 'Body 1',
                type: 'email',
                status: 'sent',
            });

            await Notification.create({
                recipient: regularUser._id,
                subject: 'Test Notification 2',
                body: 'Body 2',
                type: 'sms',
                status: 'read',
            });
        });

        it('should fetch user notifications', async () => {
            const userToken = generateToken(regularUser);

            const response = await request(app)
                .get('/api/notifications')
                .set(authHeader(userToken))
                .expect(200);

            expect(Array.isArray(response.body.notifications)).toBe(true);
            expect(response.body.notifications.length).toBe(2);
            expect(response.body.notifications.every(
                n => n.recipient._id.toString() === regularUser._id.toString()
            )).toBe(true);
        });

        it('should filter by status', async () => {
            const userToken = generateToken(regularUser);

            const response = await request(app)
                .get('/api/notifications')
                .query({ status: 'sent' })
                .set(authHeader(userToken))
                .expect(200);

            expect(response.body.notifications.every(n => n.status === 'sent')).toBe(true);
        });

        it('should support pagination', async () => {
            const userToken = generateToken(regularUser);

            const response = await request(app)
                .get('/api/notifications')
                .query({ page: 1, limit: 1 })
                .set(authHeader(userToken))
                .expect(200);

            expect(response.body).toHaveProperty('notifications');
            expect(response.body).toHaveProperty('total');
            expect(response.body.notifications.length).toBeLessThanOrEqual(1);
        });
    });

    describe('PUT /api/notifications/:id/read', () => {
        let notification;

        beforeEach(async () => {
            notification = await Notification.create({
                recipient: regularUser._id,
                subject: 'Unread Notification',
                body: 'Please read this',
                type: 'email',
                status: 'sent',
            });
        });

        it('should mark notification as read', async () => {
            const userToken = generateToken(regularUser);

            const response = await request(app)
                .put(`/api/notifications/${notification._id}/read`)
                .set(authHeader(userToken))
                .expect(200);

            expect(response.body.status).toBe('read');
            expect(response.body).toHaveProperty('readAt');
        });
    });

    describe('GET /api/notifications/preferences', () => {
        it('should fetch user notification preferences', async () => {
            const userToken = generateToken(regularUser);

            const response = await request(app)
                .get('/api/notifications/preferences')
                .set(authHeader(userToken))
                .expect(200);

            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('sms');
            expect(response.body).toHaveProperty('push');
        });
    });

    describe('PUT /api/notifications/preferences', () => {
        it('should update user preferences', async () => {
            const userToken = generateToken(regularUser);

            const preferences = {
                email: true,
                sms: false,
                push: true,
                categories: {
                    general: true,
                    alerts: true,
                    reminders: false,
                },
            };

            const response = await request(app)
                .put('/api/notifications/preferences')
                .set(authHeader(userToken))
                .send(preferences)
                .expect(200);

            expect(response.body.email).toBe(preferences.email);
            expect(response.body.sms).toBe(preferences.sms);
            expect(response.body.push).toBe(preferences.push);

            // Verify readback
            const updated = await User.findById(regularUser._id);
            expect(updated.notificationPreferences.email).toBe(preferences.email);
        });
    });
});
