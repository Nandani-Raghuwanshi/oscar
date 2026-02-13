import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { rewardApi } from '../services/api'
import '../styles/dashboard.css'

export default function RewardsDashboard() {
    const { user } = useAuth()
    const [rewards, setRewards] = useState([])
    const [totalRewards, setTotalRewards] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await rewardApi.getRewards(user?.id)
                setRewards(response.data.rewards || [])
                setTotalRewards(response.data.total || 0)
            } catch (err) {
                setError('Failed to load rewards')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (user?.id) {
            fetchRewards()
        }
    }, [user])

    const handleClaimReward = async (rewardId) => {
        try {
            await rewardApi.claimReward(rewardId)
            // Refresh rewards list
            const response = await rewardApi.getRewards(user?.id)
            setRewards(response.data.rewards || [])
        } catch (err) {
            setError('Failed to claim reward')
            console.error(err)
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Rewards Dashboard</h1>
                <p>Track your earned rewards</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="rewards-summary">
                <div className="reward-card total">
                    <h2>Total Rewards Earned</h2>
                    <p className="reward-amount">₹{totalRewards.toLocaleString()}</p>
                </div>
            </div>

            <div className="rewards-list">
                <h2>Your Rewards</h2>
                {rewards.length === 0 ? (
                    <p>No rewards yet. Start referring to earn rewards!</p>
                ) : (
                    <table className="rewards-table">
                        <thead>
                            <tr>
                                <th>Reward ID</th>
                                <th>Amount</th>
                                <th>Property Value</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewards.map((reward) => (
                                <tr key={reward._id}>
                                    <td>{reward.reward_id}</td>
                                    <td className="reward-value">₹{reward.reward_amount.toLocaleString()}</td>
                                    <td>₹{reward.property_value?.toLocaleString()}</td>
                                    <td className={`status-${reward.status}`}>{reward.status}</td>
                                    <td>{new Date(reward.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {reward.status === 'pending' && (
                                            <button
                                                className="btn-claim"
                                                onClick={() => handleClaimReward(reward._id)}
                                            >
                                                Claim
                                            </button>
                                        )}
                                        {reward.status === 'claimed' && (
                                            <span className="claimed-label">✓ Claimed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
