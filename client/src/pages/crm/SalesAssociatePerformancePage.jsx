import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { crmAPI } from '../../api/client';
import { StatsCard } from '../../components/crm';

const SalesAssociatePerformancePage = () => {
    const { user } = useAuthStore();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await crmAPI.getAssociatePerformance();
            setPerformance(response.data);
        } catch (err) {
            console.error('Error fetching performance:', err);
            setError(err.message || 'Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-6">
                <div className="mb-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={fetchPerformance}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        overall = {},
        thisMonth = {},
        interactions = {},
        payments = {}
    } = performance || {};

    return (
        <div className="py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
                <p className="text-gray-600 mt-2">Track your sales performance and metrics</p>
            </div>

            {/* Overall Performance */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Assigned"
                        value={overall.totalAssigned || 0}
                        icon="📋"
                        color="blue"
                        subtitle="All time"
                    />
                    <StatsCard
                        title="Total Converted"
                        value={overall.totalConverted || 0}
                        icon="✅"
                        color="green"
                        subtitle="Successful conversions"
                    />
                    <StatsCard
                        title="Conversion Rate"
                        value={`${overall.conversionRate || 0}%`}
                        icon="📊"
                        color="purple"
                        subtitle="Overall success rate"
                    />
                    <StatsCard
                        title="Total Revenue"
                        value={`$${overall.totalRevenue || 0}`}
                        icon="💰"
                        color="orange"
                        subtitle="From converted deals"
                    />
                </div>
            </div>

            {/* This Month Performance */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Assigned"
                        value={thisMonth.totalAssigned || 0}
                        icon="📥"
                        color="blue"
                        subtitle="New referrals"
                    />
                    <StatsCard
                        title="Contacted"
                        value={thisMonth.contacted || 0}
                        icon="📞"
                        color="cyan"
                        subtitle="Initial contact made"
                    />
                    <StatsCard
                        title="Converted"
                        value={thisMonth.converted || 0}
                        icon="🎉"
                        color="green"
                        subtitle="Closed deals"
                    />
                    <StatsCard
                        title="Revenue"
                        value={`$${thisMonth.totalRevenue || 0}`}
                        icon="💵"
                        color="emerald"
                        subtitle="This month"
                    />
                </div>
            </div>

            {/* Interactions Summary */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactions Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Interactions"
                        value={interactions.total || 0}
                        icon="💬"
                        color="purple"
                        subtitle="All interactions logged"
                    />
                    <StatsCard
                        title="Phone Calls"
                        value={interactions.calls || 0}
                        icon="📞"
                        color="blue"
                        subtitle="Call interactions"
                    />
                    <StatsCard
                        title="Site Visits"
                        value={interactions.siteVisits || 0}
                        icon="🏠"
                        color="green"
                        subtitle="In-person meetings"
                    />
                    <StatsCard
                        title="Avg. Per Referral"
                        value={(interactions.avgPerReferral || 0).toFixed(1)}
                        icon="📊"
                        color="orange"
                        subtitle="Interaction frequency"
                    />
                </div>
            </div>

            {/* Payments Summary */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payments Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Payments"
                        value={payments.count || 0}
                        icon="💳"
                        color="green"
                        subtitle="Payments processed"
                    />
                    <StatsCard
                        title="Total Amount"
                        value={`$${payments.totalAmount || 0}`}
                        icon="💰"
                        color="emerald"
                        subtitle="Revenue generated"
                    />
                    <StatsCard
                        title="Avg. Deal Size"
                        value={`$${payments.avgAmount || 0}`}
                        icon="📈"
                        color="blue"
                        subtitle="Average payment"
                    />
                    <StatsCard
                        title="This Month"
                        value={`$${payments.thisMonth || 0}`}
                        icon="📅"
                        color="purple"
                        subtitle="Current month"
                    />
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Pipeline Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-3xl font-bold text-yellow-600">{overall.statusBreakdown?.assigned || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Assigned</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-3xl font-bold text-blue-600">{overall.statusBreakdown?.contacted || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Contacted</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-3xl font-bold text-purple-600">{overall.statusBreakdown?.site_visit || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Site Visit</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-3xl font-bold text-indigo-600">{overall.statusBreakdown?.qualified || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Qualified</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-3xl font-bold text-orange-600">{overall.statusBreakdown?.booking || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Booking</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-3xl font-bold text-green-600">{overall.statusBreakdown?.converted || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Converted</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-3xl font-bold text-red-600">{overall.statusBreakdown?.dropped || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Dropped</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-gray-600">
                            {Object.values(overall.statusBreakdown || {}).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Total</p>
                    </div>
                </div>
            </div>

            {/* Performance Tips */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Performance Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Contact new referrals within 24 hours for best conversion rates</li>
                    <li>• Log detailed notes (50+ words) for each interaction to avoid escalations</li>
                    <li>• Schedule follow-ups to stay organized and never miss opportunities</li>
                    <li>• Site visits increase conversion rates by 40% - book them early!</li>
                    <li>• Qualified leads should move to booking within 7 days</li>
                </ul>
            </div>
        </div>
    );
};

export default SalesAssociatePerformancePage;
