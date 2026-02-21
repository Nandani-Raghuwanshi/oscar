import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const AdminNavbar = () => {
    const { logout } = useAuthStore();

    return (
        <nav className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-white">BuiltCred</h1>
                        <span className="text-blue-100 text-sm font-semibold">Admin</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/admin/dashboard"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/users"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/projects"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Projects
                        </Link>
                        <Link
                            to="/admin/escalations"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Escalations
                        </Link>
                        <Link
                            to="/admin/audit-trail"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Audit Trail
                        </Link>
                        <Link
                            to="/admin/notifications"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Notifications
                        </Link>
                        <Link
                            to="/admin/analytics"
                            className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Analytics
                        </Link>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};