import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmAPI } from '../../api/client';
import { ReferralCard, AssignmentDropdown } from '../../components/crm';

const CRMReferralsPage = () => {
    const navigate = useNavigate();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        status: '',
        assignedTo: '',
        escalation: '',
        search: ''
    });

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'site_visit', label: 'Site Visit' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'booking', label: 'Booking' },
        { value: 'converted', label: 'Converted' },
        { value: 'dropped', label: 'Dropped' }
    ];

    const escalationOptions = [
        { value: '', label: 'All Escalations' },
        { value: '0', label: 'No Escalation' },
        { value: '1', label: 'Warning (24hrs)' },
        { value: '2', label: 'Escalated (48hrs)' },
        { value: '3', label: 'Critical (72hrs)' }
    ];

    useEffect(() => {
        fetchReferrals();
    }, [filters]);

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.assignedTo) params.assignedTo = filters.assignedTo;
            if (filters.escalation !== '') params.escalationLevel = filters.escalation;
            if (filters.search) params.search = filters.search;

            const response = await crmAPI.getReferrals(params);
            setReferrals(response.data || []);
        } catch (err) {
            console.error('Error fetching referrals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSuccess = (result) => {
        setShowAssignModal(false);
        setSelectedReferral(null);
        fetchReferrals(); // Refresh list
    };

    const handleViewDetails = (referral) => {
        navigate(`/crm/referrals/${referral._id}`);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ status: '', assignedTo: '', escalation: '', search: '' });
    };

    const hasActiveFilters = filters.status || filters.assignedTo || filters.escalation !== '' || filters.search;

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Master Referrals List</h1>
                    <p className="text-gray-600 mt-1">Manage and assign referrals to sales associates</p>
                </div>
                <button
                    onClick={fetchReferrals}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Customer name, phone, email..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Escalation Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Escalation</label>
                        <select
                            value={filters.escalation}
                            onChange={(e) => handleFilterChange('escalation', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {escalationOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {filters.status && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                    Status: {statusOptions.find(o => o.value === filters.status)?.label}
                                </span>
                            )}
                            {filters.escalation !== '' && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                                    {escalationOptions.find(o => o.value === filters.escalation)?.label}
                                </span>
                            )}
                            {filters.search && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                    Search: "{filters.search}"
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                    {loading ? 'Loading...' : `${referrals.length} ${referrals.length === 1 ? 'referral' : 'referrals'} found`}
                </p>
            </div>

            {/* Referrals List */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : referrals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Referrals Found</h3>
                    <p className="text-gray-600 mb-6">
                        {hasActiveFilters 
                            ? 'Try adjusting your filters to see more results.' 
                            : 'No referrals available at the moment.'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {referrals.map(referral => (
                        <ReferralCard
                            key={referral._id}
                            referral={referral}
                            onViewDetails={handleViewDetails}
                            onAssign={(ref) => {
                                setSelectedReferral(ref);
                                setShowAssignModal(true);
                            }}
                            showAssignButton={true}
                            showAssignedTo={true}
                        />
                    ))}
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && selectedReferral && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Assign Referral</h2>
                                <p className="text-sm text-indigo-100 mt-1">
                                    {selectedReferral.customerName} • {selectedReferral.customerPhone}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedReferral(null);
                                }}
                                className="text-white hover:text-indigo-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <AssignmentDropdown
                                referral={selectedReferral}
                                onAssignSuccess={handleAssignSuccess}
                                mode={selectedReferral.assignedTo ? 'reassign' : 'assign'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMReferralsPage;
