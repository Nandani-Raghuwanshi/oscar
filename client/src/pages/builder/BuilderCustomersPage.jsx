import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import AddCustomerModal from '../../components/customers/AddCustomerModal';
import UploadCSVModal from '../../components/customers/UploadCSVModal';
import PreviewCSVModal from '../../components/customers/PreviewCSVModal';
import CustomersTable from '../../components/customers/CustomersTable';

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
    const [dbCustomers, setDbCustomers] = useState([]); // Customers fetched from DB
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [csvPreviewData, setCSVPreviewData] = useState([]); // CSV preview data

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
            console.log('Fetched customers:', response.data);
            setDbCustomers(response.data?.customers || []);

            const paginationData = response.data?.pagination || {};
            setPagination({
                total: paginationData.total || 0,
                pages: paginationData.pages || 1,
                limit: paginationData.limit || ITEMS_PER_PAGE,
            });
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomerSuccess = () => {
        setShowAddModal(false);
        fetchCustomers();
    };

    const handleUploadPreview = (previewData) => {
        setCSVPreviewData(previewData);
        setShowUploadModal(false);
        setShowPreviewModal(true);
    };

    const handleImportSuccess = () => {
        setShowPreviewModal(false);
        setCSVPreviewData([]);
        setSearchTerm('');
        setStatusFilter('');
        setCurrentPage(1);
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
        return <div className="py-6">Loading...</div>;
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
         
            <CustomersTable
                customers={dbCustomers}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onDelete={handleDeleteCustomer}
            />

            {/* Modals */}
            {showAddModal && (
                <AddCustomerModal
                    projectId={project._id}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddCustomerSuccess}
                />
            )}

            {showUploadModal && (
                <UploadCSVModal
                    projectId={project._id}
                    onClose={() => setShowUploadModal(false)}
                    onPreview={handleUploadPreview}
                />
            )}

            {showPreviewModal && (
                <PreviewCSVModal
                    projectId={project._id}
                    previewData={csvPreviewData}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setCSVPreviewData([]);
                    }}
                    onSuccess={handleImportSuccess}
                />
            )}
        </div>
    );
};

export default BuilderCustomersPage;
