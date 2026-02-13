import React, { useState, useEffect } from 'react'

export default function Home() {
    const [apiStatus, setApiStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkApiHealth()
    }, [])

    const checkApiHealth = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health')
            if (response.ok) {
                setApiStatus('connected')
            } else {
                setApiStatus('error')
            }
        } catch (error) {
            setApiStatus('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='container'>
            <div className='hero'>
                <h1>Welcome to BuiltCred Referral System</h1>
                <p className='subtitle'>Connect with property enthusiasts and earn rewards</p>

                <div className='status-card'>
                    <h2>System Status</h2>
                    {loading ? (
                        <p className='status-loading'>Checking connection...</p>
                    ) : apiStatus === 'connected' ? (
                        <div className='status-success'>
                            <span className='status-indicator connected'></span>
                            <p>✅ Backend API is running on <code>localhost:5000</code></p>
                        </div>
                    ) : (
                        <div className='status-error'>
                            <span className='status-indicator disconnected'></span>
                            <p>⚠️ Backend API is not reachable. Make sure Flask server is running.</p>
                            <p className='help-text'>Run: <code>python app.py</code> in the server directory</p>
                        </div>
                    )}
                </div>

                <div className='features'>
                    <div className='feature-card'>
                        <h3>📱 Easy Referrals</h3>
                        <p>Share referral links with fellow residents and earn rewards</p>
                    </div>
                    <div className='feature-card'>
                        <h3>💰 Track Rewards</h3>
                        <p>Monitor your referrals and track reward progress in real-time</p>
                    </div>
                    <div className='feature-card'>
                        <h3>🎯 Smart Attribution</h3>
                        <p>Fair reward distribution based on first-touch and last-touch attribution</p>
                    </div>
                </div>

                <div className='cta-buttons'>
                    <button className='btn btn-primary'>Get Started</button>
                    <button className='btn btn-secondary'>Learn More</button>
                </div>
            </div>
        </div>
    )
}
