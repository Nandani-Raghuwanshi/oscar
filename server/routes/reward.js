const express = require('express');
const router = express.Router();
const RewardService = require('../services/rewardService');
const rewardService = new RewardService();
const { advocateRequired, advocateOwnsResource, roleRequired } = require('../middleware/authMiddleware');

router.get('/:user_id', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const result = await rewardService.get_advocate_rewards(user_id);
        if (!result.success) return res.status(500).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.get('/:user_id/summary', advocateRequired(advocateOwnsResource(async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const result = await rewardService.get_reward_summary(user_id);
        if (!result.success) return res.status(500).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
})));

router.get('/pending/all', roleRequired('admin')(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || '50');
        const result = await rewardService.get_pending_rewards(limit);
        if (!result.success) return res.status(500).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.post('/:reward_id/approve', roleRequired('admin')(async (req, res) => {
    try {
        const reward_id = req.params.reward_id;
        const result = await rewardService.approve_reward(reward_id);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

router.post('/:reward_id/pay', roleRequired('admin')(async (req, res) => {
    try {
        const reward_id = req.params.reward_id; const data = req.body || {};
        if (!data || !data.payment_reference) return res.status(400).json({ error: 'payment_reference required' });
        const payment_reference = data.payment_reference; const notes = data.notes || '';
        const result = await rewardService.mark_reward_paid(reward_id, payment_reference, notes);
        if (!result.success) return res.status(400).json({ error: result.error });
        return res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
}));

module.exports = router;
