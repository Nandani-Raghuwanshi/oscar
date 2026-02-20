import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Layout } from '../components/Layout';

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Redirect to role-specific dashboards
    useEffect(() => {
        if (user?.role === 'brand_advocate') {
            navigate('/brand/dashboard');
        } else if (user?.role === 'project_advocate') {
            navigate('/advocate/dashboard');
        } else if (user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user?.role === 'builder') {
            navigate('/builder/dashboard');
        } else if (['crm_manager', 'sales_associate'].includes(user?.role)) {
            navigate('/crm/dashboard');
        }
    }, [user?.role, navigate]);

    const getRoleDisplayName = (role) => {
        const roleMap = {
            admin: 'Administrator',
            builder: 'Builder/Developer',
            crm_manager: 'CRM Manager',
            sales_associate: 'Sales Associate',
            project_advocate: 'Project Advocate',
            brand_advocate: 'Brand Advocate'
        };
        return roleMap[role] || role;
    };

    return (
        <Layout>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-lg font-medium text-gray-900">{user?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                    {getRoleDisplayName(user?.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Getting Started Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
                        <div className="space-y-3">
                            <p className="text-gray-600">
                                Welcome to BuiltCred! You're now logged in as a {getRoleDisplayName(user?.role)}.
                            </p>
                            <p className="text-gray-600">
                                Features for your role will be available soon as development progresses through the phases.
                            </p>
                            <div className="mt-4 p-4 bg-blue-50 rounded">
                                <p className="text-sm text-blue-900 font-semibold">Coming Soon</p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                                    <li>• Role-specific dashboards</li>
                                    <li>• Project management</li>
                                    <li>• Referral tracking</li>
                                    <li>• Analytics and reports</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
