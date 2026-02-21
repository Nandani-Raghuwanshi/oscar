import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../../store/authStore';

function BuilderAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [overview, setOverview] = useState(null);
    const [projectAnalytics, setProjectAnalytics] = useState([]);
    const [revenueData, setRevenueData] = useState(null);
    const [roiData, setROIData] = useState(null);
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

            const [overviewRes, projectsRes, revenueRes, roiRes] = await Promise.all([
                analyticsAPI.getSystemOverview(params),
                analyticsAPI.getProjectAnalytics(params),
                analyticsAPI.getRevenueAnalytics({ ...params, groupBy: 'month' }),
                analyticsAPI.getROIAnalytics(params)
            ]);

            setOverview(overviewRes.data.data);
            setProjectAnalytics(projectsRes.data.data);
            setRevenueData(revenueRes.data.data);
            setROIData(roiRes.data.data);
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
            case 'customers':
                url = analyticsAPI.exportCustomers(params);
                break;
            case 'referrals':
                url = analyticsAPI.exportReferrals(params);
                break;
            case 'revenue':
                url = analyticsAPI.exportAnalytics({ ...params, reportType: 'revenue' });
                break;
            case 'roi':
                url = analyticsAPI.exportAnalytics({ ...params, reportType: 'roi' });
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
                <h1 className="text-3xl font-bold text-gray-900">Builder Analytics</h1>
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

            {/* Stats Grid */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Customers</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{overview.customers}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Referrals</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{overview.referrals}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">{overview.leads.conversionRate}%</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Revenue</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">₹{overview.revenue.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Revenue Chart */}
            {revenueData && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Revenue Over Time</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('revenue', 'csv')}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport('revenue', 'pdf')}
                                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                PDF
                            </button>
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

            {/* ROI Analysis */}
            {roiData && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">ROI Analysis</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('roi', 'csv')}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport('roi', 'pdf')}
                                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                PDF
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <div className="text-sm text-gray-600">Total Revenue</div>
                            <div className="text-2xl font-bold text-green-600 mt-1">₹{roiData.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Total Rewards</div>
                            <div className="text-2xl font-bold text-orange-600 mt-1">₹{roiData.totalRewards.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Net Profit</div>
                            <div className="text-2xl font-bold text-blue-600 mt-1">₹{roiData.netProfit.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-sm text-gray-600">ROI</div>
                            <div className="text-2xl font-bold text-purple-600 mt-1">{roiData.roi}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Profit Margin</div>
                            <div className="text-2xl font-bold text-indigo-600 mt-1">{roiData.profitMargin}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Avg per Conversion</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">₹{roiData.averageRevenuePerConversion}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Performance */}
            {projectAnalytics.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Project Performance Details</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('customers', 'csv')}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export Customers
                            </button>
                            <button
                                onClick={() => handleExport('referrals', 'csv')}
                                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Export Referrals
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Metric</th>
                                    <th className="text-left py-3 px-4">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectAnalytics[0] && (
                                    <>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Total Customers</td>
                                            <td className="py-3 px-4 font-semibold">{projectAnalytics[0].totalCustomers}</td>
                                        </tr>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Total Referrals</td>
                                            <td className="py-3 px-4 font-semibold">{projectAnalytics[0].totalReferrals}</td>
                                        </tr>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Total Leads</td>
                                            <td className="py-3 px-4 font-semibold">{projectAnalytics[0].totalLeads}</td>
                                        </tr>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Converted Leads</td>
                                            <td className="py-3 px-4 font-semibold text-green-600">{projectAnalytics[0].convertedLeads}</td>
                                        </tr>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Conversion Rate</td>
                                            <td className="py-3 px-4 font-semibold text-blue-600">{projectAnalytics[0].conversionRate.toFixed(2)}%</td>
                                        </tr>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">Total Revenue</td>
                                            <td className="py-3 px-4 font-semibold text-green-600">₹{projectAnalytics[0].revenue.toLocaleString()}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuilderAnalyticsPage;
