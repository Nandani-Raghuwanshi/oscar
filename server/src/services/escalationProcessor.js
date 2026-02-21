import Lead from '../models/Lead.js';
import EscalationRule from '../models/EscalationRule.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { USER_ROLES } from '../config/constants.js';

class EscalationProcessor {
    
    /**
     * Main entry point - process all active escalation rules
     */
    async processAllEscalations() {
        console.log('[EscalationProcessor] Starting escalation processing...');
        
        try {
            const rules = await EscalationRule.find({ enabled: true });
            console.log(`[EscalationProcessor] Found ${rules.length} active rules`);
            
            for (const rule of rules) {
                await this.processRule(rule);
            }
            
            console.log('[EscalationProcessor] Completed escalation processing');
            return { success: true, rulesProcessed: rules.length };
        } catch (error) {
            console.error('[EscalationProcessor] Error:', error);
            throw error;
        }
    }
    
    /**
     * Process a single escalation rule
     */
    async processRule(rule) {
        console.log(`[EscalationProcessor] Processing rule: ${rule.ruleName}`);
        
        // Find leads in the source status
        const filter = {
            status: rule.sourceStatus,
            deletedAt: null
        };
        
        if (rule.projectId) {
            filter.projectId = rule.projectId;
        }
        
        const leads = await Lead.find(filter)
            .populate('assignedToId')
            .populate('projectId')
            .populate('referralId');
        
        console.log(`[EscalationProcessor] Found ${leads.length} leads for rule ${rule.ruleName}`);
        
        for (const lead of leads) {
            await this.processLeadForRule(lead, rule);
        }
    }
    
    /**
     * Process a single lead against a rule's stages
     */
    async processLeadForRule(lead, rule) {
        // Get the timestamp when lead entered current status
        const currentStatusEntry = lead.statusHistory
            .slice()
            .reverse()
            .find(h => h.status === lead.status);
        
        if (!currentStatusEntry) {
            console.log(`[EscalationProcessor] No status history for lead ${lead._id}`);
            return;
        }
        
        const hoursInStatus = 
            (Date.now() - new Date(currentStatusEntry.updatedDate).getTime()) / (1000 * 60 * 60);
        
        console.log(`[EscalationProcessor] Lead ${lead._id} in status ${lead.status} for ${hoursInStatus.toFixed(2)} hours`);
        
        // Check each stage
        for (const stage of rule.stages) {
            if (hoursInStatus >= stage.waitHours) {
                // Check if this stage already executed for THIS RULE
                // If rule changed, reset escalationStage to allow new rule to escalate
                const ruleChanged = lead.escalationRuleId && lead.escalationRuleId.toString() !== rule._id.toString();
                
                if (ruleChanged) {
                    // New rule, reset escalation stage for this rule
                    lead.escalationStage = 0;
                    lead.isEscalated = false;
                    lead.escalationRuleId = null;
                }
                
                if (lead.escalationStage < stage.stageNumber) {
                    console.log(`[EscalationProcessor] Executing stage ${stage.stageNumber} for lead ${lead._id} (rule: ${rule.ruleName})`);
                    await this.executeStage(lead, stage, rule);
                }
            }
        }
    }
    
    /**
     * Execute a specific escalation stage
     */
    async executeStage(lead, stage, rule) {
        try {
            lead.escalationStage = stage.stageNumber;
            lead.escalationRuleId = rule._id;
            
            // Record in escalation history
            lead.escalationHistory.push({
                stage: stage.stageNumber,
                priority: stage.priority || lead.priority,
                triggeredAt: new Date(),
                notes: `Stage ${stage.stageNumber} triggered by rule: ${rule.ruleName}`
            });
            
            switch (stage.actionType) {
                case 'escalate_to_manager':
                    await this.escalateToManager(lead, stage);
                    break;
                    
                case 'escalate_to_builder':
                    await this.escalateToBuilder(lead, stage);
                    break;
                    
                case 'auto_close':
                    await this.autoCloseLead(lead, stage);
                    break;
                    
                case 'send_notification':
                    await this.sendNotifications(lead, stage);
                    break;
            }
            
            await lead.save();
            console.log(`[EscalationProcessor] Stage ${stage.stageNumber} executed for lead ${lead._id}`);
            
        } catch (error) {
            console.error(`[EscalationProcessor] Error executing stage for lead ${lead._id}:`, error);
        }
    }
    
    /**
     * Escalate to CRM Manager
     */
    async escalateToManager(lead, stage) {
        lead.isEscalated = true;
        lead.priority = stage.priority || 'high';
        lead.escalatedDate = new Date();
        lead.escalationReason = `Escalated to manager - No action taken for ${stage.waitHours} hours`;
        
        // Find CRM managers
        const managers = await User.find({
            role: { $in: [USER_ROLES.CRM_MANAGER, 'crm_manager'] },
            isActive: true
        });
        
        // Create notifications
        for (const manager of managers) {
            try {
                await Notification.create({
                    userId: manager._id,
                    type: 'escalation',
                    subject: 'Lead Escalated',
                    message: `Lead has been escalated to ${stage.priority} priority: ${lead.referralId?.referrerName || 'Unknown Customer'}`,
                    eventType: 'lead_escalation',
                    eventData: {
                        leadId: lead._id,
                        priority: stage.priority,
                        stage: stage.stageNumber
                    }
                });
            } catch (notifError) {
                console.error(`[EscalationProcessor] Failed to create notification for manager ${manager._id}:`, notifError);
            }
        }
        
        console.log(`[EscalationProcessor] Escalated lead ${lead._id} to ${managers.length} managers`);
    }
    
    /**
     * Escalate to Builder
     */
    async escalateToBuilder(lead, stage) {
        lead.priority = stage.priority || 'critical';
        lead.escalationReason = `Escalated to builder - No action taken for ${stage.waitHours} hours`;
        
        // Find project builder
        const project = await Project.findById(lead.projectId);
        if (project && project.builder) {
            try {
                await Notification.create({
                    userId: project.builder,
                    type: 'escalation',
                    subject: 'Critical Lead Escalation',
                    message: `Lead has been escalated to critical priority: ${lead.referralId?.referrerName || 'Unknown Customer'}`,
                    eventType: 'lead_critical_escalation',
                    eventData: {
                        leadId: lead._id,
                        priority: stage.priority,
                        stage: stage.stageNumber
                    }
                });
                console.log(`[EscalationProcessor] Escalated lead ${lead._id} to builder ${project.builder}`);
            } catch (notifError) {
                console.error(`[EscalationProcessor] Failed to create notification for builder:`, notifError);
            }
        }
    }
    
    /**
     * Auto-close lead as lost
     */
    async autoCloseLead(lead, stage) {
        lead.status = stage.targetStatus || 'lost';
        const lostReason = stage.lostReason || `Automatically closed - No action taken for ${stage.waitHours} hours`;
        
        lead.statusHistory.push({
            status: lead.status,
            updatedBy: null, // System
            updatedDate: new Date(),
            notes: lostReason
        });
        
        // Notify assigned sales associate
        if (lead.assignedToId) {
            try {
                await Notification.create({
                    userId: lead.assignedToId,
                    type: 'alert',
                    subject: 'Lead Auto-Closed',
                    message: `Lead was automatically closed as lost: ${lead.referralId?.referrerName || 'Unknown Customer'}`,
                    eventType: 'lead_auto_closed',
                    eventData: {
                        leadId: lead._id,
                        reason: lostReason
                    }
                });
            } catch (notifError) {
                console.error(`[EscalationProcessor] Failed to create notification for sales associate:`, notifError);
            }
        }
        
        // Notify managers
        const managers = await User.find({
            role: { $in: [USER_ROLES.CRM_MANAGER, 'crm_manager'] },
            isActive: true
        });
        
        for (const manager of managers) {
            try {
                await Notification.create({
                    userId: manager._id,
                    type: 'alert',
                    subject: 'Lead Auto-Closed',
                    message: `Lead was automatically closed as lost: ${lead.referralId?.referrerName || 'Unknown Customer'}`,
                    eventType: 'lead_auto_closed',
                    eventData: {
                        leadId: lead._id,
                        reason: lostReason
                    }
                });
            } catch (notifError) {
                console.error(`[EscalationProcessor] Failed to create notification for manager:`, notifError);
            }
        }
        
        console.log(`[EscalationProcessor] Auto-closed lead ${lead._id} as ${lead.status}`);
    }
    
    /**
     * Send notifications to specified roles
     */
    async sendNotifications(lead, stage) {
        const notifyRoles = stage.notifyRoles || [];
        
        for (const role of notifyRoles) {
            const users = await User.find({ 
                role: { $in: [role, USER_ROLES[role.toUpperCase()]] },
                isActive: true 
            });
            
            for (const user of users) {
                try {
                    await Notification.create({
                        userId: user._id,
                        type: 'escalation',
                        subject: 'Escalation Alert',
                        message: `Lead requires attention: ${lead.referralId?.referrerName || 'Unknown Customer'}`,
                        eventType: 'lead_escalation_alert',
                        eventData: {
                            leadId: lead._id,
                            stage: stage.stageNumber
                        }
                    });
                } catch (notifError) {
                    console.error(`[EscalationProcessor] Failed to create notification for user ${user._id}:`, notifError);
                }
            }
        }
        
        console.log(`[EscalationProcessor] Sent notifications for lead ${lead._id}`);
    }
}

export default new EscalationProcessor();
