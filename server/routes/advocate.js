const express = require('express');
const router = express.Router();
const AdvocateService = require('../services/advocateService');
const advocateService = new AdvocateService();
const { advocateRequired, advocateOwnsResource, roleRequired } = require('../middleware/authMiddleware');

router.post('/register', advocateRequired(async (req, res) => {
    try {
        const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const advocate_type = (data.advocate_type || '').toUpperCase();
        const project_id = data.project_id;
        if (!['PROJECT_ADVOCATE', 'BRAND_ADVOCATE'].includes(advocate_type)) return res.status(400).json({ error: 'Invalid advocate type' });
        if (advocate_type === 'PROJECT_ADVOCATE' && !project_id) return res.status(400).json({ error: 'project_id required for PROJECT_ADVOCATE' });
        const user_id = String(req.currentUser._id);
        const result = await advocateService.register_advocate(user_id, advocate_type, project_id);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.status(201).json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.get('/:user_id', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const result = await advocateService.get_advocate(user_id);
        if (!result.success) return res.status(404).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.get('/user/:user_id', advocateRequired(async (req, res) => {
    try {
        const current_user_id = String(req.currentUser._id);
        const user_id = req.params.user_id;
        if (current_user_id !== user_id) return res.status(403).json({ error: 'Unauthorized' });
        const result = await advocateService.get_advocate_by_user(user_id);
        if (!result.success) return res.status(500).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.put('/:user_id', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const data = req.body || {};
        if (!data) return res.status(400).json({ error: 'No data provided' });
        const result = await advocateService.update_advocate(user_id, data);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.get('/:user_id/stats', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const advocate = await advocateService.get_advocate(user_id);
        if (!advocate.success) return res.status(404).json({ error: advocate.error });
        const advocate_data = advocate.advocate;
        const stats = { success: true, stats: { advocate_id: advocate_data._id, name: advocate_data.name, type: advocate_data.type, referral_count: advocate_data.referral_count || 0, conversion_count: advocate_data.conversion_count || 0, total_earnings: advocate_data.total_earnings || 0, status: advocate_data.advocate_status } };
        return res.json(stats);
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.post('/:user_id/pause', roleRequired('admin')(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const result = await advocateService.pause_advocate(user_id);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json({ success: true, message: 'Advocate paused' });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.post('/:user_id/blacklist', roleRequired('admin')(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const reason = (req.body && req.body.reason) || '';
        const result = await advocateService.blacklist_advocate(user_id, reason);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json({ success: true, message: 'Advocate blacklisted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

module.exports = router;
