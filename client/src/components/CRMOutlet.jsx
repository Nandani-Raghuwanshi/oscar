import { Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import CRMNavbar from './navbars/CRMNavbar';
import { authStore } from '../store';

const CRMOutlet = () => {
    const { user, isAuthenticated } = authStore();

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'crm_manager' && user?.role !== 'sales_associate') {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <CRMNavbar />
            <main className="min-h-screen bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};

export default CRMOutlet;
