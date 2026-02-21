import { useState, useEffect } from 'react';
import { crmAPI } from '../api/client';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, AlertCircle, Phone, Calendar, ArrowRight } from 'lucide-react';

const CRMDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        summary: null,
        advocates: [],
        recentLeads: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setDashboardData(prev => ({ ...prev, loading: true }));

                const [summaryRes, advocatesRes, leadsRes] = await Promise.all([
                    crmAPI.getReferralSummary(),
                    crmAPI.getAdvocates({ limit: 5 }),
                    crmAPI.getLeads({ limit: 10, sort: '-createdAt' })
                ]);

                setDashboardData({
                    summary: summaryRes.data,
                    advocates: advocatesRes.data?.data || [],
                    recentLeads: leadsRes.data?.data || [],
                    loading: false,
                    error: null
                });
            } catch (error) {
                setDashboardData(prev => ({ ...prev, error: error.message, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    if (dashboardData.loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-2xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    const statusData = dashboardData.summary?.byStatus
        ? Object.entries(dashboardData.summary.byStatus).map(([status, count]) => ({
            name: status?.charAt(0).toUpperCase() + status?.slice(1),
            value: count
        }))
        : [];

    const priorityData = dashboardData.summary?.byPriority
        ? Object.entries(dashboardData.summary.byPriority).map(([priority, count]) => ({
            name: priority?.charAt(0).toUpperCase() + priority?.slice(1),
            value: count
        }))
        : [];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">CRM Dashboard</h1>
                    <p className="text-gray-600 mt-2">Sales pipeline and performance overview</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Leads</p>
                                <p className="text-3xl font-bold text-gray-900">{dashboardData.summary?.total || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Escalated</p>
                                <p className="text-3xl font-bold text-red-600">{dashboardData.summary?.escalated || 0}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Active Advocates</p>
                                <p className="text-3xl font-bold text-green-600">{dashboardData.advocates?.length || 0}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Converted</p>
                                <p className="text-3xl font-bold text-purple-600">{dashboardData.summary?.byStatus?.converted || 0}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Lead Status Distribution</h3>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No data available</p>
                        )}
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Priority Breakdown</h3>
                        {priorityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={priorityData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No data available</p>
                        )}
                    </div>
                </div>

                {/* Top Advocates & Recent Leads */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Advocates */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Advocates</h3>
                        {dashboardData.advocates.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.advocates.map(advocate => (
                                    <div key={advocate._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-900">{advocate.name}</p>
                                            <p className="text-sm text-gray-500">{advocate.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">{advocate.referralCount || 0} referrals</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-600">{advocate.leadCount || 0}</p>
                                            <p className="text-xs text-gray-500">Leads</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No advocates yet</p>
                        )}
                    </div>

                    {/* Recent Leads */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Leads</h3>
                        {dashboardData.recentLeads.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.recentLeads.slice(0, 5).map(lead => (
                                    <div key={lead._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-900">{lead.customerId?.name || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">{lead.status}</p>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {lead.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No leads yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;
