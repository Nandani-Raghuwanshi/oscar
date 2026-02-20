import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const BuilderNavbar = () => {
    const { logout } = useAuthStore();

    return (
        <nav className="bg-gradient-to-r from-green-700 to-green-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-white">BuiltCred</h1>
                        <span className="text-green-100 text-sm font-semibold">Builder/Developer</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/builder/dashboard"
                            className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/builder/customers"
                            className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Customers
                        </Link>
                        <Link
                            to="/builder/reports"
                            className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Reports
                        </Link>
                        <Link
                            to="/builder/escalations"
                            className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Escalations
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
