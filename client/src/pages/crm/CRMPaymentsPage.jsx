import { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CRMPaymentsPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentSummary();
    }, []);

    const fetchPaymentSummary = async () => {
        try {
            setLoading(true);
            const response = await crmAPI.getPaymentSummary();
            setSummary(response.data?.data || null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch payment summary');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        pending: '#FFA500',
        partial: '#FFFF00',
        completed: '#22C55E',
        failed: '#EF4444',
        refunded: '#9CA3AF'
    };

    const pieData = summary
        ? Object.entries(summary.byStatus).map(([status, data]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: data.count,
            amount: data.amount
        }))
        : [];

    const barData = summary
        ? Object.entries(summary.byStatus).map(([status, data]) => ({
            status: status.charAt(0).toUpperCase() + status.slice(1),
            amount: data.amount
        }))
        : [];

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading payment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Payment Tracking</h1>
                <p className="text-gray-600 mt-2">Monitor revenue and payment statuses</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-900 mt-2">
                                ₹{summary?.totalRevenue?.toLocaleString() || 0}
                            </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-600 text-sm font-medium">Completed</p>
                            <p className="text-2xl font-bold text-emerald-900 mt-2">
                                ₹{summary?.byStatus?.completed?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                                {summary?.byStatus?.completed?.count || 0} payments
                            </p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">Partial</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-2">
                                ₹{summary?.byStatus?.partial?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                {summary?.byStatus?.partial?.count || 0} payments
                            </p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Pending</p>
                            <p className="text-2xl font-bold text-orange-900 mt-2">
                                ₹{summary?.byStatus?.pending?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                                {summary?.byStatus?.pending?.count || 0} payments
                            </p>
                        </div>
                        <Clock className="w-10 h-10 text-orange-400" />
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium">Failed</p>
                            <p className="text-2xl font-bold text-red-900 mt-2">
                                ₹{summary?.byStatus?.failed?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                {summary?.byStatus?.failed?.count || 0} payments
                            </p>
                        </div>
                        <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.name.toLowerCase()] || '#8884d8'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            <Bar dataKey="amount" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Lead ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!summary?.recentPayments || summary.recentPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No recent payments found
                                    </td>
                                </tr>
                            ) : (
                                summary.recentPayments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                            {payment.leadId.toString().slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            ₹{payment.amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                            {payment.method || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${payment.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : payment.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : payment.status === 'failed'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CRMPaymentsPage;