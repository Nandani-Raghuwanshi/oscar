import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmAPI } from '../../api/client';
import { ReferralCard } from '../../components/crm';

const CRMPipelinePage = () => {
    const navigate = useNavigate();
    const [pipelineData, setPipelineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');

    const pipelineStages = [
        { key: 'pending', label: 'Pending', color: 'bg-gray-100 border-gray-300', icon: '📋' },
        { key: 'assigned', label: 'Assigned', color: 'bg-blue-100 border-blue-300', icon: '👤' },
        { key: 'contacted', label: 'Contacted', color: 'bg-indigo-100 border-indigo-300', icon: '📞' },
        { key: 'site_visit', label: 'Site Visit', color: 'bg-purple-100 border-purple-300', icon: '🏗️' },
        { key: 'qualified', label: 'Qualified', color: 'bg-yellow-100 border-yellow-300', icon: '✓' },
        { key: 'booking', label: 'Booking', color: 'bg-orange-100 border-orange-300', icon: '📝' },
        { key: 'converted', label: 'Converted', color: 'bg-green-100 border-green-300', icon: '✅' },
        { key: 'dropped', label: 'Dropped', color: 'bg-red-100 border-red-300', icon: '❌' }
    ];

    useEffect(() => {
        fetchPipelineData();
    }, [selectedProject]);

    const fetchPipelineData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedProject) params.projectId = selectedProject;

            const response = await crmAPI.getPipelineData(params);
            setPipelineData(response.data || {});
        } catch (err) {
            console.error('Error fetching pipeline data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (referral) => {
        navigate(`/crm/referrals/${referral._id}`);
    };

    const getTotalCount = () => {
        if (!pipelineData) return 0;
        return Object.values(pipelineData).reduce((sum, stage) => sum + (stage?.referrals?.length || 0), 0);
    };

    const getStagePercentage = (stageCount) => {
        const total = getTotalCount();
        return total > 0 ? ((stageCount / total) * 100).toFixed(1) : 0;
    };

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
                    <p className="text-gray-600 mt-1">Kanban view of all referrals by status</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchPipelineData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            {!loading && pipelineData && (
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {pipelineStages.map(stage => {
                            const stageData = pipelineData[stage.key];
                            const count = stageData?.referrals?.length || 0;
                            const percentage = getStagePercentage(count);

                            return (
                                <div key={stage.key} className={`p-4 rounded-lg border-2 ${stage.color}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl">{stage.icon}</span>
                                        <span className="text-xs text-gray-600">{percentage}%</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{count}</p>
                                    <p className="text-xs text-gray-600 font-medium">{stage.label}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Total Referrals in Pipeline: <span className="font-bold text-gray-900">{getTotalCount()}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            {loading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {pipelineStages.map(stage => (
                        <div key={stage.key} className="flex-shrink-0 w-80">
                            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {pipelineStages.map(stage => {
                        const stageData = pipelineData[stage.key];
                        const referrals = stageData?.referrals || [];

                        return (
                            <div key={stage.key} className="flex-shrink-0 w-80">
                                {/* Column Header */}
                                <div className={`${stage.color} border-2 rounded-t-lg p-4 sticky top-0 z-10`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{stage.icon}</span>
                                            <h3 className="font-bold text-gray-900">{stage.label}</h3>
                                        </div>
                                        <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-900">
                                            {referrals.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className="bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg p-4 min-h-[600px] max-h-[800px] overflow-y-auto">
                                    {referrals.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-4xl mb-2 opacity-50">{stage.icon}</div>
                                            <p className="text-sm text-gray-500">No referrals</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {referrals.map(referral => (
                                                <div
                                                    key={referral._id}
                                                    onClick={() => handleViewDetails(referral)}
                                                    className="cursor-pointer"
                                                >
                                                    <ReferralCard
                                                        referral={referral}
                                                        onViewDetails={handleViewDetails}
                                                        compact={false}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">📋 Pending → 👤 Assigned</h4>
                        <p className="text-sm text-gray-600">Referrals awaiting CRM Manager assignment to sales associates</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">👤 Assigned → 📞 Contacted</h4>
                        <p className="text-sm text-gray-600">Sales associate makes first contact with customer</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">📞 Contacted → 🏗️ Site Visit</h4>
                        <p className="text-sm text-gray-600">Customer shows interest, site visit scheduled</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">🏗️ Site Visit → ✓ Qualified</h4>
                        <p className="text-sm text-gray-600">Customer visited site and shows serious buying intent</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">✓ Qualified → 📝 Booking</h4>
                        <p className="text-sm text-gray-600">Customer ready to book, documentation in progress</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">📝 Booking → ✅ Converted</h4>
                        <p className="text-sm text-gray-600">Payment received, deal closed successfully</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">❌ Dropped</h4>
                        <p className="text-sm text-gray-600">Lead not interested or unresponsive (can occur at any stage)</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <h4 className="font-semibold text-gray-900 mb-2">⚠️ Auto-Escalation</h4>
                        <p className="text-sm text-gray-600">Triggers at 24h (warning), 48h (escalate), 72h (auto-drop)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMPipelinePage;