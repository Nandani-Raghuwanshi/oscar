import { useState, useContext, useEffect } from 'react';
import { adminAPI, projectAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AdvocateManagement from './components/AdvocateManagement';
import ReferralPipeline from './components/ReferralPipeline';
import ReportsAnalytics from './components/ReportsAnalytics';
import ProjectConfiguration from './components/ProjectConfiguration';
import '../../styles/admin.css';

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <main>
                <div className="page-header">
                    <h1>Access Denied</h1>
                </div>
                <div className="container">
                    <p>You don't have permission to access this page.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>System administration and advocate management</p>
            </div>

            <div className="admin-container">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Navigation Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'advocates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advocates')}
                    >
                        👥 Advocates
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'pipeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pipeline')}
                    >
                        🔄 Pipeline
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        🏗️ Projects
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        📈 Reports
                    </button>
                </div>

                {/* Tab Content */}
                <div className="admin-content">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <h2>System Overview</h2>

                            {isLoading ? (
                                <div className="loading">Loading dashboard data...</div>
                            ) : analytics ? (
                                <>
                                    {/* Key Metrics */}
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <div className="metric-icon">👥</div>
                                            <div className="metric-content">
                                                <div className="metric-label">Total Advocates</div>
                                                <div className="metric-value">
                                                    {analytics.total_advocates || 0}
                                                </div>
                                                <div className="metric-breakdown">
                                                    <span>🏘️ {analytics.project_advocates || 0}</span>
                                                    <span>⭐ {analytics.brand_advocates || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="metric-card">
                                            <div className="metric-icon">📋</div>
                                            <div className="metric-content">
                                                <div className="metric-label">Active Referrals</div>
                                                <div className="metric-value">
                                                    {analytics.active_referrals || 0}
                                                </div>
                                                <div className="metric-trend">+23% this month</div>
                                            </div>
                                        </div>

                                        <div className="metric-card">
                                            <div className="metric-icon">✅</div>
                                            <div className="metric-content">
                                                <div className="metric-label">Conversions (MTD)</div>
                                                <div className="metric-value">
                                                    {analytics.conversions_mtd || 0}
                                                </div>
                                                <div className="metric-detail">
                                                    {analytics.conversion_rate || '0'}% rate
                                                </div>
                                            </div>
                                        </div>

                                        <div className="metric-card">
                                            <div className="metric-icon">💰</div>
                                            <div className="metric-content">
                                                <div className="metric-label">Rewards Paid</div>
                                                <div className="metric-value">
                                                    ₹{(analytics.rewards_paid || 0).toLocaleString()}
                                                </div>
                                                <div className="metric-detail">This month</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advocate Type Distribution */}
                                    <div className="distribution-section">
                                        <h3>Advocate Type Distribution</h3>

                                        <div className="advocate-types">
                                            <div className="advocate-type-card project-advocates">
                                                <div className="type-header">
                                                    <span className="type-icon">🏘️</span>
                                                    <span className="type-name">Project Advocates</span>
                                                </div>
                                                <div className="type-count">{analytics.project_advocates || 0}</div>
                                                <div className="type-description">
                                                    Customers in Oscar Sanctuary (NEW project)
                                                </div>
                                                <div className="type-stats">
                                                    <div className="stat">
                                                        <span className="label">Avg referrals/advocate:</span>
                                                        <span className="value">{analytics.project_advocates_avg_referrals || 0}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="label">Conversion rate:</span>
                                                        <span className="value">{analytics.project_advocates_conversion || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="advocate-type-card brand-advocates">
                                                <div className="type-header">
                                                    <span className="type-icon">⭐</span>
                                                    <span className="type-name">Brand Advocates</span>
                                                </div>
                                                <div className="type-count">{analytics.brand_advocates || 0}</div>
                                                <div className="type-description">
                                                    Customers from Oscar Fort (COMPLETED)
                                                </div>
                                                <div className="type-stats">
                                                    <div className="stat">
                                                        <span className="label">Avg referrals/advocate:</span>
                                                        <span className="value">{analytics.brand_advocates_avg_referrals || 0}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="label">Conversion rate:</span>
                                                        <span className="value">{analytics.brand_advocates_conversion || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="insight-box">
                                            <strong>📊 Key Insight:</strong> Brand Advocates from Oscar Fort have a higher conversion rate ({analytics.brand_advocates_conversion || 0}% vs {analytics.project_advocates_conversion || 0}%), likely because they have completed their purchase journey and can provide credible, experienced endorsements.
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="no-data">No analytics data available</div>
                            )}
                        </div>
                    )}

                    {/* ADVOCATES TAB */}
                    {activeTab === 'advocates' && <AdvocateManagement />}

                    {/* PIPELINE TAB */}
                    {activeTab === 'pipeline' && <ReferralPipeline />}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && <ProjectConfiguration />}

                    {/* REPORTS TAB */}
                    {activeTab === 'reports' && <ReportsAnalytics />}
                </div>
            </div>
        </main>
    );
}
