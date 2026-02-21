import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

const BuilderDashboard = () => {
    const { user } = useAuthStore();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null); // full project object
    const [stats, setStats] = useState({
        totalCustomers: 0,
        statusBreakdown: [],
        inviteStats: {},
        activeEscalations: 0,
        openEscalations: 0,
        crmEscalations: 0,
        convertedLeads: 0,
    });
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);

    // Step 1 — load all projects once
    useEffect(() => {
        fetchProjects();
    }, []);

    // Step 2 — reload stats whenever selected project changes
    useEffect(() => {
        if (selectedProject?._id) {
            fetchStats(selectedProject._id);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
            const res = await apiClient.get('/builder/projects');
            const list = res?.data?.projects || [];

            setProjects(list);
            if (list.length > 0) {
                setSelectedProject(list[0]);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const fetchStats = async (projectId) => {
        setLoadingStats(true);
        try {
            const statsRes = await apiClient.get(
                `/builder/reports/dashboard?projectId=${projectId}`
            );
            setStats(statsRes?.data || {});
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleProjectChange = (e) => {
        const chosen = projects.find((p) => p._id === e.target.value);
        if (chosen) setSelectedProject(chosen);
    };

    const getStatusCount = (status) => {
        const breakdown = stats.statusBreakdown || [];
        const item = breakdown.find((b) => b._id === status);
        return item?.count || 0;
    };

    const getStatusBadgeClass = (status) => {
        if (status === 'active') return 'bg-green-100 text-green-700';
        if (status === 'inactive') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (loadingProjects) {
        return (
            <div className="py-6 text-center">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">Builder Dashboard</h1>
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">
                        No project assigned. Please contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Builder Dashboard</h1>

            {/* ── Project Header Bar with Dropdown ── */}
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: selected project info */}
                    <div>
                        <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-1">
                            Viewing Project
                        </p>
                        <h2 className="text-2xl font-bold leading-tight">
                            {selectedProject?.name}
                        </h2>
                        <p className="text-blue-100 mt-1 text-sm">
                            {selectedProject?.description || 'No description'}
                        </p>
                    </div>

                    {/* Right: dropdown — only show if more than 1 project */}
                    {projects.length > 1 && (
                        <div className="flex-shrink-0">
                            <label className="block text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
                                Switch Project
                            </label>
                            <select
                                value={selectedProject?._id || ''}
                                onChange={handleProjectChange}
                                className="bg-white bg-opacity-20 border border-white border-opacity-40 text-white rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 min-w-[200px] cursor-pointer"
                                style={{ color: 'white' }}
                            >
                                {projects.map((p) => (
                                    <option
                                        key={p._id}
                                        value={p._id}
                                        style={{ color: '#1f2937', backgroundColor: 'white' }}
                                    >
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Project meta row */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                        <span className="font-medium text-white">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            selectedProject?.status === 'active'
                                ? 'bg-green-400 bg-opacity-30 text-green-100'
                                : 'bg-yellow-400 bg-opacity-30 text-yellow-100'
                        }`}>
                            {selectedProject?.status}
                        </span>
                    </span>
                    {selectedProject?.location && (
                        <span>
                            <span className="font-medium text-white">Location:</span>{' '}
                            {selectedProject.location}
                        </span>
                    )}
                    <span>
                        <span className="font-medium text-white">Projects:</span>{' '}
                        {projects.length} assigned
                    </span>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            {loadingStats ? (
                <div className="mt-8 text-center text-gray-400 py-10">Loading stats...</div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Customers */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Total Customers
                        </h3>
                        <p className="text-4xl font-bold text-green-600 mt-2">
                            {stats.totalCustomers || 0}
                        </p>
                    </div>

                    {/* Active */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Active
                        </h3>
                        <p className="text-4xl font-bold text-blue-600 mt-2">
                            {getStatusCount('active')}
                        </p>
                    </div>

                    {/* Converted */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Converted
                        </h3>
                        <p className="text-4xl font-bold text-purple-600 mt-2">
                            {getStatusCount('converted') + (stats.convertedLeads || 0)}
                        </p>
                        {stats.convertedLeads > 0 && (
                            <p className="text-xs text-purple-400 mt-1 font-medium">
                                {getStatusCount('converted')} customers + {stats.convertedLeads} CRM leads
                            </p>
                        )}
                    </div>

                    {/* Open Escalations */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Open Escalations
                        </h3>
                        <p className="text-4xl font-bold text-red-600 mt-2">
                            {stats.activeEscalations || 0}
                        </p>
                        <div className="mt-2 space-y-0.5">
                            {stats.openEscalations > 0 && (
                                <p className="text-xs text-red-400 font-medium">
                                    {stats.openEscalations} customer
                                </p>
                            )}
                            {stats.crmEscalations > 0 && (
                                <p className="text-xs text-orange-400 font-medium">
                                    {stats.crmEscalations} CRM / sales
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Invite Stats & Project Details ── */}
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Statistics</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Invites Sent</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.sentCount || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Invites Delivered</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.deliveredCount || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Invites Read</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.inviteStats?.readCount || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Project Name</p>
                            <p className="text-lg font-medium text-gray-900">
                                {selectedProject?.name}
                            </p>
                        </div>
                        {selectedProject?.location && (
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {selectedProject.location}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusBadgeClass(selectedProject?.status)}`}>
                                {selectedProject?.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Assigned Projects</p>
                            <p className="text-lg font-bold text-blue-600">{projects.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Builder Profile ── */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Builder Profile</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-lg font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-lg font-medium text-gray-900">{user?.role || 'Builder'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuilderDashboard;