import React from 'react';
import { Outlet } from 'react-router-dom';
import RoleBasedLayout from '../RoleBasedLayout';
import BrandNavbar from '../navbars/BrandNavbar';

/**
 * BrandAdvocateOutlet
 * Wrapper component for all brand advocate routes.
 * Provides navbar and layout structure.
 */
const BrandAdvocateOutlet = () => {
    return (
        <RoleBasedLayout requiredRoles={['brand_advocate']}>
            <BrandNavbar />
            <main className="min-h-screen bg-gray-50">
                <Outlet />
            </main>
        </RoleBasedLayout>
    );
};

export default BrandAdvocateOutlet;
