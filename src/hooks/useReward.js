import { useState, useCallback } from 'react';
import { rewardAPI } from '../services/api';

/**
 * Hook for managing reward operations
 * Handles reward retrieval and summary information
 */
export const useReward = () => {
    const [rewards, setRewards] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get advocate rewards
    const getByAdvocate = useCallback(async (advocateId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rewardAPI.getByAdvocate(advocateId);
            if (response.data?.success) {
                setRewards(response.data.rewards);
                return response.data;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch rewards';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get reward summary
    const getSummary = useCallback(async (advocateId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rewardAPI.getSummary(advocateId);
            if (response.data?.success) {
                setSummary(response.data.summary);
                return response.data.summary;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch summary';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get pending rewards (admin)
    const getPendingAll = useCallback(async (limit = 50) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rewardAPI.getPendingAll(limit);
            if (response.data?.success) {
                return response.data.pending_rewards;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch pending rewards';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        rewards,
        summary,
        loading,
        error,
        getByAdvocate,
        getSummary,
        getPendingAll,
        clearError
    };
};

export default useReward;
