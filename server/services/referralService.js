const { getDb } = require('../db');
const { ObjectId } = require('mongodb');
const { randomUUID } = require('crypto');

const REFERRAL_BASE_URL = process.env.REFERRAL_BASE_URL || 'http://localhost:5173';

class ReferralService {
    constructor() { this.db = null; try { this.db = getDb(); } catch (e) { } }
    async _db() { if (this.db) return this.db; this.db = getDb(); return this.db; }

    generate_referral_uuid() { return randomUUID(); }

    async create_referral_link(user_id, project_id, channel = 'direct') {
        try {
            const db = await this._db();
            const referrals = db.collection('referrals');
            const referral_uuid = this.generate_referral_uuid();
            const referral_link = `${REFERRAL_BASE_URL}/ref/${referral_uuid}`;
            const referral_data = { uuid: referral_uuid, user_id, advocate_id: user_id, project_id, link: referral_link, channel, created_at: new Date(), click_count: 0, visits: [], status: 'ACTIVE', leads_count: 0 };
            const result = await referrals.insertOne(referral_data);
            return { success: true, referral_id: String(result.insertedId), user_id, advocate_id: user_id, uuid: referral_uuid, link: referral_link, qr_data: referral_link };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async validate_referral_link(referral_uuid) {
        try {
            const db = await this._db();
            const referrals = db.collection('referrals');
            const referral = await referrals.findOne({ uuid: referral_uuid });
            if (!referral) return { valid: false, error: 'Referral link not found' };
            if (referral.status !== 'ACTIVE') return { valid: false, error: 'Referral link is inactive' };
            return { valid: true, referral_id: String(referral._id), advocate_id: referral.advocate_id, project_id: referral.project_id };
        } catch (e) { return { valid: false, error: e.message }; }
    }

    async record_link_click(referral_uuid, user_agent = null, ip_address = null) {
        try {
            const { createHash } = require('crypto');
            const db = await this._db();
            const referrals = db.collection('referrals');
            const device_string = `${ip_address}:${user_agent}`;
            const device_id = createHash('md5').update(device_string).digest('hex');
            const referral = await referrals.findOne({ uuid: referral_uuid });
            if (!referral) return { success: false, error: 'Referral not found' };
            const existing_visits = referral.visits || [];
            const device_already_visited = existing_visits.some(v => v.device_id === device_id);
            const visit_data = { device_id, timestamp: new Date(), user_agent, ip_address };
            const update = { $inc: { click_count: 1 } };
            if (!device_already_visited) update.$push = { visits: visit_data };
            await referrals.updateOne({ uuid: referral_uuid }, update);
            return { success: true, matched: true, is_unique: !device_already_visited, device_id };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async submit_lead(referral_uuid, lead_data) {
        try {
            const db = await this._db();
            const referrals = db.collection('referrals');
            const leads = db.collection('leads');
            const validation = await this.validate_referral_link(referral_uuid);
            if (!validation.valid) return { success: false, error: validation.error };
            const existing_lead = await leads.findOne({ lead_phone: lead_data.lead_phone, project_id: validation.project_id });
            if (existing_lead) return { success: false, error: 'Lead with this phone already exists', duplicate: true, existing_lead_id: String(existing_lead._id) };
            const lead_record = { referral_uuid, referral_id: null, advocate_id: validation.advocate_id, project_id: validation.project_id, lead_name: lead_data.lead_name || '', lead_phone: lead_data.lead_phone || '', lead_email: lead_data.lead_email || '', budget_range: lead_data.budget_range || '', created_at: new Date(), status: 'NEW', status_history: [{ status: 'NEW', timestamp: new Date(), notes: 'Lead created from referral' }], conversion_status: null, converted: false };
            const result = await leads.insertOne(lead_record);
            await referrals.updateOne({ uuid: referral_uuid }, { $inc: { leads_count: 1 } });
            return { success: true, lead_id: String(result.insertedId), message: 'Lead created successfully' };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async update_lead_status(lead_id, new_status, notes = '') {
        try {
            const db = await this._db();
            const leads = db.collection('leads');
            const id = (lead_id && lead_id.length === 24) ? new ObjectId(lead_id) : lead_id;
            const status_update = { status: new_status, timestamp: new Date(), notes };
            const result = await leads.findOneAndUpdate({ _id: id }, { $set: { status: new_status }, $push: { status_history: status_update } }, { returnDocument: 'after' });
            if (!result.value) return { success: false, error: 'Lead not found' };
            return { success: true, lead: result.value };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async convert_lead(lead_id, conversion_data) {
        try {
            const db = await this._db();
            const leads = db.collection('leads');
            const conversions = db.collection('conversions');
            const id = (lead_id && lead_id.length === 24) ? new ObjectId(lead_id) : lead_id;
            const lead = await leads.findOne({ _id: id });
            if (!lead) return { success: false, error: 'Lead not found' };
            const conversion_record = { lead_id: String(lead._id), referral_id: lead.referral_id, advocate_id: lead.advocate_id, project_id: lead.project_id, plot_number: conversion_data.plot_number, plot_value: conversion_data.plot_value || 0, booking_date: conversion_data.booking_date, first_touch_id: lead.advocate_id, created_at: new Date(), reward_triggered: false };
            const convRes = await conversions.insertOne(conversion_record);
            await leads.updateOne({ _id: lead._id }, { $set: { status: 'CONVERTED', converted: true, conversion_status: 'COMPLETED' }, $push: { status_history: { status: 'CONVERTED', timestamp: new Date(), notes: 'Lead converted - reward triggered' } } });
            return { success: true, conversion_id: String(convRes.insertedId), reward_amount: this._calculate_reward(conversion_data.plot_value || 0) };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_referral_stats({ referral_uuid = null, user_id = null } = {}) {
        try {
            const db = await this._db();
            const referrals = db.collection('referrals');
            const leads = db.collection('leads');
            let query;
            if (referral_uuid) query = { uuid: referral_uuid }; else query = { $or: [{ user_id }, { advocate_id: user_id }] };
            const referrals_data = await referrals.find(query).toArray();
            const total_referrals = referrals_data.reduce((s, r) => s + (r.leads_count || 0), 0);
            const leads_data = await leads.find(query).toArray();
            const conversions_count = leads_data.filter(l => l.converted).length;
            const conversion_rate = total_referrals > 0 ? (conversions_count / total_referrals * 100) : 0;
            return { total_referrals, conversions: conversions_count, conversion_rate: Math.round(conversion_rate * 100) / 100 };
        } catch (e) { return { error: e.message }; }
    }

    _calculate_reward(plot_value) { return Math.round((plot_value * 0.01) * 100) / 100; }
}

module.exports = ReferralService;
