import request from 'supertest';
import app from '../../src/index.js';
import Customer from '../../src/models/Customer.js';
import User from '../../src/models/User.js';
import Escalation from '../../src/models/Escalation.js';
import { seedUsers, seedProjects, seedCustomers } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';
import { CUSTOMER_CSV_VALID, CUSTOMER_CSV_INVALID_HEADERS, CUSTOMER_CSV_MISSING_FIELDS } from '../helpers/testData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Journey 5: Builder - Customer Management', () => {
    let builderUser, builderToken, adminUser, project;

    beforeEach(async () => {
        const users = await seedUsers();
        builderUser = users.builder;
        adminUser = users.admin;
        builderToken = generateToken(builderUser);

        const projects = await seedProjects(builderUser._id);
        project = projects[0];
    });

    describe('POST /api/builder/customers/upload', () => {
        it('should upload valid customer CSV', async () => {
            const csvPath = path.join(__dirname, '../fixtures/customers-valid.csv');
            fs.writeFileSync(csvPath, CUSTOMER_CSV_VALID);

            const response = await request(app)
                .post('/api/builder/customers/upload')
                .set(authHeader(builderToken))
                .attach('file', csvPath)
                .field('projectId', project._id.toString())
                .expect(200);

            expect(response.body).toHaveProperty('created');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.created).toBeGreaterThan(0);

            // Verify customers were created
            const customers = await Customer.find({ project: project._id });
            expect(customers.length).toBe(response.body.created);

            fs.unlinkSync(csvPath);
        });

        it('should fail with invalid CSV headers', async () => {
            const csvPath = path.join(__dirname, '../fixtures/customers-invalid-headers.csv');
            fs.writeFileSync(csvPath, CUSTOMER_CSV_INVALID_HEADERS);

            const response = await request(app)
                .post('/api/builder/customers/upload')
                .set(authHeader(builderToken))
                .attach('file', csvPath)
                .field('projectId', project._id.toString())
                .expect(400);

            expect(response.body).toHaveProperty('error');

            fs.unlinkSync(csvPath);
        });

        it('should validate required fields', async () => {
            const csvPath = path.join(__dirname, '../fixtures/customers-missing-fields.csv');
            fs.writeFileSync(csvPath, CUSTOMER_CSV_MISSING_FIELDS);

            const response = await request(app)
                .post('/api/builder/customers/upload')
                .set(authHeader(builderToken))
                .attach('file', csvPath)
                .field('projectId', project._id.toString())
                .expect(200);

            expect(response.body.errors.length).toBeGreaterThan(0);

            fs.unlinkSync(csvPath);
        });

        it('should deny access for non-builder', async () => {
            const adminToken = generateToken(adminUser);
            const csvPath = path.join(__dirname, '../fixtures/customers-valid.csv');
            fs.writeFileSync(csvPath, CUSTOMER_CSV_VALID);

            await request(app)
                .post('/api/builder/customers/upload')
                .set(authHeader(adminToken))
                .attach('file', csvPath)
                .field('projectId', project._id.toString())
                .expect(403);

            fs.unlinkSync(csvPath);
        });
    });

    describe('POST /api/builder/customers', () => {
        it('should create single customer', async () => {
            const newCustomer = {
                name: 'Single Customer',
                email: 'single@test.com',
                phone: '4445556666',
                address: '999 Single St',
                projectId: project._id,
            };

            const response = await request(app)
                .post('/api/builder/customers')
                .set(authHeader(builderToken))
                .send(newCustomer)
                .expect(201);

            expect(response.body.name).toBe(newCustomer.name);
            expect(response.body.email).toBe(newCustomer.email);

            // Verify readback
            const customer = await Customer.findById(response.body._id);
            expect(customer.name).toBe(newCustomer.name);
        });

        it('should fail with duplicate phone/email', async () => {
            const customer = {
                name: 'First Customer',
                email: 'duplicate@test.com',
                phone: '3334445555',
                address: '111 Dup St',
                projectId: project._id,
            };

            // Create first customer
            await request(app)
                .post('/api/builder/customers')
                .set(authHeader(builderToken))
                .send(customer)
                .expect(201);

            // Try to create duplicate
            await request(app)
                .post('/api/builder/customers')
                .set(authHeader(builderToken))
                .send(customer)
                .expect(400);
        });

        it('should fail with missing required fields', async () => {
            const incompleteCustomer = {
                email: 'incomplete@test.com',
            };

            await request(app)
                .post('/api/builder/customers')
                .set(authHeader(builderToken))
                .send(incompleteCustomer)
                .expect(400);
        });
    });

    describe('PUT /api/builder/customers/:id', () => {
        let customer;

        beforeEach(async () => {
            const customers = await seedCustomers(project._id, builderUser._id);
            customer = customers[0];
        });

        it('should update customer details', async () => {
            const updates = {
                name: 'Updated Name',
                address: 'Updated Address',
            };

            const response = await request(app)
                .put(`/api/builder/customers/${customer._id}`)
                .set(authHeader(builderToken))
                .send(updates)
                .expect(200);

            expect(response.body.name).toBe(updates.name);
            expect(response.body.address).toBe(updates.address);

            // Verify readback
            const updatedCustomer = await Customer.findById(customer._id);
            expect(updatedCustomer.name).toBe(updates.name);
        });
    });

    describe('GET /api/builder/customers', () => {
        beforeEach(async () => {
            await seedCustomers(project._id, builderUser._id);
        });

        it('should list customers with pagination', async () => {
            const response = await request(app)
                .get('/api/builder/customers')
                .query({ page: 1, limit: 10 })
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body).toHaveProperty('customers');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
            expect(Array.isArray(response.body.customers)).toBe(true);
        });

        it('should filter customers', async () => {
            const response = await request(app)
                .get('/api/builder/customers')
                .query({ status: 'active', project: project._id })
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body.customers.every(c => c.status === 'active')).toBe(true);
        });

        it('should search customers by name', async () => {
            const response = await request(app)
                .get('/api/builder/customers')
                .query({ search: 'Customer' })
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body.customers.length).toBeGreaterThan(0);
        });
    });
});

describe('Journey 6: Builder - Advocate Login Auto-Creation', () => {
    let builderUser, builderToken, project;

    beforeEach(async () => {
        const users = await seedUsers();
        builderUser = users.builder;
        builderToken = generateToken(builderUser);

        const projects = await seedProjects(builderUser._id);
        project = projects[0];
    });

    it('should auto-create advocate accounts from CSV', async () => {
        const csvWithAdvocates = `name,email,phone,address,createAdvocateAccount
Advocate Customer 1,advocate1@test.com,5559990001,100 Adv St,true
Advocate Customer 2,advocate2@test.com,5559990002,200 Adv Ave,true`;

        const csvPath = path.join(__dirname, '../fixtures/customers-advocates.csv');
        fs.writeFileSync(csvPath, csvWithAdvocates);

        await request(app)
            .post('/api/builder/customers/upload')
            .set(authHeader(builderToken))
            .attach('file', csvPath)
            .field('projectId', project._id.toString())
            .expect(200);

        // Verify advocate accounts were created
        const advocates = await User.find({
            role: 'project_advocate',
            email: { $in: ['advocate1@test.com', 'advocate2@test.com'] },
        });

        expect(advocates.length).toBe(2);

        // Verify password exists and is hashed
        advocates.forEach(advocate => {
            expect(advocate.password).toBeTruthy();
            expect(advocate.password).not.toBe('temporary');
            expect(advocate.project.toString()).toBe(project._id.toString());
        });

        fs.unlinkSync(csvPath);
    });

    it('should handle idempotency on re-import', async () => {
        const csvWithAdvocates = `name,email,phone,address,createAdvocateAccount
Same Advocate,same@test.com,5559990003,300 Same St,true`;

        const csvPath = path.join(__dirname, '../fixtures/customers-same.csv');
        fs.writeFileSync(csvPath, csvWithAdvocates);

        // First import
        await request(app)
            .post('/api/builder/customers/upload')
            .set(authHeader(builderToken))
            .attach('file', csvPath)
            .field('projectId', project._id.toString())
            .expect(200);

        // Second import (should not create duplicate)
        await request(app)
            .post('/api/builder/customers/upload')
            .set(authHeader(builderToken))
            .attach('file', csvPath)
            .field('projectId', project._id.toString())
            .expect(200);

        // Verify only one advocate was created
        const advocates = await User.find({
            email: 'same@test.com',
            role: 'project_advocate',
        });

        expect(advocates.length).toBe(1);

        fs.unlinkSync(csvPath);
    });

    it('should fail when project not assigned', async () => {
        const csvWithAdvocates = `name,email,phone,address,createAdvocateAccount
No Project Advocate,noproject@test.com,5559990004,400 No St,true`;

        const csvPath = path.join(__dirname, '../fixtures/customers-no-project.csv');
        fs.writeFileSync(csvPath, csvWithAdvocates);

        await request(app)
            .post('/api/builder/customers/upload')
            .set(authHeader(builderToken))
            .attach('file', csvPath)
            // Missing projectId field
            .expect(400);

        fs.unlinkSync(csvPath);
    });
});

describe('Journey 7: Builder - Escalations and Reports', () => {
    let builderUser, builderToken, project;

    beforeEach(async () => {
        const users = await seedUsers();
        builderUser = users.builder;
        builderToken = generateToken(builderUser);

        const projects = await seedProjects(builderUser._id);
        project = projects[0];

        // Create some escalations
        await Escalation.create({
            project: project._id,
            customer: null,
            priority: 'high',
            issue: 'Test escalation 1',
            status: 'open',
            createdBy: builderUser._id,
        });

        await Escalation.create({
            project: project._id,
            customer: null,
            priority: 'medium',
            issue: 'Test escalation 2',
            status: 'resolved',
            createdBy: builderUser._id,
        });
    });

    describe('GET /api/builder/escalations', () => {
        it('should fetch escalations list', async () => {
            const response = await request(app)
                .get('/api/builder/escalations')
                .set(authHeader(builderToken))
                .expect(200);

            expect(Array.isArray(response.body.escalations)).toBe(true);
            expect(response.body.escalations.length).toBeGreaterThan(0);
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/builder/escalations')
                .query({ status: 'open' })
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body.escalations.every(e => e.status === 'open')).toBe(true);
        });

        it('should sort by priority', async () => {
            const response = await request(app)
                .get('/api/builder/escalations')
                .query({ sortBy: 'priority', order: 'desc' })
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body.escalations.length).toBeGreaterThan(0);
        });

        it('should deny access for non-builder', async () => {
            const users = await seedUsers();
            const adminToken = generateToken(users.admin);

            await request(app)
                .get('/api/builder/escalations')
                .set(authHeader(adminToken))
                .expect(403);
        });
    });

    describe('GET /api/builder/reports', () => {
        beforeEach(async () => {
            await seedCustomers(project._id, builderUser._id);
        });

        it('should fetch builder reports statistics', async () => {
            const response = await request(app)
                .get('/api/builder/reports')
                .set(authHeader(builderToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalCustomers');
            expect(response.body).toHaveProperty('activeCustomers');
            expect(response.body).toHaveProperty('escalations');
            expect(typeof response.body.totalCustomers).toBe('number');
        });

        it('should deny access for non-builder', async () => {
            const users = await seedUsers();
            const adminToken = generateToken(users.admin);

            await request(app)
                .get('/api/builder/reports')
                .set(authHeader(adminToken))
                .expect(403);
        });
    });
});
