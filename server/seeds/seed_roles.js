const { getDb, connectToDb } = require('../db');

async function seedRoles() {
    await connectToDb();
    const db = getDb();
    const roles = db.collection('roles');

    const seedData = [
        { name: 'admin', permissions: ['manage_users', 'view_reports', 'manage_projects'] },
        { name: 'advocate', permissions: ['create_referral', 'view_own_referrals'] },
        { name: 'project_owner', permissions: ['manage_project', 'view_project_referrals'] }
    ];

    for (const r of seedData) {
        await roles.updateOne({ name: r.name }, { $set: r }, { upsert: true });
    }

    console.log('✓ Roles seeded');
    process.exit(0);
}

seedRoles().catch(err => {
    console.error('Seed roles error', err);
    process.exit(1);
});
