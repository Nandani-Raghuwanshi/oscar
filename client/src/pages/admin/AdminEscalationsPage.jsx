import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export const AdminEscalationsPage = () => {
    const [escalations, setEscalations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({ projectId: '', status: '', priority: '' });

    useEffect(() => {
        loadEscalations();
    }, [pagination.page, filters]);

    const loadEscalations = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const response = await apiClient.get('/admin/escalations', {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            setEscalations(response.data.data.escalations || []);
            setProjects(response.data.data.projects || []);
            setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load escalations');
            console.error('Error loading escalations:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Escalations - All Projects</h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={filters.projectId}
                        onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">All Projects</option>
                        {projects.map(project => (
                            <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="site_visit">Site Visit</option>
                        <option value="qualified">Qualified</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button
                        onClick={() => setFilters({ projectId: '', status: '', priority: '' })}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                    {error}
                </div>
            )}

            {/* Audit Logs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-600">Loading audit logs...</div>
                ) : logs.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">No audit logs found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {log.performedBy?.firstName} {log.performedBy?.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {log.performedBy?.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.targetUser && (
                                                    <div className="text-sm">
                                                        <div className="text-gray-900">
                                                            {log.targetUser.firstName} {log.targetUser.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {log.targetUser.email}
                                                        </div>
                                                    </div>
                                                )}
                                                {log.targetProject && (
                                                    <div className="text-sm text-gray-900">
                                                        Project: {log.targetProject.name}
                                                    </div>
                                                )}
                                                {!log.targetUser && !log.targetProject && (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {log.details && (
                                                    <div className="max-w-xs truncate">
                                                        {JSON.stringify(log.details)}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
