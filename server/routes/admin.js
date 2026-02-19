const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');
const { roleRequired } = require('../middleware/authMiddleware');

// List pending users
router.get('/pending-users', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const roleFilter = req.query.role;
        const sortBy = req.query.sort_by || 'created_at';

        const query = { status: 'pending' };
        if (roleFilter) query.role = roleFilter;

        const total = await usersCol.countDocuments(query);
        const sortOrder = sortBy === 'created_at' ? -1 : 1;

        const pending = await usersCol.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).toArray();

        const users = pending.map(u => ({ user_id: String(u._id), email: u.email, full_name: u.full_name, role: u.role || 'user', advocate_type: u.advocate_type, status: u.status, created_at: u.created_at, is_active: u.is_active !== false }));

        res.json({ users, total, skip, limit, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}));

// List all users with filtering
router.get('/users', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const roleFilter = req.query.role;
        const statusFilter = req.query.status;
        const isActiveFilter = req.query.is_active;
        const search = (req.query.search || '').trim();

        const query = {};
        if (roleFilter) query.role = roleFilter;
        if (statusFilter) query.status = statusFilter;
        if (isActiveFilter) query.is_active = isActiveFilter.toLowerCase() === 'true';
        if (search) query.$or = [{ email: { $regex: search, $options: 'i' } }, { full_name: { $regex: search, $options: 'i' } }];

        const total = await usersCol.countDocuments(query);
        const allUsers = await usersCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const users = allUsers.map(u => ({ user_id: String(u._id), email: u.email, full_name: u.full_name, role: u.role || 'user', status: u.status || 'approved', advocate_type: u.advocate_type, is_active: u.is_active !== false, created_at: u.created_at, approved_at: u.approved_at, approved_by: u.approved_by }));

        res.json({ users, total, skip, limit });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Approve user
router.post('/users/:user_id/approve', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const userId = req.params.user_id;
        let userObj;
        try { userObj = new ObjectId(userId); } catch { return res.status(400).json({ error: 'Invalid user ID format' }); }

        const user = await usersCol.findOne({ _id: userObj });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.status !== 'pending') return res.status(400).json({ error: `User is already ${user.status}`, current_status: user.status });

        const adminId = String(req.currentUser._id);
        await usersCol.updateOne({ _id: userObj }, { $set: { status: 'approved', approved_at: new Date(), approved_by: adminId, updated_at: new Date() } });
        const updated = await usersCol.findOne({ _id: userObj });

        res.json({ message: `${updated.full_name} has been approved successfully`, user: { user_id: String(updated._id), email: updated.email, full_name: updated.full_name, role: updated.role || 'user', status: updated.status, approved_at: updated.approved_at } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Reject user
router.post('/users/:user_id/reject', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const userId = req.params.user_id; const data = req.body || {};
        const reason = (data.reason || 'No reason provided').trim();
        if (!reason || reason.length < 5) return res.status(400).json({ error: 'Please provide a valid reason (at least 5 characters)' });
        let userObj;
        try { userObj = new ObjectId(userId); } catch { return res.status(400).json({ error: 'Invalid user ID format' }); }

        const user = await usersCol.findOne({ _id: userObj });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.status !== 'pending') return res.status(400).json({ error: `User is already ${user.status}`, current_status: user.status });

        const adminId = String(req.currentUser._id);
        await usersCol.updateOne({ _id: userObj }, { $set: { status: 'rejected', rejection_reason: reason, rejected_at: new Date(), rejected_by: adminId, updated_at: new Date() } });
        const updated = await usersCol.findOne({ _id: userObj });

        res.json({ message: `${updated.full_name} registration has been rejected`, user: { user_id: String(updated._id), email: updated.email, full_name: updated.full_name, role: updated.role || 'user', status: updated.status, rejection_reason: updated.rejection_reason, rejected_at: updated.rejected_at } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Reactivate rejected user back to pending
router.post('/users/:user_id/reactivate', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const userId = req.params.user_id; let userObj;
        try { userObj = new ObjectId(userId); } catch { return res.status(400).json({ error: 'Invalid user ID format' }); }
        const user = await usersCol.findOne({ _id: userObj });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.status !== 'rejected') return res.status(400).json({ error: `Only rejected users can be reactivated. Current status: ${user.status}`, current_status: user.status });

        const adminId = String(req.currentUser._id);
        await usersCol.updateOne({ _id: userObj }, { $set: { status: 'pending', rejection_reason: null, rejected_at: null, rejected_by: null, updated_at: new Date(), reactivated_by: adminId, reactivated_at: new Date() } });
        const updated = await usersCol.findOne({ _id: userObj });
        res.json({ message: `${updated.full_name} has been reactivated and is pending approval again`, user: { user_id: String(updated._id), email: updated.email, full_name: updated.full_name, role: updated.role || 'user', status: updated.status } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Analytics (dashboard)
router.get('/analytics', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const rewardsCol = db.collection('rewards');

        const total_users = await usersCol.countDocuments({});
        const approved_users = await usersCol.countDocuments({ status: 'approved' });
        const pending_users = await usersCol.countDocuments({ status: 'pending' });
        const rejected_users = await usersCol.countDocuments({ status: 'rejected' });

        const total_advocates = await usersCol.countDocuments({ role: { $in: ['advocate', 'brand_advocate'] } });
        const project_advocates = await usersCol.countDocuments({ advocate_type: 'PROJECT_ADVOCATE' });
        const brand_advocates = await usersCol.countDocuments({ advocate_type: 'BRAND_ADVOCATE' });

        const total_referrals = await referralsCol.countDocuments({});
        const active_referrals = await referralsCol.countDocuments({ status: { $in: ['NEW_LEAD', 'SITE_VISIT', 'IN_PROGRESS'] } });

        const project_new_leads = await referralsCol.countDocuments({ advocate_type: 'PROJECT_ADVOCATE', status: 'NEW_LEAD' });
        const project_in_progress = await referralsCol.countDocuments({ advocate_type: 'PROJECT_ADVOCATE', status: { $in: ['SITE_VISIT', 'IN_PROGRESS'] } });
        const project_converted = await referralsCol.countDocuments({ advocate_type: 'PROJECT_ADVOCATE', status: 'CONVERTED' });

        const brand_new_leads = await referralsCol.countDocuments({ advocate_type: 'BRAND_ADVOCATE', status: 'NEW_LEAD' });
        const brand_in_progress = await referralsCol.countDocuments({ advocate_type: 'BRAND_ADVOCATE', status: { $in: ['SITE_VISIT', 'IN_PROGRESS'] } });
        const brand_converted = await referralsCol.countDocuments({ advocate_type: 'BRAND_ADVOCATE', status: 'CONVERTED' });

        const conversions_mtd = await referralsCol.countDocuments({ status: 'CONVERTED', converted_at: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } });

        const conversion_rate = total_referrals > 0 ? Math.round((project_converted + brand_converted) / total_referrals * 100) : 0;
        const project_conversion_rate = (project_new_leads + project_in_progress + project_converted) > 0 ? Math.round(project_converted / (project_new_leads + project_in_progress + project_converted) * 100) : 0;
        const brand_conversion_rate = (brand_new_leads + brand_in_progress + brand_converted) > 0 ? Math.round(brand_converted / (brand_new_leads + brand_in_progress + brand_converted) * 100) : 0;

        const paid_rewards_list = await rewardsCol.find({ status: 'PAID' }).toArray();
        const rewards_paid = paid_rewards_list.reduce((s, r) => s + (r.amount || 0), 0);

        const project_avg_referrals = project_advocates > 0 ? Math.round((await referralsCol.countDocuments({ advocate_type: 'PROJECT_ADVOCATE' }) / project_advocates) * 100) / 100 : 0;
        const brand_avg_referrals = brand_advocates > 0 ? Math.round((await referralsCol.countDocuments({ advocate_type: 'BRAND_ADVOCATE' }) / brand_advocates) * 100) / 100 : 0;

        res.json({ total_users, approved_users, pending_users, rejected_users, total_advocates, project_advocates, brand_advocates, total_referrals, active_referrals, conversions_mtd, conversion_rate, rewards_paid, project_advocates_new_leads: project_new_leads, project_advocates_in_progress: project_in_progress, project_advocates_converted: project_converted, project_advocates_conversion: project_conversion_rate, project_advocates_avg_referrals: project_avg_referrals, brand_advocates_new_leads: brand_new_leads, brand_advocates_in_progress: brand_in_progress, brand_advocates_converted: brand_converted, brand_advocates_conversion: brand_conversion_rate, brand_advocates_avg_referrals: brand_avg_referrals, timestamp: new Date().toISOString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// List advocates with analytics
router.get('/advocates', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const rewardsCol = db.collection('rewards');
        const referralsCol = db.collection('referrals');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const advocateType = req.query.advocate_type;
        const statusFilter = req.query.status;
        const search = (req.query.search || '').trim();

        let query = { role: { $in: ['advocate', 'brand_advocate'] } };
        if (advocateType) query.advocate_type = advocateType;
        if (statusFilter) query.status = statusFilter;
        if (search) {
            const or = [{ full_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }, { project_name: { $regex: search, $options: 'i' } }];
            if (advocateType || statusFilter) query = { $and: [query, { $or: or }] };
            else query.$or = or;
        }

        const total = await usersCol.countDocuments(query);
        const advocates = await usersCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const advocates_data = [];
        for (const adv of advocates) {
            const advocate_id = String(adv._id);
            const referral_count = await referralsCol.countDocuments({ advocate_id });
            const conversion_count = await referralsCol.countDocuments({ advocate_id, status: 'CONVERTED' });
            const rewards_data = await rewardsCol.find({ advocate_id }).toArray();
            const total_rewards = rewards_data.reduce((s, r) => s + (r.amount || 0), 0);
            advocates_data.push({ id: advocate_id, name: adv.full_name || 'N/A', email: adv.email, phone: adv.phone, advocate_type: adv.advocate_type || 'UNKNOWN', project_name: adv.project_name || 'Oscar Sanctuary', plot_number: adv.plot_number, status: adv.status || 'active', referral_count, conversion_count, total_rewards, created_at: adv.created_at });
        }

        res.json({ advocates: advocates_data, total, skip, limit });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Get all referrals with analytics
router.get('/referrals', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const referralsCol = db.collection('referrals');
        const projectsCol = db.collection('projects');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const advocate_type = req.query.advocate_type;
        const status = req.query.status;
        const project_id = req.query.project_id;

        const query = {};
        if (advocate_type) query.advocate_type = advocate_type;
        if (status) query.status = status;
        if (project_id) query.project_id = project_id;

        const total = await referralsCol.countDocuments(query);
        const referrals = await referralsCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const referrals_data = referrals.map(r => ({ referral_id: String(r._id), advocate_id: r.advocate_id, referrer_name: r.referrer_name, advocate_type: r.advocate_type, source_project: r.source_project, target_project: r.target_project, lead_name: r.lead_name, lead_email: r.lead_email, lead_phone: r.lead_phone, status: r.status || 'NEW_LEAD', created_at: r.created_at, converted_at: r.converted_at }));

        const total_new_leads = await referralsCol.countDocuments({ status: 'NEW_LEAD' });
        const total_in_progress = await referralsCol.countDocuments({ status: { $in: ['SITE_VISIT', 'IN_PROGRESS'] } });
        const total_converted = await referralsCol.countDocuments({ status: 'CONVERTED' });

        res.json({ referrals: referrals_data, total, skip, limit, analytics: { total_new_leads, total_in_progress, total_converted, conversion_rate: total > 0 ? Math.round(total_converted / total * 100) : 0 } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Import advocates CSV data
router.post('/advocates/import', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const data = req.body || {};
        const advocates_to_import = data.advocates || [];
        if (!advocates_to_import.length) return res.status(400).json({ error: 'No advocates data provided' });

        let imported_count = 0; const errors = [];
        for (let i = 0; i < advocates_to_import.length; i++) {
            const advocate_data = advocates_to_import[i];
            try {
                if (!advocate_data.email || !advocate_data.full_name) { errors.push(`Row ${i + 1}: Missing email or full_name`); continue; }
                const existing = await usersCol.findOne({ email: advocate_data.email });
                if (!existing) {
                    await usersCol.insertOne({ email: advocate_data.email, full_name: advocate_data.full_name, phone: advocate_data.phone, role: 'advocate', advocate_type: advocate_data.advocate_type || 'PROJECT_ADVOCATE', project_name: advocate_data.project_name || 'Oscar Sanctuary', plot_number: advocate_data.plot_number, status: 'approved', is_active: true, created_at: new Date(), approved_at: new Date() });
                    imported_count++;
                } else {
                    await usersCol.updateOne({ email: advocate_data.email }, { $set: { advocate_type: advocate_data.advocate_type || existing.advocate_type, project_name: advocate_data.project_name || existing.project_name, plot_number: advocate_data.plot_number || existing.plot_number, phone: advocate_data.phone || existing.phone } });
                    imported_count++;
                }
            } catch (e) { errors.push(`Row ${i + 1}: ${e.message}`); }
        }

        res.json({ message: `Successfully imported ${imported_count} advocates`, imported_count, errors: errors.length ? errors : null });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Validation override
router.post('/validation/override', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const data = req.body || {};
        const advocate_id = data.advocate_id; const new_type = data.new_type; const reason = data.reason || 'Manual override';
        if (!advocate_id || !new_type) return res.status(400).json({ error: 'advocate_id and new_type are required' });
        let advocateObj;
        try { advocateObj = new ObjectId(advocate_id); } catch { return res.status(400).json({ error: 'Invalid advocate ID format' }); }
        const adminId = String(req.currentUser._id);
        await usersCol.updateOne({ _id: advocateObj }, { $set: { advocate_type: new_type, type_override: true, override_reason: reason, overridden_at: new Date(), overridden_by: adminId } });
        const updated = await usersCol.findOne({ _id: advocateObj });
        res.json({ message: `Advocate type updated to ${new_type}`, advocate: { advocate_id: String(updated._id), full_name: updated.full_name, advocate_type: updated.advocate_type, type_override: updated.type_override, override_reason: updated.override_reason } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Advocate details
router.get('/advocates/:advocate_id/details', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const rewardsCol = db.collection('rewards');
        const advocateId = req.params.advocate_id;
        let advocateObj;
        try { advocateObj = new ObjectId(advocateId); } catch { return res.status(400).json({ error: 'Invalid advocate ID format' }); }
        const advocate = await usersCol.findOne({ _id: advocateObj });
        if (!advocate) return res.status(404).json({ error: 'Advocate not found' });
        const advocate_id_str = String(advocate._id);
        const referral_count = await referralsCol.countDocuments({ advocate_id: advocate_id_str });
        const conversion_count = await referralsCol.countDocuments({ advocate_id: advocate_id_str, status: 'CONVERTED' });
        const rewards_data = await rewardsCol.find({ advocate_id: advocate_id_str }).toArray();
        const total_rewards = rewards_data.reduce((s, r) => s + (r.amount || 0), 0);
        const paid_rewards = rewards_data.filter(r => r.status === 'PAID').reduce((s, r) => s + (r.amount || 0), 0);
        const pending_rewards = total_rewards - paid_rewards;
        const recent_referrals = await referralsCol.find({ advocate_id: advocate_id_str }).sort({ created_at: -1 }).limit(10).toArray();
        res.json({ advocate: { id: advocate_id_str, name: advocate.full_name, email: advocate.email, phone: advocate.phone, advocate_type: advocate.advocate_type, project_name: advocate.project_name, plot_number: advocate.plot_number, status: advocate.status, created_at: advocate.created_at }, statistics: { total_referrals: referral_count, total_conversions: conversion_count, conversion_rate: referral_count > 0 ? Math.round(conversion_count / referral_count * 100) : 0, total_rewards, paid_rewards, pending_rewards }, recent_referrals: recent_referrals.map(r => ({ referral_id: String(r._id), lead_name: r.lead_name, status: r.status, created_at: r.created_at })) });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Rewards analytics
router.get('/rewards-analytics', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const rewardsCol = db.collection('rewards');
        const usersCol = db.collection('users');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const statusFilter = req.query.status;
        const query = {};
        if (statusFilter) query.status = statusFilter;
        const total = await rewardsCol.countDocuments(query);
        const rewards = await rewardsCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();
        let total_amount = 0, pending_amount = 0, paid_amount = 0;
        const rewards_data = [];
        for (const r of rewards) {
            const amount = r.amount || 0; const status = r.status || 'PENDING'; total_amount += amount; if (status === 'PENDING') pending_amount += amount; else if (status === 'PAID') paid_amount += amount; const adv = r.advocate_id ? await usersCol.findOne({ _id: new ObjectId(r.advocate_id) }).catch(() => null) : null; rewards_data.push({ reward_id: String(r._id), advocate_name: adv ? adv.full_name : 'Unknown', advocate_type: adv ? adv.advocate_type : 'Unknown', amount, status, referral_count: r.referral_count || 0, conversion_count: r.conversion_count || 0, created_at: r.created_at, paid_at: r.paid_at });
        }
        res.json({ rewards: rewards_data, total, skip, limit, analytics: { total_amount, paid_amount, pending_amount } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

// Project analytics
router.get('/project-analytics', roleRequired('admin')(async (req, res) => {
    try {
        const db = getDb();
        const projectsCol = db.collection('projects');
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const projects = await projectsCol.find({}).toArray();
        const projects_data = [];
        for (const project of projects) {
            const project_id_str = String(project._id);
            const project_advocates = await usersCol.countDocuments({ project_name: project.name, advocate_type: 'PROJECT_ADVOCATE' });
            const brand_advocates = await usersCol.countDocuments({ project_name: project.name, advocate_type: 'BRAND_ADVOCATE' });
            const referrals_count = await referralsCol.countDocuments({ target_project: project.name });
            const conversions = await referralsCol.countDocuments({ target_project: project.name, status: 'CONVERTED' });
            const conversion_rate = referrals_count > 0 ? Math.round(conversions / referrals_count * 100) : 0;
            projects_data.push({ project_id: project_id_str, name: project.name, status: project.status || 'active', accepts_referrals: project.accepts_referrals !== false, project_advocates_count: project_advocates, brand_advocates_count: brand_advocates, total_referrals: referrals_count, conversions, conversion_rate, total_budget: project.total_budget || 0, units: project.units || 0 });
        }
        const total_advocates = await usersCol.countDocuments({ role: { $in: ['advocate', 'brand_advocate'] } });
        const total_referrals = await referralsCol.countDocuments({});
        const total_conversions = await referralsCol.countDocuments({ status: 'CONVERTED' });
        res.json({ projects: projects_data, total_projects: projects_data.length, total_analytics: { total_advocates, total_referrals, total_conversions, overall_conversion_rate: total_referrals > 0 ? Math.round(total_conversions / total_referrals * 100) : 0 } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

module.exports = router;
