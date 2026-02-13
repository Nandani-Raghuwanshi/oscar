import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Auth APIs
export const authApi = {
    signup: (data) => apiClient.post('/auth/signup', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout')
}

// Advocate APIs
export const advocateApi = {
    register: (data) => apiClient.post('/advocates/register', data),
    getProfile: (advocateId) => apiClient.get(`/advocates/${advocateId}`),
    updateProfile: (advocateId, data) => apiClient.put(`/advocates/${advocateId}`, data),
    getReferrals: (advocateId) => apiClient.get(`/advocates/${advocateId}/referrals`),
    createReferral: (data) => apiClient.post('/advocates/referrals', data),
    getStats: (advocateId) => apiClient.get(`/advocates/${advocateId}/stats`)
}

// Referral APIs
export const referralApi = {
    getAll: () => apiClient.get('/referrals'),
    getById: (referralId) => apiClient.get(`/referrals/${referralId}`),
    updateStatus: (referralId, data) => apiClient.put(`/referrals/${referralId}`, data)
}

// Reward APIs
export const rewardApi = {
    getRewards: (userId) => apiClient.get(`/rewards?user_id=${userId}`),
    calculateReward: (data) => apiClient.post('/rewards/calculate', data),
    claimReward: (rewardId) => apiClient.post(`/rewards/${rewardId}/claim`)
}

// Admin APIs
export const adminApi = {
    getAnalyticsOverview: () => apiClient.get('/admin/analytics/overview'),
    getUserMetrics: () => apiClient.get('/admin/metrics/users'),
    getAdvocatesMetrics: () => apiClient.get('/admin/metrics/advocates'),
    getReferralMetrics: () => apiClient.get('/admin/metrics/referrals')
}

// Health Check
export const healthApi = {
    check: () => apiClient.get('/health/status')
}

export default apiClient
