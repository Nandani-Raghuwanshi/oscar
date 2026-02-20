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
    const token = localStorage.getItem('token');
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

export default apiClient;
