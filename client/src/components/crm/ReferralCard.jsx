import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Referral card component displaying key information with status badges
 * Used in CRM referrals list, pipeline view, and search results
 */
const ReferralCard = ({ 
    referral, 
    onAssign, 
    onViewDetails, 
    showAssignButton = false,
    showAssignedTo = true,
    compact = false 
}) => {
    const statusConfig = {
        pending: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Pending' },
        assigned: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Assigned' },
        contacted: { color: 'bg-indigo-100 text-indigo-700 border-indigo-300', label: 'Contacted' },
        site_visit: { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Site Visit' },
        qualified: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Qualified' },
        booking: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Booking' },
        converted: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Converted' },
        dropped: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Dropped' }
    };

    const escalationConfig = {
        0: null,
        1: { color: 'bg-yellow-50 border-yellow-300', icon: '⚠️', label: 'Attention Needed' },
        2: { color: 'bg-orange-50 border-orange-300', icon: '🔔', label: 'Escalated' },
        3: { color: 'bg-red-50 border-red-300', icon: '🚨', label: 'Critical' }
    };

    const status = statusConfig[referral.status] || statusConfig.pending;
    const escalation = escalationConfig[referral.escalationLevel || 0];

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysAgo = (date) => {
        if (!date) return null;
        const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    if (compact) {
        return (
            <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${escalation ? escalation.color : ''}`}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {referral.customerName}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {referral.customerPhone} • {referral.customerEmail}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                        {status.label}
                    </span>
                </div>
                {escalation && (
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                        <span className="mr-1">{escalation.icon}</span>
                        <span>{escalation.label}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${escalation ? `border-l-4 ${escalation.color}` : 'border-gray-200'}`}>
            {/* Header with Status and Escalation */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {referral.customerName}
                        </h3>
                        {escalation && (
                            <span className="text-lg">{escalation.icon}</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {referral.customerPhone} • {referral.customerEmail}
                    </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p className="text-sm font-medium text-gray-900">
                        ₹{referral.estimatedBudget?.toLocaleString() || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Timeline</p>
                    <p className="text-sm font-medium text-gray-900">
                        {referral.expectedTimeline || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Project</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {referral.projectId?.name || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">
                        {getDaysAgo(referral.createdAt)}
                    </p>
                </div>
            </div>

            {/* Advocate Info */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Advocate</p>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                            {referral.advocateId?.name?.[0]?.toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {referral.advocateId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {referral.advocateId?.phone || ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Assigned Sales Associate */}
            {showAssignedTo && referral.assignedTo && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                                {referral.assignedTo?.name?.[0]?.toUpperCase() || 'S'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {referral.assignedTo?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Assigned {getDaysAgo(referral.assignedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalation Warning */}
            {escalation && (
                <div className={`mb-4 p-3 rounded-lg ${escalation.color} border`}>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                        {escalation.icon} {escalation.label}
                    </p>
                    {referral.escalationReason && (
                        <p className="text-xs text-gray-600">{referral.escalationReason}</p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onViewDetails?.(referral)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    View Details
                </button>
                {showAssignButton && !referral.assignedTo && (
                    <button
                        onClick={() => onAssign?.(referral)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Assign
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReferralCard;
