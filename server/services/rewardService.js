const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

class RewardService {
    constructor() { this.db = null; try { this.db = getDb(); } catch (e) { } }
    async _db() { if (this.db) return this.db; this.db = getDb(); return this.db; }

    REWARD_PERCENTAGE = 0.01;
    TDS_PERCENTAGE = 0.10;

    async create_reward(conversion_id, user_id, plot_value) {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const users = db.collection('users');
            const reward_amount = Math.round(plot_value * this.REWARD_PERCENTAGE * 100) / 100;
            const tds_amount = Math.round(reward_amount * this.TDS_PERCENTAGE * 100) / 100;
            const net_amount = Math.round((reward_amount - tds_amount) * 100) / 100;
            const reward_data = { conversion_id, user_id, advocate_id: user_id, gross_amount: reward_amount, tds_amount, net_amount, status: 'ELIGIBLE', created_at: new Date(), eligible_after: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), approved_at: null, paid_at: null, payment_reference: null, notes: '' };
            const result = await rewards.insertOne(reward_data);
            const user_query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            await users.updateOne({ _id: user_query_id }, { $inc: { total_earnings: net_amount }, $set: { updated_at: new Date() } });
            return { success: true, reward_id: String(result.insertedId), gross_amount: reward_amount, tds_amount, net_amount, eligible_after: reward_data.eligible_after };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_advocate_rewards(user_id, status = null) {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const query = { $or: [{ user_id }, { advocate_id: user_id }] };
            if (status) query.status = status;
            const list = await rewards.find(query).sort({ created_at: -1 }).toArray();
            const mapped = list.map(r => ({ ...r, _id: String(r._id) }));
            const total_gross = list.reduce((s, r) => s + (r.gross_amount || 0), 0);
            const total_tds = list.reduce((s, r) => s + (r.tds_amount || 0), 0);
            const total_net = list.reduce((s, r) => s + (r.net_amount || 0), 0);
            const paid_count = list.filter(r => r.status === 'PAID').length;
            return { success: true, rewards: mapped, summary: { total_gross, total_tds, total_net, paid_rewards: paid_count, total_rewards: list.length } };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_pending_rewards(limit = 50) {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const now = new Date();
            const pending = await rewards.find({ status: 'ELIGIBLE', eligible_after: { $lte: now } }).sort({ created_at: 1 }).limit(limit).toArray();
            const mapped = pending.map(r => ({ ...r, _id: String(r._id), conversion_id: String(r.conversion_id), advocate_id: String(r.advocate_id) }));
            return { success: true, pending_rewards: mapped, count: mapped.length };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async approve_reward(reward_id) {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const reward_query_id = (reward_id && reward_id.length === 24) ? new ObjectId(reward_id) : reward_id;
            const result = await rewards.findOneAndUpdate({ _id: reward_query_id }, { $set: { status: 'APPROVED', approved_at: new Date() } }, { returnDocument: 'after' });
            if (!result.value) return { success: false, error: 'Reward not found' };
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async mark_reward_paid(reward_id, payment_reference, notes = '') {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const reward_query_id = (reward_id && reward_id.length === 24) ? new ObjectId(reward_id) : reward_id;
            const result = await rewards.findOneAndUpdate({ _id: reward_query_id }, { $set: { status: 'PAID', paid_at: new Date(), payment_reference, notes } }, { returnDocument: 'after' });
            if (!result.value) return { success: false, error: 'Reward not found' };
            return { success: true, reward: { _id: String(result.value._id), status: result.value.status, paid_at: result.value.paid_at, payment_reference: result.value.payment_reference } };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_reward_summary(user_id) {
        try {
            const db = await this._db();
            const rewards = db.collection('rewards');
            const list = await rewards.find({ $or: [{ user_id }, { advocate_id: user_id }] }).toArray();
            const summary = { eligible: { count: 0, total: 0 }, approved: { count: 0, total: 0 }, paid: { count: 0, total: 0 }, rejected: { count: 0, total: 0 } };
            for (const r of list) {
                const status = (r.status || '').toLowerCase();
                if (status in summary) { summary[status].count += 1; summary[status].total += (r.net_amount || 0); }
            }
            const total_earned = Object.values(summary).reduce((s, v) => s + v.total, 0);
            return { success: true, summary, total_earned: Math.round(total_earned * 100) / 100 };
        } catch (e) { return { success: false, error: e.message }; }
    }
}

module.exports = RewardService;
