import escalationProcessor from '../services/escalationProcessor.js';

/**
 * Escalation Processing Scheduler
 * Runs every hour to check and process escalations
 */

let intervalId = null;

export function startEscalationCron() {
    // Run every hour (3600000 ms)
    const INTERVAL = 60 * 60 * 1000; // 1 hour
    
    console.log('[EscalationCron] Starting escalation cron job (runs every hour)...');
    
    // Run immediately on startup
    processEscalations();
    
    // Then schedule to run every hour
    intervalId = setInterval(() => {
        processEscalations();
    }, INTERVAL);
    
    console.log('[EscalationCron] Escalation cron job started successfully');
}

export function stopEscalationCron() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[EscalationCron] Escalation cron job stopped');
    }
}

async function processEscalations() {
    console.log('[EscalationCron] Running scheduled escalation processing...');
    const startTime = Date.now();
    
    try {
        const result = await escalationProcessor.processAllEscalations();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[EscalationCron] Completed in ${duration}s - Processed ${result.rulesProcessed} rules`);
    } catch (error) {
        console.error('[EscalationCron] Error during scheduled processing:', error);
    }
}

/**
 * Manual trigger for testing
 */
export async function triggerEscalationNow() {
    console.log('[EscalationCron] Manual trigger initiated...');
    try {
        await escalationProcessor.processAllEscalations();
        console.log('[EscalationCron] Manual trigger completed');
    } catch (error) {
        console.error('[EscalationCron] Error during manual trigger:', error);
        throw error;
    }
}
