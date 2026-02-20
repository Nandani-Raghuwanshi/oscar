import React, { useEffect, useState } from 'react';
import { projectAPI, adminAPI } from '../../api/client';

export const AdminProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [builders, setBuilders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({ search: '', status: '' });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        builder: '',
        location: '',
        documentation: '',
        status: 'active'
    });

    useEffect(() => {
        loadProjects();
        loadBuilders();
    }, [pagination.page, filters]);

    const loadProjects = async () => {
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

            const response = await projectAPI.getProjects(params);
            setProjects(response.data.projects);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
            console.error('Error loading projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadBuilders = async () => {
        try {
            const response = await adminAPI.getUsers({ role: 'builder', limit: 100 });
            setBuilders(response.data.users);
        } catch (err) {
            console.error('Error loading builders:', err);
        }
    };

    const handleCreateProject = () => {
        setEditingProject(null);
        setFormData({
            name: '',
            description: '',
            builder: '',
            location: '',
            documentation: '',
            status: 'active'
        });
        setShowModal(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            builder: project.builder._id,
            location: project.location || '',
            documentation: project.documentation || '',
            status: project.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await projectAPI.updateProject(editingProject._id, formData);
            } else {
                await projectAPI.createProject(formData);
            }

            setShowModal(false);
            loadProjects();
        } catch (err) {
            alert(err.message || 'Failed to save project');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to deactivate this project?')) return;

        try {
            await projectAPI.deleteProject(projectId);
            loadProjects();
        } catch (err) {
            alert(err.message || 'Failed to delete project');
        }
    };

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
                <button
                    onClick={handleCreateProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Project
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button
                        onClick={() => setFilters({ search: '', status: '' })}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
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

            {/* Projects Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-600">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">No projects found</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {projects.map((project) => (
                                <div key={project._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>

                                    {project.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                                    )}

                                    {project.location && (
                                        <p className="text-sm text-gray-500 mb-2">
                                            📍 {project.location}
                                        </p>
                                    )}

                                    <div className="text-sm text-gray-500 mb-3">
                                        <span className="font-medium">Builder:</span> {project.builder?.firstName} {project.builder?.lastName}
                                    </div>

                                    <div className="flex space-x-2 pt-3 border-t">
                                        <button
                                            onClick={() => handleEditProject(project)}
                                            className="flex-1 text-blue-600 hover:text-blue-900 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project._id)}
                                            className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium"
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingProject ? 'Edit Project' : 'Create Project'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Builder *
                                </label>
                                <select
                                    required
                                    value={formData.builder}
                                    onChange={(e) => setFormData({ ...formData, builder: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Select Builder</option>
                                    {builders.map(builder => (
                                        <option key={builder._id} value={builder._id}>
                                            {builder.firstName} {builder.lastName} ({builder.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Documentation URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.documentation}
                                    onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status *
                                </label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingProject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
