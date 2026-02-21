import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EscalationRule from '../models/EscalationRule.js';
import User from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';
import { fileURLToPath } from "url";
import path from "path";

// Load .env file
dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.env'
  )
});

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

async function seedAllEscalationRules() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find an admin user to set as creator
    const admin = await User.findOne({ role: USER_ROLES.ADMIN });

    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('Admin user found:', admin.email);
        
        // Define all escalation rules
        const rules = [
            {
                ruleName: 'New Lead Escalation',
                description: 'Automatic escalation for leads stuck in "new" status',
                sourceStatus: 'new',
                targetStatus: 'contacted',
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
                ]
            },
            {
                ruleName: 'Contacted to Site Visit Escalation',
                description: 'Escalation for leads stuck in "contacted" status for 7+ days',
                sourceStatus: 'contacted',
                targetStatus: 'site_visit',
                stages: [
                    {
                        stageNumber: 1,
                        waitHours: 168, // 7 days = 7 * 24 hours
                        priority: 'high',
                        actionType: 'escalate_to_manager',
                        notifyRoles: ['crm_manager'],
                        kpiField: 'escalated'
                    },
                    {
                        stageNumber: 2,
                        waitHours: 336, // 14 days = 14 * 24 hours
                        priority: 'critical',
                        actionType: 'escalate_to_builder',
                        notifyRoles: ['builder', 'admin'],
                        kpiField: 'escalated'
                    },
                    {
                        stageNumber: 3,
                        waitHours: 504, // 21 days = 21 * 24 hours
                        actionType: 'auto_close',
                        targetStatus: 'lost',
                        lostReason: 'Automatically closed - No progress to site visit after 21 days',
                        notifyRoles: ['crm_manager', 'sales_associate', 'builder']
                    }
                ]
            },
            {
                ruleName: 'Site Visit to Qualified Escalation',
                description: 'Automatic escalation for leads stuck in "site_visit" status',
                sourceStatus: 'site_visit',
                targetStatus: 'qualified',
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
                        lostReason: 'Automatically closed - No qualification after site visit for 72 hours',
                        notifyRoles: ['crm_manager', 'sales_associate']
                    }
                ]
            },
            {
                ruleName: 'Qualified to Negotiating Escalation',
                description: 'Automatic escalation for leads stuck in "qualified" status',
                sourceStatus: 'qualified',
                targetStatus: 'negotiating',
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
                        lostReason: 'Automatically closed - No negotiation started after 72 hours',
                        notifyRoles: ['crm_manager', 'sales_associate']
                    }
                ]
            },
            {
                ruleName: 'Negotiating to Proposal Sent Escalation',
                description: 'Automatic escalation for leads stuck in "negotiating" status',
                sourceStatus: 'negotiating',
                targetStatus: 'proposal_sent',
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
                        lostReason: 'Automatically closed - No proposal sent after 72 hours of negotiation',
                        notifyRoles: ['crm_manager', 'sales_associate']
                    }
                ]
            },
            {
                ruleName: 'Proposal Sent to Converted Escalation',
                description: 'Automatic escalation for leads stuck in "proposal_sent" status',
                sourceStatus: 'proposal_sent',
                targetStatus: 'converted',
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
                        lostReason: 'Automatically closed - No conversion after proposal sent for 72 hours',
                        notifyRoles: ['crm_manager', 'sales_associate']
                    }
                ]
            }
        ];
        
        let createdCount = 0;
        let existingCount = 0;
        
        console.log('\n📋 Creating escalation rules...\n');
        
        for (const ruleData of rules) {
            // Check if rule already exists
            const existingRule = await EscalationRule.findOne({ ruleName: ruleData.ruleName });
            
            if (existingRule) {
                console.log(`✓ Rule "${ruleData.ruleName}" already exists`);
                console.log(`  - ID: ${existingRule._id}`);
                console.log(`  - Enabled: ${existingRule.enabled}`);
                console.log(`  - Stages: ${existingRule.stages.length}`);
                existingCount++;
            } else {
                // Create new rule
                const newRule = new EscalationRule({
                    ...ruleData,
                    enabled: true,
                    createdBy: admin._id,
                    version: 1
                });
                
                await newRule.save();
                console.log(`✅ Created "${ruleData.ruleName}"`);
                console.log(`  - ID: ${newRule._id}`);
                console.log(`  - Source: ${newRule.sourceStatus} → Target: ${newRule.targetStatus}`);
                console.log(`  - Stages: ${newRule.stages.length}`);
                console.log(`  - Wait times: ${newRule.stages.map(s => s.waitHours + 'h').join(' → ')}`);
                createdCount++;
            }
            console.log('');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Summary:');
        console.log(`  ✅ Created: ${createdCount} rule(s)`);
        console.log(`  ✓ Existing: ${existingCount} rule(s)`);
        console.log(`  📝 Total: ${createdCount + existingCount} rule(s)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Display all rules
        const allRules = await EscalationRule.find().sort({ sourceStatus: 1 });
        console.log('📋 All Escalation Rules in Database:\n');
        
        const statusOrder = ['new', 'contacted', 'site_visit', 'qualified', 'negotiating', 'proposal_sent'];
        
        for (const status of statusOrder) {
            const rule = allRules.find(r => r.sourceStatus === status);
            if (rule) {
                console.log(`🔹 ${rule.sourceStatus.toUpperCase()} → ${rule.targetStatus.toUpperCase()}`);
                console.log(`   Rule: "${rule.ruleName}"`);
                console.log(`   Enabled: ${rule.enabled ? '✓' : '✗'}`);
                console.log(`   Stages: ${rule.stages.length}`);
                rule.stages.forEach(stage => {
                    console.log(`     Stage ${stage.stageNumber}: ${stage.waitHours}h → ${stage.priority || 'N/A'} → ${stage.actionType}`);
                });
                console.log('');
            }
        }
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        console.log('✅ All escalation rules seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding escalation rules:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAllEscalationRules();