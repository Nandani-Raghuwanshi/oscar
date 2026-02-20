import Referral from '../models/Referral.js';
import Escalation from '../models/Escalation.js';
import User from '../models/User.js';

/**
 * Auto-Escalation System
 * 
 * Escalation Levels:
 * Level 0: No escalation (normal state)
 * Level 1: 24 hours warning (no contact made)
 * Level 2: 48 hours escalation (flag for CRM Manager)
 * Level 3: 72 hours auto-drop (automatically dropped)
 * 
 * This function should be called periodically (e.g., every hour via cron job)
 */

export const checkAndEscalateReferrals = async () => {
    try {
        console.log('Running auto-escalation check...');

        const now = new Date();

        // Get all assigned referrals that are not yet converted or dropped
        const activeReferrals = await Referral.find({
            assignedTo: { $ne: null },
            status: { $in: ['assigned', 'contacted', 'site_visit', 'qualified', 'booking'] },
            isDeleted: false
        }).populate('assignedTo assignedBy projectId advocateId');

        let level1Count = 0;
        let level2Count = 0;
        let level3Count = 0;

        for (const referral of activeReferrals) {
            // Calculate hours since assignment or last interaction
            const lastActivityDate = referral.lastInteractionAt || referral.assignedAt;
            const hoursSinceActivity = (now - new Date(lastActivityDate)) / (1000 * 60 * 60);

            // Level 3: 72+ hours - Auto-drop
            if (hoursSinceActivity >= 72 && referral.escalationLevel < 3) {
                referral.escalationLevel = 3;
                referral.escalationFlag = true;
                referral.escalationReason = 'Automatically dropped after 72 hours of inactivity';
                referral.status = 'dropped';
                referral.droppedAt = now;
                referral.lostReason = 'Auto-dropped due to 72+ hours of inactivity';
                
                await referral.save();

                // Create escalation record
                await Escalation.create({
                    projectId: referral.projectId._id,
                    customerId: null,
                    builderId: referral.projectId.builder,
                    title: `Referral Auto-Dropped: ${referral.referrerName}`,
                    description: `Referral for ${referral.referrerName} (${referral.referrerPhone}) was automatically dropped after 72 hours of inactivity. Last activity: ${lastActivityDate.toLocaleString()}. Assigned to: ${referral.assignedTo.firstName} ${referral.assignedTo.lastName}.`,
                    priority: 'high',
                    status: 'open',
                    tags: ['auto-escalation', 'level-3', 'auto-dropped']
                });

                level3Count++;
                console.log(`Level 3 (Auto-drop): Referral ${referral._id} dropped after 72+ hours`);
            }
            // Level 2: 48-72 hours - Escalate to CRM Manager
            else if (hoursSinceActivity >= 48 && referral.escalationLevel < 2) {
                referral.escalationLevel = 2;
                referral.escalationFlag = true;
                referral.escalationReason = 'No activity for 48+ hours - Escalated to CRM Manager';
                referral.escalatedAt = now;
                
                await referral.save();

                // Create escalation record for CRM Manager
                await Escalation.create({
                    projectId: referral.projectId._id,
                    customerId: null,
                    builderId: referral.projectId.builder,
                    title: `Urgent: 48hr Escalation - ${referral.referrerName}`,
                    description: `URGENT: Referral for ${referral.referrerName} (${referral.referrerPhone}) has had no activity for 48+ hours. Immediate action required or will be auto-dropped in 24 hours. Last activity: ${lastActivityDate.toLocaleString()}. Assigned to: ${referral.assignedTo.firstName} ${referral.assignedTo.lastName}.`,
                    priority: 'high',
                    status: 'open',
                    assignedTo: referral.assignedBy?._id || null,
                    tags: ['auto-escalation', 'level-2', '48hr-warning']
                });

                level2Count++;
                console.log(`Level 2 (48hr Escalation): Referral ${referral._id} escalated to CRM Manager`);
            }
            // Level 1: 24-48 hours - Warning flag
            else if (hoursSinceActivity >= 24 && referral.escalationLevel < 1) {
                referral.escalationLevel = 1;
                referral.escalationFlag = true;
                referral.escalationReason = 'No activity for 24+ hours - Warning';
                
                await referral.save();

                level1Count++;
                console.log(`Level 1 (24hr Warning): Referral ${referral._id} flagged for warning`);
            }
        }

        console.log(`Auto-escalation check completed:
            - Level 1 (24hr warnings): ${level1Count}
            - Level 2 (48hr escalations): ${level2Count}
            - Level 3 (72hr auto-drops): ${level3Count}
        `);

        return {
            success: true,
            level1Count,
            level2Count,
            level3Count
        };
    } catch (error) {
        console.error('Auto-escalation check error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Check for referrals stuck in "qualified" status for too long
 * If a referral stays in "qualified" for 7+ days, escalate
 */
export const checkQualifiedReferrals = async () => {
    try {
        console.log('Checking referrals stuck in qualified status...');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stuckReferrals = await Referral.find({
            status: 'qualified',
            qualifiedAt: { $lte: sevenDaysAgo },
            isDeleted: false
        }).populate('assignedTo projectId');

        let escalatedCount = 0;

        for (const referral of stuckReferrals) {
            if (!referral.escalationFlag) {
                referral.escalationFlag = true;
                referral.escalationReason = 'Stuck in qualified status for 7+ days';
                await referral.save();

                // Create escalation
                await Escalation.create({
                    projectId: referral.projectId._id,
                    customerId: null,
                    builderId: referral.projectId.builder,
                    title: `Qualified Lead Stalled: ${referral.referrerName}`,
                    description: `Referral for ${referral.referrerName} (${referral.referrerPhone}) has been in "Qualified" status for 7+ days without progressing. Assigned to: ${referral.assignedTo?.firstName} ${referral.assignedTo?.lastName}. Consider reassignment or additional follow-up.`,
                    priority: 'medium',
                    status: 'open',
                    tags: ['qualified-stuck', 'pipeline-stalled']
                });

                escalatedCount++;
            }
        }

        console.log(`Qualified check completed: ${escalatedCount} referrals escalated`);

        return {
            success: true,
            escalatedCount
        };
    } catch (error) {
        console.error('Qualified referrals check error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Reset escalation flags when interaction is logged
 * This should be called when a new interaction is created
 */
export const resetEscalationOnInteraction = async (referralId) => {
    try {
        const referral = await Referral.findById(referralId);
        if (referral) {
            referral.escalationLevel = 0;
            referral.escalationFlag = false;
            referral.escalationReason = null;
            await referral.save();
        }
    } catch (error) {
        console.error('Reset escalation error:', error);
    }
};

/**
 * Manual escalation by CRM Manager
 */
export const createManualEscalation = async (referralId, reason, priority = 'medium') => {
    try {
        const referral = await Referral.findById(referralId)
            .populate('projectId assignedTo');

        if (!referral) {
            throw new Error('Referral not found');
        }

        referral.escalationFlag = true;
        referral.escalationReason = `Manual escalation: ${reason}`;
        await referral.save();

        const escalation = await Escalation.create({
            projectId: referral.projectId._id,
            customerId: null,
            builderId: referral.projectId.builder,
            title: `Manual Escalation: ${referral.referrerName}`,
            description: `Manual escalation for referral ${referral.referrerName} (${referral.referrerPhone}). Reason: ${reason}. Assigned to: ${referral.assignedTo?.firstName} ${referral.assignedTo?.lastName}.`,
            priority,
            status: 'open',
            tags: ['manual-escalation']
        });

        return {
            success: true,
            escalation
        };
    } catch (error) {
        console.error('Manual escalation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get escalation statistics
 */
export const getEscalationStats = async () => {
    try {
        const level1 = await Referral.countDocuments({ 
            escalationLevel: 1,
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        });

        const level2 = await Referral.countDocuments({ 
            escalationLevel: 2,
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        });

        const level3 = await Referral.countDocuments({ 
            escalationLevel: 3,
            isDeleted: false
        });

        const totalEscalated = await Referral.countDocuments({
            escalationFlag: true,
            status: { $nin: ['converted', 'dropped'] },
            isDeleted: false
        });

        return {
            level1,
            level2,
            level3,
            totalEscalated
        };
    } catch (error) {
        console.error('Get escalation stats error:', error);
        return null;
    }
};

// Export all functions
export default {
    checkAndEscalateReferrals,
    checkQualifiedReferrals,
    resetEscalationOnInteraction,
    createManualEscalation,
    getEscalationStats
};
