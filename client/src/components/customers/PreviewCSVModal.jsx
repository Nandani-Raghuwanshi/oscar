import React, { useState } from 'react';
import apiClient from '../../api/client';

const PreviewCSVModal = ({ projectId, previewData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [serverDetails, setServerDetails] = useState(null);

    const validRecords = previewData.filter((c) => Object.keys(c.validation).length === 0).length;
    const invalidRecords = previewData.filter((c) => Object.keys(c.validation).length > 0).length;

    const handleConfirmImport = async () => {
        setLoading(true);
        setServerError('');
        setServerDetails(null);
        try {
            const customersToImport = previewData.map(({ validation, ...customer }) => customer);

            const importResponse = await apiClient.post(
                '/builder/customers-import',
                {
                    projectId,
                    customers: customersToImport,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            const importedCount = importResponse.data?.data?.count || importResponse.data?.count || previewData.length;
            alert(`Successfully imported ${importedCount} customers!`);

            onSuccess();
        } catch (error) {
            console.error('Import failed:', error);
            const message = error?.message || 'Failed to import customers';
            setServerError(message);
            setServerDetails(error?.errors || null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
                <h3 className="text-lg font-semibold mb-4">
                    CSV Preview - {previewData.length} records
                </h3>

                {serverError && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <p>{serverError}</p>
                        {serverDetails?.duplicatePhones?.length > 0 && (
                            <p className="mt-1 text-xs text-red-600">
                                Duplicate phones: {serverDetails.duplicatePhones.join(', ')}
                            </p>
                        )}
                        {serverDetails?.duplicateEmails?.length > 0 && (
                            <p className="mt-1 text-xs text-red-600">
                                Duplicate emails: {serverDetails.duplicateEmails.join(', ')}
                            </p>
                        )}
                        {serverDetails?.existingUsers?.length > 0 && (
                            <p className="mt-1 text-xs text-red-600">
                                Existing logins: {serverDetails.existingUsers
                                    .map((user) => user.phone || user.email)
                                    .join(', ')}
                            </p>
                        )}
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Valid Records</p>
                        <p className="text-lg font-bold text-green-700">{validRecords}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Invalid Records</p>
                        <p className="text-lg font-bold text-yellow-700">{invalidRecords}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-blue-700">{previewData.length}</p>
                    </div>
                </div>

                {previewData.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
                        <p className="text-gray-500">No data to display. Please check your CSV file and try again.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold">Phone</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((customer, idx) => {
                                    const hasErrors = Object.keys(customer.validation).length > 0;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`border-b ${hasErrors ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <td className="px-4 py-2">
                                                {hasErrors ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        ✗ Error
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        ✓ Valid
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`px-4 py-2 ${customer.validation.name ? 'font-semibold text-red-600' : ''}`}>
                                                {customer.name}
                                                {customer.validation.name && (
                                                    <div className="text-xs text-red-500 mt-1">{customer.validation.name}</div>
                                                )}
                                            </td>
                                            <td className={`px-4 py-2 ${customer.validation.phone ? 'font-semibold text-red-600' : ''}`}>
                                                {customer.phone}
                                                {customer.validation.phone && (
                                                    <div className="text-xs text-red-500 mt-1">{customer.validation.phone}</div>
                                                )}
                                            </td>
                                            <td className={`px-4 py-2 ${customer.validation.email ? 'font-semibold text-red-600' : ''}`}>
                                                {customer.email || '—'}
                                                {customer.validation.email && (
                                                    <div className="text-xs text-red-500 mt-1">{customer.validation.email}</div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={loading || previewData.length === 0}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Importing...' : `Import All (${previewData.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewCSVModal;
