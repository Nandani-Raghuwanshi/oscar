import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { referralAPI } from '../services/api';
import '../styles/referral-analytics.css';

export default function ReferralAnalytics() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    useEffect(() => {
        const loadVisitRecords = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await referralAPI.getVisits(uuid, currentPage * pageSize, pageSize);
                console.log('Analytics data:', response.data);
                setAnalyticsData(response.data);
            } catch (err) {
                console.error('Failed to load visit records:', err);
                const errorMsg =
                    err.response?.data?.error ||
                    err.message ||
                    'Failed to load visit records';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            loadVisitRecords();
        }
    }, [uuid, currentPage, pageSize]);

    if (loading) {
        return (
            <main className="analytics-page">
                <div className="loading-spinner">
                    <p>Loading visit records...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="analytics-page">
                <div className="container">
                    <div className="error-box">
                        <h2>Error Loading Records</h2>
                        <p style={{ color: '#c33' }}>{error}</p>
                        <button onClick={() => navigate(-1)} className="btn btn-primary">
                            Go Back
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const data = analyticsData || {};
    const { referral_uuid, total_visits, click_count, visits = [], pagination = {}, referral_info = {} } = data;

    const hasNextPage = pagination.returned === pageSize;
    const hasPrevPage = currentPage > 0;

    return (
        <main className="analytics-page">
            <div className="container">
                {/* Header */}
                <section className="analytics-header">
                    <h1>Referral Link Analytics</h1>
                    <p className="subtitle">Track and analyze your referral link performance</p>
                </section>

                {/* Summary Cards */}
                <section className="summary-cards">
                    <div className="stat-card">
                        <p className="label">Total Visits</p>
                        <p className="value">{total_visits}</p>
                    </div>
                    <div className="stat-card">
                        <p className="label">Click Count</p>
                        <p className="value">{click_count}</p>
                    </div>
                    {referral_info?.project_name && (
                        <div className="stat-card">
                            <p className="label">Project</p>
                            <p className="value">{referral_info.project_name}</p>
                        </div>
                    )}
                    {referral_info?.channel && (
                        <div className="stat-card">
                            <p className="label">Channel</p>
                            <p className="value" style={{ textTransform: 'capitalize' }}>
                                {referral_info.channel}
                            </p>
                        </div>
                    )}
                </section>

                {/* Referral Info */}
                {referral_info?.created_at && (
                    <section className="info-card">
                        <h3>Referral Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <p className="label">Created</p>
                                <p className="value">{new Date(referral_info.created_at).toLocaleString()}</p>
                            </div>
                            <div className="info-item">
                                <p className="label">Status</p>
                                <span className={`status-badge ${referral_info.status?.toLowerCase()}`}>
                                    {referral_info.status}
                                </span>
                            </div>
                            <div className="info-item">
                                <p className="label">UUID</p>
                                <p className="value uuid">{referral_uuid}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Visits Table */}
                <section className="visits-card">
                    <h3>Visit Records ({total_visits})</h3>

                    {visits.length === 0 ? (
                        <div className="empty-state">
                            <p>No visits yet. Share your referral link to start tracking visits!</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="visits-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Timestamp</th>
                                            <th>IP Address</th>
                                            <th>User Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visits.map((visit, index) => (
                                            <tr key={index}>
                                                <td>{currentPage * pageSize + index + 1}</td>
                                                <td>{new Date(visit.timestamp).toLocaleString()}</td>
                                                <td className="monospace">{visit.ip_address || 'N/A'}</td>
                                                <td className="user-agent">
                                                    <span title={visit.user_agent}>
                                                        {visit.user_agent?.substring(0, 60) || 'N/A'}...
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {(hasPrevPage || hasNextPage) && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!hasPrevPage}
                                        className="btn btn-sm"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="page-info">
                                        Page {currentPage + 1} • Showing {pagination.returned || 0} of {total_visits} visits
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!hasNextPage}
                                        className="btn btn-sm"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Back Button */}
                <div className="action-buttons">
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">
                        ← Go Back
                    </button>
                </div>
            </div>
        </main>
    );
}
