import { useState, useEffect } from 'react';
import { X, User, Users } from 'lucide-react';
import { crmAPI } from '../../api/client';

const AssignReferralModal = ({ isOpen, onClose, selectedReferrals, onAssignComplete }) => {
    const [salesAssociates, setSalesAssociates] = useState([]);
    const [selectedAssociate, setSelectedAssociate] = useState('');
    const [assignmentMode, setAssignmentMode] = useState('manual'); // 'manual' or 'auto'
    const [autoStrategy, setAutoStrategy] = useState('round-robin'); // 'round-robin' or 'load-balanced'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchSalesAssociates();
        }
    }, [isOpen]);

    const fetchSalesAssociates = async () => {
        try {
            const response = await crmAPI.getSalesAssociates();
            setSalesAssociates(response.data?.data || []);
        } catch (err) {
            setError('Failed to fetch sales associates');
        }
    };

    const handleAssign = async () => {
        if (assignmentMode === 'manual' && !selectedAssociate) {
            setError('Please select a sales associate');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (assignmentMode === 'manual') {
                // Assign all selected referrals to the selected associate
                await Promise.all(
                    selectedReferrals.map(referralId =>
                        crmAPI.assignReferral(referralId, {
                            assignedToId: selectedAssociate,
                            notes: 'Manually assigned by CRM manager',
                        })
                    )
                );
            } else {
                // Auto-split using batch assignment
                await crmAPI.batchAssignReferrals({
                    referralIds: selectedReferrals,
                    assignmentStrategy: autoStrategy
                });
            }

            onAssignComplete();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to assign referrals');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Assign Referrals ({selectedReferrals.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Assignment Mode Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Assignment Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAssignmentMode('manual')}
                                className={`p-4 border-2 rounded-lg transition flex items-center gap-3 ${assignmentMode === 'manual'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">Manual Assignment</div>
                                    <div className="text-xs text-gray-600">Assign to specific associate</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setAssignmentMode('auto')}
                                className={`p-4 border-2 rounded-lg transition flex items-center gap-3 ${assignmentMode === 'auto'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">Auto-Split</div>
                                    <div className="text-xs text-gray-600">Distribute automatically</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Manual Assignment - Select Associate */}
                    {assignmentMode === 'manual' && (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Select Sales Associate
                            </label>
                            <select
                                value={selectedAssociate}
                                onChange={(e) => setSelectedAssociate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose an associate...</option>
                                {salesAssociates.map(associate => (
                                    <option key={associate._id} value={associate._id}>
                                        {associate.firstName} {associate.lastName} - {associate.assignedCount} active leads
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Auto Assignment - Strategy Selection */}
                    {assignmentMode === 'auto' && (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Assignment Strategy
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="round-robin"
                                        checked={autoStrategy === 'round-robin'}
                                        onChange={(e) => setAutoStrategy(e.target.value)}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Round-Robin</div>
                                        <div className="text-sm text-gray-600">
                                            Distribute evenly in rotation among all sales associates
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="load-balanced"
                                        checked={autoStrategy === 'load-balanced'}
                                        onChange={(e) => setAutoStrategy(e.target.value)}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Load-Balanced</div>
                                        <div className="text-sm text-gray-600">
                                            Assign to associates with the fewest active leads
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Sales Associates Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Available Sales Associates</h3>
                        {salesAssociates.length === 0 ? (
                            <p className="text-sm text-gray-600">No sales associates found. Please create one first.</p>
                        ) : (
                            <div className="space-y-2">
                                {salesAssociates.map(associate => (
                                    <div
                                        key={associate._id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-gray-900">
                                            {associate.firstName} {associate.lastName}
                                        </span>
                                        <span className="text-gray-600">
                                            {associate.assignedCount} active leads
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || salesAssociates.length === 0 || (assignmentMode === 'manual' && !selectedAssociate)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Assigning...' : `Assign ${selectedReferrals.length} Referral${selectedReferrals.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignReferralModal;
