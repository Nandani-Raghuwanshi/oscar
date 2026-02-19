const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    if (!password || password.length < 8) return [false, 'Password must be at least 8 characters'];
    if (!/[a-z]/.test(password)) return [false, 'Password must contain lowercase letters'];
    if (!/[A-Z]/.test(password)) return [false, 'Password must contain uppercase letters'];
    if (!/[0-9]/.test(password)) return [false, 'Password must contain numbers'];
    return [true, ''];
}

function generateToken(userId) {
    return jwt.sign({ user_id: String(userId) }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
    try {
        const data = req.body || {};
        const email = (data.email || '').trim().toLowerCase();
        const password = data.password || '';
        const full_name = (data.full_name || '').trim();
        const role = (data.role || 'user').toLowerCase();
        const advocate_type = data.advocate_type;

        if (!email || !password || !full_name) return res.status(400).json({ error: 'Email, password, and full name are required' });
        if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
        const [isValid, msg] = validatePassword(password);
        if (!isValid) return res.status(400).json({ error: msg });

        const db = getDb();
        const users = db.collection('users');

        const existing = await users.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        let initial_status = 'approved';
        if (role === 'admin') initial_status = 'pending';
        else if (role === 'advocate' || role === 'brand_advocate') initial_status = 'pending';

        const user = {
            email,
            full_name,
            password: await bcrypt.hash(password, 10),
            role,
            status: initial_status,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            approved_at: initial_status === 'approved' ? new Date() : null,
            approved_by: null
        };

        if (role === 'advocate' || role === 'brand_advocate') {
            user.advocate_type = advocate_type || role;
            user.source_project_id = null;
            user.advocate_status = 'PENDING';
            user.referral_count = 0;
            user.conversion_count = 0;
            user.total_earnings = 0;
            user.advocate_metadata = {};
        }

        const result = await users.insertOne(user);
        const user_id = result.insertedId;

        const user_data = {
            user_id: String(user_id),
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: user.status,
            advocate_type: user.advocate_type
        };

        const response = { message: 'User registered successfully', user_id: String(user_id), user: user_data };
        if (initial_status === 'approved') response.token = generateToken(user_id);
        else response.message = 'Registration submitted. Please wait for admin approval.';

        return res.status(201).json(response);
    } catch (err) {
        console.error('Signup error', err);
        return res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email = '', password = '' } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        const db = getDb();
        const users = db.collection('users');
        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        const ok = await bcrypt.compare(password, user.password || '');
        if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
        if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
        const status = user.status || 'approved';
        if (status === 'rejected') return res.status(403).json({ message: 'Your registration has been rejected', status: 'rejected', user: { user_id: String(user._id), email: user.email, full_name: user.full_name, status } });
        if (status === 'pending') return res.status(202).json({ message: 'Your registration is pending admin approval', status: 'pending', user: { user_id: String(user._id), email: user.email, full_name: user.full_name, status, role: user.role, created_at: user.created_at } });

        const token = generateToken(user._id);
        const advocate_id = user.advocate_type ? String(user._id) : null;
        const user_data = { user_id: String(user._id), email: user.email, full_name: user.full_name, role: user.role, status, advocate_type: user.advocate_type, advocate_id, created_at: user.created_at };

        return res.json({ message: 'Login successful', token, user: user_data, status: 'approved' });
    } catch (err) {
        console.error('Login error', err);
        return res.status(500).json({ error: err.message });
    }
});

router.post('/logout', (req, res) => {
    // Stateless JWT-based logout
    return res.json({ message: 'Logout successful' });
});

const { getTokenFromRequest, verifyToken } = require('../middleware/authMiddleware');

router.get('/verify', async (req, res) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) return res.status(401).json({ error: 'Missing authorization token' });
        const [user, error] = await verifyToken(token);
        if (error) return res.status(401).json({ error });
        if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
        if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved' });
        return res.json({ success: true, user: { user_id: String(user._id), email: user.email, full_name: user.full_name, role: user.role, status: user.status } });
    } catch (err) {
        console.error('Verify error', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
