import React, { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import {
    AlertCircle,
    Clock,
    Phone,
    CheckCircle,
    FileText,
    TrendingUp,
    DollarSign,
    XCircle,
    User,
    Calendar,
    Filter,
    X,
    ArrowRight
} from 'lucide-react';

const STATUS_COLUMNS = [
    { key: 'pending', label: 'Pending', color: 'bg-gray-100 border-gray-300' },
    { key: 'new', label: 'New', color: 'bg-blue-100 border-blue-300' },
    { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 border-yellow-300' },
    { key: 'site_visit', label: 'Site Visit', color: 'bg-teal-100 border-teal-300' },
    { key: 'qualified', label: 'Qualified', color: 'bg-purple-100 border-purple-300' },
    { key: 'negotiating', label: 'Negotiating', color: 'bg-indigo-100 border-indigo-300' },
    { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-cyan-100 border-cyan-300' },
    { key: 'converted', label: 'Converted', color: 'bg-green-100 border-green-300' },
    { key: 'lost', label: 'Lost', color: 'bg-red-100 border-red-300' }
];

// Status Change Modal Component
const StatusChangeModal = ({
    showStatusChangeModal,
    newStatus,
    statusChangeNotes,
    wordCount,
    submittingStatus,
    onClose,
    onNotesChange,
    onSubmit
}) => {
    if (!showStatusChangeModal) return null;

    const isValid = wordCount >= 50;
    const wordCountColor = isValid ? 'text-green-600' : 'text-orange-600';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                        Change Status to: {STATUS_COLUMNS.find(col => col.key === newStatus)?.label}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Update Notes *
                        </label>
                        <textarea
                            value={statusChangeNotes}
                            onChange={onNotesChange}
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Provide detailed notes about this status change (minimum 50 words required)..."
                        />
                        <div className="mt-2 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Minimum 50 words required
                            </p>
                            <p className={`text-sm font-semibold ${wordCountColor}`}>
                                {wordCount} / 50
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!isValid || submittingStatus}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {submittingStatus ? 'Updating...' : 'Confirm Status Change'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CRMPipelinePage = () => {
    const [leads, setLeads] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterPriority, setFilterPriority] = useState('all');

    // Detail Modal State
    const [selectedLead, setSelectedLead] = useState(null);

    // Status Change Modal State
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusChangeNotes, setStatusChangeNotes] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [submittingStatus, setSubmittingStatus] = useState(false);

    const getCustomerDetails = (item) => {
        if (!item) {
            return { name: undefined, phone: undefined, email: undefined };
        }

        if (item.customerId && typeof item.customerId === 'object') {
            return {
                name: item.customerId.name,
                phone: item.customerId.phone,
                email: item.customerId.email
            };
        }

        const referral = item.referralId && typeof item.referralId === 'object' ? item.referralId : null;

        return {
            name: referral?.referrerName || item.referrerName || item.name,
            phone: referral?.referrerPhone || item.referrerPhone || item.phone,
            email: referral?.referrerEmail || item.referrerEmail || item.email
        };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [leadsResponse, referralsResponse] = await Promise.all([
                crmAPI.getLeads(),
                crmAPI.getReferrals()
            ]);

            // Extract data array from nested response structure: response.data.data
            const leadsData = Array.isArray(leadsResponse?.data?.data) ? leadsResponse.data.data : [];
            const referralsData = Array.isArray(referralsResponse?.data?.data) ? referralsResponse.data.data : [];

            setLeads(leadsData);
            setReferrals(referralsData);

            // Get IDs of referrals that have been assigned (exist as leads)
            const assignedReferralIds = new Set(
                leadsData
                    .filter(lead => lead.referralId)
                    .map(lead => typeof lead.referralId === 'object' ? lead.referralId._id : lead.referralId)
            );

            // Filter out referrals that have already been assigned to avoid duplicates
            const unassignedReferrals = referralsData.filter(
                ref => !assignedReferralIds.has(ref._id)
            );

            const combined = [
                ...leadsData.map(lead => ({ ...lead, type: 'lead' })),
                ...unassignedReferrals.map(ref => ({
                    ...ref,
                    type: 'referral',
                    status: ref.status || 'pending',
                    priority: ref.priority || 'normal'
                }))
            ];

            setAllItems(combined);
        } catch (err) {
            console.error('Failed to fetch pipeline data:', err);
            setError(err.message || 'Failed to load pipeline data');
        } finally {
            setLoading(false);
        }
    };

    const getLeadsByStatus = (status) => {
        let filtered = allItems.filter(item => item.status === status);

        if (filterPriority !== 'all') {
            filtered = filtered.filter(item => item.priority === filterPriority);
        }

        return filtered;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-300';
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-300';
            case 'normal':
                return 'text-blue-600 bg-blue-50 border-blue-300';
            case 'low':
                return 'text-gray-600 bg-gray-50 border-gray-300';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-300';
        }
    };

    const getStatusColor = (status) => {
        const column = STATUS_COLUMNS.find(col => col.key === status);
        return column ? column.color : 'bg-gray-100 border-gray-300';
    };

    const handleNotesChange = (e) => {
        const text = e.target.value;
        setStatusChangeNotes(text);

        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    };

    const initiateStatusChange = (status) => {
        setNewStatus(status);
        setStatusChangeNotes('');
        setWordCount(0);
        setShowStatusChangeModal(true);
    };

    const handleStatusChange = async () => {
        if (wordCount < 50) {
            return;
        }

        // Check if this is an unassigned referral (no assignedToId field)
        if (selectedLead.type === 'referral' && !selectedLead.assignedToId) {
            alert('This referral must be assigned to a sales associate before its status can be changed.');
            setShowStatusChangeModal(false);
            return;
        }

        try {
            setSubmittingStatus(true);

            await crmAPI.updateLeadStatus(selectedLead._id, {
                status: newStatus,
                notes: statusChangeNotes
            });

            await fetchData();

            setShowStatusChangeModal(false);
            setSelectedLead(null);
            setStatusChangeNotes('');
            setWordCount(0);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status: ' + (err.message || 'Unknown error'));
        } finally {
            setSubmittingStatus(false);
        }
    };

    const LeadDetailModal = () => {
        if (!selectedLead) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {selectedLead.type === 'lead' ? 'Lead' : 'Referral'} Details
                        </h3>
                        <button
                            onClick={() => setSelectedLead(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Customer Name</h4>
                                <p className="text-lg font-semibold text-gray-900">
                                    {getCustomerDetails(selectedLead).name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                                <p className="text-lg text-gray-900">
                                    {getCustomerDetails(selectedLead).phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                                <p className="text-lg text-gray-900">
                                    {getCustomerDetails(selectedLead).email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(selectedLead.priority)}`}>
                                    {selectedLead.priority || 'normal'}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Current Status</h4>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedLead.status)}`}>
                                    {selectedLead.status}
                                </span>
                            </div>
                        </div>

                        {selectedLead.projectId && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Project</h4>
                                <p className="text-gray-900">{selectedLead.projectId.name || 'N/A'}</p>
                            </div>
                        )}

                        {selectedLead.assignedToId && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h4>
                                <p className="text-gray-900">
                                    {selectedLead.assignedToId.name || selectedLead.assignedToId.email || 'N/A'}
                                </p>
                            </div>
                        )}

                        {selectedLead.notes && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedLead.notes}</p>
                            </div>
                        )}

                        {(selectedLead.type === 'lead' || selectedLead.assignedToId) ? (
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Status</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {STATUS_COLUMNS.map(column => (
                                        <button
                                            key={column.key}
                                            onClick={() => initiateStatusChange(column.key)}
                                            disabled={selectedLead.status === column.key}
                                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${column.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {column.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 pt-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This referral must be assigned to a sales associate before its status can be managed in the pipeline.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const LeadCard = ({ item }) => {
        const customerDetails = getCustomerDetails(item);
        const displayName = customerDetails.name || 'Unnamed';
        const displayPhone = customerDetails.phone;
        const assignedTo = item.assignedToId;

        return (
            <div
                onClick={() => setSelectedLead(item)}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
            >
                {/* Escalation Indicator */}
                {item.isEscalated && (
                    <div className="mb-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2 py-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className={`text-xs font-semibold ${
                            item.priority === 'critical' ? 'text-red-600' :
                            item.priority === 'high' ? 'text-orange-600' :
                            'text-yellow-600'
                        }`}>
                            {item.priority === 'critical' ? 'CRITICAL' :
                             item.priority === 'high' ? 'HIGH PRIORITY' :
                             'ESCALATED'}
                            {item.escalationStage ? ` (Stage ${item.escalationStage})` : ''}
                        </span>
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                        {displayName}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                        {item.priority || 'normal'}
                    </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                    {displayPhone && (
                        <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{displayPhone}</span>
                        </div>
                    )}
                    {item.projectId && (
                        <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{item.projectId.name || 'Project'}</span>
                        </div>
                    )}
                    {assignedTo && (
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{assignedTo.name || assignedTo.email}</span>
                        </div>
                    )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 italic">
                        {item.type === 'lead' ? 'Lead' : 'Referral'}
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading pipeline...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-900">Error Loading Pipeline</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">Priority:</span>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex gap-4 pb-4 min-w-full">
                    {STATUS_COLUMNS.map(column => {
                        const columnLeads = getLeadsByStatus(column.key);
                        return (
                            <div
                                key={column.key}
                                className="flex-shrink-0 w-80"
                            >
                                <div className={`rounded-lg border-2 ${column.color} p-4 h-full`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-900">{column.label}</h3>
                                        <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
                                            {columnLeads.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                        {columnLeads.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No items</p>
                                        ) : (
                                            columnLeads.map(item => (
                                                <LeadCard key={item._id} item={item} />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <LeadDetailModal />
            <StatusChangeModal
                showStatusChangeModal={showStatusChangeModal}
                newStatus={newStatus}
                statusChangeNotes={statusChangeNotes}
                wordCount={wordCount}
                submittingStatus={submittingStatus}
                onClose={() => setShowStatusChangeModal(false)}
                onNotesChange={handleNotesChange}
                onSubmit={handleStatusChange}
            />
        </div>
    );
};

export default CRMPipelinePage;