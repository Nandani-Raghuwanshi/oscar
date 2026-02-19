import { useState, useCallback, useEffect } from 'react';
import { referralAPI } from '../services/api';

/**
 * Hook for managing referral operations
 * Handles link creation, lead submission, and status tracking
 */
export const useReferral = () => {
    const [referral, setReferral] = useState(null);
    const [referralLink, setReferralLink] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create referral link (userId can be advocate user ID)
    const createLink = useCallback(async (userId, projectId, channel = 'direct') => {
        setLoading(true);
        setError(null);
        try {
            if (!userId || !projectId) {
                throw new Error('User ID and Project ID are required');
            }

            const response = await referralAPI.createLink(userId, projectId, channel);
            const responseData = response.data;

            // Check if response has success flag or if it just has the data
            if (responseData?.success || responseData?.link || responseData?.referral_uuid) {
                setReferral(responseData);
                setReferralLink(responseData.link || responseData.referral_uuid);
                setQrCode(responseData.qr_code_url);
                return responseData;
            } else if (responseData?.error) {
                throw new Error(responseData.error);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Failed to create referral link';
            setError(message);
            console.error('Error in createLink:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Submit lead
    const submitLead = useCallback(async (referralUuid, leadData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await referralAPI.submitLead(referralUuid, leadData);
            if (response.data?.success) {
                return response.data;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to submit lead';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get referral details
    const getDetails = useCallback(async (referralUuid) => {
        setLoading(true);
        setError(null);
        try {
            const response = await referralAPI.getDetails(referralUuid);
            if (response.data?.success) {
                return response.data;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to get referral details';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get advocate's referrals
    const getByAdvocate = useCallback(async (advocateId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await referralAPI.getByAdvocate(advocateId);
            if (response.data?.success) {
                return response.data;
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch referrals';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        referral,
        referralLink,
        qrCode,
        loading,
        error,
        createLink,
        submitLead,
        getDetails,
        getByAdvocate,
        clearError
    };
};

export default useReferral;
