const { getDb, connectToDb } = require('../db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
    await connectToDb();
    const db = getDb();
    const users = db.collection('users');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

    const hashed = await bcrypt.hash(adminPassword, 10);

    const admin = {
        email: adminEmail,
        full_name: 'Admin User',
        phone: '9000000000',
        password: hashed,
        role: 'admin',
        status: 'approved',
        is_active: true,
        created_at: new Date(),
        approved_at: new Date()
    };

    await users.updateOne({ email: adminEmail }, { $set: admin }, { upsert: true });

    console.log(`✓ Admin seeded: ${adminEmail}`);
    process.exit(0);
}

seedAdmin().catch(err => {
    console.error('Seed admin error', err);
    process.exit(1);
});
