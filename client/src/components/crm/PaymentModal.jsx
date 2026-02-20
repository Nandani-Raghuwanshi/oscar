import React, { useState, useEffect } from 'react';

/**
 * Modal for marking payments when a referral converts
 * Automatically triggers 2% commission reward generation
 */
const PaymentModal = ({ isOpen, onClose, onSubmit, referral, loading = false }) => {
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'bank_transfer',
        transactionId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [calculatedReward, setCalculatedReward] = useState(0);

    const paymentMethods = [
        { value: 'bank_transfer', label: '🏦 Bank Transfer', icon: '🏦' },
        { value: 'upi', label: '📱 UPI', icon: '📱' },
        { value: 'cheque', label: '📃 Cheque', icon: '📃' },
        { value: 'cash', label: '💵 Cash', icon: '💵' },
        { value: 'online', label: '💳 Online Payment', icon: '💳' },
        { value: 'other', label: '📋 Other', icon: '📋' }
    ];

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                amount: '',
                paymentMethod: 'bank_transfer',
                transactionId: '',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setErrors({});
            setCalculatedReward(0);
        }
    }, [isOpen]);

    useEffect(() => {
        // Calculate 2% reward
        const amount = parseFloat(formData.amount) || 0;
        setCalculatedReward(amount * 0.02);
    }, [formData.amount]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Please enter a valid payment amount';
        } else if (formData.amount < 1000) {
            newErrors.amount = 'Amount must be at least ₹1,000';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Please select a payment method';
        }

        if (!formData.transactionId || formData.transactionId.trim() === '') {
            newErrors.transactionId = 'Transaction ID is required';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        } else if (new Date(formData.paymentDate) > new Date()) {
            newErrors.paymentDate = 'Payment date cannot be in the future';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validate()) {
            onSubmit({
                ...formData,
                referralId: referral._id,
                customerId: referral.customerId,
                projectId: referral.projectId,
                advocateId: referral.advocateId,
                amount: parseFloat(formData.amount)
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Mark Payment - Conversion</h2>
                        <p className="text-sm text-green-100 mt-1">
                            {referral?.customerName} • {referral?.projectId?.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-white hover:text-green-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Info Banner */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                    Payment Processing Information
                                </h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>✓ Referral status will be updated to "Converted"</li>
                                    <li>✓ Advocate will receive 2% commission reward automatically</li>
                                    <li>✓ Payment will be tracked in the system for reporting</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Payment Amount */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Amount (₹) *
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="1000"
                            step="0.01"
                            placeholder="e.g., 50000"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                errors.amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.amount && (
                            <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                        )}
                        
                        {/* Reward Calculation Preview */}
                        {formData.amount && !errors.amount && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Advocate Commission (2%):</span>
                                    <span className="text-lg font-bold text-green-700">
                                        ₹{calculatedReward.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                        formData.paymentMethod === method.value
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                                    }`}
                                >
                                    <span className="text-lg mr-1">{method.icon}</span>
                                    <span className="text-xs">{method.label.split(' ').slice(1).join(' ')}</span>
                                </button>
                            ))}
                        </div>
                        {errors.paymentMethod && (
                            <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>
                        )}
                    </div>

                    {/* Transaction ID */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction ID / Reference Number *
                        </label>
                        <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="e.g., TXN123456789 or CHQ/2024/001"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                errors.transactionId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.transactionId && (
                            <p className="text-red-600 text-sm mt-1">{errors.transactionId}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the unique transaction reference for tracking
                        </p>
                    </div>

                    {/* Payment Date */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Date *
                        </label>
                        <input
                            type="date"
                            name="paymentDate"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.paymentDate && (
                            <p className="text-red-600 text-sm mt-1">{errors.paymentDate}</p>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes (optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any additional information about the payment, booking details, special terms, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>

                    {/* Advocate Details Summary */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Reward Recipient</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-lg font-bold text-indigo-700">
                                    {referral?.advocateId?.name?.[0]?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {referral?.advocateId?.name || 'Unknown Advocate'}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {referral?.advocateId?.email} • {referral?.advocateId?.phone}
                                </p>
                            </div>
                            {calculatedReward > 0 && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-600">Will Receive</p>
                                    <p className="text-lg font-bold text-green-600">
                                        ₹{calculatedReward.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                '✓ Confirm Payment & Convert'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
