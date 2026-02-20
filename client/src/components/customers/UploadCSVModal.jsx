import React, { useState } from 'react';
import apiClient from '../../api/client';
import { validateCustomerData } from './validationPatterns';

const UploadCSVModal = ({ projectId, onClose, onPreview }) => {
    const [loading, setLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const downloadCSVTemplate = () => {
        const templateContent = 'name,phone,email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+0987654321,jane@example.com';
        const blob = new Blob([templateContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setLoading(true);
        const formDataObj = new FormData();
        formDataObj.append('file', uploadFile);
        formDataObj.append('projectId', projectId);

        try {
            const uploadResponse = await apiClient.post(
                '/builder/customers-upload',
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const customers = uploadResponse.data?.customers || uploadResponse.data?.data?.customers || [];

            if (!customers || customers.length === 0) {
                alert('No valid data found in CSV file');
                return;
            }

            const previewWithValidation = customers.map((customer) => ({
                ...customer,
                validation: validateCustomerData(customer),
            }));

            onPreview(previewWithValidation);
            setUploadFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to parse CSV file: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Upload Customers CSV</h3>
                <form onSubmit={handleFileUpload}>
                    <div className="mb-4">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            CSV must contain columns: name, phone, email
                        </p>
                        <button
                            type="button"
                            onClick={downloadCSVTemplate}
                            className="text-blue-600 hover:text-blue-800 text-xs mt-2 underline"
                        >
                            Download CSV Template
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!uploadFile || loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadCSVModal;
