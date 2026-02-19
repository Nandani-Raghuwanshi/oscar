const { getDb, connectToDb } = require('../db');

async function seedProjects() {
    await connectToDb();
    const db = getDb();
    const projects = db.collection('projects');

    const seedData = [
        {
            name: 'Oscar Sanctuary',
            location: 'Bangalore',
            status: 'active',
            accepts_referrals: true,
            units: 150,
            total_budget: 50000000,
            description: 'New residential project - Oscar Sanctuary',
            developer: 'Oscar Developers',
            created_at: new Date()
        },
        {
            name: 'Oscar Fort',
            location: 'Bangalore',
            status: 'completed',
            accepts_referrals: false,
            units: 200,
            total_budget: 75000000,
            description: 'Completed residential project - Oscar Fort',
            developer: 'Oscar Developers',
            created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000)
        },
        {
            name: 'Maple Heights',
            location: 'Pune',
            status: 'active',
            accepts_referrals: true,
            units: 120,
            total_budget: 45000000,
            description: 'New residential project - Maple Heights',
            developer: 'Oscar Developers',
            created_at: new Date(Date.now() - 180 * 24 * 3600 * 1000)
        }
    ];

    for (const p of seedData) {
        await projects.updateOne({ name: p.name }, { $set: p }, { upsert: true });
    }

    console.log(`✓ Seeded ${seedData.length} projects`);
    process.exit(0);
}

seedProjects().catch(err => {
    console.error('Seed projects error', err);
    process.exit(1);
});
