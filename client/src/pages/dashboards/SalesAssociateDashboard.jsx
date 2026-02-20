import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { crmAPI } from '../../api/client';
import { StatsCard } from '../../components/crm';

const SalesAssociateDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await crmAPI.getAssociateDashboard();
            setDashboard(response.data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-6">
                <div className="mb-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboard}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        assignedCount = {},
        pendingActions = [],
        dailyActivity = {},
        monthlyPerformance = {}
    } = dashboard || {};

    return (
        <div className="py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Sales Associate'}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Assigned"
                    value={assignedCount.total || 0}
                    icon="📋"
                    color="blue"
                    subtitle="Referrals assigned to you"
                />
                <StatsCard
                    title="Active Referrals"
                    value={assignedCount.active || 0}
                    icon="🔥"
                    color="orange"
                    subtitle="In progress"
                />
                <StatsCard
                    title="Converted"
                    value={assignedCount.converted || 0}
                    icon="✅"
                    color="green"
                    subtitle="This month"
                />
                <StatsCard
                    title="Conversion Rate"
                    value={`${monthlyPerformance.conversionRate || 0}%`}
                    icon="📊"
                    color="purple"
                    subtitle="Overall performance"
                />
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-3xl font-bold text-yellow-600">{assignedCount.assigned || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Assigned</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{assignedCount.contacted || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Contacted</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">{assignedCount.qualified || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Qualified</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{assignedCount.booking || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Booking</p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Pending Actions</h2>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            {pendingActions.length}
                        </span>
                    </div>

                    {pendingActions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">🎉</p>
                            <p>No pending actions!</p>
                            <p className="text-sm mt-1">You're all caught up</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {pendingActions.map((action, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => navigate('/crm/my-referrals')}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {action.type === 'overdue' && <span className="text-red-500">🚨</span>}
                                                {action.type === 'followup' && <span className="text-yellow-500">⏰</span>}
                                                {action.type === 'escalated' && <span className="text-orange-500">⚠️</span>}
                                                <p className="font-semibold text-gray-900">
                                                    {action.customerName}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600">{action.reason}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {action.daysOverdue && `${action.daysOverdue} days overdue`}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            action.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {action.priority}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Daily Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📞</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Calls Made</p>
                                    <p className="text-sm text-gray-600">Phone interactions</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">{dailyActivity.callsToday || 0}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🏠</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Site Visits</p>
                                    <p className="text-sm text-gray-600">In-person meetings</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{dailyActivity.siteVisitsToday || 0}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📝</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Notes Added</p>
                                    <p className="text-sm text-gray-600">Interaction logs</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-600">{dailyActivity.notesAdded || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-purple-600">{monthlyPerformance.totalAssigned || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Total Assigned</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-blue-600">{monthlyPerformance.contacted || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Contacted</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-green-600">{monthlyPerformance.converted || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Converted</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-orange-600">${monthlyPerformance.totalRevenue || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Total Revenue</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => navigate('/crm/my-referrals')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                    View My Referrals
                </button>
                <button
                    onClick={() => navigate('/crm/my-performance')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    View Performance
                </button>
            </div>
        </div>
    );
};

export default SalesAssociateDashboard;
