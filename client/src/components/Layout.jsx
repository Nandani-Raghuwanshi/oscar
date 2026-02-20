import React from 'react';
import { useAuthStore } from '../store/authStore';

export const Layout = ({ children }) => {
    const { user, logout } = useAuthStore();

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
        </div>
    );
};
