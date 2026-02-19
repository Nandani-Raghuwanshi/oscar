import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useReferral } from '../../hooks/useReferral';
import { useReward } from '../../hooks/useReward';
import { useAdvocate } from '../../hooks/useAdvocate';
import '../styles/dashboard.css';
import { Link } from 'react-router-dom';

/**
 * Advocate Dashboard Overview
 * Displays key metrics and quick navigation
 */
export default function Dashboard() {
    const { user } = useContext(AuthContext);
    let advocateId = localStorage.getItem('advocateId');

    // Fallback: try to get advocate_id from user context
    if (!advocateId && user?.advocate_id) {
        advocateId = user.advocate_id;
        localStorage.setItem('advocateId', advocateId);
    }

    const { getByAdvocate: getReferrals } = useReferral();
    const { getByAdvocate: getRewards } = useReward();
    const { getDetails: getAdvocateDetails, getStats } = useAdvocate();

    const [advocate, setAdvocate] = useState(null);
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!advocateId) {
            window.location.href = '/referral/select-type';
            return;
        }

        const loadDashboardData = async () => {
            try {
                // Load advocate details
                const advData = await getAdvocateDetails(advocateId);
                setAdvocate(advData?.data?.advocate || advData);

                // Load advocate stats
                const statsData = await getStats(advocateId);
                setStats(statsData?.data || statsData);

                // Load recent referrals
                const refData = await getReferrals(advocateId);
                const refList = refData?.data?.referrals || refData?.referrals || [];
                setReferrals(refList.slice(0, 5)); // Show last 5

                // Load rewards
                const rewData = await getRewards(advocateId);
                setRewards(rewData?.data?.rewards || rewData?.rewards || []);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [advocateId, getAdvocateDetails, getStats, getReferrals, getRewards]);

    const getStatusBadge = (status) => {
        const statusMap = {
            'NEW_LEAD': { color: '#3498db', label: 'New Lead' },
            'SITE_VISIT': { color: '#f39c12', label: 'Site Visit' },
            'IN_PROGRESS': { color: '#9b59b6', label: 'In Progress' },
            'CONVERTED': { color: '#27ae60', label: 'Converted' },
            'REJECTED': { color: '#e74c3c', label: 'Rejected' }
        };
        const info = statusMap[status] || { color: '#95a5a6', label: status };
        return <span className="badge" style={{ backgroundColor: info.color }}>{info.label}</span>;
    };

    const calculateTotalEarnings = () => {
        const converted = referrals.filter(r => r.status === 'CONVERTED').length;
        const earnedRewards = rewards.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.amount || 0), 0);
        return earnedRewards || (converted * 50000); // Default estimate
    };

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="loading-spinner">
                    <p>Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    const activeReferrals = referrals.filter(r => r.status !== 'REJECTED').length;
    const conversions = referrals.filter(r => r.status === 'CONVERTED').length;
    const totalEarnings = calculateTotalEarnings();

    return (
        <main className="dashboard-page">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Welcome, {user?.name || user?.full_name}!</h1>
                    <p className="advocate-badge">
                        {user?.advocate_type === 'PROJECT_ADVOCATE' ? '🏘️ Project Advocate' : '🌟 Brand Advocate'}
                        
                    </p>
                </div>
                <div className="header-actions">
                    <Link to="/referral/link-qr" className="btn btn-primary">
                        + Create New Link
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <p className="stat-label">Active Referrals</p>
                        <h3 className="stat-value">{activeReferrals}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <p className="stat-label">Conversions</p>
                        <h3 className="stat-value">{conversions}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <p className="stat-label">Total Earnings</p>
                        <h3 className="stat-value">₹{(totalEarnings / 100000).toFixed(1)}L</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <p className="stat-label">Pending Rewards</p>
                        <h3 className="stat-value">
                            {rewards.filter(r => r.status === 'pending').length}
                        </h3>
                    </div>
                </div>
            </section>

            {/* Recent Referrals */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Referrals</h2>
                    <Link to="/dashboard/my-referrals" className="link-btn">View All →</Link>
                </div>

                {referrals.length > 0 ? (
                    <div className="referrals-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lead Name</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map(referral => (
                                    <tr key={referral._id} className="table-row">
                                        <td className="lead-name">{referral.lead_name}</td>
                                        <td>{referral.lead_phone}</td>
                                        <td>{getStatusBadge(referral.status)}</td>
                                        <td>{new Date(referral.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No referrals yet. <Link to="/referral/link-qr">Create your first link</Link></p>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <div className="action-card">
                    <h3>📋 My Referrals</h3>
                    <p>View and manage all your referrals</p>
                    <Link to="/dashboard/my-referrals" className="btn btn-secondary">Go to Referrals</Link>
                </div>

                <div className="action-card">
                    <h3>💸 Rewards</h3>
                    <p>Track your earnings and rewards</p>
                    <Link to="/dashboard/rewards" className="btn btn-secondary">View Rewards</Link>
                </div>

                <div className="action-card">
                    <h3>🔗 Create Link</h3>
                    <p>Generate new referral links with QR codes</p>
                    <Link to="/referral/link-qr" className="btn btn-secondary">Create Link</Link>
                </div>

                <div className="action-card">
                    <h3>📱 Share & Promote</h3>
                    <p>Share referral links across channels</p>
                    <Link to="/dashboard/share" className="btn btn-secondary">Share Now</Link>
                </div>
            </section>
        </main>
    );
}
