const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0' });
});

router.get('/health/db', async (req, res) => {
    try {
        const { getDb } = require('../db');
        // try to list collections as a basic connectivity check
        const db = getDb();
        const cols = await db.listCollections().toArray();
        res.json({ status: 'ok', database: db.databaseName, connected: true, collections: cols.map(c => c.name) });
    } catch (err) {
        res.status(500).json({ status: 'error', connected: false, error: err.message });
    }
});

router.get('/health/api', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), endpoints: ['/api/health', '/api/auth', '/api/users'] });
});

module.exports = router;
