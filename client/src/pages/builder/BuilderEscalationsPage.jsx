import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const BuilderEscalationsPage = () => {
    const [escalations, setEscalations] = useState([]);
    const [escalationsByProject, setEscalationsByProject] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const { user } = useAuthStore();

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user]);

    useEffect(() => {
        fetchEscalations();
    }, [selectedProject, statusFilter, priorityFilter, currentPage]);

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/builder/projects', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const projectsList = response.data?.data?.projects || [];
            setProjects(projectsList);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchEscalations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            
            if (selectedProject && selectedProject !== 'all') {
                params.append('projectId', selectedProject);
            }
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);

            const response = await apiClient.get(
                `/builder/escalations?${params}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            
            setEscalations(response.data?.data?.escalations || []);
            setEscalationsByProject(response.data?.data?.escalationsByProject || []);
            setPagination(response.data?.data?.pagination || {});
        } catch (error) {
            console.error('Failed to fetch escalations:', error);
            setEscalations([]);
            setEscalationsByProject([]);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 border-red-300',
            high: 'bg-orange-100 text-orange-700 border-orange-300',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            low: 'bg-blue-100 text-blue-700 border-blue-300',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700',
            contacted: 'bg-yellow-100 text-yellow-700',
            site_visit: 'bg-teal-100 text-teal-700',
            qualified: 'bg-green-100 text-green-700',
            negotiating: 'bg-purple-100 text-purple-700',
            proposal_sent: 'bg-indigo-100 text-indigo-700',
            converted: 'bg-green-200 text-green-800',
            lost: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCustomerName = (escalation) => {
        if (escalation.referralId?.referrerName) {
            return escalation.referralId.referrerName;
        }
        if (escalation.sourceAdvocateId) {
            return `${escalation.sourceAdvocateId.firstName || ''} ${escalation.sourceAdvocateId.lastName || ''}`.trim() || 'Unknown';
        }
        return 'Unknown Customer';
    };

    return (
        <div className="py-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Critical Escalations</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Leads escalated to Builder (Stage 2 - Critical Priority)
                </p>
            </div>

            {/* Project Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Project
                </label>
                <select
                    value={selectedProject}
                    onChange={(e) => {
                        setSelectedProject(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All Projects</option>
                    {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="site_visit">Site Visit</option>
                            <option value="qualified">Qualified</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="proposal_sent">Proposal Sent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Escalations Display - Project-wise grouping */}
            {loading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2">Loading escalations...</p>
                </div>
            ) : selectedProject === 'all' && escalationsByProject.length > 0 ? (
                // Group view - show by project
                <div className="space-y-6">
                    {escalationsByProject.map((projectGroup) => (
                        <div key={projectGroup.projectId} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {projectGroup.projectName}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {projectGroup.escalations.length} escalation{projectGroup.escalations.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stage
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Escalated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned To
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {projectGroup.escalations.map((escalation) => (
                                            <tr key={escalation._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getCustomerName(escalation)}
                                                        </div>
                                                        {escalation.referralId?.referrerPhone && (
                                                            <div className="text-xs text-gray-500">
                                                                {escalation.referralId.referrerPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(escalation.status)}`}>
                                                        {escalation.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 ${getPriorityColor(escalation.priority)}`}>
                                                        {escalation.priority?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        Stage {escalation.escalationStage}
                                                    </div>
                                                    {escalation.escalationRuleId?.ruleName && (
                                                        <div className="text-xs text-gray-500">
                                                            {escalation.escalationRuleId.ruleName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(escalation.escalatedDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {escalation.assignedToId 
                                                        ? `${escalation.assignedToId.firstName} ${escalation.assignedToId.lastName}`
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : escalations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No escalations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No critical escalations found for the selected filters.
                    </p>
                </div>
            ) : (
                // Single project or filtered view
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Escalated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {escalations.map((escalation) => (
                                    <tr key={escalation._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getCustomerName(escalation)}
                                                </div>
                                                {escalation.referralId?.referrerPhone && (
                                                    <div className="text-xs text-gray-500">
                                                        {escalation.referralId.referrerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {escalation.projectId?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(escalation.status)}`}>
                                                {escalation.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 ${getPriorityColor(escalation.priority)}`}>
                                                {escalation.priority?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                Stage {escalation.escalationStage}
                                            </div>
                                            {escalation.escalationRuleId?.ruleName && (
                                                <div className="text-xs text-gray-500">
                                                    {escalation.escalationRuleId.ruleName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(escalation.escalatedDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {escalation.assignedToId 
                                                ? `${escalation.assignedToId.firstName} ${escalation.assignedToId.lastName}`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span> of{' '}
                                <span className="font-medium">{pagination.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600">
                                    Page {currentPage} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                                    disabled={currentPage >= pagination.pages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuilderEscalationsPage;
