import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../api/client';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    const getTypeColor = (type) => {
        const colors = {
            referral: 'bg-blue-100 text-blue-800',
            reward: 'bg-green-100 text-green-800',
            escalation: 'bg-red-100 text-red-800',
            reminder: 'bg-yellow-100 text-yellow-800',
            payment: 'bg-purple-100 text-purple-800',
            message: 'bg-gray-100 text-gray-800',
            alert: 'bg-orange-100 text-orange-800',
            info: 'bg-indigo-100 text-indigo-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return new Date(date).toLocaleDateString();
    };

    return (
        <div
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${notification.status !== 'read' ? 'bg-blue-50' : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                            {notification.type}
                        </span>
                        {notification.status !== 'read' && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{notification.subject}</h3>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-2">{formatTime(notification.createdAt)}</p>
                </div>
                <div className="flex gap-2 ml-3">
                    {notification.status !== 'read' && (
                        <button
                            onClick={() => onMarkAsRead(notification._id)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                            title="Mark as read"
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(notification._id)}
                        className="p-1 hover:bg-red-200 rounded transition"
                        title="Delete"
                    >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationCenter = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, filter, page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 20,
                page,
            };
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await notificationAPI.getNotifications(params);
            setNotifications(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(
                notifications.map(n =>
                    n._id === id ? { ...n, status: 'read' } : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(
                notifications.map(n => ({ ...n, status: 'read' }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.deleteNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-96 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 pt-3 border-b border-gray-200 flex gap-2">
                    {['all', 'read', 'unread'].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(1);
                            }}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'unread' ? 'Unread' : f === 'read' ? 'Read' : 'All'}
                        </button>
                    ))}
                    {notifications.some(n => n.status !== 'read') && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="ml-auto px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Loading notifications...</div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-gray-500">No notifications</p>
                            </div>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.total > 1 && (
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.current} of {pagination.total}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(pagination.total, page + 1))}
                            disabled={page === pagination.total}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
