import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './notifications/NotificationBell';
import NotificationCenter from './notifications/NotificationCenter';
import NotificationPreferences from './notifications/NotificationPreferences';

export const Layout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">BuiltCred</h1>
                        </div>
                        {user && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Welcome, {user.firstName}
                                </span>
                                <NotificationBell onClick={() => setShowNotifications(true)} />
                                <button
                                    onClick={() => setShowPreferences(true)}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
                                    title="Notification Settings"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Notification Center Modal */}
            <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />

            {/* Notification Preferences Modal */}
            <NotificationPreferences
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
            />
        </div>
    );
};
