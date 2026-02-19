const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const { loginRequired } = require('../middleware/authMiddleware');

function validatePassword(password) {
    if (!password || password.length < 8) return [false, 'Password must be at least 8 characters'];
    if (!/[a-z]/.test(password)) return [false, 'Password must contain lowercase letters'];
    if (!/[A-Z]/.test(password)) return [false, 'Password must contain uppercase letters'];
    if (!/[0-9]/.test(password)) return [false, 'Password must contain numbers'];
    return [true, ''];
}

router.get('/profile', loginRequired(async (req, res) => {
    try {
        const user = req.currentUser;
        const user_data = {
            user_id: String(user._id),
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            project_name: user.project_name,
            plot_number: user.plot_number,
            role: user.role,
            status: user.status,
            advocate_type: user.advocate_type,
            advocate_status: user.advocate_status,
            source_project_id: user.source_project_id,
            referral_count: user.referral_count || 0,
            conversion_count: user.conversion_count || 0,
            total_earnings: user.total_earnings || 0,
            advocate_metadata: user.advocate_metadata || {},
            created_at: user.created_at
        };
        res.json({ user: user_data });
    } catch (err) {
        console.error('Get profile error', err);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
}));

router.put('/profile', loginRequired(async (req, res) => {
    try {
        const user = req.currentUser;
        const db = getDb();
        const users = db.collection('users');
        const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });

        const update = {};
        if ('full_name' in data) {
            const full_name = (data.full_name || '').trim();
            if (!full_name) return res.status(400).json({ error: 'Full name is required' });
            update.full_name = full_name;
        }

        if ('email' in data) {
            const email = (data.email || '').trim().toLowerCase();
            if (!email) return res.status(400).json({ error: 'Email is required' });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
            const existing = await users.findOne({ email, _id: { $ne: user._id } });
            if (existing) return res.status(400).json({ error: 'Email already in use' });
            update.email = email;
        }

        if ('phone' in data) update.phone = data.phone ? data.phone.trim() : null;
        if ('project_name' in data) update.project_name = data.project_name ? data.project_name.trim() : null;
        if ('plot_number' in data) update.plot_number = data.plot_number ? data.plot_number.trim() : null;
        update.updated_at = new Date();

        await users.updateOne({ _id: user._id }, { $set: update });
        const updated = await users.findOne({ _id: user._id });

        res.json({ message: 'Profile updated successfully', user: { user_id: String(updated._id), email: updated.email, full_name: updated.full_name, phone: updated.phone, project_name: updated.project_name, plot_number: updated.plot_number, role: updated.role, advocate_type: updated.advocate_type } });
    } catch (err) {
        console.error('Update profile error', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}));

router.post('/reset-password', loginRequired(async (req, res) => {
    try {
        const user = req.currentUser;
        const db = getDb();
        const users = db.collection('users');
        const { current_password, new_password } = req.body || {};
        if (!current_password || !new_password) return res.status(400).json({ error: 'Current and new password are required' });
        const ok = await bcrypt.compare(current_password, user.password || '');
        if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
        const [isValid, msg] = validatePassword(new_password);
        if (!isValid) return res.status(400).json({ error: msg });
        if (current_password === new_password) return res.status(400).json({ error: 'New password must be different from current password' });
        const hashed = await bcrypt.hash(new_password, 10);
        await users.updateOne({ _id: user._id }, { $set: { password: hashed, updated_at: new Date() } });
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Reset password error', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}));

module.exports = router;
