import { useState } from 'react';
import { useAdvocate } from '../../hooks/useAdvocate';

/**
 * Advocate Type Selection Component
 * Allows users to choose between Project Advocate and Brand Advocate
 */
export default function ReferralSelectType() {
    const [selectedType, setSelectedType] = useState(null);
    const { register, loading, error } = useAdvocate();

    const handleSelect = async (advocateType) => {
        try {
            const result = await register(advocateType);
            localStorage.setItem('advocateId', result.advocate_id);
            localStorage.setItem('advocateType', advocateType);

            // Route directly based on advocate type
            if (advocateType === 'project_advocate' || advocateType === 'PROJECT_ADVOCATE') {
                window.location.href = '/referral/link-qr';
            } else {
                window.location.href = '/referral/dashboard';
            }
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    return (
        <main>
            <div className="page-header">
                <h1>Become an Advocate</h1>
                <p>Choose how you want to refer and earn rewards</p>
            </div>

            <div className="container">
                <div className="advocate-types">
                    <div
                        className={`type-card ${selectedType === 'PROJECT_ADVOCATE' ? 'active' : ''}`}
                        onClick={() => setSelectedType('PROJECT_ADVOCATE')}
                    >
                        <div className="type-icon">🏘️</div>
                        <h2>Project Advocate</h2>
                        <p className="type-description">
                            Own a plot in the current project
                        </p>
                        <ul className="benefits">
                            <li>Refer friends in your community</li>
                            <li>Earn 1% of plot value as reward</li>
                            <li>Track all your referrals</li>
                            <li>Receive referral bonuses</li>
                        </ul>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSelect('PROJECT_ADVOCATE')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'I Own in This Project'}
                        </button>
                    </div>

                    <div
                        className={`type-card ${selectedType === 'BRAND_ADVOCATE' ? 'active' : ''}`}
                        onClick={() => setSelectedType('BRAND_ADVOCATE')}
                    >
                        <div className="type-icon">⭐</div>
                        <h2>Brand Advocate</h2>
                        <p className="type-description">
                            Completed project customer - refer new projects
                        </p>
                        <ul className="benefits">
                            <li>Refer to any new project</li>
                            <li>Earn 1% of plot value as reward</li>
                            <li>Share your positive experience</li>
                            <li>Help friends find their perfect home</li>
                        </ul>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSelect('BRAND_ADVOCATE')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'I\'m a Past Customer'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <div className="info-section">
                    <h3>How It Works</h3>
                    <div className="steps">
                        <div className="step">
                            <span className="step-number">1</span>
                            <h4>Register</h4>
                            <p>Choose your advocate type and verify your details</p>
                        </div>
                        <div className="step">
                            <span className="step-number">2</span>
                            <h4>Create Links</h4>
                            <p>Generate unique referral links with QR codes</p>
                        </div>
                        <div className="step">
                            <span className="step-number">3</span>
                            <h4>Share</h4>
                            <p>Share via WhatsApp, email, or print QR codes</p>
                        </div>
                        <div className="step">
                            <span className="step-number">4</span>
                            <h4>Earn</h4>
                            <p>Get rewarded when referrals convert to bookings</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
