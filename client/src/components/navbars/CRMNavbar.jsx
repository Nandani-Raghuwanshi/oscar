import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const CRMNavbar = () => {
    const { logout } = useAuthStore();

    return (
        <nav className="bg-gradient-to-r from-purple-700 to-purple-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-white">BuiltCred</h1>
                        <span className="text-purple-100 text-sm font-semibold">CRM/Sales</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/crm/dashboard"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/crm/advocates"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Advocates
                        </Link>
                        <Link
                            to="/crm/leads"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Leads
                        </Link>
                        <Link
                            to="/crm/referrals"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Referrals
                        </Link>
                        <Link
                            to="/crm/pipeline"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Pipeline
                        </Link>
                        <Link
                            to="/crm/payments"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Payments
                        </Link>
                        <Link
                            to="/crm/escalations"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Escalations
                        </Link>
                        <Link
                            to="/crm/analytics"
                            className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
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
