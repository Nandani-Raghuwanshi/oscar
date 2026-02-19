const { connectToDb, getDb } = require('../db');
const ReferralService = require('../services/referralService');

async function run() {
    try {
        await connectToDb();
        const svc = new ReferralService();
        const res = await svc.record_link_click('4e83fb51-1171-497b-9ed5-1ac4bd429028', 'test-agent', '127.0.0.1');
        console.log('result:', res);
    } catch (e) {
        console.error('Error calling record_link_click:', e);
        console.error(e.stack);
    }
}

run();
