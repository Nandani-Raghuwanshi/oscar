import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmAPI } from '../../api/client';

const CRMAdvocatesPage = () => {
    const navigate = useNavigate();
    const [advocates, setAdvocates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdvocate, setSelectedAdvocate] = useState(null);
    const [filters, setFilters] = useState({
        tier: '',
        search: ''
    });

    const tierConfig = {
        gold: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Gold', icon: '🥇', minReferrals: 20 },
        silver: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Silver', icon: '🥈', minReferrals: 10 },
        bronze: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Bronze', icon: '🥉', minReferrals: 5 },
        inactive: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Inactive', icon: '⏸️', minReferrals: 0 }
    };

    useEffect(() => {
        fetchAdvocates();
    }, [filters]);

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.tier) params.tier = filters.tier;
            if (filters.search) params.search = filters.search;

            const response = await crmAPI.getAdvocates(params);
            setAdvocates(response.data || []);
        } catch (err) {
            console.error('Error fetching advocates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (advocate) => {
        try {
            const response = await crmAPI.getAdvocateById(advocate._id);
            setSelectedAdvocate(response.data);
        } catch (err) {
            console.error('Error fetching advocate details:', err);
        }
    };

    const getTierBadge = (tier) => {
        const config = tierConfig[tier] || tierConfig.inactive;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${config.color}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Advocates</h1>
                    <p className="text-gray-600 mt-1">Monitor advocate performance and referral activity</p>
                </div>
                <button
                    onClick={fetchAdvocates}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Tier Legend */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(tierConfig).map(([key, config]) => (
                        <div key={key} className={`p-4 rounded-lg border-2 ${config.color}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{config.icon}</span>
                                <h4 className="font-bold text-gray-900">{config.label}</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                {config.minReferrals === 0 ? 'Less than 5 referrals' : `${config.minReferrals}+ referrals`}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Advocate name, email, phone..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
                        <select
                            value={filters.tier}
                            onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Tiers</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="bronze">Bronze</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
                <p className="text-gray-600">
                    {loading ? 'Loading...' : `${advocates.length} ${advocates.length === 1 ? 'advocate' : 'advocates'} found`}
                </p>
            </div>

            {/* Advocates Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ) : advocates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Advocates Found</h3>
                    <p className="text-gray-600">No advocates match your current filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advocate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referrals</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rewards</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {advocates.map(advocate => (
                                    <tr key={advocate._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-indigo-700">
                                                        {advocate.name?.[0]?.toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{advocate.name}</p>
                                                    <p className="text-sm text-gray-500">{advocate.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getTierBadge(advocate.performanceTier)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-gray-900">{advocate.totalReferrals || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-blue-600">{advocate.activeReferrals || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-green-600">{advocate.convertedReferrals || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-lg font-bold ${
                                                advocate.conversionRate >= 20 ? 'text-green-600' :
                                                advocate.conversionRate >= 10 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {advocate.conversionRate?.toFixed(1) || 0}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-purple-600">
                                                ₹{(advocate.totalRewards || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleViewDetails(advocate)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Advocate Details Modal */}
            {selectedAdvocate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Advocate Details</h2>
                                <p className="text-sm text-indigo-100 mt-1">{selectedAdvocate.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAdvocate(null)}
                                className="text-white hover:text-indigo-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Profile Info */}
                            <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Email</p>
                                        <p className="font-medium text-gray-900">{selectedAdvocate.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                                        <p className="font-medium text-gray-900">{selectedAdvocate.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Performance Tier</p>
                                        {getTierBadge(selectedAdvocate.performanceTier)}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                                    <p className="text-3xl font-bold text-blue-600">{selectedAdvocate.totalReferrals || 0}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Active</p>
                                    <p className="text-3xl font-bold text-indigo-600">{selectedAdvocate.activeReferrals || 0}</p>
                                </div>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Converted</p>
                                    <p className="text-3xl font-bold text-green-600">{selectedAdvocate.convertedReferrals || 0}</p>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Dropped</p>
                                    <p className="text-3xl font-bold text-red-600">{selectedAdvocate.droppedReferrals || 0}</p>
                                </div>
                            </div>

                            {/* Status Breakdown */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Status Breakdown</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {selectedAdvocate.statusBreakdown && Object.entries(selectedAdvocate.statusBreakdown).map(([status, count]) => (
                                        <div key={status} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-600 mb-1 capitalize">{status.replace('_', ' ')}</p>
                                            <p className="text-xl font-bold text-gray-900">{count}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rewards Summary */}
                            <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Rewards</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₹{(selectedAdvocate.totalRewards || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            ₹{(selectedAdvocate.pendingRewards || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Paid Rewards</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{(selectedAdvocate.paidRewards || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CRMAdvocatesPage;