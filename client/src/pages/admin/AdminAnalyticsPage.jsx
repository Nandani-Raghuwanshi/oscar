import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [overview, setOverview] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState([]);
    const [projectAnalytics, setProjectAnalytics] = useState([]);
    const [revenueData, setRevenueData] = useState(null);
    const [roiData, setROIData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const [overviewRes, usersRes, projectsRes, revenueRes, roiRes] = await Promise.all([
                analyticsAPI.getSystemOverview(params),
                analyticsAPI.getUserAnalytics(params),
                analyticsAPI.getProjectAnalytics(params),
                analyticsAPI.getRevenueAnalytics({ ...params, groupBy: 'month' }),
                analyticsAPI.getROIAnalytics(params)
            ]);

            setOverview(overviewRes.data.data);
            setUserAnalytics(usersRes.data.data);
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
        let url = '';

        switch (type) {
            case 'users':
                url = analyticsAPI.exportUsers(params);
                break;
            case 'projects':
                url = analyticsAPI.exportAnalytics({ ...params, reportType: 'project' });
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

        // Create temporary link and trigger download
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
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
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

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'users', 'projects', 'revenue', 'roi'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && overview && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Users</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{overview.users.total}</div>
                            <div className="text-sm text-green-600 mt-2">{overview.users.active} active</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Active Projects</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{overview.projects.active}</div>
                            <div className="text-sm text-gray-500 mt-2">of {overview.projects.total} total</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Customers</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{overview.customers}</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Referrals</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{overview.referrals}</div>
                        </div>
                    </div>

                    {/* Leads & Revenue */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Lead Performance</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Leads</span>
                                    <span className="font-semibold">{overview.leads.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Converted</span>
                                    <span className="font-semibold text-green-600">{overview.leads.converted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Conversion Rate</span>
                                    <span className="font-semibold text-blue-600">{overview.leads.conversionRate}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Total Revenue</h3>
                            <div className="text-4xl font-bold text-green-600 mt-6">
                                ₹{overview.revenue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">User Analytics</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('users', 'csv')}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('users', 'pdf')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userAnalytics}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {userAnalytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Total</th>
                                    <th className="text-left py-3 px-4">Active</th>
                                    <th className="text-left py-3 px-4">Inactive</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userAnalytics.map((user, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 capitalize">{user._id}</td>
                                        <td className="py-3 px-4">{user.count}</td>
                                        <td className="py-3 px-4 text-green-600">{user.active}</td>
                                        <td className="py-3 px-4 text-red-600">{user.inactive}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Project Performance</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('projects', 'csv')}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('projects', 'pdf')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Project</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Customers</th>
                                    <th className="text-left py-3 px-4">Referrals</th>
                                    <th className="text-left py-3 px-4">Leads</th>
                                    <th className="text-left py-3 px-4">Converted</th>
                                    <th className="text-left py-3 px-4">Conv. Rate</th>
                                    <th className="text-left py-3 px-4">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectAnalytics.map((project, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{project.name}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{project.totalCustomers}</td>
                                        <td className="py-3 px-4">{project.totalReferrals}</td>
                                        <td className="py-3 px-4">{project.totalLeads}</td>
                                        <td className="py-3 px-4 text-green-600">{project.convertedLeads}</td>
                                        <td className="py-3 px-4">{project.conversionRate.toFixed(2)}%</td>
                                        <td className="py-3 px-4 font-semibold">₹{project.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && revenueData && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('revenue', 'csv')}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('revenue', 'pdf')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Revenue</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">
                                ₹{revenueData.summary.total.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Conversions</div>
                            <div className="text-3xl font-bold text-blue-600 mt-2">
                                {revenueData.summary.count}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Average per Conversion</div>
                            <div className="text-3xl font-bold text-purple-600 mt-2">
                                ₹{revenueData.summary.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={revenueData.overTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id.month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalRevenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                                <Line type="monotone" dataKey="conversions" stroke="#3B82F6" strokeWidth={2} name="Conversions" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ROI Tab */}
            {activeTab === 'roi' && roiData && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">ROI Analysis</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('roi', 'csv')}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('roi', 'pdf')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Revenue</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">
                                ₹{roiData.totalRevenue.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Rewards</div>
                            <div className="text-3xl font-bold text-orange-600 mt-2">
                                ₹{roiData.totalRewards.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Net Profit</div>
                            <div className="text-3xl font-bold text-blue-600 mt-2">
                                ₹{roiData.netProfit.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">ROI</div>
                            <div className="text-3xl font-bold text-purple-600 mt-2">
                                {roiData.roi}%
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Profit Margin</div>
                            <div className="text-3xl font-bold text-indigo-600 mt-2">
                                {roiData.profitMargin}%
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Conversions</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">
                                {roiData.conversions}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Revenue vs Rewards Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { name: 'Revenue', value: roiData.totalRevenue },
                                { name: 'Rewards', value: roiData.totalRewards },
                                { name: 'Net Profit', value: roiData.netProfit }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAnalyticsPage;
