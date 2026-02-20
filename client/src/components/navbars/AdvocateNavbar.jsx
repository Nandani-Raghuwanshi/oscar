import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const AdvocateNavbar = () => {
    const { logout, user } = useAuthStore();

    const isProjectAdvocate = user?.role === 'project_advocate';
    const title = isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate';

    return (
        <nav className="bg-gradient-to-r from-amber-700 to-amber-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-white">BuiltCred</h1>
                        <span className="text-amber-100 text-sm font-semibold">{title}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/advocate/dashboard"
                            className="text-amber-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/advocate/referrals"
                            className="text-amber-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Referrals
                        </Link>
                        <Link
                            to="/advocate/rewards"
                            className="text-amber-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Rewards
                        </Link>
                        <Link
                            to="/advocate/documentation"
                            className="text-amber-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Docs
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
