import { useState, useEffect } from 'react';
import { useReward } from '../../hooks/useReward';
import '../styles/rewards.css';

/**
 * Rewards Page
 * Display rewards, earnings, and payout history
 */
export default function Rewards() {
    const advocateId = localStorage.getItem('advocateId');
    const { getByAdvocate: getRewards } = useReward();

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (!advocateId) {
            window.location.href = '/referral/select-type';
            return;
        }

        const loadRewards = async () => {
            try {
                const data = await getRewards(advocateId);
                const rewList = data?.data?.rewards || data?.rewards || [];
                setRewards(rewList);
            } catch (error) {
                console.error('Failed to load rewards:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRewards();
    }, [advocateId, getRewards]);

    const getRewardsData = () => {
        const completed = rewards.filter(r => r.status === 'completed');
        const pending = rewards.filter(r => r.status === 'pending');
        const totalAmount = completed.reduce((sum, r) => sum + (r.amount || 0), 0);
        const pendingAmount = pending.reduce((sum, r) => sum + (r.amount || 0), 0);

        return {
            total: completed.length,
            pending: pending.length,
            totalAmount,
            pendingAmount
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            'completed': '#27ae60',
            'pending': '#f39c12',
            'processing': '#3498db',
            'failed': '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'completed': '✓',
            'pending': '⏳',
            'processing': '⚙️',
            'failed': '✗'
        };
        return icons[status] || '•';
    };

    if (loading) {
        return (
            <main className="rewards-page">
                <div className="loading-spinner">
                    <p>Loading rewards...</p>
                </div>
            </main>
        );
    }

    const data = getRewardsData();
    const displayRewards = filterStatus === 'all' ? rewards : rewards.filter(r => r.status === filterStatus);

    return (
        <main className="rewards-page">
            <div className="page-header">
                <h1>Rewards & Earnings</h1>
                <p>Track your referral rewards and payouts</p>
            </div>

            {/* Summary Cards */}
            <section className="rewards-summary">
                <div className="summary-card primary">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <p className="card-label">Total Earnings</p>
                        <h2 className="card-value">₹{(data.totalAmount / 100000).toFixed(2)}L</h2>
                        <p className="card-subtitle">{data.total} completed rewards</p>
                    </div>
                </div>

                <div className="summary-card pending">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                        <p className="card-label">Pending Rewards</p>
                        <h2 className="card-value">₹{(data.pendingAmount / 100000).toFixed(2)}L</h2>
                        <p className="card-subtitle">{data.pending} in process</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">🎯</div>
                    <div className="card-content">
                        <p className="card-label">Average Reward</p>
                        <h2 className="card-value">
                            ₹{data.total > 0 ? ((data.totalAmount / data.total) / 100000).toFixed(2) : '0'}L
                        </h2>
                        <p className="card-subtitle">per conversion</p>
                    </div>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="filter-section">
                <div className="filter-tabs">
                    <button
                        className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All Rewards ({rewards.length})
                    </button>
                    <button
                        className={`tab ${filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('completed')}
                    >
                        Completed ({data.total})
                    </button>
                    <button
                        className={`tab ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending ({data.pending})
                    </button>
                </div>
            </section>

            {/* Rewards Table */}
            <section className="rewards-list">
                {displayRewards.length > 0 ? (
                    <div className="table-container">
                        <table className="rewards-table">
                            <thead>
                                <tr>
                                    <th>Referral ID</th>
                                    <th>Lead Name</th>
                                    <th>Reward Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayRewards.map(reward => (
                                    <tr key={reward._id} className="reward-row">
                                        <td className="id-cell">
                                            {reward.referral_id?.substring(0, 8)}...
                                        </td>
                                        <td className="lead-cell">
                                            {reward.referral_details?.lead_name || 'N/A'}
                                        </td>
                                        <td className="amount-cell">
                                            <span className="amount">
                                                ₹{(reward.amount / 100000).toFixed(2)}L
                                            </span>
                                        </td>
                                        <td className="status-cell">
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(reward.status) }}
                                            >
                                                {getStatusIcon(reward.status)} {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(reward.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>
                            {filterStatus === 'completed'
                                ? 'No completed rewards yet. Keep creating referrals!'
                                : filterStatus === 'pending'
                                    ? 'No pending rewards.'
                                    : 'No rewards yet. Create referral links to start earning!'}
                        </p>
                        <a href="/referral/link-qr" className="btn btn-primary">Create Referral Link</a>
                    </div>
                )}
            </section>

            {/* Payout Information */}
            <section className="payout-info">
                <h3>💳 Payout Information</h3>
                <div className="info-box">
                    <p><strong>Minimum Payout:</strong> ₹5,000</p>
                    <p><strong>Payout Frequency:</strong> Monthly (Last Friday of the month)</p>
                    <p><strong>Processing Time:</strong> 3-5 business days</p>
                    <p><strong>Payment Method:</strong> Bank Transfer / Digital Wallet</p>
                    <a href="/profile" className="link-btn">Update Payment Details →</a>
                </div>
            </section>
        </main>
    );
}
