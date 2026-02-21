import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../api/client';

const AdminNotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('send');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Send Notification State
    const [sendForm, setSendForm] = useState({
        userId: '',
        templateId: '',
        variables: {},
    });

    // Send Bulk Notification State
    const [bulkForm, setBulkForm] = useState({
        userIds: '',
        templateId: '',
        variables: {},
    });

    // Schedule Notification State
    const [scheduleForm, setScheduleForm] = useState({
        userId: '',
        templateId: '',
        scheduledFor: '',
        variables: {},
    });

    // Create Template State
    const [templateForm, setTemplateForm] = useState({
        name: '',
        type: 'info',
        channel: 'in-app',
        subject: '',
        message: '',
        category: 'system_alerts',
        variables: [],
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getTemplates({ limit: 100 });
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setMessage('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            if (!sendForm.userId || !sendForm.templateId) {
                setMessage('Please fill in all required fields');
                return;
            }
            await notificationAPI.sendNotification(sendForm);
            setMessage('Notification sent successfully');
            setSendForm({ userId: '', templateId: '', variables: {} });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error sending notification:', error);
            setMessage('Failed to send notification');
        }
    };

    const handleSendBulk = async (e) => {
        e.preventDefault();
        try {
            if (!bulkForm.userIds || !bulkForm.templateId) {
                setMessage('Please fill in all required fields');
                return;
            }
            const userIds = bulkForm.userIds.split(',').map(id => id.trim());
            await notificationAPI.sendBulkNotification({
                ...bulkForm,
                userIds,
            });
            setMessage(`Notifications sent to ${userIds.length} users`);
            setBulkForm({ userIds: '', templateId: '', variables: {} });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error sending bulk notification:', error);
            setMessage('Failed to send bulk notification');
        }
    };

    const handleScheduleNotification = async (e) => {
        e.preventDefault();
        try {
            if (!scheduleForm.userId || !scheduleForm.templateId || !scheduleForm.scheduledFor) {
                setMessage('Please fill in all required fields');
                return;
            }
            await notificationAPI.scheduleNotification(scheduleForm);
            setMessage('Notification scheduled successfully');
            setScheduleForm({
                userId: '',
                templateId: '',
                scheduledFor: '',
                variables: {},
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error scheduling notification:', error);
            setMessage('Failed to schedule notification');
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            if (!templateForm.name || !templateForm.subject || !templateForm.message) {
                setMessage('Please fill in all required fields');
                return;
            }
            await notificationAPI.createTemplate(templateForm);
            setMessage('Template created successfully');
            setTemplateForm({
                name: '',
                type: 'info',
                channel: 'in-app',
                subject: '',
                message: '',
                category: 'system_alerts',
                variables: [],
            });
            fetchTemplates();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error creating template:', error);
            setMessage('Failed to create template');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Notification Management
                    </h1>
                    <p className="text-gray-600">
                        Manage and send notifications to users across the platform
                    </p>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-md text-sm font-medium ${message.includes('success') || message.includes('sent')
                                ? 'bg-green-50 text-green-800'
                                : message.includes('Failed')
                                    ? 'bg-red-50 text-red-800'
                                    : 'bg-blue-50 text-blue-800'
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b border-gray-200">
                        {[
                            { id: 'send', label: 'Send Notification' },
                            { id: 'bulk', label: 'Bulk Notifications' },
                            { id: 'schedule', label: 'Schedule Notification' },
                            { id: 'templates', label: 'Manage Templates' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-6 py-3 text-center font-medium transition ${activeTab === tab.id
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Send Notification */}
                        {activeTab === 'send' && (
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={sendForm.userId}
                                        onChange={e => setSendForm({ ...sendForm, userId: e.target.value })}
                                        placeholder="Enter MongoDB User ID"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template *
                                    </label>
                                    <select
                                        value={sendForm.templateId}
                                        onChange={e => setSendForm({ ...sendForm, templateId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="">Select a template</option>
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                                >
                                    Send Notification
                                </button>
                            </form>
                        )}

                        {/* Bulk Notifications */}
                        {activeTab === 'bulk' && (
                            <form onSubmit={handleSendBulk} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User IDs (comma-separated) *
                                    </label>
                                    <textarea
                                        value={bulkForm.userIds}
                                        onChange={e => setBulkForm({ ...bulkForm, userIds: e.target.value })}
                                        placeholder="Enter MongoDB User IDs separated by commas"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template *
                                    </label>
                                    <select
                                        value={bulkForm.templateId}
                                        onChange={e => setBulkForm({ ...bulkForm, templateId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="">Select a template</option>
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                                >
                                    Send Bulk Notifications
                                </button>
                            </form>
                        )}

                        {/* Schedule Notification */}
                        {activeTab === 'schedule' && (
                            <form onSubmit={handleScheduleNotification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={scheduleForm.userId}
                                        onChange={e => setScheduleForm({ ...scheduleForm, userId: e.target.value })}
                                        placeholder="Enter MongoDB User ID"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template *
                                    </label>
                                    <select
                                        value={scheduleForm.templateId}
                                        onChange={e => setScheduleForm({ ...scheduleForm, templateId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="">Select a template</option>
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule For *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleForm.scheduledFor}
                                        onChange={e => setScheduleForm({ ...scheduleForm, scheduledFor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                                >
                                    Schedule Notification
                                </button>
                            </form>
                        )}

                        {/* Manage Templates */}
                        {activeTab === 'templates' && (
                            <div className="space-y-8">
                                {/* Create Template Form */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Create New Template
                                    </h3>
                                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Template Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={templateForm.name}
                                                onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                                                placeholder="e.g., Welcome Email"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type
                                                </label>
                                                <select
                                                    value={templateForm.type}
                                                    onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                >
                                                    {['referral', 'reward', 'escalation', 'reminder', 'payment', 'message', 'alert', 'info'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Channel
                                                </label>
                                                <select
                                                    value={templateForm.channel}
                                                    onChange={e => setTemplateForm({ ...templateForm, channel: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                >
                                                    {['email', 'sms', 'whatsapp', 'push', 'in-app'].map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                value={templateForm.subject}
                                                onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                                                placeholder="Use {{variable}} for placeholders"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                value={templateForm.message}
                                                onChange={e => setTemplateForm({ ...templateForm, message: e.target.value })}
                                                placeholder="Use {{variable}} for placeholders"
                                                rows="4"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition"
                                        >
                                            Create Template
                                        </button>
                                    </form>
                                </div>

                                {/* Templates List */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Existing Templates
                                    </h3>
                                    {loading ? (
                                        <div className="text-center text-gray-500">Loading templates...</div>
                                    ) : templates.length === 0 ? (
                                        <div className="text-center text-gray-500">No templates created yet</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {templates.map(template => (
                                                <div key={template._id} className="p-4 border border-gray-200 rounded-md hover:shadow-md transition">
                                                    <h4 className="font-semibold text-gray-800">{template.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                            {template.type}
                                                        </span>
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                            {template.channel}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsPage;
