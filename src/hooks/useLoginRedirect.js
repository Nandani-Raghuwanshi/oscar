import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to handle login redirects based on user role and status
 * Usage: useLoginRedirect(shouldRedirect)
 */
export function useLoginRedirect(shouldRedirect = true) {
    const navigate = useNavigate();
    const { isAuthenticated, user, loginStatus } = useContext(AuthContext);

    useEffect(() => {
        if (!shouldRedirect) return;

        if (isAuthenticated && loginStatus === 'approved') {
            // Redirect based on user role
            if (user?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (user?.role === 'advocate' || user?.role === 'brand_advocate') {
                navigate('/dashboard', { replace: true });
            } else {
                // Regular user
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, loginStatus, user, navigate, shouldRedirect]);
}

/**
 * Get redirect path based on user role and status
 * Returns the appropriate route for a user
 */
export function getRedirectPath(user, status) {
    if (!user || status !== 'approved') {
        return '/login';
    }

    if (user.role === 'admin') {
        return '/admin';
    }

    if (user.role === 'advocate' || user.role === 'brand_advocate') {
        return '/dashboard';
    }

    return '/dashboard';
}

/**
 * Check if user should be redirected away from login/signup pages
 * Returns true if user should not be on these pages
 */
export function shouldRedirectFromAuth(isAuthenticated, status) {
    return isAuthenticated && status === 'approved';
}
