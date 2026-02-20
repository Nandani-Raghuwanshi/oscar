import React, { useEffect, useState } from 'react';
import { adminAPI, projectAPI } from '../../api/client';

export const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkResult, setBulkResult] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'project_advocate',
        projectId: '',
        isActive: true
    });

    useEffect(() => {
        loadUsers();
        loadProjects();
    }, [pagination.page, filters]);

    const loadUsers = async () => {
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

            const response = await adminAPI.getUsers(params);
            setUsers(response.data.users);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load users');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await projectAPI.getProjects({ limit: 100 });
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Error loading projects:', err);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            role: 'project_advocate',
            projectId: '',
            isActive: true
        });
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            password: '',
            role: user.role,
            projectId: user.projectId?._id || '',
            isActive: user.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };

            // Remove password if editing and password is empty
            if (editingUser && !submitData.password) {
                delete submitData.password;
            }

            // Remove projectId if empty
            if (!submitData.projectId) {
                delete submitData.projectId;
            }

            if (editingUser) {
                await adminAPI.updateUser(editingUser._id, submitData);
            } else {
                await adminAPI.createUser(submitData);
            }

            setShowModal(false);
            loadUsers();
        } catch (err) {
            alert(err.message || 'Failed to save user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;

        try {
            await adminAPI.deleteUser(userId);
            loadUsers();
        } catch (err) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) {
            alert('Please select a CSV file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', bulkFile);

            const response = await adminAPI.bulkImportUsers(formData);
            setBulkResult(response.data);
            setBulkFile(null);
            loadUsers();

            if (response.data.errors === 0) {
                setTimeout(() => {
                    setShowBulkUpload(false);
                    setBulkResult(null);
                }, 3000);
            }
        } catch (err) {
            alert(err.message || 'Failed to import users');
        }
    };

    const ROLES = [
        { value: 'admin', label: 'ADMIN' },
        { value: 'builder', label: 'BUILDER' },
        { value: 'crm_manager', label: 'CRM_MANAGER' },
        { value: 'sales_associate', label: 'SALES_ASSOCIATE' },
        { value: 'project_advocate', label: 'PROJECT_ADVOCATE' },
        { value: 'brand_advocate', label: 'BRAND_ADVOCATE' }
    ];

    const getRoleLabel = (roleValue) => {
        const role = ROLES.find(r => r.value === roleValue);
        return role ? role.label : roleValue;
    };

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Bulk Import
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Roles</option>
                        {ROLES.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.isActive}
                        onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <button
                        onClick={() => setFilters({ search: '', role: '', isActive: '' })}
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

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-600">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">No users found</div>
                ) : (
                    <>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingUser ? 'Edit User' : 'Create User'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!editingUser && '*'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role *
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project (Optional)
                                </label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">No Project</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                {projects.length === 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        No projects available. Projects can be assigned later.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="mr-2"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
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
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Bulk Import Users</h3>
                        <form onSubmit={handleBulkUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CSV File
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setBulkFile(e.target.files[0])}
                                    className="w-full border rounded px-3 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Required columns: firstName, lastName, email, phone, password, role
                                </p>
                            </div>

                            {bulkResult && (
                                <div className={`p-3 rounded ${bulkResult.errors === 0
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                    <p>Created: {bulkResult.created}</p>
                                    <p>Errors: {bulkResult.errors}</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBulkUpload(false);
                                        setBulkFile(null);
                                        setBulkResult(null);
                                    }}
                                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
