import React, { useState, useEffect } from 'react';
import { advocateAPI } from '../../api/client';

export const AdvocateRewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRewards();
        fetchSummary();
    }, [page, statusFilter]);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const data = await advocateAPI.getRewards(params);
            setRewards(data.data.data);
            setTotalPages(data.data.pagination.pages);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch rewards');
            setRewards([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const data = await advocateAPI.getRewardsSummary();
            setSummary(data.data);
        } catch (err) {
            console.error('Failed to fetch reward summary:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'earned':
                return 'bg-blue-100 text-blue-800';
            case 'processed':
                return 'bg-purple-100 text-purple-800';
            case 'claimed':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            referral_commission: 'Referral Commission',
            bonus: 'Bonus',
            incentive: 'Incentive',
            milestone: 'Milestone Reward'
        };
        return labels[type] || type;
    };

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Rewards</h2>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-600">Total Earned</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            ₹{summary.earned.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{summary.earned.count} rewards</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-600">Processed</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                            ₹{summary.processed.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{summary.processed.count} rewards</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-600">Claimed</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            ₹{summary.claimed.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{summary.claimed.count} rewards</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-600">Grand Total</h3>
                        <p className="text-3xl font-bold text-amber-600 mt-2">
                            ₹{summary.grandTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">All time earnings</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex gap-2 flex-wrap">
                    {['all', 'earned', 'processed', 'claimed', 'expired'].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg capitalize transition ${statusFilter === status
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rewards List */}
            {loading ? (
                <div className="text-center text-gray-600">Loading rewards...</div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            ) : rewards.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                    No rewards found. Convert referrals to earn rewards!
                </div>
            ) : (
                <div className="space-y-4">
                    {rewards.map(reward => (
                        <div key={reward._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            ₹{reward.amount.toLocaleString()}
                                        </h3>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reward.status)}`}>
                                            {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Type: {getTypeLabel(reward.type)}
                                    </p>
                                    {reward.referralId && (
                                        <p className="text-sm text-gray-600">
                                            Referral: {reward.referralId.referrerName} ({reward.referralId.referrerPhone})
                                        </p>
                                    )}
                                    {reward.description && (
                                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                            {reward.description}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    <p>Earned: {new Date(reward.earnedAt).toLocaleDateString()}</p>
                                    {reward.processedAt && (
                                        <p>Processed: {new Date(reward.processedAt).toLocaleDateString()}</p>
                                    )}
                                    {reward.claimedAt && (
                                        <p>Claimed: {new Date(reward.claimedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
