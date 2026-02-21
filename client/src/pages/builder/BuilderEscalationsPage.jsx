import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const BuilderEscalationsPage = () => {
    const [escalations, setEscalations] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthStore();

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user]);

    useEffect(() => {
        if (selectedProject) {
            fetchEscalations();
        }
    }, [selectedProject, statusFilter, priorityFilter, currentPage]);

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

    const fetchEscalations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                projectId: selectedProject,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);

            const response = await apiClient.get(
                `/builder/escalations?${params}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setEscalations(response.data?.data?.escalations || []);
        } catch (error) {
            console.error('Failed to fetch escalations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            critical: 'bg-red-100 text-red-700',
            high: 'bg-orange-100 text-orange-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-blue-100 text-blue-700',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700',
            contacted: 'bg-yellow-100 text-yellow-700',
            site_visit: 'bg-teal-100 text-teal-700',
            qualified: 'bg-green-100 text-green-700',
            negotiating: 'bg-purple-100 text-purple-700',
            proposal_sent: 'bg-indigo-100 text-indigo-700',
            converted: 'bg-green-100 text-green-700',
            lost: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Escalations</h2>

            {/* Project Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Project
                </label>
                <select
                    value={selectedProject}
                    onChange={(e) => {
                        setSelectedProject(e.target.value);
                        setCurrentPage(1);
                    }}
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

            {/* Filters */}
            {selectedProject && (
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="site_visit">Site Visit</option>
                            <option value="qualified">Qualified</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="proposal_sent">Proposal Sent</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="">All Priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Escalations List */}
            {selectedProject && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : escalations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No escalations found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Stage
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Assigned To
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Escalated
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {escalations.map((escalation) => (
                                            <tr
                                                key={escalation._id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 text-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {escalation.referralId?.referrerName || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {escalation.referralId?.phoneNumber || '—'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                            escalation.status
                                                        )}`}
                                                    >
                                                        {escalation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                                            escalation.priority
                                                        )}`}
                                                    >
                                                        {escalation.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    Stage {escalation.escalationStage || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {escalation.assignedToId
                                                        ? `${escalation.assignedToId.firstName} ${escalation.assignedToId.lastName}`
                                                        : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {escalation.escalatedDate
                                                        ? new Date(escalation.escalatedDate).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuilderEscalationsPage;
