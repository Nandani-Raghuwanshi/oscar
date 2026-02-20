import React from 'react';
import { useAuthStore } from '../store/authStore';
import { AdminNavbar } from './navbars/AdminNavbar';
import { BuilderNavbar } from './navbars/BuilderNavbar';
import { CRMNavbar } from './navbars/CRMNavbar';
import { AdvocateNavbar } from './navbars/AdvocateNavbar';

export const RoleBasedLayout = ({ children }) => {
    const { user } = useAuthStore();

    const getNavbar = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminNavbar />;
            case 'builder':
                return <BuilderNavbar />;
            case 'crm_manager':
            case 'sales_associate':
                return <CRMNavbar />;
            case 'project_advocate':
            case 'brand_advocate':
                return <AdvocateNavbar />;
            default:
                return <AdminNavbar />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {getNavbar()}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};
