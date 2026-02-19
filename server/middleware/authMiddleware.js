const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.user_id;
        if (!userId) return [null, 'Invalid token'];
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) return [null, 'User not found'];
        return [user, null];
    } catch (err) {
        if (err.name === 'TokenExpiredError') return [null, 'Token has expired'];
        return [null, err.message || 'Invalid token'];
    }
}

function getTokenFromRequest(req) {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
    return parts[1];
}

function loginRequired(handler) {
    return async (req, res, next) => {
        try {
            const token = getTokenFromRequest(req);
            if (!token) return res.status(401).json({ error: 'Missing authorization token' });
            const [user, error] = await verifyToken(token);
            if (error) return res.status(401).json({ error });
            if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
            if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved' });
            req.currentUser = user;
            return handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

function roleRequired(...roles) {
    return (handler) => async (req, res, next) => {
        try {
            const token = getTokenFromRequest(req);
            if (!token) return res.status(401).json({ error: 'Missing authorization token' });
            const [user, error] = await verifyToken(token);
            if (error) return res.status(401).json({ error });
            if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
            if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved' });
            if (!roles.includes(user.role)) return res.status(403).json({ error: `Insufficient permissions. Required roles: ${roles.join(', ')}` });
            req.currentUser = user;
            return handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

function advocateRequired(handler) {
    return async (req, res, next) => {
        try {
            const token = getTokenFromRequest(req);
            if (!token) return res.status(401).json({ error: 'Missing authorization token' });
            const [user, error] = await verifyToken(token);
            if (error) return res.status(401).json({ error });
            if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
            if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved' });
            if (!user.advocate_type) return res.status(403).json({ error: 'Advocate access required' });
            req.currentUser = user;
            return handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

function advocateOwnsResource(handler) {
    return async (req, res, next) => {
        try {
            const token = getTokenFromRequest(req);
            if (!token) return res.status(401).json({ error: 'Missing authorization token' });
            const [user, error] = await verifyToken(token);
            if (error) return res.status(401).json({ error });
            if (!user.is_active) return res.status(403).json({ error: 'Account is inactive' });
            if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved' });

            const resource_user_id = req.params.user_id || req.params.advocate_id || req.query.user_id || req.query.advocate_id || (req.body && (req.body.user_id || req.body.advocate_id));
            if (resource_user_id) {
                const current_user_id = String(user._id);
                if (resource_user_id !== current_user_id) return res.status(403).json({ error: 'You do not have permission to access this resource' });
            }

            req.currentUser = user;
            return handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = { verifyToken, getTokenFromRequest, loginRequired, roleRequired, advocateRequired, advocateOwnsResource };
