import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const BuilderEscalationsPage = () => {
    const [escalations, setEscalations] = useState([]);
    const [crmEscalations, setCrmEscalations] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [crmLoading, setCrmLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [crmPage, setCrmPage] = useState(1);
    const [activeTab, setActiveTab] = useState('customer');
    const { user } = useAuthStore();

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        // user?.id OR user?._id — support both shapes
        if (user) {
            fetchProjects();
        }
    }, [user]);

    useEffect(() => {
        if (!selectedProject) return;
        if (activeTab === 'customer') {
            fetchEscalations();
        } else {
            fetchCrmEscalations();
        }
    }, [selectedProject, statusFilter, priorityFilter, currentPage, crmPage, activeTab]);

    const fetchProjects = async () => {
        try {
            // NOTE: apiClient interceptor already returns response.data,
            // so the actual shape here is { success, message, data: { projects, project } }
            const res = await apiClient.get('/builder/projects');
            const projectList = res?.data?.projects || [];

            if (projectList.length > 0) {
                setProjects(projectList);
                setSelectedProject(projectList[0]._id);
            } else {
                // fallback for older single-project shape
                const single = res?.data?.project;
                if (single) {
                    setProjects([single]);
                    setSelectedProject(single._id);
                }
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

            // apiClient interceptor returns response.data already
            const res = await apiClient.get(`/builder/escalations?${params}`);
            setEscalations(res?.data?.escalations || []);
        } catch (error) {
            console.error('Failed to fetch escalations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCrmEscalations = async () => {
        setCrmLoading(true);
        try {
            const params = new URLSearchParams({
                projectId: selectedProject,
                page: crmPage,
                limit: ITEMS_PER_PAGE,
            });
            if (priorityFilter) params.append('priority', priorityFilter);

            const res = await apiClient.get(`/builder/crm-escalations?${params}`);
            setCrmEscalations(res?.data?.escalations || []);
        } catch (error) {
            console.error('Failed to fetch CRM escalations:', error);
        } finally {
            setCrmLoading(false);
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
            open: 'bg-red-100 text-red-700',
            in_progress: 'bg-yellow-100 text-yellow-700',
            resolved: 'bg-green-100 text-green-700',
            closed: 'bg-gray-100 text-gray-700',
            new: 'bg-blue-100 text-blue-700',
            contacted: 'bg-indigo-100 text-indigo-700',
            site_visit: 'bg-purple-100 text-purple-700',
            qualified: 'bg-teal-100 text-teal-700',
            negotiating: 'bg-orange-100 text-orange-700',
            proposal_sent: 'bg-yellow-100 text-yellow-700',
            converted: 'bg-green-100 text-green-700',
            lost: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const selectedProjectName = projects.find((p) => p._id === selectedProject)?.name || '';

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Escalations</h2>

            {/* Project Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                {projects.length === 0 ? (
                    <p className="text-sm text-gray-500">No projects found. Please contact your administrator.</p>
                ) : (
                    <select
                        value={selectedProject}
                        onChange={(e) => {
                            setSelectedProject(e.target.value);
                            setCurrentPage(1);
                            setCrmPage(1);
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
                )}
            </div>

            {selectedProject && (
                <>
                    {/* Tabs */}
                    <div className="mb-4 border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => { setActiveTab('customer'); setCurrentPage(1); }}
                                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'customer'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Customer Escalations
                            </button>
                            <button
                                onClick={() => { setActiveTab('crm'); setCrmPage(1); }}
                                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'crm'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                CRM / Sales Escalations
                            </button>
                        </nav>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {activeTab === 'customer' && (
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            )}
                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    setCurrentPage(1);
                                    setCrmPage(1);
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

                    {/* CUSTOMER ESCALATIONS */}
                    {activeTab === 'customer' && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : escalations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No customer escalations found for <strong>{selectedProjectName}</strong>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {escalations.map((esc) => (
                                                    <tr key={esc._id} className="border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm">
                                                            <p className="font-medium text-gray-900">{esc.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {esc.description?.substring(0, 60)}...
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {esc.customerId?.name || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(esc.priority)}`}>
                                                                {esc.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(esc.status)}`}>
                                                                {esc.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {new Date(esc.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-600">Page {currentPage}</span>
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={escalations.length < ITEMS_PER_PAGE}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* CRM / SALES ESCALATIONS */}
                    {activeTab === 'crm' && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
                                <p className="text-sm text-orange-700 font-medium">
                                    Leads escalated by CRM / Sales team for <strong>{selectedProjectName}</strong>
                                </p>
                            </div>
                            {crmLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : crmEscalations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No CRM escalations found for <strong>{selectedProjectName}</strong>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lead / Referrer</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assigned To (CRM)</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pipeline Status</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Escalation Reason</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Escalated On</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {crmEscalations.map((lead) => (
                                                    <tr key={lead._id} className="border-b border-gray-200 hover:bg-orange-50">
                                                        <td className="px-6 py-4 text-sm">
                                                            <p className="font-medium text-gray-900">
                                                                {lead.referralId?.referrerName || '—'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {lead.referralId?.referrerPhone || lead.referralId?.referrerEmail || ''}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {lead.assignedToId
                                                                ? `${lead.assignedToId.firstName} ${lead.assignedToId.lastName}`
                                                                : <span className="text-gray-400 italic">Unassigned</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                                                {lead.status?.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                                                                {lead.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                            <p className="truncate" title={lead.escalationReason}>
                                                                {lead.escalationReason || '—'}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {lead.escalatedDate
                                                                ? new Date(lead.escalatedDate).toLocaleDateString()
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                        <button
                                            onClick={() => setCrmPage(Math.max(1, crmPage - 1))}
                                            disabled={crmPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-600">Page {crmPage}</span>
                                        <button
                                            onClick={() => setCrmPage(crmPage + 1)}
                                            disabled={crmEscalations.length < ITEMS_PER_PAGE}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BuilderEscalationsPage;
