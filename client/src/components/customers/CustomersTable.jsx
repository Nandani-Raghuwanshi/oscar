import React from 'react';

const CustomersTable = ({ customers, loading, pagination, currentPage, onPageChange, onDelete }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-8 text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-8 text-center text-gray-500">No customers found</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Phone
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Invite Sent
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr
                            key={customer._id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                        >
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {customer.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {customer.phone}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {customer.email || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : customer.status === 'converted'
                                            ? 'bg-blue-100 text-blue-700'
                                            : customer.status === 'inactive'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {customer.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {customer.inviteSentAt ? '✓' : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <button
                                    onClick={() => onDelete(customer._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages} • {pagination.total} total
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CustomersTable;
