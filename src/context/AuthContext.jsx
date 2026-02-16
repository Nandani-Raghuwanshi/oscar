import { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loginStatus, setLoginStatus] = useState(null); // 'pending', 'rejected', 'approved'

    // Initialize user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse stored user:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    /**
     * Task: Implement user signup
     * - Make POST request to /api/auth/signup
     * - Store user data and token on success (if approved)
     * - Handle pending approval status
     * - Handle errors appropriately
     */
    const signup = useCallback(async (email, password, fullName, role = 'user', advocateType = null) => {
        setIsLoading(true);
        setError(null);
        setLoginStatus(null);

        try {
            const response = await authAPI.signup(email, password, fullName, role, advocateType);
            const { user: userData, token, message } = response.data;

            if (token) {
                // User is approved, store token and data
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setLoginStatus('approved');
            } else {
                // User is pending approval
                setLoginStatus('pending');
                setUser(userData);
            }

            return userData;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Signup failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Task: Implement user login
     * - Make POST request to /api/auth/login
     * - Store user data and token on success
     * - Handle pending approval status
     * - Handle rejected status
     * - Handle errors appropriately
     */
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);
        setLoginStatus(null);

        try {
            const response = await authAPI.login(email, password);
            const { user: userData, token, status } = response.data;

            if (status === 'approved' && token) {
                // User is approved, store token and data
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setLoginStatus('approved');
            } else if (status === 'pending') {
                // User is waiting for approval
                setLoginStatus('pending');
                setUser(userData);
                setError(null); // Clear error, show pending message instead
            } else if (status === 'rejected') {
                // User registration was rejected
                setLoginStatus('rejected');
                setUser(userData);
                setError('Your registration has been rejected');
            }

            return userData;
        } catch (err) {
            // Handle specific status codes
            if (err.response?.status === 202) {
                // 202 Accepted - pending approval
                const userData = err.response?.data?.user;
                setLoginStatus('pending');
                setUser(userData);
                setError(null);
                return userData;
            } else if (err.response?.status === 403) {
                // 403 Forbidden - rejected or inactive
                const userData = err.response?.data?.user;
                setLoginStatus('rejected');
                setUser(userData);
                setError(err.response?.data?.message || 'Account access denied');
                throw err;
            } else {
                const message = err.response?.data?.error || err.message || 'Login failed';
                setError(message);
                throw err;
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Task: Implement user logout
     * - Make POST request to /api/auth/logout
     * - Clear user data and token from storage
     * - Reset app state
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await authAPI.logout();
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setLoginStatus(null);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Logout failed';
            setError(message);
            // Still clear local state even if logout fails
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setLoginStatus(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        user,
        isLoading,
        error,
        loginStatus,
        signup,
        login,
        logout,
        isAuthenticated: !!user && (user.status === 'approved' || user.status === undefined),
        isAdmin: user?.role === 'admin' && user?.status === 'approved',
        isAdvocate: ['advocate', 'brand_advocate'].includes(user?.role) && user?.status === 'approved',
        isPendingApproval: user?.status === 'pending',
        isRejected: user?.status === 'rejected',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
