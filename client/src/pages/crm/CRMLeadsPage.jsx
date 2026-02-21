import { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { Phone, MessageSquare, Search } from 'lucide-react';

const CRMLeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [callLogs, setCallLogs] = useState([]);
    const [showCallForm, setShowCallForm] = useState(false);
    const [callData, setCallData] = useState({
        callType: 'outbound',
        outcome: 'completed',
        notes: '',
        sentiment: 'positive',
        callDuration: 0,
        purpose: []
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                const response = await crmAPI.getLeads({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search || undefined
                });

                const fetchedLeads = response.data?.data || [];
                setLeads(fetchedLeads);
                setPagination(prev => ({
                    ...prev,
                    total: response.data?.pagination?.total || 0
                }));
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch leads');
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [pagination.page, pagination.limit, search]);

    const handleSelectLead = async (lead) => {
        setSelectedLead(lead);
        await fetchCallLogs(lead._id);
    };

    const fetchCallLogs = async (leadId) => {
        try {
            const response = await crmAPI.getCallLogs(leadId, { limit: 50 });
            setCallLogs(response.data?.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogCall = async () => {
        if (!callData.notes.trim()) {
            setError('Notes are required');
            return;
        }

        try {
            await crmAPI.logCall({
                leadId: selectedLead._id,
                ...callData
            });
            await fetchCallLogs(selectedLead._id);
            setCallData({
                callType: 'outbound',
                outcome: 'completed',
                notes: '',
                sentiment: 'positive',
                callDuration: 0,
                purpose: []
            });
            setShowCallForm(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-gray-600 mt-2">Manage assigned leads, log calls, and track interactions</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads List */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned Leads</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : leads.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No leads found</div>
                    ) : (
                        <>
                            <div className="overflow-y-auto max-h-96">
                                {leads.map(lead => (
                                    <button
                                        key={lead._id}
                                        onClick={() => handleSelectLead(lead)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition ${selectedLead?._id === lead._id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">{lead.referralId?.referrerName || 'Unknown'}</p>
                                                <p className="text-xs text-gray-600 mt-1">{lead.referralId?.referrerEmail || lead.referralId?.referrerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                                    lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {lead.status}
                                            </span>
                                            {lead.priority && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        lead.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {lead.priority}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total > pagination.limit && (
                                <div className="p-3 border-t border-gray-200 flex gap-2">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={pagination.page * pagination.limit >= pagination.total}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Lead Details & Call Log */}
                <div className="lg:col-span-2">
                    {selectedLead ? (
                        <div className="space-y-6">
                            {/* Lead Details Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedLead.referralId?.referrerName}</h2>
                                        <p className="text-gray-600">{selectedLead.referralId?.referrerEmail}</p>
                                        <p className="text-gray-600">{selectedLead.referralId?.referrerPhone}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedLead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                            selectedLead.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedLead.priority} Priority
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">{selectedLead.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Contact</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedLead.lastContactDate
                                                ? new Date(selectedLead.lastContactDate).toLocaleDateString()
                                                : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Assigned To</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedLead.assignedToId?.firstName + " " + selectedLead.assignedToId?.lastName || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Source</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">
                                            {selectedLead.sourceAdvocateId?.firstName + " " + selectedLead.sourceAdvocateId?.lastName || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedLead.notes && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="text-sm text-gray-600 mb-2">Notes</p>
                                        <p className="text-gray-900">{selectedLead.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Call Log */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Call History</h3>
                                    <button
                                        onClick={() => setShowCallForm(!showCallForm)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Log Call</span>
                                    </button>
                                </div>

                                {/* Call Log Form */}
                                {showCallForm && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Call Type</label>
                                                    <select
                                                        value={callData.callType}
                                                        onChange={(e) => setCallData({ ...callData, callType: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option>outbound</option>
                                                        <option>inbound</option>
                                                        <option>video</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Outcome</label>
                                                    <select
                                                        value={callData.outcome}
                                                        onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option>completed</option>
                                                        <option>missed</option>
                                                        <option>declined</option>
                                                        <option>no_answer</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Duration (minutes)</label>
                                                    <input
                                                        type="number"
                                                        value={callData.callDuration}
                                                        onChange={(e) => setCallData({ ...callData, callDuration: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Sentiment</label>
                                                    <select
                                                        value={callData.sentiment}
                                                        onChange={(e) => setCallData({ ...callData, sentiment: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option>very_positive</option>
                                                        <option>positive</option>
                                                        <option>neutral</option>
                                                        <option>negative</option>
                                                        <option>very_negative</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Notes *</label>
                                                <textarea
                                                    value={callData.notes}
                                                    onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                                                    placeholder="Call summary and notes..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    rows="3"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleLogCall}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                                >
                                                    Log Call
                                                </button>
                                                <button
                                                    onClick={() => setShowCallForm(false)}
                                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Call Log List */}
                                {callLogs.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">No call logs yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {callLogs.map(call => (
                                            <div key={call._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{call.callType.toUpperCase()} Call</p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {new Date(call.callStartTime).toLocaleDateString()} at{' '}
                                                            {new Date(call.callStartTime).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${call.outcome === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {call.outcome}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 mb-2">{call.notes}</p>
                                                <div className="flex gap-4 text-xs text-gray-600">
                                                    <span>Duration: {call.callDuration}s</span>
                                                    <span>Sentiment: {call.sentiment}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">Select a lead to view details and log calls</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CRMLeadsPage;
