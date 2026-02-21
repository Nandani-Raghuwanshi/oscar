import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../../store/authStore';

function CRMAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [referralAnalytics, setReferralAnalytics] = useState(null);
    const [pipelineAnalytics, setPipelineAnalytics] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
            if (user?.project) params.projectId = user.project;

            const [referralRes, pipelineRes, revenueRes] = await Promise.all([
                analyticsAPI.getReferralAnalytics(params),
                analyticsAPI.getSalesPipelineAnalytics(params),
                analyticsAPI.getRevenueAnalytics({ ...params, groupBy: 'month' })
            ]);

            setReferralAnalytics(referralRes.data.data);
            setPipelineAnalytics(pipelineRes.data.data);
            setRevenueData(revenueRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type, format) => {
        const params = { format, ...dateRange };
        if (user?.project) params.projectId = user.project;

        let url = '';
        switch (type) {
            case 'leads':
                url = analyticsAPI.exportLeads(params);
                break;
            case 'referrals':
                url = analyticsAPI.exportReferrals(params);
                break;
            case 'sales':
                url = analyticsAPI.exportAnalytics({ ...params, reportType: 'sales' });
                break;
            default:
                return;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_report_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">CRM Analytics</h1>
                <div className="flex gap-4 items-center">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <button
                        onClick={() => setDateRange({ startDate: '', endDate: '' })}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Referral Analytics */}
            {referralAnalytics && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Referral Performance by Status</h3>
                            <button
                                onClick={() => handleExport('referrals', 'csv')}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={referralAnalytics.byStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3B82F6" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Advocates */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Top Performing Advocates</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Advocate</th>
                                        <th className="text-left py-3 px-4">Total Referrals</th>
                                        <th className="text-left py-3 px-4">Converted</th>
                                        <th className="text-left py-3 px-4">Pending</th>
                                        <th className="text-left py-3 px-4">Conversion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referralAnalytics.topAdvocates.slice(0, 10).map((advocate, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{advocate.advocateName || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{advocate.advocateEmail}</div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">{advocate.totalReferrals}</td>
                                            <td className="py-3 px-4 text-green-600">{advocate.converted}</td>
                                            <td className="py-3 px-4 text-orange-600">{advocate.pending}</td>
                                            <td className="py-3 px-4 font-semibold">{advocate.conversionRate.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Pipeline Analytics */}
            {pipelineAnalytics && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Sales Pipeline by Status</h3>
                            <button
                                onClick={() => handleExport('leads', 'csv')}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={pipelineAnalytics.byStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#10B981" name="Lead Count" />
                                <Bar dataKey="totalValue" fill="#F59E0B" name="Total Value (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Top Sales Performers</h3>
                            <button
                                onClick={() => handleExport('sales', 'csv')}
                                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Sales Person</th>
                                        <th className="text-left py-3 px-4">Total Leads</th>
                                        <th className="text-left py-3 px-4">Converted</th>
                                        <th className="text-left py-3 px-4">Conversion Rate</th>
                                        <th className="text-left py-3 px-4">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pipelineAnalytics.topPerformers.slice(0, 10).map((performer, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{performer.userName || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{performer.userEmail}</div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">{performer.totalLeads}</td>
                                            <td className="py-3 px-4 text-green-600">{performer.converted}</td>
                                            <td className="py-3 px-4 font-semibold">{performer.conversionRate.toFixed(2)}%</td>
                                            <td className="py-3 px-4 font-semibold text-green-600">₹{performer.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Timeline */}
            {revenueData && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <div className="text-sm text-gray-600">Total Revenue</div>
                            <div className="text-2xl font-bold text-green-600 mt-1">₹{revenueData.summary.total.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Total Conversions</div>
                            <div className="text-2xl font-bold text-blue-600 mt-1">{revenueData.summary.count}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Average per Conversion</div>
                            <div className="text-2xl font-bold text-purple-600 mt-1">₹{revenueData.summary.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData.overTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id.month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="conversions" stroke="#3B82F6" strokeWidth={2} name="Conversions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default CRMAnalyticsPage;
