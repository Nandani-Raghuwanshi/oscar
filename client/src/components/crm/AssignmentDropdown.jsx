import React, { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';

/**
 * Dropdown component for assigning/reassigning referrals to sales associates
 * Used by CRM Managers to distribute leads
 */
const AssignmentDropdown = ({ 
    referral, 
    onAssignSuccess, 
    mode = 'assign', // 'assign' or 'reassign'
    className = '' 
}) => {
    const [salesAssociates, setSalesAssociates] = useState([]);
    const [selectedAssociate, setSelectedAssociate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingAssociates, setFetchingAssociates] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSalesAssociates();
    }, []);

    const fetchSalesAssociates = async () => {
        setFetchingAssociates(true);
        try {
            const response = await crmAPI.getSalesAssociates({ 
                status: 'active',
                sortBy: 'assignmentCount',
                sortOrder: 'asc' 
            });
            setSalesAssociates(response.data || []);
        } catch (err) {
            console.error('Error fetching sales associates:', err);
            setError('Failed to load sales associates');
        } finally {
            setFetchingAssociates(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedAssociate) {
            setError('Please select a sales associate');
            return;
        }

        if (mode === 'reassign' && !reason.trim()) {
            setError('Please provide a reason for reassignment');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (mode === 'assign') {
                await crmAPI.assignReferral(referral._id, { 
                    salesAssociateId: selectedAssociate 
                });
                onAssignSuccess?.({ 
                    message: 'Referral assigned successfully',
                    referralId: referral._id,
                    assignedTo: selectedAssociate
                });
            } else {
                await crmAPI.reassignReferral(referral._id, { 
                    newSalesAssociateId: selectedAssociate,
                    reason: reason.trim()
                });
                onAssignSuccess?.({ 
                    message: 'Referral reassigned successfully',
                    referralId: referral._id,
                    reassignedTo: selectedAssociate
                });
            }

            // Reset form
            setSelectedAssociate('');
            setReason('');
            setShowReasonInput(false);
        } catch (err) {
            console.error(`Error ${mode === 'assign' ? 'assigning' : 'reassigning'} referral:`, err);
            setError(err.message || `Failed to ${mode} referral`);
        } finally {
            setLoading(false);
        }
    };

    const getAssociateWorkload = (associate) => {
        const total = associate.stats?.assignedCount || 0;
        if (total === 0) return { label: 'Available', color: 'text-green-600' };
        if (total < 10) return { label: `${total} leads`, color: 'text-blue-600' };
        if (total < 20) return { label: `${total} leads`, color: 'text-yellow-600' };
        return { label: `${total} leads (busy)`, color: 'text-red-600' };
    };

    if (fetchingAssociates) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === 'assign' ? 'Assign to Sales Associate' : 'Reassign to Different Sales Associate'}
                </label>
                <select
                    value={selectedAssociate}
                    onChange={(e) => {
                        setSelectedAssociate(e.target.value);
                        setError('');
                        if (mode === 'reassign') setShowReasonInput(true);
                    }}
                    disabled={loading || salesAssociates.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Select sales associate...</option>
                    {salesAssociates.map(associate => {
                        const workload = getAssociateWorkload(associate);
                        return (
                            <option 
                                key={associate._id} 
                                value={associate._id}
                                disabled={mode === 'reassign' && associate._id === referral.assignedTo?._id}
                            >
                                {associate.name} - {workload.label} ({associate.stats?.conversionRate || 0}% conv.)
                            </option>
                        );
                    })}
                </select>

                {salesAssociates.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        No sales associates available. Please add sales associates first.
                    </p>
                )}
            </div>

            {/* Reassignment Reason */}
            {mode === 'reassign' && showReasonInput && (
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Reassignment *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError('');
                        }}
                        rows="2"
                        placeholder="e.g., Previous associate not responsive, workload balancing, associate on leave..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>
            )}

            {/* Selected Associate Info */}
            {selectedAssociate && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                        const associate = salesAssociates.find(a => a._id === selectedAssociate);
                        if (!associate) return null;
                        
                        const workload = getAssociateWorkload(associate);
                        return (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {associate.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {associate.email} • {associate.phone}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${workload.color}`}>
                                        {workload.label}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {associate.stats?.conversionRate || 0}% conversion
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleAssign}
                disabled={loading || !selectedAssociate || (mode === 'reassign' && !reason.trim())}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {mode === 'assign' ? 'Assigning...' : 'Reassigning...'}
                    </>
                ) : (
                    <>
                        {mode === 'assign' ? '✓ Assign Referral' : '🔄 Reassign Referral'}
                    </>
                )}
            </button>

            {/* Workload Summary */}
            {salesAssociates.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Team Workload:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {salesAssociates.slice(0, 5).map(associate => {
                            const workload = getAssociateWorkload(associate);
                            return (
                                <div 
                                    key={associate._id}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs"
                                >
                                    <span className="font-medium">{associate.name.split(' ')[0]}</span>
                                    <span className={`ml-1 ${workload.color}`}>
                                        ({associate.stats?.assignedCount || 0})
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDropdown;
