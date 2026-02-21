import { useState, useEffect } from 'react';
import { crmAPI } from '../../api/client';
import { Users, TrendingUp, Search, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CRMAdvocatesPage = () => {
    const navigate = useNavigate();
    const [advocates, setAdvocates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        const fetchAdvocates = async () => {
            try {
                setLoading(true);
                const response = await crmAPI.getAdvocates({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search || undefined
                });

                setAdvocates(response.data?.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data?.pagination?.total || 0
                }));
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch advocates');
            } finally {
                setLoading(false);
            }
        };

        fetchAdvocates();
    }, [pagination.page, pagination.limit, search]);

    const [selectedAdvocate, setSelectedAdvocate] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loadingPerformance, setLoadingPerformance] = useState(false);

    const handleViewPerformance = async (advocateId) => {
        try {
            setLoadingPerformance(true);
            const response = await crmAPI.getAdvocatePerformance(advocateId);
            setPerformanceData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingPerformance(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Project Advocates</h1>
                    <p className="text-gray-600 mt-2">Monitor advocate performance and referral generation</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading advocates...</p>
                    </div>
                ) : advocates.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-lg">No advocates found</p>
                    </div>
                ) : (
                    <>
                        {/* Advocates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {advocates.map(advocate => (
                                <div key={advocate._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{advocate.name}</h3>
                                            <p className="text-sm text-gray-600">{advocate.email}</p>
                                            <p className="text-sm text-gray-500 mt-1">{advocate.phone}</p>
                                        </div>
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Total Referrals</span>
                                            <span className="font-bold text-gray-900">{advocate.referralCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Active Leads</span>
                                            <span className="font-bold text-gray-900">{advocate.leadCount || 0}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewPerformance(advocate._id)}
                                        className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                                    >
                                        <span>View Performance</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Performance Modal */}
                        {performanceData && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg max-w-2xl w-full p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {performanceData.advocate.name}
                                            </h2>
                                            <p className="text-gray-600">{performanceData.advocate.email}</p>
                                        </div>
                                        <button
                                            onClick={() => setPerformanceData(null)}
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                                            <p className="text-3xl font-bold text-blue-600">{performanceData.referrals.total}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Converted</p>
                                            <p className="text-3xl font-bold text-green-600">{performanceData.referrals.converted}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                                            <p className="text-3xl font-bold text-purple-600">{performanceData.referrals.pending}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                                            <p className="text-3xl font-bold text-orange-600">{performanceData.conversionRate}%</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Lead Performance</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Leads Managed</p>
                                                <p className="text-2xl font-bold text-gray-900">{performanceData.leads.managed}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Leads Converted</p>
                                                <p className="text-2xl font-bold text-gray-900">{performanceData.leads.converted}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setPerformanceData(null)}
                                        className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.total > pagination.limit && (
                            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-600 text-sm">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={pagination.page * pagination.limit >= pagination.total}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CRMAdvocatesPage;