import { useState, useCallback } from 'react';
import { advocateAPI } from '../services/api';

/**
 * Hook for managing advocate operations
 * Handles registration, profile updates, and statistics
 */
export const useAdvocate = () => {
    const [advocate, setAdvocate] = useState(null);
    const [advocates, setAdvocates] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Register as advocate
    const register = useCallback(async (advocateType, projectId = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await advocateAPI.register(advocateType, projectId);
            if (response.data?.success) {
                setAdvocate(response.data);
                return response.data;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to register as advocate';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get advocate details
    const getDetails = useCallback(async (advocateId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await advocateAPI.getDetails(advocateId);
            if (response.data?.success) {
                setAdvocate(response.data.advocate);
                return response.data.advocate;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch advocate details';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get all advocates for user
    const getByUser = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await advocateAPI.getByUser(userId);
            if (response.data?.success) {
                setAdvocates(response.data.advocates);
                return response.data.advocates;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch advocates';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get advocate statistics
    const getStats = useCallback(async (advocateId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await advocateAPI.getStats(advocateId);
            if (response.data?.success) {
                setStats(response.data.stats);
                return response.data.stats;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch stats';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update advocate profile
    const update = useCallback(async (advocateId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await advocateAPI.update(advocateId, data);
            if (response.data?.success) {
                setAdvocate(response.data.advocate);
                return response.data.advocate;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update advocate';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        advocate,
        advocates,
        stats,
        loading,
        error,
        register,
        getDetails,
        getByUser,
        getStats,
        update,
        clearError
    };
};

export default useAdvocate;
