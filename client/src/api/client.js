import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('oscar_app_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle responses
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    getMe: () => apiClient.get('/auth/me')
};

export const adminAPI = {
    // Users
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    getUserById: (id) => apiClient.get(`/admin/users/${id}`),
    createUser: (data) => apiClient.post('/admin/users', data),
    updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
    bulkImportUsers: (formData) => apiClient.post('/admin/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Dashboard
    getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),

    // Audit Logs
    getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params })
};

export const projectAPI = {
    getProjects: (params) => apiClient.get('/projects', { params }),
    getProjectById: (id) => apiClient.get(`/projects/${id}`),
    createProject: (data) => apiClient.post('/projects', data),
    updateProject: (id, data) => apiClient.put(`/projects/${id}`, data),
    deleteProject: (id) => apiClient.delete(`/projects/${id}`),
    addCertification: (id, data) => apiClient.post(`/projects/${id}/certifications`, data)
};

export const advocateAPI = {
    // Profile & Dashboard
    getProfile: () => apiClient.get('/advocate/profile'),
    getDashboard: () => apiClient.get('/advocate/dashboard'),

    // Referrals
    submitReferral: (data) => apiClient.post('/advocate/referrals', data),
    getReferrals: (params) => apiClient.get('/advocate/referrals', { params }),
    getReferralById: (id) => apiClient.get(`/advocate/referrals/${id}`),
    updateReferralStatus: (id, data) => apiClient.patch(`/advocate/referrals/${id}/status`, data),

    // Rewards
    getRewards: (params) => apiClient.get('/advocate/rewards', { params }),
    getRewardsSummary: () => apiClient.get('/advocate/rewards/summary'),

    // Project & Documentation
    getProject: () => apiClient.get('/advocate/project'),
    getProjectCertifications: () => apiClient.get('/advocate/project/certifications'),
    getProjectDocuments: () => apiClient.get('/advocate/project/documents')
};

export const brandAPI = {
    // Profile & Dashboard
    getProfile: () => apiClient.get('/brand/profile'),
    getDashboard: () => apiClient.get('/brand/dashboard'),

    // Referrals
    submitReferral: (data) => apiClient.post('/brand/referrals', data),
    getReferrals: (params) => apiClient.get('/brand/referrals', { params }),
    getReferralById: (id) => apiClient.get(`/brand/referrals/${id}`),
    updateReferralStatus: (id, data) => apiClient.patch(`/brand/referrals/${id}/status`, data),
    getReferralSummary: () => apiClient.get('/brand/referrals/summary/count'),

    // Rewards
    getRewards: (params) => apiClient.get('/brand/rewards', { params }),
    getRewardsSummary: () => apiClient.get('/brand/rewards/summary'),
    claimReward: (id, data) => apiClient.patch(`/brand/rewards/${id}/claim`, data),

    // Project & Documentation
    getProject: () => apiClient.get('/brand/project'),
    getProjectCertifications: () => apiClient.get('/brand/project/certifications'),
    getProjectDocuments: () => apiClient.get('/brand/project/documents')
};

export const crmAPI = {
    // Advocate Management
    getAdvocates: (params) => apiClient.get('/crm/advocates', { params }),
    getAdvocatePerformance: (id) => apiClient.get(`/crm/advocates/${id}/performance`),

    // Sales Associates
    getSalesAssociates: () => apiClient.get('/crm/sales-associates'),

    // Referral Management
    getReferrals: (params) => apiClient.get('/crm/referrals', { params }),

    // Referral Assignment
    assignReferral: (id, data) => apiClient.patch(`/crm/referrals/${id}/assign`, data),
    batchAssignReferrals: (data) => apiClient.post('/crm/referrals/batch-assign', data),

    // Lead Management
    getLeads: (params) => apiClient.get('/crm/leads', { params }),
    updateLeadStatus: (id, data) => apiClient.patch(`/crm/leads/${id}/status`, data),

    // Call Logging
    logCall: (data) => apiClient.post('/crm/call-logs', data),
    getCallLogs: (leadId, params) => apiClient.get(`/crm/leads/${leadId}/call-logs`, { params }),

    // Daily Status
    submitDailyStatus: (data) => apiClient.post('/crm/daily-status', data),
    getMyDailyStatus: (params) => apiClient.get('/crm/my-daily-status', { params }),

    // Referral Summary
    getReferralSummary: (params) => apiClient.get('/crm/referral-summary', { params }),

    // Payment Tracking
    recordPayment: (leadId, data) => apiClient.post(`/crm/leads/${leadId}/payment`, data),
    getPaymentHistory: (leadId) => apiClient.get(`/crm/leads/${leadId}/payment-history`),
    getPaymentSummary: (params) => apiClient.get('/crm/payment-summary', { params }),

    // Escalation Management
    getEscalations: (params) => apiClient.get('/crm/escalations', { params }),
    resolveEscalation: (id, data) => apiClient.patch(`/crm/escalations/${id}/resolve`, data)
};

export const escalationRulesAPI = {
    // Escalation Rules Management (Admin only)
    getRules: (params) => apiClient.get('/admin/escalation-rules', { params }),
    getRule: (id) => apiClient.get(`/admin/escalation-rules/${id}`),
    createRule: (data) => apiClient.post('/admin/escalation-rules', data),
    updateRule: (id, data) => apiClient.put(`/admin/escalation-rules/${id}`, data),
    toggleRule: (id) => apiClient.patch(`/admin/escalation-rules/${id}/toggle`),
    deleteRule: (id) => apiClient.delete(`/admin/escalation-rules/${id}`),
    triggerProcessing: () => apiClient.post('/admin/escalation-rules/trigger')
};

export const notificationAPI = {
    // Get notifications
    getNotifications: (params) => apiClient.get('/notifications', { params }),
    getUnreadCount: () => apiClient.get('/notifications/unread/count'),

    // Mark as read
    markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.patch('/notifications/read-all/all'),

    // Delete notifications
    deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

    // User preferences
    getUserPreferences: () => apiClient.get('/notifications/preferences/user'),
    updateUserPreferences: (data) => apiClient.patch('/notifications/preferences/update', data),

    // Admin - Send notifications
    sendNotification: (data) => apiClient.post('/notifications/send', data),
    sendBulkNotification: (data) => apiClient.post('/notifications/send-bulk', data),
    scheduleNotification: (data) => apiClient.post('/notifications/schedule', data),

    // Template management
    getTemplates: (params) => apiClient.get('/notifications/templates/list', { params }),
    createTemplate: (data) => apiClient.post('/notifications/templates/create', data),
    getTemplate: (id) => apiClient.get(`/notifications/templates/${id}`),
    updateTemplate: (id, data) => apiClient.patch(`/notifications/templates/${id}/update`, data),
    deleteTemplate: (id) => apiClient.delete(`/notifications/templates/${id}`),
};

export const analyticsAPI = {
    // Overview & Analytics
    getSystemOverview: (params) => apiClient.get('/analytics/overview', { params }),
    getUserAnalytics: (params) => apiClient.get('/analytics/users', { params }),
    getProjectAnalytics: (params) => apiClient.get('/analytics/projects', { params }),
    getReferralAnalytics: (params) => apiClient.get('/analytics/referrals', { params }),
    getSalesPipelineAnalytics: (params) => apiClient.get('/analytics/sales-pipeline', { params }),
    getRevenueAnalytics: (params) => apiClient.get('/analytics/revenue', { params }),
    getROIAnalytics: (params) => apiClient.get('/analytics/roi', { params }),
    getActivityTimeline: (params) => apiClient.get('/analytics/activity-timeline', { params }),

    // Custom Reports
    generateCustomReport: (data) => apiClient.post('/analytics/custom-report', data),

    // Export Functions
    exportLeads: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `${apiClient.defaults.baseURL}/analytics/export/leads?${queryString}`;
    },
    exportReferrals: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `${apiClient.defaults.baseURL}/analytics/export/referrals?${queryString}`;
    },
    exportUsers: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `${apiClient.defaults.baseURL}/analytics/export/users?${queryString}`;
    },
    exportCustomers: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `${apiClient.defaults.baseURL}/analytics/export/customers?${queryString}`;
    },
    exportAnalytics: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `${apiClient.defaults.baseURL}/analytics/export/analytics?${queryString}`;
    }
};

export default apiClient;
