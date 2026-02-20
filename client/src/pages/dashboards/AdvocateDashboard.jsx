import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { advocateAPI } from '../../api/client';

export const AdvocateDashboard = () => {
    const { user } = useAuthStore();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isProjectAdvocate = user?.role === 'project_advocate';

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                // Only fetch dashboard data for project advocates
                if (isProjectAdvocate) {
                    const data = await advocateAPI.getDashboard();
                    setDashboard(data.data);
                } else {
                    // Brand advocates don't have dashboard data, just show profile
                    setDashboard(null);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message || 'Failed to load dashboard');
                setDashboard(null);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'project_advocate' || user?.role === 'brand_advocate') {
            fetchDashboard();
        } else {
            setLoading(false);
        }
    }, [user, isProjectAdvocate]);

    if (loading) {
        return (
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'} Dashboard
                </h1>
                <div className="mt-8 text-center text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'} Dashboard
                </h1>
                <div className="mt-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    <p className="font-semibold">Error loading dashboard</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
                {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'} Dashboard
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats - Only show for project advocates */}
                {isProjectAdvocate && dashboard && (
                    <>
                        {/* Referrals Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Total Referrals</h3>
                            <p className="text-4xl font-bold text-amber-600 mt-2">{dashboard.referrals.total}</p>
                            <p className="text-sm text-gray-600 mt-2">Conversions: {dashboard.referrals.converted}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                            <p className="text-4xl font-bold text-green-600 mt-2">{dashboard.referrals.conversionRate}%</p>
                            <p className="text-sm text-gray-600 mt-2">Pending: {dashboard.referrals.pending}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Total Rewards</h3>
                            <p className="text-4xl font-bold text-blue-600 mt-2">₹{dashboard.rewards.totalEarned.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 mt-2">Claimed: ₹{dashboard.rewards.totalClaimed.toLocaleString()}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Pending Rewards</h3>
                            <p className="text-4xl font-bold text-purple-600 mt-2">₹{dashboard.rewards.pendingAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 mt-2">{dashboard.rewards.pendingCount} rewards earned</p>
                        </div>
                    </>
                )}

                {/* Profile Card */}
                <div className={`bg-white rounded-lg shadow p-6 ${isProjectAdvocate && dashboard ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-lg font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-lg font-medium text-gray-900">{user?.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-lg font-medium text-gray-900">{user?.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                                {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

