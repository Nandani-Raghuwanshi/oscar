import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { crmAPI } from '../../api/client';
import { StatsCard } from '../../components/crm';

const CRMDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await crmAPI.getDashboardStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.message || 'Failed to load dashboard data');
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={fetchDashboardStats}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Dashboard</h1>
                <p className="text-gray-600">
                    Welcome back, {user?.name || 'CRM Manager'}! Here's your overview.
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Advocates"
                    value={stats?.totalAdvocates || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    color="purple"
                    subtitle="Active advocates"
                />

                <StatsCard
                    title="Active Referrals"
                    value={stats?.activeReferrals || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                    color="blue"
                    subtitle="In pipeline"
                />

                <StatsCard
                    title="Conversion Rate"
                    value={`${stats?.conversionRate?.toFixed(1) || 0}%`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                    color="green"
                    trend={stats?.conversionRate >= 20 ? 'up' : stats?.conversionRate >= 10 ? 'neutral' : 'down'}
                    trendValue={`${stats?.conversionRate?.toFixed(1) || 0}%`}
                />

                <StatsCard
                    title="Pending Assignments"
                    value={stats?.pendingAssignments || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color={stats?.pendingAssignments > 10 ? 'red' : stats?.pendingAssignments > 5 ? 'yellow' : 'gray'}
                    subtitle="Need assignment"
                />
            </div>

            {/* Sales Associates Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sales Associates</h3>
                    {stats?.topSalesAssociates && stats.topSalesAssociates.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topSalesAssociates.slice(0, 5).map((associate, index) => (
                                <div key={associate._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                            index === 0 ? 'bg-yellow-500' : 
                                            index === 1 ? 'bg-gray-400' : 
                                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{associate.name}</p>
                                            <p className="text-xs text-gray-600">
                                                {associate.assignedCount} assigned • {associate.convertedCount} converted
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{associate.conversionRate}%</p>
                                        <p className="text-xs text-gray-600">conv. rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No sales associates data available</p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalations & Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🚨</span>
                                <div>
                                    <p className="font-medium text-gray-900">Critical Escalations</p>
                                    <p className="text-xs text-gray-600">72+ hours unattended</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{stats?.escalations?.critical || 0}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔔</span>
                                <div>
                                    <p className="font-medium text-gray-900">High Priority</p>
                                    <p className="text-xs text-gray-600">48+ hours unattended</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{stats?.escalations?.high || 0}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="font-medium text-gray-900">Attention Needed</p>
                                    <p className="text-xs text-gray-600">24+ hours unattended</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{stats?.escalations?.warning || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button
                    onClick={() => navigate('/crm/referrals')}
                    className="bg-indigo-600 text-white rounded-lg p-6 hover:bg-indigo-700 transition-colors text-left shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">Manage Referrals</h3>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-indigo-100">Assign and track referrals</p>
                </button>

                <button
                    onClick={() => navigate('/crm/pipeline')}
                    className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition-colors text-left shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">Pipeline View</h3>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-blue-100">Kanban board view</p>
                </button>

                <button
                    onClick={() => navigate('/crm/advocates')}
                    className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors text-left shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">View Advocates</h3>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-purple-100">Advocate performance</p>
                </button>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Status Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[
                        { status: 'pending', label: 'Pending', color: 'gray', count: stats?.statusDistribution?.pending || 0 },
                        { status: 'assigned', label: 'Assigned', color: 'blue', count: stats?.statusDistribution?.assigned || 0 },
                        { status: 'contacted', label: 'Contacted', color: 'indigo', count: stats?.statusDistribution?.contacted || 0 },
                        { status: 'site_visit', label: 'Site Visit', color: 'purple', count: stats?.statusDistribution?.site_visit || 0 },
                        { status: 'qualified', label: 'Qualified', color: 'yellow', count: stats?.statusDistribution?.qualified || 0 },
                        { status: 'booking', label: 'Booking', color: 'orange', count: stats?.statusDistribution?.booking || 0 },
                        { status: 'converted', label: 'Converted', color: 'green', count: stats?.statusDistribution?.converted || 0 },
                        { status: 'dropped', label: 'Dropped', color: 'red', count: stats?.statusDistribution?.dropped || 0 }
                    ].map(item => (
                        <div key={item.status} className={`p-4 rounded-lg border-2 bg-${item.color}-50 border-${item.color}-200`}>
                            <p className={`text-3xl font-bold text-${item.color}-600 mb-1`}>{item.count}</p>
                            <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;