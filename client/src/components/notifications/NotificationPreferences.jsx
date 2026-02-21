import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../api/client';

const NotificationPreferences = ({ isOpen, onClose }) => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        whatsappNotifications: true,
        escalationAlerts: true,
        dailyDigest: false,
        marketing: false,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPreferences();
        }
    }, [isOpen]);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getUserPreferences();
            setPreferences(response.data);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            setMessage('Failed to load preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage('');
            await notificationAPI.updateUserPreferences(preferences);
            setMessage('Preferences saved successfully');
            setTimeout(() => {
                setMessage('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {message && (
                        <div
                            className={`p-4 rounded-md text-sm font-medium ${message.includes('success')
                                    ? 'bg-green-50 text-green-800'
                                    : 'bg-red-50 text-red-800'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-gray-500">Loading preferences...</div>
                    ) : (
                        <>
                            {/* Notification Channels */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Notification Channels
                                </h3>
                                <div className="space-y-3">
                                    <PreferenceToggle
                                        label="Email Notifications"
                                        description="Receive updates via email"
                                        value={preferences.emailNotifications}
                                        onChange={() => handleToggle('emailNotifications')}
                                    />
                                    <PreferenceToggle
                                        label="SMS Notifications"
                                        description="Receive updates via SMS"
                                        value={preferences.smsNotifications}
                                        onChange={() => handleToggle('smsNotifications')}
                                    />
                                    <PreferenceToggle
                                        label="WhatsApp Notifications"
                                        description="Receive updates via WhatsApp"
                                        value={preferences.whatsappNotifications}
                                        onChange={() => handleToggle('whatsappNotifications')}
                                    />
                                    <PreferenceToggle
                                        label="Push Notifications"
                                        description="Receive browser push notifications"
                                        value={preferences.pushNotifications}
                                        onChange={() => handleToggle('pushNotifications')}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            {/* Alert Types */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Alert Types
                                </h3>
                                <div className="space-y-3">
                                    <PreferenceToggle
                                        label="Escalation Alerts"
                                        description="Get notified about escalations immediately"
                                        value={preferences.escalationAlerts}
                                        onChange={() => handleToggle('escalationAlerts')}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            {/* Digest & Marketing */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Preferences
                                </h3>
                                <div className="space-y-3">
                                    <PreferenceToggle
                                        label="Daily Digest"
                                        description="Get a summary of daily activities"
                                        value={preferences.dailyDigest}
                                        onChange={() => handleToggle('dailyDigest')}
                                    />
                                    <PreferenceToggle
                                        label="Marketing Communications"
                                        description="Receive promotional and marketing emails"
                                        value={preferences.marketing}
                                        onChange={() => handleToggle('marketing')}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PreferenceToggle = ({ label, description, value, onChange }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
            <div>
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                ></span>
            </button>
        </div>
    );
};

export default NotificationPreferences;
