const { getDb, connectToDb } = require('../db');
const bcrypt = require('bcrypt');

async function seedAdvocates() {
    await connectToDb();
    const db = getDb();
    const users = db.collection('users');

    const projectCount = parseInt(process.env.SEED_PROJECT_ADVOCATES || '10', 10);
    const brandCount = parseInt(process.env.SEED_BRAND_ADVOCATES || '8', 10);
    const basePassword = process.env.SEED_ADVOCATE_PASSWORD || 'Test@1234';

    const hashed = await bcrypt.hash(basePassword, 10);

    const projectAdvocates = [];
    for (let i = 0; i < projectCount; i++) {
        projectAdvocates.push({
            email: `project_advocate_${i}@example.com`,
            full_name: `Project Advocate ${i}`,
            phone: `9876500${100 + i}`,
            password: hashed,
            role: 'advocate',
            advocate_type: 'PROJECT_ADVOCATE',
            project_name: 'Oscar Sanctuary',
            plot_number: `A-${100 + i}`,
            status: 'approved',
            is_active: true,
            created_at: new Date(),
            approved_at: new Date()
        });
    }

    const brandAdvocates = [];
    for (let i = 0; i < brandCount; i++) {
        brandAdvocates.push({
            email: `brand_advocate_${i}@example.com`,
            full_name: `Brand Advocate ${i}`,
            phone: `9776500${100 + i}`,
            password: hashed,
            role: 'advocate',
            advocate_type: 'BRAND_ADVOCATE',
            project_name: 'Oscar Fort',
            plot_number: `B-${1 + i}`,
            status: 'approved',
            is_active: true,
            created_at: new Date(),
            approved_at: new Date()
        });
    }

    const all = projectAdvocates.concat(brandAdvocates);

    for (const a of all) {
        await users.updateOne({ email: a.email }, { $set: a }, { upsert: true });
    }

    console.log(`✓ Created ${projectAdvocates.length} project advocates and ${brandAdvocates.length} brand advocates`);
    process.exit(0);
}

seedAdvocates().catch(err => {
    console.error('Seed advocates error', err);
    process.exit(1);
});
