const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');
const { toObjectId } = require('../utils/idConverter');

router.get('', async (req, res) => {
    try {
        const db = getDb();
        const projectsCol = db.collection('projects');
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');
        const status = req.query.status;
        const search = (req.query.search || '').trim();

        const query = {};
        if (status) query.status = status;
        if (search) query.name = { $regex: search, $options: 'i' };

        const total = await projectsCol.countDocuments(query);
        const projects = await projectsCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const projects_data = [];
        for (const project of projects) {
            const project_id_str = String(project._id);
            const referrals_count = await referralsCol.countDocuments({ target_project: project.name });
            const conversions = await referralsCol.countDocuments({ target_project: project.name, status: 'CONVERTED' });
            const project_advocates = await usersCol.countDocuments({ project_name: project.name, advocate_type: 'PROJECT_ADVOCATE' });
            const brand_advocates = await usersCol.countDocuments({ project_name: project.name, advocate_type: 'BRAND_ADVOCATE' });
            projects_data.push({ id: project_id_str, name: project.name, location: project.location, status: project.status || 'active', accepts_referrals: project.accepts_referrals !== false, units: project.units || 0, total_budget: project.total_budget || 0, project_advocates_count: project_advocates, brand_advocates_count: brand_advocates, total_referrals: referrals_count, conversions, conversion_rate: referrals_count > 0 ? Math.round(conversions / referrals_count * 100) : 0, created_at: project.created_at });
        }

        res.json({ projects: projects_data, total, skip, limit });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:project_id', async (req, res) => {
    try {
        const db = getDb();
        const projectsCol = db.collection('projects');
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const projectId = req.params.project_id;
        let projectObj;
        try { projectObj = new ObjectId(projectId); } catch { return res.status(400).json({ error: 'Invalid project ID format' }); }
        const project = await projectsCol.findOne({ _id: projectObj });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const project_name = project.name;
        const referrals_count = await referralsCol.countDocuments({ target_project: project_name });
        const conversions = await referralsCol.countDocuments({ target_project: project_name, status: 'CONVERTED' });
        const project_advocates_list = await usersCol.find({ project_name, advocate_type: 'PROJECT_ADVOCATE' }).limit(10).toArray();
        const brand_advocates_list = await usersCol.find({ project_name, advocate_type: 'BRAND_ADVOCATE' }).limit(10).toArray();
        const recent_referrals = await referralsCol.find({ target_project: project_name }).sort({ created_at: -1 }).limit(10).toArray();

        res.json({ project: { id: String(project._id), name: project.name, location: project.location, status: project.status, description: project.description, units: project.units || 0, total_budget: project.total_budget || 0, accepts_referrals: project.accepts_referrals !== false, developer: project.developer, created_at: project.created_at }, statistics: { total_referrals: referrals_count, conversions, conversion_rate: referrals_count > 0 ? Math.round(conversions / referrals_count * 100) : 0, project_advocates_count: project_advocates_list.length, brand_advocates_count: brand_advocates_list.length }, project_advocates: project_advocates_list.map(a => ({ id: String(a._id), name: a.full_name, plot_number: a.plot_number })), brand_advocates: brand_advocates_list.map(a => ({ id: String(a._id), name: a.full_name })), recent_referrals: recent_referrals.map(r => ({ referral_id: String(r._id), lead_name: r.lead_name, status: r.status, created_at: r.created_at })) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/advocate/:advocate_id', async (req, res) => {
    try {
        const db = getDb();
        const projectsCol = db.collection('projects');
        const usersCol = db.collection('users');
        const referralsCol = db.collection('referrals');
        const advocate_id = req.params.advocate_id;
        const advocate_query_id = toObjectId(advocate_id);
        const user = await usersCol.findOne({ _id: advocate_query_id });
        if (!user) return res.status(404).json({ error: 'User/Advocate not found' });
        const advocate_type = user.advocate_type || 'BRAND_ADVOCATE';
        const skip = parseInt(req.query.skip || '0');
        const limit = parseInt(req.query.limit || '20');

        const query = { accepts_referrals: true };
        if (advocate_type === 'PROJECT_ADVOCATE') {
            const source_project_id = user.source_project_id;
            if (source_project_id) query._id = toObjectId(source_project_id);
        } else {
            query.status = 'active';
        }

        const total = await projectsCol.countDocuments(query);
        const projects = await projectsCol.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const projects_data = [];
        for (const project of projects) {
            const referrals_count = await referralsCol.countDocuments({ advocate_id, project_id: String(project._id) });
            projects_data.push({ id: String(project._id), name: project.name, location: project.location, status: project.status, units: project.units || 0, total_budget: project.total_budget || 0, description: project.description || '', advocate_referrals: referrals_count, created_at: project.created_at });
        }

        res.json({ projects: projects_data, advocate_type, total, skip, limit });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
