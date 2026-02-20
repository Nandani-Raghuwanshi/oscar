import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const BuilderReportsPage = () => {
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user]);

    useEffect(() => {
        if (selectedProject) {
            fetchDashboardStats();
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/builder/projects', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const builderProject = response.data?.data?.project;
            if (builderProject) {
                setProjects([builderProject]);
                setSelectedProject(builderProject._id);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/builder/reports/dashboard?projectId=${selectedProject}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setStats(response.data?.data || {});
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, color = 'blue' }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            green: 'bg-green-50 text-green-700 border-green-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
            orange: 'bg-orange-50 text-orange-700 border-orange-200',
        };

        return (
            <div className={`${colorClasses[color]} border rounded-lg p-6`}>
                <p className="text-sm font-medium opacity-75">{title}</p>
                <p className="text-4xl font-bold mt-2">{value}</p>
                {subtitle && (
                    <p className="text-xs opacity-50 mt-1">{subtitle}</p>
                )}
            </div>
        );
    };

    if (!selectedProject) {
        return (
            <div className="py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Please select a project first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            </div>

            {/* Project Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Project
                </label>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                    <option value="">Choose a project</option>
                    {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading statistics...</p>
                </div>
            ) : stats ? (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Total Customers"
                            value={stats.totalCustomers}
                            color="blue"
                        />
                        <StatCard
                            title="Invites Sent"
                            value={stats.inviteStats?.sentCount || 0}
                            color="green"
                        />
                        <StatCard
                            title="Invites Delivered"
                            value={stats.inviteStats?.deliveredCount || 0}
                            color="purple"
                        />
                        <StatCard
                            title="Active Escalations"
                            value={stats.activeEscalations}
                            color="orange"
                        />
                    </div>

                    {/* Customer Status Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4">Customer Status Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.statusBreakdown && stats.statusBreakdown.length > 0 ? (
                                stats.statusBreakdown.map((item) => (
                                    <div
                                        key={item._id}
                                        className="border border-gray-200 rounded-lg p-4 text-center"
                                    >
                                        <p className="text-sm text-gray-600 capitalize">
                                            {item._id}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {item.count}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No customer data available</p>
                            )}
                        </div>
                    </div>

                    {/* Invite Delivery Rate */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Invite Delivery Rate</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Sent</span>
                                    <span className="text-sm font-medium">
                                        {stats.inviteStats?.sentCount || 0} /{' '}
                                        {stats.totalCustomers}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${stats.totalCustomers > 0
                                                ? (
                                                    ((stats.inviteStats?.sentCount || 0) /
                                                        stats.totalCustomers) *
                                                    100
                                                ).toFixed(1)
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Delivered</span>
                                    <span className="text-sm font-medium">
                                        {stats.inviteStats?.deliveredCount || 0} /{' '}
                                        {stats.inviteStats?.sentCount || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{
                                            width: `${(stats.inviteStats?.sentCount || 0) > 0
                                                ? (
                                                    ((stats.inviteStats?.deliveredCount || 0) /
                                                        (stats.inviteStats?.sentCount || 1)) *
                                                    100
                                                ).toFixed(1)
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Read</span>
                                    <span className="text-sm font-medium">
                                        {stats.inviteStats?.readCount || 0} /{' '}
                                        {stats.inviteStats?.deliveredCount || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full"
                                        style={{
                                            width: `${(stats.inviteStats?.deliveredCount || 0) > 0
                                                ? (
                                                    ((stats.inviteStats?.readCount || 0) /
                                                        (stats.inviteStats?.deliveredCount || 1)) *
                                                    100
                                                ).toFixed(1)
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">No data available</p>
                </div>
            )}
        </div>
    );
};

export default BuilderReportsPage;
