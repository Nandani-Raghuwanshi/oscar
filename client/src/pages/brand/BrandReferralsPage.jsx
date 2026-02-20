import React, { useEffect, useState } from 'react';
import { brandAPI } from '../../api/client';

export const BrandReferralsPage = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const [formData, setFormData] = useState({
        referrerName: '',
        referrerPhone: '',
        referrerEmail: '',
        referrerCity: '',
        referrerNotes: ''
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch referrals
    const fetchReferrals = async (page = 1, status = '') => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page,
                limit: 10,
                ...(status && { status })
            };
            const data = await brandAPI.getReferrals(params);
            setReferrals(data.data.referrals);
            setPagination(data.data.pagination);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching referrals:', err);
            setError(err.message || 'Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals(1, selectedStatus);
    }, [selectedStatus]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (!formData.referrerName.trim()) {
            setFormError('Referrer name is required');
            return;
        }
        if (!formData.referrerPhone.trim()) {
            setFormError('Phone number is required');
            return;
        }
        if (formData.referrerNotes.length > 500) {
            setFormError('Notes must be 500 characters or less');
            return;
        }

        try {
            setSubmitting(true);
            await brandAPI.submitReferral(formData);

            // Reset form and refresh list
            setFormData({
                referrerName: '',
                referrerPhone: '',
                referrerEmail: '',
                referrerCity: '',
                referrerNotes: ''
            });
            setShowForm(false);
            await fetchReferrals(1, selectedStatus);
        } catch (err) {
            console.error('Error submitting referral:', err);
            setFormError(err.message || 'Failed to submit referral');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Status colors
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            qualified: 'bg-purple-100 text-purple-800',
            converted: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Referrals</h1>
                        <p className="text-gray-600 mt-2">Submit and track your referrals</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        {showForm ? '✕ Close' : '+ New Referral'}
                    </button>
                </div>

                {/* Referral Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8 border-2 border-blue-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit New Referral</h2>

                        {formError && (
                            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="referrerName"
                                        value={formData.referrerName}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {/* Phone - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="referrerPhone"
                                        value={formData.referrerPhone}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>

                                {/* Email - Optional */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="referrerEmail"
                                        value={formData.referrerEmail}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* City - Optional */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="referrerCity"
                                        value={formData.referrerCity}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Bangalore"
                                    />
                                </div>
                            </div>

                            {/* Notes - Optional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="referrerNotes"
                                    value={formData.referrerNotes}
                                    onChange={handleFormChange}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add any notes about this referral..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.referrerNotes.length}/500 characters
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                            >
                                {submitting ? 'Submitting...' : 'Submit Referral'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Status Filter */}
                <div className="mb-6 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setSelectedStatus('')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === ''
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        All ({pagination?.total || 0})
                    </button>
                    <button
                        onClick={() => setSelectedStatus('pending')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setSelectedStatus('contacted')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'contacted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Contacted
                    </button>
                    <button
                        onClick={() => setSelectedStatus('qualified')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'qualified'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Qualified
                    </button>
                    <button
                        onClick={() => setSelectedStatus('converted')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'converted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Converted
                    </button>
                    <button
                        onClick={() => setSelectedStatus('lost')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedStatus === 'lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Lost
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Referrals List */}
                {!loading && !error && (
                    <div>
                        {referrals.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    {selectedStatus ? 'No referrals found with this status.' : 'No referrals yet. Start by submitting your first referral!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {referrals.map(referral => (
                                    <div key={referral._id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {referral.referrerName}
                                                </h3>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    📱 {referral.referrerPhone}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                                                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
                                            {referral.referrerEmail && (
                                                <div>
                                                    <p className="text-gray-600">Email</p>
                                                    <p className="text-gray-900 break-all">{referral.referrerEmail}</p>
                                                </div>
                                            )}
                                            {referral.referrerCity && (
                                                <div>
                                                    <p className="text-gray-600">City</p>
                                                    <p className="text-gray-900">{referral.referrerCity}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-600">Submitted</p>
                                                <p className="text-gray-900">
                                                    {new Date(referral.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {referral.referrerNotes && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-gray-600 text-sm mb-1">Notes</p>
                                                <p className="text-gray-900 text-sm">{referral.referrerNotes}</p>
                                            </div>
                                        )}

                                        {referral.reward && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                                                <p className="text-green-800 font-semibold">
                                                    🎁 Reward: ₹{referral.reward.amount.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    onClick={() => fetchReferrals(currentPage - 1, selectedStatus)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchReferrals(page, selectedStatus)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchReferrals(currentPage + 1, selectedStatus)}
                                    disabled={currentPage === pagination.pages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandReferralsPage;
