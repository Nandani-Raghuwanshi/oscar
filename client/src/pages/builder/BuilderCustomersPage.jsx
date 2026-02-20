import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

// Validation regex patterns
const VALIDATION_PATTERNS = {
    // E.164 format for phone (allows +country_code with 10-15 digits)
    phone: /^\+?[1-9]\d{1,14}(\s|\-|\(|\))*\d*$/,
    // Alternative: more permissive phone format
    phonePermissive: /^[\d\s\-\+\(\)]{7,}$/,
    // Standard email validation
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // More strict email
    emailStrict: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    // Customer name (2+ characters, letters/numbers/spaces/hyphens/apostrophes)
    name: /^[a-zA-Z0-9\s\-']{2,}$/,
    // Tags (alphanumeric and underscores)
    tag: /^[a-zA-Z0-9_]+$/,
};

/**
 * Customer Model Fields (from /server/src/models/Customer.js):
 * - projectId: ObjectId (required)
 * - builderId: ObjectId (required)
 * - name: String (required, trimmed)
 * - email: String (optional, lowercase, trimmed)
 * - phone: String (required, E.164 format for WhatsApp)
 * - status: enum['active', 'inactive', 'converted', 'blacklist'] (default: 'active')
 * - referralCode: String (unique, sparse, indexed)
 * - source: enum['csv_upload', 'manual', 'bulk_import'] (default: 'manual')
 * - tags: [String]
 * - notes: String
 * - inviteSentAt, inviteDeliveredAt, inviteReadAt: Date
 * - deletedAt: Date (for soft deletes)
 * - timestamps: createdAt, updatedAt (auto)
 */

const BuilderCustomersPage = () => {
    const [project, setProject] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [uploadFile, setUploadFile] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });
    const { user } = useAuthStore();

    const ITEMS_PER_PAGE = 20;

    // Fetch project on mount
    useEffect(() => {

        fetchProject();

    }, []);

    // Fetch customers when project is loaded or filters change
    useEffect(() => {
        if (project?._id) {
            fetchCustomers();
        }
    }, [project, searchTerm, statusFilter, currentPage]);

    const fetchProject = async () => {
        try {
            const response = await apiClient.get('/builder/projects', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProject(response.data?.project || null);
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                projectId: project._id,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);

            const response = await apiClient.get(`/builder/customers?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCustomers(response.data?.data?.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};

        // Validate name
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (!VALIDATION_PATTERNS.name.test(formData.name.trim())) {
            errors.name = 'Name must be at least 2 characters and contain only letters, numbers, spaces, hyphens, or apostrophes';
        }

        // Validate phone
        if (!formData.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!VALIDATION_PATTERNS.phonePermissive.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number (at least 7 digits)';
        }

        // Validate email if provided
        if (formData.email && !VALIDATION_PATTERNS.emailStrict.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Real-time validation helper (without blocking)
    const validateField = (fieldName, value) => {
        const errors = { ...formErrors };

        switch (fieldName) {
            case 'name':
                if (value && !VALIDATION_PATTERNS.name.test(value.trim())) {
                    errors.name = 'Name must be at least 2 characters';
                } else {
                    delete errors.name;
                }
                break;
            case 'phone':
                if (value && !VALIDATION_PATTERNS.phonePermissive.test(value)) {
                    errors.phone = 'Phone must have at least 7 digits';
                } else {
                    delete errors.phone;
                }
                break;
            case 'email':
                if (value && !VALIDATION_PATTERNS.emailStrict.test(value)) {
                    errors.email = 'Invalid email format';
                } else {
                    delete errors.email;
                }
                break;
            default:
                break;
        }

        setFormErrors(errors);
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await apiClient.post(
                '/builder/customers',
                {
                    projectId: project._id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    notes: formData.notes,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            alert('Customer added successfully!');
            setFormData({ name: '', phone: '', email: '', notes: '' });
            setFormErrors({});
            setShowAddModal(false);
            fetchCustomers();
        } catch (error) {
            console.error('Failed to add customer:', error);
            alert('Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSVTemplate = () => {
        const templateContent = 'name,phone,email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+0987654321,jane@example.com';
        const blob = new Blob([templateContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setLoading(true);
        const formDataObj = new FormData();
        formDataObj.append('file', uploadFile);
        formDataObj.append('projectId', project._id);

        try {
            // Step 1: Upload and parse CSV
            const uploadResponse = await apiClient.post(
                '/builder/customers-upload',
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            console.log('Upload response:', uploadResponse);

            // Show preview with validation
            // Handle both response structures: data.customers or data.data.customers
            const customers = uploadResponse.data?.customers || uploadResponse.data?.data?.customers || [];

            if (!customers || customers.length === 0) {
                alert('No valid data found in CSV file');
                return;
            }

            const previewWithValidation = customers.map((customer) => ({
                ...customer,
                validation: validateCustomerData(customer),
            }));

            setPreviewData(previewWithValidation);
            setShowUploadModal(false);
            setShowPreviewModal(true);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to parse CSV file: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Validate individual customer data
    const validateCustomerData = (customer) => {
        const errors = {};

        if (!customer.name || !VALIDATION_PATTERNS.name.test(customer.name.trim())) {
            errors.name = 'Invalid name';
        }

        if (!customer.phone || !VALIDATION_PATTERNS.phonePermissive.test(customer.phone)) {
            errors.phone = 'Invalid phone';
        }

        if (customer.email && !VALIDATION_PATTERNS.emailStrict.test(customer.email)) {
            errors.email = 'Invalid email';
        }

        return errors;
    };

    // Confirm import after preview
    const handleConfirmImport = async () => {
        setLoading(true);
        try {
            // Prepare customers for import (remove validation object)
            const customersToImport = previewData.map(({ validation, ...customer }) => customer);

            const importResponse = await apiClient.post(
                '/builder/customers-import',
                {
                    projectId: project._id,
                    customers: customersToImport,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            const importedCount = importResponse.data?.data?.count || importResponse.data?.count || previewData.length;
            alert(`Successfully imported ${importedCount} customers!`);

            // Reset states
            setUploadFile(null);
            setShowPreviewModal(false);
            setPreviewData([]);
            setLoading(false);

            // Reset pagination and filters - useEffect will auto-trigger to fetch data
            setSearchTerm('');
            setStatusFilter('');
            setCurrentPage(1);
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import customers: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await apiClient.delete(`/builder/customers/${customerId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                fetchCustomers();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete customer');
            }
        }
    };

    if (!project) {
        return <>loading..</>;
    }

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                    <p className="text-sm text-gray-600 mt-1">Project: {project.name}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Add Customer
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Upload CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="converted">Converted</option>
                        <option value="blacklist">Blacklist</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No customers found
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Invite Sent
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {customer.phone}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {customer.email || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : customer.status === 'converted'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : customer.status === 'inactive'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {customer.inviteSentAt ? '✓' : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() =>
                                                    handleDeleteCustomer(customer._id)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
                        <form onSubmit={handleAddCustomer}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        validateField('name', e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-4 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., John Doe"
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        validateField('phone', e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-4 py-2 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="+1 (555) 123-4567"
                                />
                                {formErrors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        validateField('email', e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-4 py-2 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="name@example.com"
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Additional notes"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ name: '', phone: '', email: '', notes: '' });
                                        setFormErrors({});
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Upload Customers CSV</h3>
                        <form onSubmit={handleFileUpload}>
                            <div className="mb-4">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    CSV must contain columns: name, phone, email
                                </p>
                                <button
                                    type="button"
                                    onClick={downloadCSVTemplate}
                                    className="text-blue-600 hover:text-blue-800 text-xs mt-2 underline"
                                >
                                    Download CSV Template
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!uploadFile || loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
                        <h3 className="text-lg font-semibold mb-4">
                            CSV Preview - {previewData.length} records
                        </h3>

                        {/* Summary Stats */}
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <div className="bg-green-50 p-3 rounded">
                                <p className="text-xs text-gray-600">Valid Records</p>
                                <p className="text-lg font-bold text-green-700">
                                    {previewData.length > 0 ? previewData.filter((c) => Object.keys(c.validation).length === 0).length : 0}
                                </p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                                <p className="text-xs text-gray-600">Invalid Records</p>
                                <p className="text-lg font-bold text-yellow-700">
                                    {previewData.length > 0 ? previewData.filter((c) => Object.keys(c.validation).length > 0).length : 0}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <p className="text-xs text-gray-600">Total</p>
                                <p className="text-lg font-bold text-blue-700">{previewData.length}</p>
                            </div>
                        </div>

                        {previewData.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
                                <p className="text-gray-500">No data to display. Please check your CSV file and try again.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">Phone</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((customer, idx) => {
                                            const hasErrors = Object.keys(customer.validation).length > 0;
                                            return (
                                                <tr
                                                    key={idx}
                                                    className={`border-b ${hasErrors
                                                        ? 'bg-red-50 hover:bg-red-100'
                                                        : 'bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-4 py-2">
                                                        {hasErrors ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                ✗ Error
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                ✓ Valid
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-2 ${customer.validation.name ? 'font-semibold text-red-600' : ''}`}>
                                                        {customer.name}
                                                        {customer.validation.name && (
                                                            <div className="text-xs text-red-500 mt-1">{customer.validation.name}</div>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-2 ${customer.validation.phone ? 'font-semibold text-red-600' : ''}`}>
                                                        {customer.phone}
                                                        {customer.validation.phone && (
                                                            <div className="text-xs text-red-500 mt-1">{customer.validation.phone}</div>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-2 ${customer.validation.email ? 'font-semibold text-red-600' : ''}`}>
                                                        {customer.email || '—'}
                                                        {customer.validation.email && (
                                                            <div className="text-xs text-red-500 mt-1">{customer.validation.email}</div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    setPreviewData([]);
                                    setUploadFile(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmImport}
                                disabled={loading || previewData.length === 0}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Importing...' : `Import All (${previewData.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuilderCustomersPage;
