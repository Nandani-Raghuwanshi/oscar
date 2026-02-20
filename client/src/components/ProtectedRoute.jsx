import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, requiredRole, requiredRoles, allowedRoles }) => {
    const { user, token } = useAuthStore();

    // No token or user - redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Support multiple ways to specify allowed roles
    const roles = requiredRole ? [requiredRole] : (requiredRoles || allowedRoles || []);

    // If roles are specified and user doesn't have the required role, deny access
    if (roles.length > 0 && !roles.includes(user.role)) {
        alert('Access denied: You do not have permission to view this page.');
        console.log(`Access denied: User role '${user.role}' not in allowed roles:`, roles);
        return <Navigate to="/dashboard" replace />;
    }

    // All checks passed
    return children;
};
