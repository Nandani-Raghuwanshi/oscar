import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { brandAPI } from '../../api/client';

export const BrandAdvocateDashboard = () => {
    const { user } = useAuthStore();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.targetProjectId) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const data = await brandAPI.getDashboard();
                setDashboard(data.data);
            } catch (err) {
                console.error('Error fetching dashboard:', err);
                setError(err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user?.targetProjectId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}! 👋</h1>
                    <p className="text-gray-600 mt-2">Brand Advocate Dashboard</p>
                </div>

                {/* Referral Stats */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Referrals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Referrals */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {dashboard?.referrals?.total || 0}
                                    </p>
                                </div>
                                <div className="text-4xl text-blue-500">👥</div>
                            </div>
                        </div>

                        {/* Pending Status */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {dashboard?.referrals?.pending || 0}
                                    </p>
                                </div>
                                <div className="text-4xl text-yellow-500">⏳</div>
                            </div>
                        </div>

                        {/* Qualified Status */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Qualified</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {dashboard?.referrals?.qualified || 0}
                                    </p>
                                </div>
                                <div className="text-4xl text-purple-500">✓</div>
                            </div>
                        </div>

                        {/* Conversion Rate */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {dashboard?.referrals?.conversionRate || 0}%
                                    </p>
                                </div>
                                <div className="text-4xl text-green-500">📈</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reward Stats */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rewards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Total Earned */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Earned</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        ₹{(dashboard?.rewards?.totalEarned || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="text-4xl text-emerald-500">💰</div>
                            </div>
                        </div>

                        {/* Total Claimed */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Claimed</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        ₹{(dashboard?.rewards?.totalClaimed || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="text-4xl text-indigo-500">✅</div>
                            </div>
                        </div>

                        {/* Pending Amount */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Pending Amount</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        ₹{(dashboard?.rewards?.pendingAmount || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ({dashboard?.rewards?.pendingCount || 0} rewards)
                                    </p>
                                </div>
                                <div className="text-4xl text-orange-500">⏸️</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Name</label>
                            <p className="text-lg text-gray-900 font-medium">
                                {user?.firstName} {user?.lastName}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <p className="text-lg text-gray-900 font-medium break-all">
                                {user?.email || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone</label>
                            <p className="text-lg text-gray-900 font-medium">
                                {user?.phone}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Role</label>
                            <p className="text-lg text-gray-900 font-medium">
                                <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                    Brand Advocate
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/brand/referrals" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition">
                            <p className="text-2xl mb-2">➕</p>
                            <p className="font-semibold">Submit Referral</p>
                        </a>
                        <a href="/brand/rewards" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition">
                            <p className="text-2xl mb-2">🎁</p>
                            <p className="font-semibold">View Rewards</p>
                        </a>
                        <a href="/brand/project" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition">
                            <p className="text-2xl mb-2">🏗️</p>
                            <p className="font-semibold">Project Details</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandAdvocateDashboard;
