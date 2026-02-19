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
        // Log all errors for debugging
        console.debug('API Error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
            url: error.config?.url
        });

        // Only auto-logout on actual token/auth errors, not on permission/validation errors
        if (error.response?.status === 401) {
            const errorData = error.response?.data || {};
            const errorMessage = (errorData.error || errorData.message || '').toLowerCase();

            // Check if this is a token/auth error (not a validation error)
            // Token errors: token validation, token format, token expiration, authorization header issues
            const isTokenError =
                errorMessage.includes('token') ||
                errorMessage.includes('authorization') ||
                errorMessage.includes('expired');

            // Check if token exists in storage
            const tokenExists = !!localStorage.getItem('authToken');

            // Only logout if it's clearly a token/auth error AND token exists in storage
            // This prevents unwanted logouts from validation errors or permission issues
            if (isTokenError && tokenExists) {
                console.warn('Token error detected, logging out user');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('advocateId');
                localStorage.removeItem('user_id');
                window.location.href = '/login';
            }
        }

        // For 403 errors (permission denied), don't logout - let the app handle it
        if (error.response?.status === 403) {
            console.debug('Permission denied (403), not logging out');
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

    /**
     * GET /auth/verify
     * Verify that the current token is valid
     * Response: { success, user }
     */
    verifyToken: () =>
        api.get('/auth/verify'),
};

/**
 * ADVOCATE ENDPOINTS (Now using user_id)
 */
export const advocateAPI = {
    /**
     * POST /advocates/register
     * Request: { advocate_type, project_id }
     * Response: { success, user_id, advocate_id, type, message }
     */
    register: (advocateType, projectId = null) =>
        api.post('/advocates/register', {
            advocate_type: advocateType,
            ...(projectId && { project_id: projectId })
        }),

    /**
     * GET /advocates/:user_id
     * Get advocate details (using user_id)
     */
    getDetails: (userId) =>
        api.get(`/advocates/${userId}`),

    /**
     * GET /advocates/user/:user_id
     * Get advocate for a user
     */
    getByUser: (userId) =>
        api.get(`/advocates/user/${userId}`),

    /**
     * PUT /advocates/:user_id
     * Update advocate information
     */
    update: (userId, data) =>
        api.put(`/advocates/${userId}`, data),

    /**
     * GET /advocates/:user_id/stats
     * Get advocate statistics
     */
    getStats: (userId) =>
        api.get(`/advocates/${userId}/stats`),

    /**
     * POST /advocates/:user_id/pause
     * Pause an advocate
     */
    pause: (userId) =>
        api.post(`/advocates/${userId}/pause`),

    /**
     * POST /advocates/:user_id/blacklist
     * Blacklist an advocate
     */
    blacklist: (userId, reason = '') =>
        api.post(`/advocates/${userId}/blacklist`, { reason })
};

/**
 * REFERRAL ENDPOINTS (Now using user_id)
 */
export const referralAPI = {
    /**
     * POST /referrals/create-link
     * Create a new referral link
     * Request: { user_id, project_id, channel }
     * Response: { success, referral_id, user_id, uuid, link, qr_code_url }
     */
    createLink: (userId, projectId, channel = 'direct') =>
        api.post('/referrals/create-link', {
            user_id: userId,
            project_id: projectId,
            channel
        }),

    /**
     * GET /referrals/visit/:uuid
     * Track referral link visit and get project info
     */
    trackClick: (referralUuid) =>
        api.get(`/referrals/visit/${referralUuid}`),

    /**
     * GET /referrals/:uuid/visits
     * Get all visit records for a referral link
     */
    getVisits: (referralUuid, skip = 0, limit = 50) =>
        api.get(`/referrals/${referralUuid}/visits?skip=${skip}&limit=${limit}`),

    /**
     * POST /referrals/submit-lead
     * Submit a new lead from referral
     * Request: { referral_uuid, lead_name, lead_phone, lead_email, budget_range }
     * Response: { success, lead_id, message }
     */
    submitLead: (referralUuid, leadData) =>
        api.post('/referrals/submit-lead', {
            referral_uuid: referralUuid,
            ...leadData
        }),

    /**
     * GET /referrals/advocate/:advocate_id
     * Get all referrals for an advocate
     */
    getByAdvocate: (advocateId) =>
        api.get(`/referrals/advocate/${advocateId}`),

    /**
     * GET /referrals/:referral_uuid
     * Get specific referral details
     */
    getDetails: (referralUuid) =>
        api.get(`/referrals/${referralUuid}`),

    /**
     * POST /referrals/:lead_id/convert
     * Mark a lead as converted
     * Request: { plot_number, plot_value, booking_date }
     * Response: { success, conversion_id, reward_amount }
     */
    convertLead: (leadId, conversionData) =>
        api.post(`/referrals/${leadId}/convert`, conversionData),

    /**
     * PUT /referrals/:lead_id/status
     * Update lead status in pipeline
     * Request: { status, notes }
     * Response: { success }
     */
    updateLeadStatus: (leadId, status, notes = '') =>
        api.put(`/referrals/${leadId}/status`, {
            status,
            notes
        })
};

/**
 * REWARD ENDPOINTS
 */
export const rewardAPI = {
    /**
     * GET /rewards/:advocate_id
     * Get reward summary and history for an advocate
     */
    getByAdvocate: (advocateId) =>
        api.get(`/rewards/${advocateId}`),

    /**
     * GET /rewards/:advocate_id/summary
     * Get comprehensive reward summary
     */
    getSummary: (advocateId) =>
        api.get(`/rewards/${advocateId}/summary`),

    /**
     * GET /rewards/pending/all
     * Get all pending rewards (admin only)
     */
    getPendingAll: (limit = 50) =>
        api.get(`/rewards/pending/all?limit=${limit}`),

    /**
     * POST /rewards/:reward_id/approve
     * Approve a reward for payment (admin only)
     */
    approveReward: (rewardId) =>
        api.post(`/rewards/${rewardId}/approve`),

    /**
     * POST /rewards/:reward_id/pay
     * Mark reward as paid (admin only)
     * Request: { payment_reference, notes }
     */
    markAsPaid: (rewardId, paymentReference, notes = '') =>
        api.post(`/rewards/${rewardId}/pay`, {
            payment_reference: paymentReference,
            notes
        })
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

    /**
     * Task: GET /projects?search=name&status=active
     * Search projects with filters
     */
    search: (params = {}) => {
        let url = '/projects?';
        if (params.name) url += `search=${encodeURIComponent(params.name)}&`;
        if (params.status) url += `status=${params.status}&`;
        if (params.skip) url += `skip=${params.skip}&`;
        if (params.limit) url += `limit=${params.limit}&`;
        return api.get(url);
    }
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
