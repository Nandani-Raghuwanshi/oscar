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
    // ===== CRM MANAGER ENDPOINTS =====
    
    // Dashboard
    getDashboardStats: () => apiClient.get('/crm/dashboard/stats'),
    
    // Advocates Management
    getAdvocates: (params) => apiClient.get('/crm/advocates', { params }),
    getAdvocateById: (id) => apiClient.get(`/crm/advocates/${id}`),
    
    // Referrals Management (Master List)
    getReferrals: (params) => apiClient.get('/crm/referrals', { params }),
    getReferralById: (id) => apiClient.get(`/crm/referrals/${id}`),
    assignReferral: (id, data) => apiClient.post(`/crm/referrals/${id}/assign`, data),
    reassignReferral: (id, data) => apiClient.put(`/crm/referrals/${id}/reassign`, data),
    
    // Pipeline View
    getPipelineData: (params) => apiClient.get('/crm/pipeline', { params }),
    
    // Payments Management
    getPayments: (params) => apiClient.get('/crm/payments', { params }),
    
    // Sales Associates Management
    getSalesAssociates: (params) => apiClient.get('/crm/sales-associates', { params }),
    
    // Escalations
    getEscalations: (params) => apiClient.get('/crm/escalations', { params }),
    createManualEscalation: (id, data) => apiClient.post(`/crm/referrals/${id}/escalate`, data),
    resolveEscalation: (id, data) => apiClient.patch(`/crm/escalations/${id}/resolve`, data),
    
    // ===== SALES ASSOCIATE ENDPOINTS =====
    
    // Sales Associate Dashboard
    getAssociateDashboard: () => apiClient.get('/crm/associate/dashboard'),
    
    // My Assigned Referrals
    getMyReferrals: (params) => apiClient.get('/crm/associate/referrals', { params }),
    
    // Interactions (Call Logs)
    logInteraction: (data) => apiClient.post('/crm/associate/interactions', data),
    getInteractions: (referralId) => apiClient.get(`/crm/associate/interactions/${referralId}`),
    
    // Status Updates
    updateReferralStatus: (id, data) => apiClient.patch(`/crm/associate/referrals/${id}/status`, data),
    
    // Payments
    markPayment: (data) => apiClient.post('/crm/associate/payments', data),
    getMyPayments: (params) => apiClient.get('/crm/associate/payments', { params }),
    
    // Performance
    getPerformance: (params) => apiClient.get('/crm/associate/performance', { params })
};

export default apiClient;
