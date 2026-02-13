import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { advocateApi } from '../services/api'
import '../styles/dashboard.css'

export default function AdvocateDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [referrals, setReferrals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsResponse = await advocateApi.getStats(user.id)
                setStats(statsResponse.data)

                const referralsResponse = await advocateApi.getReferrals(user.id)
                setReferrals(referralsResponse.data)
            } catch (err) {
                setError('Failed to load data')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (user?.id) {
            fetchData()
        }
    }, [user])

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Advocate Dashboard</h1>
                <p>Welcome, {user?.full_name}!</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === 'referrals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('referrals')}
                >
                    Referrals
                </button>
            </div>

            {activeTab === 'overview' && stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Referrals</h3>
                        <p className="stat-value">{stats.total_referrals || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Converted</h3>
                        <p className="stat-value">{stats.converted_referrals || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Rewards Earned</h3>
                        <p className="stat-value">₹{stats.total_rewards?.toLocaleString() || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Conversion Rate</h3>
                        <p className="stat-value">
                            {stats.total_referrals > 0
                                ? ((stats.converted_referrals / stats.total_referrals) * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'referrals' && (
                <div className="referrals-list">
                    <h2>Your Referrals</h2>
                    {referrals.length === 0 ? (
                        <p>No referrals yet</p>
                    ) : (
                        <table className="referrals-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((ref) => (
                                    <tr key={ref._id}>
                                        <td>{ref.property_name}</td>
                                        <td>₹{ref.property_value?.toLocaleString()}</td>
                                        <td className={`status-${ref.status}`}>{ref.status}</td>
                                        <td>{new Date(ref.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}
