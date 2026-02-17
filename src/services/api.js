import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * AUTHENTICATION ENDPOINTS
 */
export const authAPI = {
    /**
     * Task: POST /auth/signup
     * Request: { email, password, full_name, role, advocate_type }
     * Response: { message, user_id, token (if approved), user }
     */
    signup: (email, password, fullName, role = 'user', advocateType = null) =>
        api.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            role,
            advocate_type: advocateType
        }),

    /**
     * Task: POST /auth/login
     * Request: { email, password }
     * Response: { message, user, token (if approved), status }
     */
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    /**
     * Task: POST /auth/logout
     * Response: { message }
     */
    logout: () =>
        api.post('/auth/logout'),
};

/**
 * ADVOCATE ENDPOINTS
 */
export const advocateAPI = {
    /**
     * Task: POST /advocates/register
     * Request: { user_id, advocate_type }
     * Response: { message, advocate_id }
     */
    register: (userId, advocateType) =>
        api.post('/advocates/register', {
            user_id: userId,
            advocate_type: advocateType,
        }),

    /**
     * Task: GET /advocates/:advocate_id
     * Get advocate details
     */
    getDetails: (advocateId) =>
        api.get(`/advocates/${advocateId}`),

    /**
     * Task: PUT /advocates/:advocate_id
     * Update advocate information
     */
    update: (advocateId, data) =>
        api.put(`/advocates/${advocateId}`, data),
};

/**
 * REFERRAL ENDPOINTS
 */
export const referralAPI = {
    /**
     * Task: POST /referrals/create-link
     * Request: { advocate_id, project_id }
     * Response: { referral_link, uuid, qr_code_url }
     */
    createLink: (advocateId, projectId) =>
        api.post('/referrals/create-link', {
            advocate_id: advocateId,
            project_id: projectId,
        }),

    /**
     * Task: POST /referrals/submit-lead
     * Request: { referral_id, lead_name, lead_email, lead_phone, budget }
     * Response: { message, lead_id }
     */
    submitLead: (referralId, leadData) =>
        api.post('/referrals/submit-lead', {
            referral_id: referralId,
            ...leadData,
        }),

    /**
     * Task: GET /referrals/:advocate_id
     * Get all referrals for an advocate
     */
    getByAdvocate: (advocateId) =>
        api.get(`/referrals/${advocateId}`),

    /**
     * Task: GET /referrals/:referral_id
     * Get specific referral details
     */
    getDetails: (referralId) =>
        api.get(`/referrals/${referralId}`),
};

/**
 * REWARD ENDPOINTS
 */
export const rewardAPI = {
    /**
     * Task: GET /rewards/:advocate_id
     * Get reward summary and history
     */
    getByAdvocate: (advocateId) =>
        api.get(`/rewards/${advocateId}`),

    /**
     * Task: GET /rewards/pending/:advocate_id
     * Get pending rewards
     */
    getPending: (advocateId) =>
        api.get(`/rewards/pending/${advocateId}`),

    /**
     * Task: GET /rewards/paid/:advocate_id
     * Get paid rewards history
     */
    getPaid: (advocateId) =>
        api.get(`/rewards/paid/${advocateId}`),
};

/**
 * PROJECT ENDPOINTS
 */
export const projectAPI = {
    /**
     * Task: GET /projects
     * Get list of all projects
     */
    getAll: () =>
        api.get('/projects'),

    /**
     * Task: GET /projects/:project_id
     * Get specific project details
     */
    getDetails: (projectId) =>
        api.get(`/projects/${projectId}`),

    /**
     * Task: GET /projects/advocate/:advocate_id
     * Get projects for an advocate
     */
    getByAdvocate: (advocateId) =>
        api.get(`/projects/advocate/${advocateId}`),
};

/**
 * HEALTH CHECK ENDPOINT
 */
export const healthAPI = {
    /**
     * Task: GET /health
     * Check backend health
     */
    check: () =>
        api.get('/health'),
};

/**
 * ADMIN ENDPOINTS
 */
export const adminAPI = {
    /**
     * Task: GET /admin/pending-users
     * Get all pending user registrations
     */
    getPendingUsers: (skip = 0, limit = 20, role = null) => {
        let url = `/admin/pending-users?skip=${skip}&limit=${limit}`;
        if (role) url += `&role=${role}`;
        return api.get(url);
    },

    /**
     * Task: GET /admin/users
     * List all users with filters
     */
    listAllUsers: (skip = 0, limit = 20, role = null, status = null, search = null) => {
        let url = `/admin/users?skip=${skip}&limit=${limit}`;
        if (role) url += `&role=${role}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return api.get(url);
    },

    /**
     * Task: POST /admin/users/:user_id/approve
     * Approve a pending user
     */
    approveUser: (userId) =>
        api.post(`/admin/users/${userId}/approve`),

    /**
     * Task: POST /admin/users/:user_id/reject
     * Reject a pending user
     */
    rejectUser: (userId, reason) =>
        api.post(`/admin/users/${userId}/reject`, { reason }),

    /**
     * Task: POST /admin/users/:user_id/reactivate
     * Reactivate a rejected user
     */
    reactivateUser: (userId) =>
        api.post(`/admin/users/${userId}/reactivate`),

    /**
     * Task: GET /admin/analytics
     * Get system analytics
     */
    getAnalytics: () =>
        api.get('/admin/analytics'),

    /**
     * Task: GET /admin/advocates
     * List all advocates with detailed statistics
     */
    listAdvocates: (skip = 0, limit = 20, advocateType = null, search = null) => {
        let url = `/admin/advocates?skip=${skip}&limit=${limit}`;
        if (advocateType) url += `&advocate_type=${advocateType}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return api.get(url);
    },

    /**
     * Task: GET /admin/referrals
     * Get all referrals with filtering
     */
    getReferrals: (skip = 0, limit = 20, advocateType = null, status = null, projectId = null) => {
        let url = `/admin/referrals?skip=${skip}&limit=${limit}`;
        if (advocateType) url += `&advocate_type=${advocateType}`;
        if (status) url += `&status=${status}`;
        if (projectId) url += `&project_id=${projectId}`;
        return api.get(url);
    },

    /**
     * Task: GET /admin/advocates/:advocate_id/details
     * Get detailed advocate information
     */
    getAdvocateDetails: (advocateId) =>
        api.get(`/admin/advocates/${advocateId}/details`),

    /**
     * Task: GET /admin/rewards-analytics
     * Get rewards analytics and distribution
     */
    getRewardsAnalytics: (skip = 0, limit = 20, status = null) => {
        let url = `/admin/rewards-analytics?skip=${skip}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return api.get(url);
    },

    /**
     * Task: GET /admin/project-analytics
     * Get project-wise analytics
     */
    getProjectAnalytics: () =>
        api.get('/admin/project-analytics'),

    /**
     * Task: POST /admin/validation/override
     * Override advocate type validation
     */
    overrideValidation: (advocateId, newType, reason) =>
        api.post('/admin/validation/override', {
            advocate_id: advocateId,
            new_type: newType,
            reason: reason
        }),

    /**
     * Task: POST /admin/advocates/import
     * Bulk import advocates
     */
    importAdvocates: (advocatesData) =>
        api.post('/admin/advocates/import', {
            advocates: advocatesData
        }),
};

/**
 * USER MANAGEMENT ENDPOINTS
 */
export const userAPI = {
    /**
     * Task: PUT /users/profile
     * Update user profile information
     */
    updateProfile: (profileData) =>
        api.put('/users/profile', profileData),

    /**
     * Task: POST /users/reset-password
     * Reset/change user password
     */
    resetPassword: (currentPassword, newPassword) =>
        api.post('/users/reset-password', {
            current_password: currentPassword,
            new_password: newPassword
        }),

    /**
     * Task: GET /users/profile
     * Get current user profile
     */
    getProfile: () =>
        api.get('/users/profile'),
};

export default api;
