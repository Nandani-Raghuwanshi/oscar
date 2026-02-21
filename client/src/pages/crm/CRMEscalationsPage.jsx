import { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { AlertTriangle, Clock, User, CheckCircle } from 'lucide-react';

const CRMEscalationsPage = () => {
    const [escalations, setEscalations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterPriority, setFilterPriority] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [selectedEscalation, setSelectedEscalation] = useState(null);
    const [resolution, setResolution] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);

    useEffect(() => {
        fetchEscalations();
    }, [filterPriority, filterStatus]);

    const fetchEscalations = async () => {
        try {
            setLoading(true);
            const response = await crmAPI.getEscalations({
                priority: filterPriority || undefined,
                status: filterStatus || undefined,
                limit: 100
            });
            setEscalations(response.data?.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch escalations');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolution.trim()) {
            setError('Resolution notes are required');
            return;
        }

        try {
            await crmAPI.resolveEscalation(selectedEscalation._id, { resolution });
            setShowResolveModal(false);
            setResolution('');
            setSelectedEscalation(null);
            fetchEscalations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resolve escalation');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'converted':
                return 'bg-green-100 text-green-800';
            case 'lost':
                return 'bg-gray-100 text-gray-800';
            case 'negotiating':
                return 'bg-purple-100 text-purple-800';
            case 'qualified':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getDaysSinceEscalation = (escalatedDate) => {
        const days = Math.floor((new Date() - new Date(escalatedDate)) / (1000 * 60 * 60 * 24));
        return days;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading escalations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Escalated Leads</h1>
                <p className="text-gray-600 mt-2">Manage and resolve escalated customer cases</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterPriority(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filterPriority === null
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        All Priorities
                    </button>
                    <button
                        onClick={() => setFilterPriority('critical')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filterPriority === 'critical'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Critical
                    </button>
                    <button
                        onClick={() => setFilterPriority('high')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filterPriority === 'high'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        High
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium">Total Escalations</p>
                            <p className="text-3xl font-bold text-red-900 mt-2">{escalations.length}</p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Critical Priority</p>
                            <p className="text-3xl font-bold text-orange-900 mt-2">
                                {escalations.filter((e) => e.priority === 'critical').length}
                            </p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-orange-400" />
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">High Priority</p>
                            <p className="text-3xl font-bold text-yellow-900 mt-2">
                                {escalations.filter((e) => e.priority === 'high').length}
                            </p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Avg Days Open</p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">
                                {escalations.length > 0
                                    ? Math.round(
                                        escalations.reduce(
                                            (sum, e) => sum + getDaysSinceEscalation(e.escalatedDate),
                                            0
                                        ) / escalations.length
                                    )
                                    : 0}
                            </p>
                        </div>
                        <Clock className="w-10 h-10 text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Escalations List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Stage
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Assigned To
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Days Open
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {escalations.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No escalations found
                                    </td>
                                </tr>
                            ) : (
                                escalations.map((escalation) => (
                                    <tr key={escalation._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {escalation.customerId?.name || escalation.referralId?.referrerName || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {escalation.customerId?.email || escalation.referralId?.referrerEmail || escalation.customerId?.phone || escalation.referralId?.referrerPhone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    Stage {escalation.escalationStage || 1}
                                                </span>
                                                {escalation.escalationHistory && escalation.escalationHistory.length > 0 && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {new Date(escalation.escalationHistory[escalation.escalationHistory.length - 1].triggeredAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block text-xs px-3 py-1 rounded-full border font-semibold ${getPriorityColor(
                                                    escalation.priority
                                                )}`}
                                            >
                                                {escalation.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block text-xs px-3 py-1 rounded-full font-semibold capitalize ${getStatusColor(
                                                    escalation.status
                                                )}`}
                                            >
                                                {escalation.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{escalation.escalationReason || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm text-gray-700">
                                                    {escalation.assignedToId?.name || escalation.assignedToId?.firstName || 'Unassigned'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {getDaysSinceEscalation(escalation.escalatedDate)} days
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedEscalation(escalation);
                                                    setShowResolveModal(true);
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                            >
                                                Resolve
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolve Modal */}
            {showResolveModal && selectedEscalation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Resolve Escalation</h2>
                                <p className="text-gray-600 mt-1">{selectedEscalation.customerId?.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowResolveModal(false);
                                    setResolution('');
                                    setSelectedEscalation(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Escalation Reason:</strong> {selectedEscalation.escalationReason}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Escalated:</strong>{' '}
                                    {new Date(selectedEscalation.escalatedDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Days Open:</strong> {getDaysSinceEscalation(selectedEscalation.escalatedDate)}
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resolution Notes <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                rows={6}
                                placeholder="Describe how this escalation was resolved, actions taken, and next steps..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleResolve}
                                disabled={!resolution.trim()}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${resolution.trim()
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark as Resolved
                            </button>
                            <button
                                onClick={() => {
                                    setShowResolveModal(false);
                                    setResolution('');
                                    setSelectedEscalation(null);
                                }}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMEscalationsPage;
