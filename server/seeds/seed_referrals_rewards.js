const { getDb, connectToDb } = require('../db');

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedReferralsAndRewards() {
    await connectToDb();
    const db = getDb();
    const users = db.collection('users');
    const referrals = db.collection('referrals');
    const rewards = db.collection('rewards');

    const advocates = await users.find({ role: 'advocate' }).toArray();
    if (!advocates.length) {
        console.log('No advocates found; run seed_advocates first.');
        process.exit(1);
    }

    const statuses = ['NEW_LEAD', 'SITE_VISIT', 'IN_PROGRESS', 'CONVERTED'];
    const leadNames = ['Amit Kumar', 'Priya Shah', 'Rajesh Verma', 'Neha Gupta', 'Vikram Singh', 'Anjali Desai'];

    const createdReferrals = [];

    for (const adv of advocates) {
        const num = randInt(0, 4);
        for (let i = 0; i < num; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const createdAt = new Date(Date.now() - randInt(1, 120) * 24 * 3600 * 1000);
            const r = {
                advocate_id: adv._id.toString(),
                referrer_name: adv.full_name,
                advocate_type: adv.advocate_type || 'BRAND_ADVOCATE',
                source_project: adv.project_name || null,
                target_project: adv.project_name || null,
                lead_name: leadNames[Math.floor(Math.random() * leadNames.length)],
                lead_email: `lead_${randInt(1000, 9999)}@example.com`,
                lead_phone: `98${randInt(1000000, 9999999)}`,
                budget: randInt(2000000, 8000000),
                status,
                created_at: createdAt,
                converted_at: status === 'CONVERTED' ? new Date(createdAt.getTime() + randInt(5, 50) * 24 * 3600 * 1000) : null
            };
            createdReferrals.push(r);
        }
    }

    if (createdReferrals.length) {
        await referrals.insertMany(createdReferrals);
        console.log(`✓ Created ${createdReferrals.length} referrals`);
    } else {
        console.log('No referrals created (random choice).');
    }

    // rewards: ₹5000 per conversion
    const converted = await referrals.find({ status: 'CONVERTED' }).toArray();
    const rewardDocs = [];
    const byAdv = {};
    for (const c of converted) {
        byAdv[c.advocate_id] = (byAdv[c.advocate_id] || 0) + 1;
    }

    for (const [advId, cnt] of Object.entries(byAdv)) {
        const amount = cnt * 5000;
        rewardDocs.push({
            advocate_id: advId,
            advocate_type: null,
            referral_count: null,
            conversion_count: cnt,
            amount,
            status: 'PENDING',
            created_at: new Date()
        });
    }

    if (rewardDocs.length) {
        await rewards.insertMany(rewardDocs);
        console.log(`✓ Created ${rewardDocs.length} reward records`);
    } else {
        console.log('No reward records created');
    }

    process.exit(0);
}

seedReferralsAndRewards().catch(err => {
    console.error('Seed referrals/rewards error', err);
    process.exit(1);
});
