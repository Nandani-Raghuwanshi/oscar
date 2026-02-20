import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminAPI } from '../../api/client';

export const AdminDashboard = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboardStats();
            setStats(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load dashboard stats');
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-6 flex justify-center items-center">
                <div className="text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.activeUsers || 0} active</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Inactive Users</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.inactiveUsers || 0}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Admins</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.roleStats?.ADMIN || 0}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Builders</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats?.roleStats?.BUILDER || 0}</p>
                </div>
            </div>

            {/* Role Distribution */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
                    <div className="space-y-3">
                        {stats?.roleStats && Object.entries(stats.roleStats).map(([role, count]) => (
                            <div key={role} className="flex justify-between items-center">
                                <span className="text-gray-700">{role}</span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
                    <div className="space-y-3">
                        {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                            stats.recentUsers.map((recentUser) => (
                                <div key={recentUser._id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {recentUser.firstName} {recentUser.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{recentUser.role}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded ${recentUser.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {recentUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No recent users</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-lg font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="text-lg font-medium text-gray-900">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
