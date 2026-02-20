import React, { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { StatsCard } from '../../components/crm';

const CRMPaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        paymentMethod: '',
        search: ''
    });

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'processed', label: 'Processed' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' }
    ];

    const paymentMethodOptions = [
        { value: '', label: 'All Methods' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'upi', label: 'UPI' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'cash', label: 'Cash' },
        { value: 'online', label: 'Online Payment' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        fetchPayments();
    }, [filters]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
            if (filters.search) params.search = filters.search;

            const response = await crmAPI.getPayments(params);
            setPayments(response.data?.payments || []);
            setSummary(response.data?.summary || null);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            processing: 'bg-blue-100 text-blue-700 border-blue-300',
            processed: 'bg-indigo-100 text-indigo-700 border-indigo-300',
            completed: 'bg-green-100 text-green-700 border-green-300',
            failed: 'bg-red-100 text-red-700 border-red-300'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config[status] || config.pending}`}>
                {status?.toUpperCase()}
            </span>
        );
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            bank_transfer: '🏦',
            upi: '📱',
            cheque: '📃',
            cash: '💵',
            online: '💳',
            other: '📋'
        };
        return icons[method] || '💰';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-gray-600 mt-1">Track all conversion payments and commissions</p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            {!loading && summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatsCard
                        title="Total Amount"
                        value={`₹${(summary.totalAmount || 0).toLocaleString()}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="green"
                        subtitle="All payments"
                    />
                    <StatsCard
                        title="Completed"
                        value={`₹${(summary.completedAmount || 0).toLocaleString()}`}
                        color="green"
                        subtitle={`${summary.completedCount || 0} payments`}
                    />
                    <StatsCard
                        title="Processing"
                        value={`₹${(summary.processingAmount || 0).toLocaleString()}`}
                        color="blue"
                        subtitle={`${summary.processingCount || 0} payments`}
                    />
                    <StatsCard
                        title="Pending"
                        value={`₹${(summary.pendingAmount || 0).toLocaleString()}`}
                        color="yellow"
                        subtitle={`${summary.pendingCount || 0} payments`}
                    />
                    <StatsCard
                        title="Total Rewards"
                        value={`₹${(summary.totalRewards || 0).toLocaleString()}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        }
                        color="purple"
                        subtitle="2% commission"
                    />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Customer name, transaction ID..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select
                            value={filters.paymentMethod}
                            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {paymentMethodOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
                <p className="text-gray-600">
                    {loading ? 'Loading...' : `${payments.length} ${payments.length === 1 ? 'payment' : 'payments'} found`}
                </p>
            </div>

            {/* Payments Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ) : payments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
                    <p className="text-gray-600">No payments match your current filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map(payment => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {payment.referralId?.customerName || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {payment.referralId?.customerPhone || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{payment.amount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {payment.paymentMethod?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-700">
                                                {payment.transactionId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.rewardGenerated ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-green-600">✓</span>
                                                    <span className="text-sm font-medium text-green-600">
                                                        ₹{(payment.amount * 0.02).toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {formatDate(payment.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedPayment(payment)}
                                                className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Payment Details</h2>
                                <p className="text-sm text-green-100 mt-1">{selectedPayment.transactionId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-white hover:text-green-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Payment Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{selectedPayment.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Status</p>
                                            {getStatusBadge(selectedPayment.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                            <p className="font-medium text-gray-900 capitalize">
                                                {getPaymentMethodIcon(selectedPayment.paymentMethod)} {selectedPayment.paymentMethod?.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                                            <p className="font-mono text-sm font-medium text-gray-900">{selectedPayment.transactionId}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Name</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.referralId?.customerName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.referralId?.customerPhone || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.referralId?.customerEmail || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reward Info */}
                                {selectedPayment.rewardGenerated && (
                                    <div className="pt-6 border-t border-gray-200 bg-purple-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advocate Reward (2% Commission)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Advocate</p>
                                                <p className="font-medium text-gray-900">{selectedPayment.advocateId?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Reward Amount</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    ₹{(selectedPayment.amount * 0.02).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Processed By */}
                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Processed By</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.processedBy?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedPayment.notes && (
                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                                        <p className="text-gray-700">{selectedPayment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMPaymentsPage;