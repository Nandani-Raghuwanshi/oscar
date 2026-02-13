import React, { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import '../styles/dashboard.css'

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await adminApi.getAnalyticsOverview()
                setAnalytics(response.data)
            } catch (err) {
                setError('Failed to load analytics')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>System Analytics & Overview</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {analytics && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p className="stat-value">{analytics.total_users || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Advocates</h3>
                        <p className="stat-value">{analytics.total_advocates || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Referrals</h3>
                        <p className="stat-value">{analytics.total_referrals || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Converted Referrals</h3>
                        <p className="stat-value">{analytics.converted_referrals || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Rewards Distributed</h3>
                        <p className="stat-value">₹{analytics.total_rewards?.toLocaleString() || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Conversion Rate</h3>
                        <p className="stat-value">
                            {analytics.total_referrals > 0
                                ? ((analytics.converted_referrals / analytics.total_referrals) * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>
            )}

            <div className="admin-sections">
                <section className="admin-section">
                    <h2>System Status</h2>
                    <div className="status-info">
                        <p><strong>Platform Status:</strong> <span className="status-active">Active</span></p>
                        <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
