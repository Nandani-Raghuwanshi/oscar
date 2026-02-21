import { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { Search, CheckSquare, Square, User, Calendar } from 'lucide-react';
import AssignReferralModal from '../../components/crm/AssignReferralModal';

const CRMReferralsPage = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [selectedReferrals, setSelectedReferrals] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                setLoading(true);
                const response = await crmAPI.getReferrals({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search || undefined
                });

                const fetchedReferrals = response.data?.data || [];
                setReferrals(fetchedReferrals);
                setPagination(prev => ({
                    ...prev,
                    total: response.data?.pagination?.total || 0
                }));
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch referrals');
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, [pagination.page, pagination.limit, search]);

    const handleToggleReferral = (referralId) => {
        setSelectedReferrals(prev => {
            if (prev.includes(referralId)) {
                return prev.filter(id => id !== referralId);
            } else {
                return [...prev, referralId];
            }
        });
    };

    const handleToggleAll = () => {
        const unassignedReferralIds = referrals
            .filter(ref => !ref.assignedToId)
            .map(ref => ref._id);

        if (selectedReferrals.length === unassignedReferralIds.length) {
            setSelectedReferrals([]);
        } else {
            setSelectedReferrals(unassignedReferralIds);
        }
    };

    const handleAssignComplete = async () => {
        setSelectedReferrals([]);
        setSelectedReferral(null);
        // Refresh the data
        const response = await crmAPI.getReferrals({
            page: pagination.page,
            limit: pagination.limit,
            search: search || undefined
        });

        const fetchedReferrals = response.data?.data || [];
        setReferrals(fetchedReferrals);
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Referrals Management</h1>
                <p className="text-gray-600 mt-2">Review and assign new referrals to sales associates</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Assignment Action Bar */}
            {selectedReferrals.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                            {selectedReferrals.length} referral{selectedReferrals.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedReferrals([])}
                            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Assign to Sales Associate
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Referrals List */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Referrals</h2>
                            {referrals.filter(ref => !ref.assignedToId).length > 0 && (
                                <button
                                    onClick={handleToggleAll}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    {selectedReferrals.length === referrals.filter(ref => !ref.assignedToId).length ? (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            <span>Deselect All</span>
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-4 h-4" />
                                            <span>Select All</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search referrals..."
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
                    ) : referrals.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No referrals found</div>
                    ) : (
                        <>
                            <div className="overflow-y-auto max-h-96">
                                {referrals.map(referral => (
                                    <div
                                        key={referral._id}
                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition ${selectedReferral?._id === referral._id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        {/* Checkbox for unassigned referrals */}
                                        {!referral.assignedToId && (
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedReferrals.includes(referral._id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleReferral(referral._id);
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setSelectedReferral(referral)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{referral.referrerName || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{referral.referrerEmail || referral.referrerPhone}</p>
                                                </div>
                                                {!referral.assignedToId && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${referral.status === 'converted' ? 'bg-green-100 text-green-800' :
                                                        referral.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                                                            referral.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                                referral.status === 'lost' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {referral.status}
                                                </span>
                                                {referral.advocateId && (
                                                    <span className="text-xs text-gray-500">
                                                        by {referral.advocateId.firstName} {referral.advocateId.lastName}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    </div>
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

                {/* Referral Details */}
                <div className="lg:col-span-2">
                    {selectedReferral ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedReferral.referrerName}</h2>
                                    <p className="text-gray-600">{selectedReferral.referrerEmail}</p>
                                    <p className="text-gray-600">{selectedReferral.referrerPhone}</p>
                                </div>
                                {!selectedReferral.assignedToId && (
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                        Unassigned
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedReferral.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created Date</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(selectedReferral.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {selectedReferral.assignedToId && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Assigned To</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedReferral.assignedToId.firstName} {selectedReferral.assignedToId.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{selectedReferral.assignedToId.email}</p>
                                        <p className="text-sm text-gray-500">{selectedReferral.assignedToId.phone}</p>
                                    </div>
                                )}
                                {selectedReferral.advocateId && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Referred By</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedReferral.advocateId.firstName} {selectedReferral.advocateId.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{selectedReferral.advocateId.email}</p>
                                    </div>
                                )}
                            </div>

                            {selectedReferral.notes && (
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm text-gray-600 mb-2">Notes</p>
                                    <p className="text-gray-900">{selectedReferral.notes}</p>
                                </div>
                            )}

                            {!selectedReferral.assignedToId && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setSelectedReferrals([selectedReferral._id]);
                                            setShowAssignModal(true);
                                        }}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Assign to Sales Associate
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">Select a referral to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Referral Modal */}
            <AssignReferralModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                selectedReferrals={selectedReferrals}
                onAssignComplete={handleAssignComplete}
            />
        </div>
    );
};

export default CRMReferralsPage;