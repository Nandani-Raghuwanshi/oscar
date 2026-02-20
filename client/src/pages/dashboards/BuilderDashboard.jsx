import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

const BuilderDashboard = () => {
    const { user } = useAuthStore();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        statusBreakdown: [],
        inviteStats: {},
        activeEscalations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectAndStats();
    }, []);

    const fetchProjectAndStats = async () => {
        setLoading(true);
        try {
            // Fetch project
            const projectResponse = await apiClient.get('/builder/projects', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            const builderProject = await projectResponse.data || null;
            console.log('[BuilderDashboard] Fetched project:', builderProject);
            setProject(builderProject);

            // Fetch statistics if project exists
            if (builderProject?._id) {
                const statsResponse = await apiClient.get(
                    `/builder/reports/dashboard?projectId=${builderProject._id}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                );

                setStats(statsResponse.data?.data || {});
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusCount = (status) => {
        const breakdown = stats.statusBreakdown || [];
        const item = breakdown.find((b) => b._id === status);
        return item?.count || 0;
    };

    if (loading) {
        return (
            <div className="py-6 text-center">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">Builder Dashboard</h1>
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">No project assigned. Please contact your administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Builder Dashboard</h1>

            {/* Project Header */}
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-blue-100 mt-1">{project.description || 'No description'}</p>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600">Total Customers</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalCustomers || 0}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600">Active</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{getStatusCount('active')}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600">Converted</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{getStatusCount('converted')}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600">Open Escalations</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.activeEscalations || 0}</p>
                </div>
            </div>

            {/* Invite Stats & Project Details */}
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Invite Statistics */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Statistics</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Invites Sent</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.sentCount || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Invites Delivered</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.deliveredCount || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Invites Read</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.readCount || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Project Name</p>
                            <p className="text-lg font-medium text-gray-900">{project.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${project.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : project.status === 'inactive'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {project.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Builder Profile</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-lg font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="text-lg font-medium text-gray-900">{user?.role || 'Builder'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuilderDashboard;
