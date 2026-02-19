import { useState } from 'react';
import { useReferral } from '../../hooks/useReferral';
import { useParams } from 'react-router-dom';

/**
 * Referral Lead Form Component
 * Public form for collecting lead information from referral links
 */
export default function ReferralLeadForm() {
    const { referralUuid } = useParams();
    const [formData, setFormData] = useState({
        lead_name: '',
        lead_phone: '',
        lead_email: '',
        budget_range: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { submitLead, loading, error } = useReferral();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreed) {
            alert('Please agree to the terms to continue');
            return;
        }

        try {
            await submitLead(referralUuid, formData);
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit lead', err);
        }
    };

    if (submitted) {
        return (
            <main>
                <div className="page-header">
                    <h1>Thank You!</h1>
                    <p>Your information has been received.</p>
                </div>

                <div className="container">
                    <div className="content-box">
                        <div className="success-message">
                            <p>Our sales team will contact you shortly at <strong>{formData.lead_phone}</strong></p>
                            <h3>What Next?</h3>
                            <ol>
                                <li>We'll reach out within 24 hours</li>
                                <li>Schedule a site visit at your convenience</li>
                                <li>Receive special referral pricing</li>
                                <li>Complete your booking</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="page-header">
                <h1>Lead Capture Form</h1>
                <p>Enter your details to proceed</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="lead_name">Full Name *</label>
                            <input
                                id="lead_name"
                                name="lead_name"
                                type="text"
                                value={formData.lead_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lead_phone">Phone Number *</label>
                            <input
                                id="lead_phone"
                                name="lead_phone"
                                type="tel"
                                value={formData.lead_phone}
                                onChange={handleChange}
                                required
                                placeholder="10-digit mobile number"
                                pattern="[0-9]{10}"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lead_email">Email Address</label>
                            <input
                                id="lead_email"
                                name="lead_email"
                                type="email"
                                value={formData.lead_email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="budget_range">Budget Range</label>
                            <select
                                id="budget_range"
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">-- Select budget --</option>
                                <option value="50-100L">50 - 100 Lakhs</option>
                                <option value="100-200L">100 - 200 Lakhs</option>
                                <option value="200-300L">200 - 300 Lakhs</option>
                                <option value="300-500L">300 - 500 Lakhs</option>
                                <option value="500L+">500+ Lakhs</option>
                            </select>
                        </div>

                        <div className="form-group checkbox">
                            <input
                                id="agreed"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                disabled={loading}
                            />
                            <label htmlFor="agreed">
                                I agree to be contacted by the sales team.
                            </label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading || !agreed}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
