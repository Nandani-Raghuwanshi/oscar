import React from 'react';

/**
 * Timeline view of all interactions (calls, meetings, notes) for a referral
 * Displays chronological history with interaction details and word count
 */
const InteractionTimeline = ({ interactions = [], loading = false }) => {
    const getInteractionIcon = (type) => {
        const icons = {
            call: { emoji: '📞', bg: 'bg-blue-100', text: 'text-blue-700' },
            email: { emoji: '📧', bg: 'bg-purple-100', text: 'text-purple-700' },
            whatsapp: { emoji: '💬', bg: 'bg-green-100', text: 'text-green-700' },
            meeting: { emoji: '🤝', bg: 'bg-indigo-100', text: 'text-indigo-700' },
            site_visit: { emoji: '🏗️', bg: 'bg-orange-100', text: 'text-orange-700' },
            note: { emoji: '📝', bg: 'bg-gray-100', text: 'text-gray-700' }
        };
        return icons[type] || icons.note;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return formatDate(date);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!interactions || interactions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Interactions Yet
                </h3>
                <p className="text-sm text-gray-600">
                    Log your first call, meeting, or note to start tracking this referral.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Interaction Timeline
                </h3>
                <span className="text-sm text-gray-600">
                    {interactions.length} {interactions.length === 1 ? 'interaction' : 'interactions'}
                </span>
            </div>

            {/* Timeline Items */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                    {interactions.map((interaction, index) => {
                        const iconConfig = getInteractionIcon(interaction.interactionType);
                        const isLatest = index === 0;

                        return (
                            <div key={interaction._id} className="relative pl-12">
                                {/* Icon */}
                                <div className={`absolute left-0 w-10 h-10 rounded-full ${iconConfig.bg} ${iconConfig.text} flex items-center justify-center text-lg font-bold shadow-sm ${isLatest ? 'ring-4 ring-indigo-50' : ''}`}>
                                    {iconConfig.emoji}
                                </div>

                                {/* Content Card */}
                                <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${isLatest ? 'border-indigo-300 shadow-sm' : 'border-gray-200'}`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-semibold text-gray-900 capitalize">
                                                    {interaction.interactionType.replace('_', ' ')}
                                                </h4>
                                                {isLatest && (
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                                        Latest
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>
                                                    {formatDate(interaction.createdAt)} at {formatTime(interaction.createdAt)}
                                                </span>
                                                <span>•</span>
                                                <span>{getTimeAgo(interaction.createdAt)}</span>
                                                {interaction.duration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{interaction.duration} mins</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outcome */}
                                    {interaction.outcome && (
                                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">Outcome:</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {interaction.outcome}
                                            </p>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {interaction.notes && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-gray-600">Notes:</p>
                                                <span className="text-xs text-gray-500">
                                                    {interaction.wordCount || 0} words
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                {interaction.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Next Follow-up */}
                                    {interaction.nextFollowUpDate && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center text-xs">
                                                <span className="text-gray-600 mr-2">📅 Next follow-up:</span>
                                                <span className="font-medium text-indigo-600">
                                                    {formatDate(interaction.nextFollowUpDate)}
                                                </span>
                                                {new Date(interaction.nextFollowUpDate) < Date.now() && (
                                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sales Associate Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-700">
                                                    {interaction.salesAssociateId?.name?.[0]?.toUpperCase() || 'S'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                {interaction.salesAssociateId?.name || 'Unknown Associate'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Timeline Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Total Interactions</p>
                        <p className="text-lg font-bold text-gray-900">{interactions.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Calls Made</p>
                        <p className="text-lg font-bold text-blue-600">
                            {interactions.filter(i => i.interactionType === 'call').length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Site Visits</p>
                        <p className="text-lg font-bold text-orange-600">
                            {interactions.filter(i => i.interactionType === 'site_visit').length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Total Duration</p>
                        <p className="text-lg font-bold text-indigo-600">
                            {interactions.reduce((sum, i) => sum + (i.duration || 0), 0)} mins
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractionTimeline;
