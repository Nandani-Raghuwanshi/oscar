import React, { useState, useEffect } from 'react';
import { advocateAPI } from '../../api/client';

export const AdvocateReferralsPage = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        referrerName: '',
        referrerPhone: '',
        referrerEmail: '',
        referrerCity: '',
        notes: ''
    });

    useEffect(() => {
        fetchReferrals();
    }, [page, statusFilter]);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const data = await advocateAPI.getReferrals(params);
            setReferrals(data.data.data);
            setTotalPages(data.data.pagination.pages);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch referrals');
            setReferrals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitReferral = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await advocateAPI.submitReferral(formData);
            setFormData({
                referrerName: '',
                referrerPhone: '',
                referrerEmail: '',
                referrerCity: '',
                notes: ''
            });
            setShowForm(false);
            setPage(1);
            await fetchReferrals();
        } catch (err) {
            alert(err.message || 'Failed to submit referral');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'contacted':
                return 'bg-blue-100 text-blue-800';
            case 'qualified':
                return 'bg-purple-100 text-purple-800';
            case 'converted':
                return 'bg-green-100 text-green-800';
            case 'lost':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Referrals</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
                >
                    {showForm ? 'Cancel' : 'New Referral'}
                </button>
            </div>

            {/* Referral Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Referral</h3>
                    <form onSubmit={handleSubmitReferral} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="referrerName"
                                    value={formData.referrerName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Enter referrer's full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="referrerPhone"
                                    value={formData.referrerPhone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    name="referrerEmail"
                                    value={formData.referrerEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="referrer@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="referrerCity"
                                    value={formData.referrerCity}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="City name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                maxLength="500"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Add any additional notes about this referral..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-6 py-2 rounded-lg transition"
                            >
                                {submitting ? 'Submitting...' : 'Submit Referral'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'contacted', 'qualified', 'converted', 'lost'].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg capitalize transition ${statusFilter === status
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Referrals List */}
            {loading ? (
                <div className="text-center text-gray-600">Loading referrals...</div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            ) : referrals.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                    No referrals found. Start by submitting your first referral!
                </div>
            ) : (
                <div className="space-y-4">
                    {referrals.map(referral => (
                        <div key={referral._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{referral.referrerName}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Phone: {referral.referrerPhone}
                                    </p>
                                    {referral.referrerEmail && (
                                        <p className="text-sm text-gray-600">
                                            Email: {referral.referrerEmail}
                                        </p>
                                    )}
                                    {referral.referrerCity && (
                                        <p className="text-sm text-gray-600">
                                            City: {referral.referrerCity}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(referral.status)}`}>
                                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Submitted {new Date(referral.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {referral.notes && (
                                <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {referral.notes}
                                </p>
                            )}
                            {referral.rewardAmount > 0 && (
                                <p className="mt-2 text-sm font-semibold text-green-600">
                                    Reward: ₹{referral.rewardAmount.toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
