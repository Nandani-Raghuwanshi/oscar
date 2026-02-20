import React, { useState } from 'react';
import { VALIDATION_PATTERNS } from './validationPatterns';
import apiClient from '../../api/client';

const AddCustomerModal = ({ projectId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [serverDetails, setServerDetails] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (!VALIDATION_PATTERNS.name.test(formData.name.trim())) {
            errors.name = 'Name must be at least 2 characters and contain only letters, numbers, spaces, hyphens, or apostrophes';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!VALIDATION_PATTERNS.phonePermissive.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number (at least 7 digits)';
        }

        if (formData.email && !VALIDATION_PATTERNS.emailStrict.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateField = (fieldName, value) => {
        const errors = { ...formErrors };

        switch (fieldName) {
            case 'name':
                if (value && !VALIDATION_PATTERNS.name.test(value.trim())) {
                    errors.name = 'Name must be at least 2 characters';
                } else {
                    delete errors.name;
                }
                break;
            case 'phone':
                if (value && !VALIDATION_PATTERNS.phonePermissive.test(value)) {
                    errors.phone = 'Phone must have at least 7 digits';
                } else {
                    delete errors.phone;
                }
                break;
            case 'email':
                if (value && !VALIDATION_PATTERNS.emailStrict.test(value)) {
                    errors.email = 'Invalid email format';
                } else {
                    delete errors.email;
                }
                break;
            default:
                break;
        }

        setFormErrors(errors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setServerError('');
        setServerDetails(null);
        try {
            await apiClient.post(
                '/builder/customers',
                {
                    projectId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    notes: formData.notes,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            alert('Customer added successfully!');
            onSuccess();
        } catch (error) {
            console.error('Failed to add customer:', error);
            const message = error?.message || 'Failed to add customer';
            setServerError(message);
            setServerDetails(error?.errors || null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
                {serverError && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <p>{serverError}</p>
                        {serverDetails?.existingUser && (
                            <p className="mt-1 text-xs text-red-600">
                                Existing login: {serverDetails.existingUser.phone || '—'}
                                {serverDetails.existingUser.email ? ` (${serverDetails.existingUser.email})` : ''}
                            </p>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                validateField('name', e.target.value);
                            }}
                            className={`w-full border rounded-lg px-4 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g., John Doe"
                        />
                        {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                validateField('phone', e.target.value);
                            }}
                            className={`w-full border rounded-lg px-4 py-2 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+1 (555) 123-4567"
                        />
                        {formErrors.phone && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                validateField('email', e.target.value);
                            }}
                            className={`w-full border rounded-lg px-4 py-2 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="name@example.com"
                        />
                        {formErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            placeholder="Additional notes"
                            rows="3"
                        />
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
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;
