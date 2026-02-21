import request from 'supertest';
import app from '../../src/index.js';
import Lead from '../../src/models/Lead.js';
import Referral from '../../src/models/Referral.js';
import CallLog from '../../src/models/CallLog.js';
import DailyStatusUpdate from '../../src/models/DailyStatusUpdate.js';
import Escalation from '../../src/models/Escalation.js';
import { seedComplete } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';
import { generateLongNote } from '../helpers/testData.js';

describe('Journey 14: CRM - Advocate Management', () => {
    let crmManager, crmToken, projectAdvocate, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        crmManager = seeded.users.crmManager;
        crmToken = generateToken(crmManager);
        projectAdvocate = seeded.users.projectAdvocate;
        project = seeded.projects[0];
    });

    describe('GET /api/crm/advocates', () => {
        it('should list advocates with performance metrics', async () => {
            const response = await request(app)
                .get('/api/crm/advocates')
                .set(authHeader(crmToken))
                .expect(200);

            expect(Array.isArray(response.body.advocates)).toBe(true);

            if (response.body.advocates.length > 0) {
                const advocate = response.body.advocates[0];
                expect(advocate).toHaveProperty('totalReferrals');
                expect(advocate).toHaveProperty('convertedReferrals');
                expect(advocate).toHaveProperty('totalRewards');
            }
        });

        it('should filter advocates by project', async () => {
            const response = await request(app)
                .get('/api/crm/advocates')
                .query({ project: project._id })
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body.advocates.every(
                a => a.project._id.toString() === project._id.toString()
            )).toBe(true);
        });

        it('should deny access for non-CRM roles', async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('Builder123!');
            const builder = await User.create({
                name: 'Builder Unauth',
                email: 'builder-crm-unauth@test.com',
                phone: '5554443333',
                password: hashedPassword,
                role: 'builder',
                isActive: true,
            });

            const builderToken = generateToken(builder);

            await request(app)
                .get('/api/crm/advocates')
                .set(authHeader(builderToken))
                .expect(403);
        });
    });

    describe('GET /api/crm/advocates/:id/performance', () => {
        it('should fetch advocate performance detail', async () => {
            const response = await request(app)
                .get(`/api/crm/advocates/${projectAdvocate._id}/performance`)
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalReferrals');
            expect(response.body).toHaveProperty('qualifiedReferrals');
            expect(response.body).toHaveProperty('convertedReferrals');
            expect(response.body).toHaveProperty('conversionRate');
            expect(response.body).toHaveProperty('recentReferrals');
        });
    });
});

describe('Journey 15: CRM - Referral Assignment', () => {
    let crmManager, crmToken, salesAssociate, referral, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        crmManager = seeded.users.crmManager;
        crmToken = generateToken(crmManager);
        salesAssociate = seeded.users.salesAssociate;
        project = seeded.projects[0];

        // Create unassigned referral
        referral = await Referral.create({
            advocate: seeded.users.projectAdvocate._id,
            project: project._id,
            referredName: 'Unassigned Referral',
            referredPhone: '3332221111',
            referredEmail: 'unassigned@test.com',
            status: 'qualified',
            notes: 'Ready for assignment',
        });
    });

    describe('POST /api/crm/referrals/:id/assign', () => {
        it('should assign referral to sales associate', async () => {
            const response = await request(app)
                .post(`/api/crm/referrals/${referral._id}/assign`)
                .set(authHeader(crmToken))
                .send({ salesAssociateId: salesAssociate._id })
                .expect(200);

            expect(response.body).toHaveProperty('lead');
            expect(response.body.lead.assignedTo.toString()).toBe(salesAssociate._id.toString());

            // Verify lead was created
            const lead = await Lead.findOne({ referral: referral._id });
            expect(lead).toBeTruthy();
            expect(lead.assignedTo.toString()).toBe(salesAssociate._id.toString());
        });

        it('should fail with invalid associate id', async () => {
            await request(app)
                .post(`/api/crm/referrals/${referral._id}/assign`)
                .set(authHeader(crmToken))
                .send({ salesAssociateId: '000000000000000000000000' })
                .expect(400);
        });

        it('should prevent reassignment of already assigned referral', async () => {
            // First assignment
            await request(app)
                .post(`/api/crm/referrals/${referral._id}/assign`)
                .set(authHeader(crmToken))
                .send({ salesAssociateId: salesAssociate._id })
                .expect(200);

            // Try to reassign
            await request(app)
                .post(`/api/crm/referrals/${referral._id}/assign`)
                .set(authHeader(crmToken))
                .send({ salesAssociateId: salesAssociate._id })
                .expect(400);
        });
    });

    describe('POST /api/crm/referrals/auto-assign', () => {
        let salesAssociate2;

        beforeEach(async () => {
            const User = (await import('../../src/models/User.js')).default;
            const { hashPassword } = await import('../helpers/testData.js');

            const hashedPassword = await hashPassword('Sales2123!');
            salesAssociate2 = await User.create({
                name: 'Sales Associate 2',
                email: 'sales2@test.com',
                phone: '4443332222',
                password: hashedPassword,
                role: 'sales_associate',
                project: project._id,
                isActive: true,
            });
        });

        it('should auto-assign using round-robin', async () => {
            // Create multiple referrals
            const referrals = [];
            for (let i = 0; i < 4; i++) {
                const ref = await Referral.create({
                    advocate: (await seedComplete()).users.projectAdvocate._id,
                    project: project._id,
                    referredName: `Auto Assign ${i}`,
                    referredPhone: `555000${i}000`,
                    referredEmail: `autoassign${i}@test.com`,
                    status: 'qualified',
                    notes: 'Auto assignment test',
                });
                referrals.push(ref);
            }

            // Auto-assign them
            for (const ref of referrals) {
                await request(app)
                    .post(`/api/crm/referrals/${ref._id}/assign`)
                    .set(authHeader(crmToken))
                    .send({ autoAssign: true })
                    .expect(200);
            }

            // Verify distribution
            const lead1Count = await Lead.countDocuments({ assignedTo: salesAssociate._id });
            const lead2Count = await Lead.countDocuments({ assignedTo: salesAssociate2._id });

            expect(Math.abs(lead1Count - lead2Count)).toBeLessThanOrEqual(1);
        });
    });
});

describe('Journey 16: CRM - Sales Pipeline', () => {
    let salesAssociate, salesToken, lead;

    beforeEach(async () => {
        const seeded = await seedComplete();
        salesAssociate = seeded.users.salesAssociate;
        salesToken = generateToken(salesAssociate);
        lead = seeded.lead;
    });

    describe('GET /api/crm/leads', () => {
        it('should fetch leads with filtering', async () => {
            const response = await request(app)
                .get('/api/crm/leads')
                .query({ status: 'new' })
                .set(authHeader(salesToken))
                .expect(200);

            expect(Array.isArray(response.body.leads)).toBe(true);
            expect(response.body.leads.every(l => l.status === 'new')).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/crm/leads')
                .query({ page: 1, limit: 5 })
                .set(authHeader(salesToken))
                .expect(200);

            expect(response.body).toHaveProperty('leads');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
        });

        it('should filter by assigned user', async () => {
            const response = await request(app)
                .get('/api/crm/leads')
                .query({ assignedTo: salesAssociate._id })
                .set(authHeader(salesToken))
                .expect(200);

            expect(response.body.leads.every(
                l => l.assignedTo._id.toString() === salesAssociate._id.toString()
            )).toBe(true);
        });
    });

    describe('PUT /api/crm/leads/:id/status', () => {
        it('should update lead status with valid note', async () => {
            const longNote = generateLongNote();

            const response = await request(app)
                .put(`/api/crm/leads/${lead._id}/status`)
                .set(authHeader(salesToken))
                .send({
                    status: 'contacted',
                    note: longNote,
                })
                .expect(200);

            expect(response.body.status).toBe('contacted');
            expect(response.body.contactHistory.length).toBeGreaterThan(0);
            expect(response.body.contactHistory[0].note).toBe(longNote);
        });

        it('should fail with short note (< 50 words)', async () => {
            await request(app)
                .put(`/api/crm/leads/${lead._id}/status`)
                .set(authHeader(salesToken))
                .send({
                    status: 'contacted',
                    note: 'Too short note',
                })
                .expect(400);
        });

        it('should enforce valid status transitions', async () => {
            await request(app)
                .put(`/api/crm/leads/${lead._id}/status`)
                .set(authHeader(salesToken))
                .send({
                    status: 'invalid_status',
                    note: generateLongNote(),
                })
                .expect(400);
        });
    });

    describe('Escalation after inactivity', () => {
        it('should trigger escalation after inactivity threshold', async () => {
            // Set lead's last contact to beyond threshold
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - 8); // 8 days ago

            await Lead.updateOne(
                { _id: lead._id },
                {
                    lastContactedAt: daysAgo,
                    status: 'contacted',
                }
            );

            // Trigger escalation check (this would normally be a cron job)
            const response = await request(app)
                .post('/api/crm/escalations/check-inactivity')
                .set(authHeader(salesToken))
                .expect(200);

            expect(response.body.escalationsCreated).toBeGreaterThan(0);

            // Verify escalation was created
            const escalation = await Escalation.findOne({ lead: lead._id });
            expect(escalation).toBeTruthy();
        });
    });
});

describe('Journey 17: CRM - Calls and Interactions', () => {
    let salesAssociate, salesToken, lead;

    beforeEach(async () => {
        const seeded = await seedComplete();
        salesAssociate = seeded.users.salesAssociate;
        salesToken = generateToken(salesAssociate);
        lead = seeded.lead;
    });

    describe('POST /api/crm/leads/:id/calls', () => {
        it('should log call for lead', async () => {
            const callData = {
                duration: 300,
                outcome: 'interested',
                notes: 'Customer showed strong interest in the project',
                sentiment: 'positive',
            };

            const response = await request(app)
                .post(`/api/crm/leads/${lead._id}/calls`)
                .set(authHeader(salesToken))
                .send(callData)
                .expect(201);

            expect(response.body.lead.toString()).toBe(lead._id.toString());
            expect(response.body.duration).toBe(callData.duration);
            expect(response.body.outcome).toBe(callData.outcome);
            expect(response.body.sentiment).toBe(callData.sentiment);
        });

        it('should fail with invalid lead id', async () => {
            await request(app)
                .post('/api/crm/leads/000000000000000000000000/calls')
                .set(authHeader(salesToken))
                .send({
                    duration: 100,
                    outcome: 'no_answer',
                    notes: 'Test call',
                })
                .expect(404);
        });
    });

    describe('GET /api/crm/leads/:id/calls', () => {
        beforeEach(async () => {
            // Create some call logs
            await CallLog.create({
                lead: lead._id,
                calledBy: salesAssociate._id,
                duration: 200,
                outcome: 'interested',
                notes: 'First call',
            });

            await CallLog.create({
                lead: lead._id,
                calledBy: salesAssociate._id,
                duration: 150,
                outcome: 'callback_requested',
                notes: 'Follow-up call',
            });
        });

        it('should fetch call history for lead', async () => {
            const response = await request(app)
                .get(`/api/crm/leads/${lead._id}/calls`)
                .set(authHeader(salesToken))
                .expect(200);

            expect(Array.isArray(response.body.calls)).toBe(true);
            expect(response.body.calls.length).toBe(2);
            expect(response.body.calls.every(c => c.lead.toString() === lead._id.toString())).toBe(true);
        });

        it('should order calls by date descending', async () => {
            const response = await request(app)
                .get(`/api/crm/leads/${lead._id}/calls`)
                .set(authHeader(salesToken))
                .expect(200);

            const calls = response.body.calls;
            for (let i = 1; i < calls.length; i++) {
                const prevDate = new Date(calls[i - 1].createdAt);
                const currDate = new Date(calls[i].createdAt);
                expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
            }
        });
    });
});

describe('Journey 18: CRM - Daily Status Updates', () => {
    let salesAssociate, salesToken, crmManager, crmToken;

    beforeEach(async () => {
        const seeded = await seedComplete();
        salesAssociate = seeded.users.salesAssociate;
        salesToken = generateToken(salesAssociate);
        crmManager = seeded.users.crmManager;
        crmToken = generateToken(crmManager);
    });

    describe('POST /api/crm/daily-status', () => {
        it('should submit daily status', async () => {
            const statusData = {
                callsMade: 15,
                leadsContacted: 10,
                appointmentsSet: 3,
                dealsClosed: 1,
                notes: 'Productive day with good lead engagement',
            };

            const response = await request(app)
                .post('/api/crm/daily-status')
                .set(authHeader(salesToken))
                .send(statusData)
                .expect(201);

            expect(response.body.submittedBy.toString()).toBe(salesAssociate._id.toString());
            expect(response.body.callsMade).toBe(statusData.callsMade);
            expect(response.body.leadsContacted).toBe(statusData.leadsContacted);
        });

        it('should fail with missing required metrics', async () => {
            await request(app)
                .post('/api/crm/daily-status')
                .set(authHeader(salesToken))
                .send({
                    notes: 'Missing metrics',
                })
                .expect(400);
        });
    });

    describe('GET /api/crm/daily-status', () => {
        beforeEach(async () => {
            await DailyStatusUpdate.create({
                submittedBy: salesAssociate._id,
                callsMade: 10,
                leadsContacted: 8,
                appointmentsSet: 2,
                dealsClosed: 0,
                notes: 'Day 1',
            });
        });

        it('should fetch own status history', async () => {
            const response = await request(app)
                .get('/api/crm/daily-status')
                .set(authHeader(salesToken))
                .expect(200);

            expect(Array.isArray(response.body.updates)).toBe(true);
            expect(response.body.updates.every(
                u => u.submittedBy._id.toString() === salesAssociate._id.toString()
            )).toBe(true);
        });
    });

    describe('GET /api/crm/daily-status/team', () => {
        beforeEach(async () => {
            await DailyStatusUpdate.create({
                submittedBy: salesAssociate._id,
                callsMade: 12,
                leadsContacted: 9,
                appointmentsSet: 2,
                dealsClosed: 1,
                notes: 'Team status',
            });
        });

        it('should fetch team aggregation for managers', async () => {
            const response = await request(app)
                .get('/api/crm/daily-status/team')
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body).toHaveProperty('teamStats');
            expect(response.body).toHaveProperty('individualStats');
            expect(Array.isArray(response.body.individualStats)).toBe(true);
        });

        it('should deny access for non-managers', async () => {
            await request(app)
                .get('/api/crm/daily-status/team')
                .set(authHeader(salesToken))
                .expect(403);
        });
    });
});

describe('Journey 19: CRM - Payments', () => {
    let salesAssociate, salesToken, lead;

    beforeEach(async () => {
        const seeded = await seedComplete();
        salesAssociate = seeded.users.salesAssociate;
        salesToken = generateToken(salesAssociate);
        lead = seeded.lead;

        // Set lead to converted status
        await Lead.updateOne(
            { _id: lead._id },
            { status: 'converted' }
        );
    });

    describe('POST /api/crm/leads/:id/payments', () => {
        it('should record payment on a lead', async () => {
            const paymentData = {
                amount: 50000,
                method: 'bank_transfer',
                notes: 'Initial deposit received',
            };

            const response = await request(app)
                .post(`/api/crm/leads/${lead._id}/payments`)
                .set(authHeader(salesToken))
                .send(paymentData)
                .expect(201);

            expect(response.body.amount).toBe(paymentData.amount);
            expect(response.body.method).toBe(paymentData.method);
            expect(response.body.lead.toString()).toBe(lead._id.toString());
        });

        it('should fail with invalid amount', async () => {
            await request(app)
                .post(`/api/crm/leads/${lead._id}/payments`)
                .set(authHeader(salesToken))
                .send({
                    amount: -1000,
                    method: 'cash',
                    notes: 'Invalid amount',
                })
                .expect(400);
        });

        it('should fail on non-converted lead', async () => {
            await Lead.updateOne({ _id: lead._id }, { status: 'contacted' });

            await request(app)
                .post(`/api/crm/leads/${lead._id}/payments`)
                .set(authHeader(salesToken))
                .send({
                    amount: 10000,
                    method: 'cash',
                    notes: 'Should not work',
                })
                .expect(400);
        });
    });

    describe('GET /api/crm/payments/summary', () => {
        beforeEach(async () => {
            const Payment = (await import('../../src/models/Payment.js')).default;

            await Payment.create({
                lead: lead._id,
                amount: 25000,
                method: 'cash',
                status: 'completed',
            });

            await Payment.create({
                lead: lead._id,
                amount: 30000,
                method: 'bank_transfer',
                status: 'completed',
            });
        });

        it('should fetch payment summary with totals', async () => {
            const response = await request(app)
                .get('/api/crm/payments/summary')
                .set(authHeader(salesToken))
                .expect(200);

            expect(response.body).toHaveProperty('totalRevenue');
            expect(response.body).toHaveProperty('statusDistribution');
            expect(response.body.totalRevenue).toBe(55000);
        });
    });
});

describe('Journey 20: CRM - Escalations', () => {
    let crmManager, crmToken, escalation, project;

    beforeEach(async () => {
        const seeded = await seedComplete();
        crmManager = seeded.users.crmManager;
        crmToken = generateToken(crmManager);
        project = seeded.projects[0];

        escalation = await Escalation.create({
            project: project._id,
            lead: seeded.lead._id,
            priority: 'high',
            issue: 'Customer not responding to calls',
            status: 'open',
            createdBy: seeded.users.salesAssociate._id,
        });
    });

    describe('GET /api/crm/escalations', () => {
        it('should list escalations', async () => {
            const response = await request(app)
                .get('/api/crm/escalations')
                .set(authHeader(crmToken))
                .expect(200);

            expect(Array.isArray(response.body.escalations)).toBe(true);
            expect(response.body.escalations.length).toBeGreaterThan(0);
        });

        it('should filter by priority', async () => {
            const response = await request(app)
                .get('/api/crm/escalations')
                .query({ priority: 'high' })
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body.escalations.every(e => e.priority === 'high')).toBe(true);
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/crm/escalations')
                .query({ status: 'open' })
                .set(authHeader(crmToken))
                .expect(200);

            expect(response.body.escalations.every(e => e.status === 'open')).toBe(true);
        });
    });

    describe('POST /api/crm/escalations/:id/resolve', () => {
        it('should resolve escalation with notes', async () => {
            const resolution = {
                resolutionNotes: 'Contacted customer via alternate phone number. Issue resolved successfully.',
            };

            const response = await request(app)
                .post(`/api/crm/escalations/${escalation._id}/resolve`)
                .set(authHeader(crmToken))
                .send(resolution)
                .expect(200);

            expect(response.body.status).toBe('resolved');
            expect(response.body.resolutionNotes).toBe(resolution.resolutionNotes);
            expect(response.body).toHaveProperty('resolvedAt');
            expect(response.body.resolvedBy.toString()).toBe(crmManager._id.toString());
        });

        it('should fail without required notes', async () => {
            await request(app)
                .post(`/api/crm/escalations/${escalation._id}/resolve`)
                .set(authHeader(crmToken))
                .send({})
                .expect(400);
        });
    });
});
