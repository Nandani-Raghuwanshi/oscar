import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import EscalationRule from '../models/EscalationRule.js';
import User from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';

async function seedDefaultEscalationRule() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        // Find an admin user to set as creator
        const admin = await User.findOne({ role: USER_ROLES.ADMIN });
        if (!admin) {
            console.error('No admin user found. Please create an admin user first.');
            process.exit(1);
        }
        
        // Check if default rule already exists
        const existingRule = await EscalationRule.findOne({ ruleName: 'New Lead Escalation' });
        if (existingRule) {
            console.log('Default escalation rule already exists');
            console.log('Rule ID:', existingRule._id);
            process.exit(0);
        }
        
        // Create default rule
        const defaultRule = new EscalationRule({
            ruleName: 'New Lead Escalation',
            description: 'Automatic escalation for leads stuck in "new" status',
            sourceStatus: 'new',
            targetStatus: 'contacted',
            enabled: true,
            stages: [
                {
                    stageNumber: 1,
                    waitHours: 24,
                    priority: 'high',
                    actionType: 'escalate_to_manager',
                    notifyRoles: ['crm_manager'],
                    kpiField: 'escalated'
                },
                {
                    stageNumber: 2,
                    waitHours: 48,
                    priority: 'critical',
                    actionType: 'escalate_to_builder',
                    notifyRoles: ['builder'],
                    kpiField: 'escalated'
                },
                {
                    stageNumber: 3,
                    waitHours: 72,
                    actionType: 'auto_close',
                    targetStatus: 'lost',
                    lostReason: 'Automatically closed - No action taken for 72 hours',
                    notifyRoles: ['crm_manager', 'sales_associate']
                }
            ],
            createdBy: admin._id,
            version: 1
        });
        
        await defaultRule.save();
        
        console.log('✅ Default escalation rule created successfully!');
        console.log('Rule Name:', defaultRule.ruleName);
        console.log('Rule ID:', defaultRule._id);
        console.log('Stages:', defaultRule.stages.length);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding escalation rule:', error);
        process.exit(1);
    }
}

seedDefaultEscalationRule();
