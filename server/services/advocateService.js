const { MongoClient, ObjectId } = require('mongodb');
const { getDb } = require('../db');

class AdvocateService {
    constructor() {
        this.db = null;
        try { this.db = getDb(); } catch (e) { /* will obtain when used */ }
    }

    async _db() { if (this.db) return this.db; this.db = getDb(); return this.db; }

    async register_advocate(user_id, advocate_type, project_id = null) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            if (!['PROJECT_ADVOCATE', 'BRAND_ADVOCATE'].includes(advocate_type)) return { success: false, error: 'Invalid advocate type' };
            const user = await users.findOne({ _id: new ObjectId(user_id) });
            if (!user) return { success: false, error: 'User not found' };
            if (user.advocate_type === advocate_type) return { success: false, error: 'User is already registered as this advocate type' };
            const update_data = { advocate_type, source_project_id: project_id, advocate_status: 'ACTIVE', updated_at: new Date(), referral_count: user.referral_count || 0, conversion_count: user.conversion_count || 0, total_earnings: user.total_earnings || 0, advocate_metadata: user.advocate_metadata || {} };
            const result = await users.findOneAndUpdate({ _id: new ObjectId(user_id) }, { $set: update_data }, { returnDocument: 'after' });
            if (!result.value) return { success: false, error: 'Failed to update user' };
            return { success: true, user_id: String(result.value._id), advocate_id: String(result.value._id), type: advocate_type, message: 'Advocate registered successfully' };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_advocate(user_id) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            const user = await users.findOne({ _id: query_id });
            if (!user) return { success: false, error: 'User/Advocate not found' };
            if (!user.advocate_type) return { success: false, error: 'User is not registered as an advocate' };
            const advocate = { _id: String(user._id), user_id: String(user._id), name: user.full_name || '', email: user.email || '', phone: user.phone || '', type: user.advocate_type, source_project_id: user.source_project_id, advocate_status: user.advocate_status || 'ACTIVE', referral_count: user.referral_count || 0, conversion_count: user.conversion_count || 0, total_earnings: user.total_earnings || 0, created_at: user.created_at, updated_at: user.updated_at };
            return { success: true, advocate };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async get_advocate_by_user(user_id) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const user = await users.findOne({ _id: new ObjectId(user_id) });
            if (!user) return { success: false, error: 'User not found' };
            if (!user.advocate_type) return { success: false, advocates: [] };
            const advocate = { _id: String(user._id), user_id: String(user._id), name: user.full_name || '', email: user.email || '', phone: user.phone || '', type: user.advocate_type, source_project_id: user.source_project_id, advocate_status: user.advocate_status || 'ACTIVE', referral_count: user.referral_count || 0, conversion_count: user.conversion_count || 0, total_earnings: user.total_earnings || 0 };
            return { success: true, advocates: [advocate] };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async update_advocate(user_id, update_data) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const protected_fields = ['_id', 'user_id', 'created_at', 'advocate_type', 'email', 'full_name'];
            protected_fields.forEach(f => delete update_data[f]);
            update_data.updated_at = new Date();
            const query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            const result = await users.findOneAndUpdate({ _id: query_id }, { $set: update_data }, { returnDocument: 'after' });
            if (!result.value) return { success: false, error: 'User/Advocate not found' };
            const advocate = { _id: String(result.value._id), name: result.value.full_name || '', email: result.value.email || '', phone: result.value.phone || '', type: result.value.advocate_type, referral_count: result.value.referral_count || 0, conversion_count: result.value.conversion_count || 0, total_earnings: result.value.total_earnings || 0 };
            return { success: true, advocate };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async update_advocate_stats(user_id, referral_count = 0, conversion_count = 0, earnings = 0) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            await users.updateOne({ _id: query_id }, { $inc: { referral_count, conversion_count, total_earnings: earnings }, $set: { updated_at: new Date() } });
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async validate_advocate_for_referral(user_id, target_project_id) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const projects = db.collection('projects');
            const advocate_query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            const user = await users.findOne({ _id: advocate_query_id });
            if (!user) return { valid: false, error: 'User not found' };
            if (!user.advocate_type) return { valid: false, error: 'User is not an advocate' };
            if (user.advocate_status !== 'ACTIVE') return { valid: false, error: `Advocate is ${user.advocate_status}` };
            const target_project_query_id = (target_project_id && target_project_id.length === 24) ? new ObjectId(target_project_id) : target_project_id;
            const target_project = await projects.findOne({ _id: target_project_query_id });
            if (!target_project) return { valid: false, error: 'Target project not found' };
            if (!target_project.accepts_referrals) return { valid: false, error: 'Project does not accept referrals' };
            if (user.advocate_type === 'PROJECT_ADVOCATE') {
                const source_project_id = user.source_project_id;
                if (!source_project_id) return { valid: false, error: 'Advocate missing source project assignment' };
                const source_project_query_id = (source_project_id && source_project_id.length === 24) ? new ObjectId(source_project_id) : source_project_id;
                const source_project = await projects.findOne({ _id: source_project_query_id });
                if (!source_project) return { valid: false, error: 'Advocate source project not found in database' };
                if (source_project.name !== target_project.name) return { valid: false, error: `Project advocate can only refer to own project. Assigned: ${source_project.name}, Requested: ${target_project.name}` };
            } else if (user.advocate_type === 'BRAND_ADVOCATE') {
                const source_project_id = user.source_project_id;
                if (!source_project_id) return { valid: false, error: 'Advocate missing source project assignment' };
                const source_project_query_id = (source_project_id && source_project_id.length === 24) ? new ObjectId(source_project_id) : source_project_id;
                const source_project = await projects.findOne({ _id: source_project_query_id });
                if (!source_project) return { valid: false, error: 'Advocate source project not found in database' };
                if (source_project.developer_id !== target_project.developer_id) return { valid: false, error: 'Can only refer to projects by same developer' };
            }
            return { valid: true };
        } catch (e) { return { valid: false, error: e.message }; }
    }

    async auto_register_project_owner(user_id, project_id) {
        try {
            const db = await this._db();
            const users = db.collection('users');
            const query_id = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id;
            const user = await users.findOne({ _id: query_id });
            if (!user) return { success: false, error: 'User not found' };
            const has_advocate_type = !!user.advocate_type;
            const has_active_status = user.advocate_status === 'ACTIVE';
            const has_source_project = !!user.source_project_id;
            if (has_advocate_type && has_active_status && has_source_project) return { success: true, message: 'User already fully registered as advocate' };
            const update_data = { advocate_type: user.advocate_type || 'PROJECT_ADVOCATE', source_project_id: user.source_project_id || project_id, advocate_status: 'ACTIVE', updated_at: new Date(), referral_count: user.referral_count || 0, conversion_count: user.conversion_count || 0, total_earnings: user.total_earnings || 0, advocate_metadata: user.advocate_metadata || {} };
            const result = await users.findOneAndUpdate({ _id: query_id }, { $set: update_data }, { returnDocument: 'after' });
            return { success: true, user_id: String(result.value._id), advocate_type: result.value.advocate_type, advocate_status: 'ACTIVE', source_project_id: String(result.value.source_project_id), message: 'Project owner advocate registration completed' };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async pause_advocate(user_id) {
        try { const db = await this._db(); const users = db.collection('users'); const q = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id; await users.updateOne({ _id: q }, { $set: { advocate_status: 'PAUSED' } }); return { success: true }; } catch (e) { return { success: false, error: e.message }; }
    }

    async blacklist_advocate(user_id, reason = '') {
        try { const db = await this._db(); const users = db.collection('users'); const q = (user_id && user_id.length === 24) ? new ObjectId(user_id) : user_id; await users.updateOne({ _id: q }, { $set: { advocate_status: 'BLACKLISTED', advocate_blacklist_reason: reason, advocate_blacklisted_at: new Date() } }); return { success: true }; } catch (e) { return { success: false, error: e.message }; }
    }
}

module.exports = AdvocateService;
