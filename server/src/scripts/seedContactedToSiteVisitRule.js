import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EscalationRule from '../models/EscalationRule.js';
import User from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

// Connect using env variable
async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
}

// Create escalation stages template (7-14-21 days pattern)
function createScalationStages() {
    return [
        {
            stageNumber: 1,
            waitHours: 168,
            priority: 'high',
            actionType: 'escalate_to_manager',
            notifyRoles: ['crm_manager'],
            kpiField: 'escalated'
        },
        {
            stageNumber: 2,
            waitHours: 336,
            priority: 'critical',
            actionType: 'escalate_to_builder',
            notifyRoles: ['builder'],
            kpiField: 'escalated'
        },
        {
            stageNumber: 3,
            waitHours: 504,
            actionType: 'auto_close',
            targetStatus: 'lost',
            lostReason: 'Automatically closed - No progress in current bucket for 21 days',
            notifyRoles: ['crm_manager', 'sales_associate']
        }
    ];
}

async function createOrUpdateRule(admin, ruleName, sourceStatus, targetStatus, description) {
    const existingRule = await EscalationRule.findOne({ ruleName });
    
    if (existingRule) {
        console.log(`⏭️  ${ruleName} already exists, skipping...`);
        return null;
    }

    const rule = new EscalationRule({
        ruleName,
        description,
        sourceStatus,
        targetStatus,
        enabled: true,
        stages: createScalationStages(),
        createdBy: admin._id,
        version: 1
    });

    await rule.save();
    console.log(`✅ ${ruleName} created`);
    return rule;
}

async function seedAllEscalationRules() {
    try {
        await connectDB();

        const admin = await User.findOne({ role: USER_ROLES.ADMIN });
        if (!admin) {
            console.error('❌ No admin user found.');
            process.exit(1);
        }

        console.log('\n🔄 Seeding escalation rules (7-14-21 day pattern for all)...\n');

        // Rule 1: Contacted to Site Visit
        await createOrUpdateRule(
            admin,
            'Contacted to Site Visit Escalation',
            'contacted',
            'site_visit',
            'Automatic escalation for leads stuck in contacted without moving to site_visit'
        );

        // Rule 2: Site Visit to Qualified
        await createOrUpdateRule(
            admin,
            'Site Visit to Qualified Escalation',
            'site_visit',
            'qualified',
            'Automatic escalation for leads stuck in site_visit without moving to qualified'
        );

        // Rule 3: Qualified to Negotiating
        await createOrUpdateRule(
            admin,
            'Qualified to Negotiating Escalation',
            'qualified',
            'negotiating',
            'Automatic escalation for leads stuck in qualified without moving to negotiating'
        );

        // Rule 4: Negotiating to Proposal Sent
        await createOrUpdateRule(
            admin,
            'Negotiating to Proposal Sent Escalation',
            'negotiating',
            'proposal_sent',
            'Automatic escalation for leads stuck in negotiating without moving to proposal_sent'
        );

        // Rule 5: Proposal Sent to Converted
        await createOrUpdateRule(
            admin,
            'Proposal Sent to Converted Escalation',
            'proposal_sent',
            'converted',
            'Automatic escalation for leads stuck in proposal_sent without moving to converted'
        );

        console.log('\n✅ All escalation rules processed successfully!');
        console.log('Each rule uses: 7 days → HIGH priority, 14 days → CRITICAL, 21 days → Auto-close as LOST\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAllEscalationRules();