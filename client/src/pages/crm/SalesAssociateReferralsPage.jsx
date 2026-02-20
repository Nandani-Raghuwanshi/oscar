import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { crmAPI } from '../../api/client';
import { CallLogModal, ReferralCard } from '../../components/crm';

const SalesAssociateReferralsPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });
    const [showCallLogModal, setShowCallLogModal] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [interactions, setInteractions] = useState({});

    useEffect(() => {
        fetchMyReferrals();
    }, [filters]);

    const fetchMyReferrals = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;

            const response = await crmAPI.getAssociateReferrals(params);
            setReferrals(response.data || []);
        } catch (err) {
            console.error('Error fetching referrals:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInteractionHistory = async (referralId) => {
        try {
            const response = await crmAPI.getInteractionHistory(referralId);
            setInteractions(prev => ({
                ...prev,
                [referralId]: response.data || []
            }));
        } catch (err) {
            console.error('Error fetching interactions:', err);
        }
    };

    const handleLogCall = (referral) => {
        setSelectedReferral(referral);
        setShowCallLogModal(true);
    };

    const handleCallLogSuccess = () => {
        setShowCallLogModal(false);
        setSelectedReferral(null);
        fetchMyReferrals();
    };

    const handleStatusUpdate = async (referralId, newStatus) => {
        try {
            await crmAPI.updateReferralStatus(referralId, { status: newStatus });
            fetchMyReferrals();
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-800',
            assigned: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            site_visit: 'bg-purple-100 text-purple-800',
            qualified: 'bg-indigo-100 text-indigo-800',
            booking: 'bg-orange-100 text-orange-800',
            converted: 'bg-green-100 text-green-800',
            dropped: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getNextStatus = (currentStatus) => {
        const flow = {
            assigned: 'contacted',
            contacted: 'site_visit',
            site_visit: 'qualified',
            qualified: 'booking',
            booking: 'converted'
        };
        return flow[currentStatus];
    };

    const activeFiltersCount = [filters.status, filters.search].filter(Boolean).length;

    return (
        <div className="py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Referrals</h1>
                <p className="text-gray-600 mt-2">Manage your assigned referrals</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Customer
                        </label>
                        <input
                            type="text"
                            placeholder="Name, phone, email..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="assigned">Assigned</option>
                            <option value="contacted">Contacted</option>
                            <option value="site_visit">Site Visit</option>
                            <option value="qualified">Qualified</option>
                            <option value="booking">Booking</option>
                            <option value="converted">Converted</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: '', search: '' })}
                            disabled={activeFiltersCount === 0}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            Clear Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{referrals.length}</span> referral{referrals.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Referrals List */}
            {loading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : referrals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-6xl mb-4">📭</p>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Referrals Found</h3>
                    <p className="text-gray-600">
                        {activeFiltersCount > 0 
                            ? 'Try adjusting your filters to see more results.'
                            : 'You have no assigned referrals at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {referrals.map(referral => (
                        <div key={referral._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Referral Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {referral.customer?.name || 'Unknown Customer'}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(referral.status)}`}>
                                                {referral.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            {referral.escalationFlag && (
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                    🚨 ESCALATED
                                                </span>
                                            )}
                                            {referral.isOverdue && (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                    ⏰ OVERDUE
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>📞 {referral.customer?.phone || 'N/A'}</span>
                                            <span>📧 {referral.customer?.email || 'N/A'}</span>
                                            <span>🏗️ {referral.project?.name || 'No Project'}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <span>Assigned {referral.daysSinceAssignment} days ago</span>
                                            {referral.lastInteractionAt && (
                                                <span className="ml-4">
                                                    Last contact: {new Date(referral.lastInteractionAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-6 bg-gray-50">
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleLogCall(referral)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                                    >
                                        📞 Log Call
                                    </button>

                                    {referral.status !== 'converted' && referral.status !== 'dropped' && getNextStatus(referral.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(referral._id, getNextStatus(referral.status))}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                                        >
                                            ✅ Move to {getNextStatus(referral.status).replace('_', ' ').toUpperCase()}
                                        </button>
                                    )}

                                    {referral.status === 'booking' && (
                                        <button
                                            onClick={() => navigate(`/crm/my-referrals/${referral._id}/payment`)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2"
                                        >
                                            💰 Mark Payment
                                        </button>
                                    )}

                                    {referral.status !== 'dropped' && referral.status !== 'converted' && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to mark this as dropped?')) {
                                                    handleStatusUpdate(referral._id, 'dropped');
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold flex items-center gap-2"
                                        >
                                            ❌ Mark as Dropped
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            fetchInteractionHistory(referral._id);
                                            // Toggle interaction history display
                                            const element = document.getElementById(`interactions-${referral._id}`);
                                            if (element) {
                                                element.classList.toggle('hidden');
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold flex items-center gap-2"
                                    >
                                        📝 View History
                                    </button>
                                </div>
                            </div>

                            {/* Interaction History (Collapsible) */}
                            <div id={`interactions-${referral._id}`} className="hidden p-6 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Interaction History</h4>
                                {interactions[referral._id] ? (
                                    interactions[referral._id].length === 0 ? (
                                        <p className="text-gray-600 text-sm">No interactions logged yet.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {interactions[referral._id].map((interaction, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">
                                                                {interaction.interactionType === 'call' ? '📞' : 
                                                                 interaction.interactionType === 'site_visit' ? '🏠' : 
                                                                 interaction.interactionType === 'email' ? '📧' : '💬'}
                                                            </span>
                                                            <span className="font-semibold text-gray-900 capitalize">
                                                                {interaction.interactionType.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(interaction.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 mb-2">
                                                        <strong>Outcome:</strong> {interaction.outcome}
                                                    </div>
                                                    {interaction.duration && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            Duration: {interaction.duration} minutes
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-700">
                                                        <strong>Notes:</strong> {interaction.notes}
                                                    </div>
                                                    {interaction.nextFollowUpDate && (
                                                        <div className="text-sm text-blue-600 mt-2">
                                                            Next follow-up: {new Date(interaction.nextFollowUpDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <p className="text-gray-600 text-sm">Click "View History" to load interactions.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Call Log Modal */}
            {showCallLogModal && selectedReferral && (
                <CallLogModal
                    referralId={selectedReferral._id}
                    customerName={selectedReferral.customer?.name}
                    onClose={() => {
                        setShowCallLogModal(false);
                        setSelectedReferral(null);
                    }}
                    onSuccess={handleCallLogSuccess}
                />
            )}
        </div>
    );
};

export default SalesAssociateReferralsPage;
