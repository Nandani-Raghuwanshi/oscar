const express = require('express');
const router = express.Router();
const ReferralService = require('../services/referralService');
const { generate_qr_code } = require('../services/qrService');
const AdvocateService = require('../services/advocateService');
const RewardService = require('../services/rewardService');
const { advocateRequired, advocateOwnsResource } = require('../middleware/authMiddleware');
const referralService = new ReferralService();
const advocateService = new AdvocateService();
const rewardService = new RewardService();
const { ObjectId } = require('mongodb');

router.get('/visit/:uuid', async (req, res) => {
    try {
        const uuidParam = req.params.uuid;
        const user_agent = req.headers['user-agent'];
        const ip_address = req.ip || req.connection.remoteAddress;
        const record_result = await referralService.record_link_click(uuidParam, user_agent, ip_address);
        if (!record_result.success) return res.status(500).json({ error: 'Failed to record visit' });
        const validation = await referralService.validate_referral_link(uuidParam);
        if (!validation.valid) return res.status(404).json({ error: validation.error });
        const db = require('../db').getDb();
        const projectsCol = db.collection('projects');
        const project_id = validation.project_id;
        const projObj = (project_id && project_id.length === 24) ? new ObjectId(project_id) : project_id;
        const project = await projectsCol.findOne({ _id: projObj });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        return res.json({ success: true, referral_uuid: uuidParam, project_id: String(project._id), project_name: project.name, location: project.location, description: project.description, units: project.units, total_budget: project.total_budget, developer: project.developer });
    } catch (err) { console.error('Error recording referral visit:', err); res.status(500).json({ error: err.message }); }
});

router.get('/:referral_uuid/visits', async (req, res) => {
    try {
        const referral_uuid = req.params.referral_uuid;
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '50');
        const db = require('../db').getDb();
        const referralsCol = db.collection('referrals');
        const projectsCol = db.collection('projects');
        const referral = await referralsCol.findOne({ uuid: referral_uuid });
        if (!referral) return res.status(404).json({ error: 'Referral not found' });
        const visits = referral.visits || []; const click_count = referral.click_count || 0; const total_visits = visits.length; const paginated = visits.slice(skip, skip + limit);
        const project_id = referral.project_id; const projObj = (project_id && project_id.length === 24) ? new ObjectId(project_id) : project_id; const project = await projectsCol.findOne({ _id: projObj }); const project_name = project ? project.name : 'Unknown';
        const formatted_visits = paginated.map(v => ({ timestamp: v.timestamp, user_agent: v.user_agent, ip_address: v.ip_address }));
        return res.json({ success: true, referral_uuid, total_visits, click_count, visits: formatted_visits, pagination: { skip, limit, returned: formatted_visits.length }, referral_info: { project_name, channel: referral.channel, created_at: referral.created_at, status: referral.status } });
    } catch (err) { console.error('Error retrieving visits:', err); res.status(500).json({ error: err.message }); }
});

router.post('/create-link', advocateOwnsResource(async (req, res) => {
    try {
        const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const user_id = data.user_id || data.advocate_id; const project_id = data.project_id; const channel = data.channel || 'direct';
        if (!user_id || !project_id) return res.status(400).json({ error: 'user_id (or advocate_id) and project_id required' });
        const auto_reg_result = await advocateService.auto_register_project_owner(user_id, project_id);
        if (!auto_reg_result.success) console.warn('Warning: Auto-registration incomplete:', auto_reg_result.error || auto_reg_result);
        const validation = await advocateService.validate_advocate_for_referral(user_id, project_id);
        if (!validation.valid) return res.status(400).json({ error: validation.error });
        const result = await referralService.create_referral_link(user_id, project_id, channel);
        if (!result.success) return res.status(400).json({ error: result.error });
        const qr_result = await generate_qr_code(result.link);
        if (qr_result.success) result.qr_code_url = qr_result.qr_data_uri;
        return res.status(201).json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.get('/track/:referral_uuid', async (req, res) => {
    try {
        const referral_uuid = req.params.referral_uuid;
        const validation = await referralService.validate_referral_link(referral_uuid);
        if (!validation.valid) return res.status(404).json({ error: validation.error });
        await referralService.record_link_click(referral_uuid);
        return res.json({ success: true, referral_uuid, project_id: validation.project_id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/submit-lead', async (req, res) => {
    try {
        const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const referral_uuid = data.referral_uuid; if (!referral_uuid) return res.status(400).json({ error: 'referral_uuid required' });
        const lead_data = { lead_name: (data.lead_name || '').trim(), lead_phone: (data.lead_phone || '').trim(), lead_email: (data.lead_email || '').trim(), budget_range: data.budget_range || '' };
        if (!lead_data.lead_name || !lead_data.lead_phone) return res.status(400).json({ error: 'lead_name and lead_phone required' });
        const result = await referralService.submit_lead(referral_uuid, lead_data);
        if (!result.success) return res.status(400).json({ error: result.error, duplicate: result.duplicate });
        return res.status(201).json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/advocate/:advocate_id', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const advocate_id = req.params.advocate_id;
        const db = require('../db').getDb();
        const referralsCol = db.collection('referrals');
        const refs = await referralsCol.find({ advocate_id }).sort({ created_at: -1 }).toArray();
        refs.forEach(r => r._id = String(r._id));
        return res.json({ success: true, referrals: refs, count: refs.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.get('/:referral_uuid', advocateRequired(async (req, res) => {
    try {
        const referral_uuid = req.params.referral_uuid;
        const db = require('../db').getDb();
        const referralsCol = db.collection('referrals');
        const leadsCol = db.collection('leads');
        const referral = await referralsCol.findOne({ uuid: referral_uuid });
        if (!referral) return res.status(404).json({ error: 'Referral not found' });
        // verify ownership (best effort)
        const advocate_id = String(referral.advocate_id || '');
        const current_user_id = String(req.currentUser._id || '');
        if (advocate_id && advocate_id !== current_user_id) return res.status(403).json({ error: 'You do not have permission to access this referral' });
        referral._id = String(referral._id);
        const leads = await leadsCol.find({ referral_uuid }).toArray();
        leads.forEach(l => l._id = String(l._id));
        return res.json({ success: true, referral, leads });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.post('/:lead_id/convert', advocateRequired(async (req, res) => {
    try {
        const lead_id = req.params.lead_id; const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const conversion_data = { plot_number: data.plot_number, plot_value: data.plot_value || 0, booking_date: data.booking_date };
        const conversion_result = await referralService.convert_lead(lead_id, conversion_data);
        if (!conversion_result.success) return res.status(400).json({ error: conversion_result.error });
        // attempt to create reward
        try {
            const db = require('../db').getDb();
            const conversionsCol = db.collection('conversions');
            const conversionObjId = (conversion_result.conversion_id && conversion_result.conversion_id.length === 24) ? new ObjectId(conversion_result.conversion_id) : null;
            if (conversionObjId) {
                const conversion = await conversionsCol.findOne({ _id: conversionObjId });
                if (conversion) {
                    const reward_result = await rewardService.create_reward(String(conversion._id), conversion.advocate_id, conversion.plot_value);
                    if (reward_result.success) { conversion_result.reward_id = reward_result.reward_id; conversion_result.reward_eligible_after = reward_result.eligible_after; }
                }
            }
        } catch (e) { /* ignore reward creation errors */ }
        return res.status(201).json(conversion_result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.put('/:lead_id/status', advocateRequired(async (req, res) => {
    try {
        const lead_id = req.params.lead_id; const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const new_status = (data.status || '').toUpperCase(); const notes = data.notes || '';
        const valid_statuses = ['CONTACTED', 'SITE_VISIT', 'NEGOTIATION', 'LOST', 'CONVERTED'];
        if (!valid_statuses.includes(new_status)) return res.status(400).json({ error: `Invalid status. Must be one of ${valid_statuses}` });
        const result = await referralService.update_lead_status(lead_id, new_status, notes);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

module.exports = router;
