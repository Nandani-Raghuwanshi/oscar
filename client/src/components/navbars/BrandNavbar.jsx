import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const BrandNavbar = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600';
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        <Link to="/brand/dashboard" className="text-2xl font-bold text-blue-600">
                            BuiltCred
                        </Link>
                        <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                            Brand Advocate
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex gap-8">
                        <Link
                            to="/brand/dashboard"
                            className={`font-medium transition ${isActive('/brand/dashboard')}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/brand/referrals"
                            className={`font-medium transition ${isActive('/brand/referrals')}`}
                        >
                            Referrals
                        </Link>
                        <Link
                            to="/brand/rewards"
                            className={`font-medium transition ${isActive('/brand/rewards')}`}
                        >
                            Rewards
                        </Link>
                        <Link
                            to="/brand/project"
                            className={`font-medium transition ${isActive('/brand/project')}`}
                        >
                            Project
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user?.phone}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex gap-4 mt-4 overflow-x-auto pb-2">
                    <Link
                        to="/brand/dashboard"
                        className={`font-medium whitespace-nowrap transition ${isActive('/brand/dashboard')}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/brand/referrals"
                        className={`font-medium whitespace-nowrap transition ${isActive('/brand/referrals')}`}
                    >
                        Referrals
                    </Link>
                    <Link
                        to="/brand/rewards"
                        className={`font-medium whitespace-nowrap transition ${isActive('/brand/rewards')}`}
                    >
                        Rewards
                    </Link>
                    <Link
                        to="/brand/project"
                        className={`font-medium whitespace-nowrap transition ${isActive('/brand/project')}`}
                    >
                        Project
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default BrandNavbar;
