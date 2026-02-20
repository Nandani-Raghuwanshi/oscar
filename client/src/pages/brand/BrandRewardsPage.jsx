import React, { useEffect, useState } from 'react';
import { brandAPI } from '../../api/client';

export const BrandRewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [claimingId, setClaimingId] = useState(null);
    const [showClaimForm, setShowClaimForm] = useState(null);

    const [claimForm, setClaimForm] = useState({
        redemptionMethod: 'bank_transfer',
        accountDetails: {
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            accountHolder: ''
        }
    });

    // Fetch rewards and summary
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = {
                    page: currentPage,
                    limit: 10,
                    ...(selectedStatus && { status: selectedStatus })
                };

                const [rewardsData, summaryData] = await Promise.all([
                    brandAPI.getRewards(params),
                    brandAPI.getRewardsSummary()
                ]);

                setRewards(rewardsData.data.rewards);
                setPagination(rewardsData.data.pagination);
                setSummary(summaryData.data);
            } catch (err) {
                console.error('Error fetching rewards:', err);
                setError(err.message || 'Failed to load rewards');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedStatus, currentPage]);

    const handleClaimClick = (rewardId) => {
        setShowClaimForm(rewardId);
    };

    const handleClaimSubmit = async (rewardId) => {
        try {
            setClaimingId(rewardId);
            await brandAPI.claimReward(rewardId, claimForm);

            // Refresh data
            const params = {
                page: currentPage,
                limit: 10,
                ...(selectedStatus && { status: selectedStatus })
            };
            const [rewardsData, summaryData] = await Promise.all([
                brandAPI.getRewards(params),
                brandAPI.getRewardsSummary()
            ]);

            setRewards(rewardsData.data.rewards);
            setSummary(summaryData.data);
            setShowClaimForm(null);
            setClaimForm({
                redemptionMethod: 'bank_transfer',
                accountDetails: {
                    accountNumber: '',
                    bankName: '',
                    ifscCode: '',
                    accountHolder: ''
                }
            });
        } catch (err) {
            alert('Error claiming reward: ' + (err.message || 'Unknown error'));
        } finally {
            setClaimingId(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            earned: 'bg-yellow-100 text-yellow-800',
            processed: 'bg-blue-100 text-blue-800',
            claimed: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status) => {
        const badges = {
            earned: '💚 Earned',
            processed: '⏳ Processed',
            claimed: '✅ Claimed',
            expired: '❌ Expired'
        };
        return badges[status] || status;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Rewards</h1>
                    <p className="text-gray-600 mt-2">Track your earned rewards and claim them</p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Earned */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Earned</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        ₹{(summary.earned?.amount || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {summary.earned?.count || 0} rewards
                                    </p>
                                </div>
                                <div className="text-4xl text-yellow-500">💚</div>
                            </div>
                        </div>

                        {/* Processed */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Processed</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        ₹{(summary.processed?.amount || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {summary.processed?.count || 0} rewards
                                    </p>
                                </div>
                                <div className="text-4xl text-blue-500">⏳</div>
                            </div>
                        </div>

                        {/* Claimed */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Claimed</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        ₹{(summary.claimed?.amount || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {summary.claimed?.count || 0} rewards
                                    </p>
                                </div>
                                <div className="text-4xl text-green-500">✅</div>
                            </div>
                        </div>

                        {/* Total Earned */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="opacity-90 text-sm font-medium">Total Earned</p>
                                    <p className="text-3xl font-bold mt-2">
                                        ₹{(summary.totalEarned || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="text-4xl">💰</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Filter */}
                <div className="mb-6 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => { setSelectedStatus(''); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === ''
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => { setSelectedStatus('earned'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'earned'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Earned
                    </button>
                    <button
                        onClick={() => { setSelectedStatus('processed'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'processed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Processed
                    </button>
                    <button
                        onClick={() => { setSelectedStatus('claimed'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'claimed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Claimed
                    </button>
                    <button
                        onClick={() => { setSelectedStatus('expired'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Expired
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Rewards List */}
                {!loading && !error && (
                    <div>
                        {rewards.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    {selectedStatus ? 'No rewards found with this status.' : 'No rewards earned yet. Keep referring to earn rewards!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rewards.map(reward => (
                                    <div key={reward._id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    ₹{reward.amount.toLocaleString('en-IN')}
                                                </h3>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    {reward.description}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reward.status)}`}>
                                                {getStatusBadge(reward.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-gray-600">Type</p>
                                                <p className="text-gray-900 font-medium capitalize">{reward.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Earned Date</p>
                                                <p className="text-gray-900">
                                                    {new Date(reward.earnedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Currency</p>
                                                <p className="text-gray-900 font-medium">{reward.currency}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Referral</p>
                                                <p className="text-gray-900 text-xs truncate">
                                                    {reward.referralId?.referrerName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Claim Button for Processed Rewards */}
                                        {reward.status === 'processed' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {showClaimForm === reward._id ? (
                                                    <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900">Claim This Reward</h4>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Redemption Method
                                                            </label>
                                                            <select
                                                                value={claimForm.redemptionMethod}
                                                                onChange={(e) =>
                                                                    setClaimForm(prev => ({
                                                                        ...prev,
                                                                        redemptionMethod: e.target.value
                                                                    }))
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="bank_transfer">Bank Transfer</option>
                                                                <option value="wallet">Wallet</option>
                                                                <option value="check">Check</option>
                                                            </select>
                                                        </div>

                                                        {claimForm.redemptionMethod === 'bank_transfer' && (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Account Holder Name"
                                                                    value={claimForm.accountDetails.accountHolder}
                                                                    onChange={(e) =>
                                                                        setClaimForm(prev => ({
                                                                            ...prev,
                                                                            accountDetails: {
                                                                                ...prev.accountDetails,
                                                                                accountHolder: e.target.value
                                                                            }
                                                                        }))
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Account Number"
                                                                    value={claimForm.accountDetails.accountNumber}
                                                                    onChange={(e) =>
                                                                        setClaimForm(prev => ({
                                                                            ...prev,
                                                                            accountDetails: {
                                                                                ...prev.accountDetails,
                                                                                accountNumber: e.target.value
                                                                            }
                                                                        }))
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Bank Name"
                                                                    value={claimForm.accountDetails.bankName}
                                                                    onChange={(e) =>
                                                                        setClaimForm(prev => ({
                                                                            ...prev,
                                                                            accountDetails: {
                                                                                ...prev.accountDetails,
                                                                                bankName: e.target.value
                                                                            }
                                                                        }))
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="IFSC Code"
                                                                    value={claimForm.accountDetails.ifscCode}
                                                                    onChange={(e) =>
                                                                        setClaimForm(prev => ({
                                                                            ...prev,
                                                                            accountDetails: {
                                                                                ...prev.accountDetails,
                                                                                ifscCode: e.target.value
                                                                            }
                                                                        }))
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleClaimSubmit(reward._id)}
                                                                disabled={claimingId === reward._id}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                                                            >
                                                                {claimingId === reward._id ? 'Claiming...' : 'Confirm Claim'}
                                                            </button>
                                                            <button
                                                                onClick={() => setShowClaimForm(null)}
                                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleClaimClick(reward._id)}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                                    >
                                                        Claim Reward
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Claimed Info */}
                                        {reward.status === 'claimed' && reward.claimedAt && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                                                <p className="text-green-800 font-semibold">
                                                    ✅ Claimed on {new Date(reward.claimedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                    disabled={currentPage === pagination.pages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandRewardsPage;
