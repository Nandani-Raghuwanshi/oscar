import React from 'react';
import { useAuthStore } from '../../store/authStore';

export const AdvocateDashboard = () => {
    const { user } = useAuthStore();
    const isProjectAdvocate = user?.role === 'project_advocate';

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
                {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'} Dashboard
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Referrals Sent</h3>
                    <p className="text-4xl font-bold text-amber-600 mt-2">--</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Conversions</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">--</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Rewards Earned</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">₹--</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-lg font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
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
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                                {isProjectAdvocate ? 'Project Advocate' : 'Brand Advocate'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
