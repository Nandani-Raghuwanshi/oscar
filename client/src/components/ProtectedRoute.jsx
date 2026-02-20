import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, requiredRole, requiredRoles, allowedRoles }) => {
    const { user, token } = useAuthStore();

    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    // Support multiple ways to specify allowed roles
    const roles = requiredRole ? [requiredRole] : (requiredRoles || allowedRoles || []);

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};
