import { useState, useEffect } from 'react';
import { useReferral } from '../../hooks/useReferral';
import { useAdvocate } from '../../hooks/useAdvocate';
import { useReward } from '../../hooks/useReward';
import '../styles/referral.css';

/**
 * Referral Dashboard Component
 * Main dashboard for advocates to manage referrals and rewards
 */
export default function ReferralDashboard() {
    const advocateId = localStorage.getItem('advocateId');
    const [activeTab, setActiveTab] = useState('dashboard');

    const { getByAdvocate: getReferrals } = useReferral();
    const { getDetails } = useAdvocate();
    const { getByAdvocate: getRewards } = useReward();

    const [advocate, setAdvocate] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!advocateId) {
            window.location.href = '/referral/select-type';
            return;
        }

        const loadData = async () => {
            try {
                const advData = await getDetails(advocateId);
                setAdvocate(advData);

                const refData = await getReferrals(advocateId);
                setReferrals(refData?.referrals || []);

                const rewData = await getRewards(advocateId);
                setRewards(rewData?.rewards || []);
            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [advocateId, getDetails, getReferrals, getRewards]);

    if (loading) {
        return (
            <div className="referral-dashboard loading">
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (!advocate) {
        return (
            <div className="referral-dashboard error">
                <p>Failed to load advocate data. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="referral-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {advocate.name}</h1>
                <p className="advocate-type">{advocate.type}</p>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={`tab ${activeTab === 'referrals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('referrals')}
                >
                    My Referrals ({referrals.length})
                </button>
                <button
                    className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rewards')}
                >
                    Rewards
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <DashboardTab advocate={advocate} referrals={referrals} rewards={rewards} />
            )}
            {activeTab === 'referrals' && (
                <ReferralsTab referrals={referrals} advocate={advocate} />
            )}
            {activeTab === 'rewards' && (
                <RewardsTab rewards={rewards} />
            )}
        </div>
    );
}

function DashboardTab({ advocate, referrals, rewards }) {
    const conversions = referrals.filter(r => r.status === 'CONVERTED').length;
    const totalEarnings = rewards
        .filter(r => r.status === 'PAID')
        .reduce((sum, r) => sum + r.net_amount, 0);

    return (
        <div className="dashboard-tab">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Referrals</h3>
                    <p className="stat-value">{referrals.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Conversions</h3>
                    <p className="stat-value">{conversions}</p>
                </div>
                <div className="stat-card">
                    <h3>Conversion Rate</h3>
                    <p className="stat-value">
                        {referrals.length > 0 ? ((conversions / referrals.length) * 100).toFixed(1) : 0}%
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Earnings (Paid)</h3>
                    <p className="stat-value">₹{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <a href="/referral/create-link" className="btn btn-primary">
                        Create New Referral Link
                    </a>
                    <a href="/referral/share" className="btn btn-secondary">
                        Share & Promote
                    </a>
                </div>
            </div>
        </div>
    );
}

function ReferralsTab({ referrals, advocate }) {
    const [sortBy, setSortBy] = useState('recent');

    const sorted = [...referrals].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return a.status.localeCompare(b.status);
    });

    return (
        <div className="referrals-tab">
            <div className="tab-header">
                <h2>My Referrals</h2>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="recent">Most Recent</option>
                    <option value="status">By Status</option>
                </select>
            </div>

            {sorted.length === 0 ? (
                <div className="empty-state">
                    <p>No referrals yet. Create your first referral link!</p>
                    <a href="/referral/create-link" className="btn btn-primary">
                        Create Link
                    </a>
                </div>
            ) : (
                <div className="referrals-list">
                    {sorted.map((referral) => (
                        <ReferralCard
                            key={referral._id}
                            referral={referral}
                            advocateType={advocate.type}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReferralCard({ referral, advocateType }) {
    const date = new Date(referral.created_at).toLocaleDateString('en-IN');
    const statusColor = {
        'ACTIVE': 'green',
        'INACTIVE': 'gray',
        'PAUSED': 'orange'
    }[referral.status] || 'gray';

    return (
        <div className="referral-card">
            <div className="card-header">
                <h4>Referral Link</h4>
                <span className={`status-badge status-${statusColor}`}>{referral.status}</span>
            </div>
            <div className="card-body">
                <p><strong>Link:</strong> <code>{referral.link}</code></p>
                <p><strong>Channel:</strong> {referral.channel || 'Direct'}</p>
                <p><strong>Created:</strong> {date}</p>
                <p><strong>Click Count:</strong> {referral.click_count}</p>
                <p><strong>Leads:</strong> {referral.leads_count}</p>
            </div>
            <div className="card-actions">
                <button className="btn btn-small" onClick={() => {
                    navigator.clipboard.writeText(referral.link);
                    alert('Link copied to clipboard!');
                }}>
                    Copy Link
                </button>
                <a href={`/referral/${referral.uuid}`} className="btn btn-small">
                    View Details
                </a>
            </div>
        </div>
    );
}

function RewardsTab({ rewards }) {
    const summary = {
        pending: rewards.filter(r => r.status === 'ELIGIBLE').length,
        approved: rewards.filter(r => r.status === 'APPROVED').length,
        paid: rewards.filter(r => r.status === 'PAID').length,
        total: rewards.reduce((sum, r) => sum + (r.status === 'PAID' ? r.net_amount : 0), 0)
    };

    return (
        <div className="rewards-tab">
            <div className="rewards-summary">
                <div className="summary-card">
                    <h4>Pending</h4>
                    <p className="count">{summary.pending}</p>
                    <p className="label">Eligible for Payment</p>
                </div>
                <div className="summary-card">
                    <h4>Approved</h4>
                    <p className="count">{summary.approved}</p>
                    <p className="label">Ready to Process</p>
                </div>
                <div className="summary-card">
                    <h4>Paid</h4>
                    <p className="count">{summary.paid}</p>
                    <p className="label">Completed Payments</p>
                </div>
                <div className="summary-card highlight">
                    <h4>Total Earnings</h4>
                    <p className="amount">₹{summary.total.toLocaleString('en-IN')}</p>
                    <p className="label">(Paid Rewards)</p>
                </div>
            </div>

            {rewards.length === 0 ? (
                <div className="empty-state">
                    <p>No rewards yet. Your rewards will appear here once a referral converts!</p>
                </div>
            ) : (
                <div className="rewards-list">
                    {rewards.map((reward) => (
                        <RewardCard key={reward._id} reward={reward} />
                    ))}
                </div>
            )}
        </div>
    );
}

function RewardCard({ reward }) {
    const statusColor = {
        'ELIGIBLE': 'blue',
        'APPROVED': 'orange',
        'PAID': 'green',
        'REJECTED': 'red'
    }[reward.status] || 'gray';

    const paidDate = reward.paid_at ? new Date(reward.paid_at).toLocaleDateString('en-IN') : '-';

    return (
        <div className="reward-card">
            <div className="card-header">
                <h4>Reward #{reward._id.substring(0, 8)}</h4>
                <span className={`status-badge status-${statusColor}`}>{reward.status}</span>
            </div>
            <div className="card-body">
                <div className="amount-row">
                    <span>Gross Amount:</span>
                    <strong>₹{reward.gross_amount}</strong>
                </div>
                <div className="amount-row">
                    <span>TDS (10%):</span>
                    <strong>-₹{reward.tds_amount}</strong>
                </div>
                <div className="amount-row highlight">
                    <span>Net Amount:</span>
                    <strong>₹{reward.net_amount}</strong>
                </div>
                <p className="small-text">
                    {reward.status === 'PAID' ? `Paid on: ${paidDate}` : 'Pending payment'}
                </p>
            </div>
        </div>
    );
}
