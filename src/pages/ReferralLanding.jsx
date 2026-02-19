import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { referralAPI } from '../services/api';
import '../styles/referral-landing.css';

export default function ReferralLanding() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    // Loading and project states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const [referralUuid, setReferralUuid] = useState(null);

    // Form states
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        lead_name: '',
        lead_phone: '',
        lead_email: '',
        budget_range: ''
    });

    // Load project info on mount
    useEffect(() => {
        const loadProjectInfo = async () => {
            try {
                setLoading(true);
                setError('');

                // Call the visit tracking endpoint
                const response = await referralAPI.trackClick(uuid);
                const projectData = response.data;

                console.log('Tracked referral visit:', projectData);

                setProjectInfo(projectData);
                setReferralUuid(projectData.referral_uuid);
            } catch (err) {
                console.error('Failed to load project info:', err);
                const errorMsg =
                    err.response?.data?.error ||
                    err.message ||
                    'Invalid referral link';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            loadProjectInfo();
        }
    }, [uuid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitLead = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Validate required fields
            if (!formData.lead_name || !formData.lead_phone) {
                throw new Error('Name and phone are required');
            }

            // Submit the lead
            const submitResponse = await referralAPI.submitLead(referralUuid, formData);
            console.log('Lead submitted:', submitResponse.data);

            // Mark form as submitted
            setFormSubmitted(true);

            // Clear form
            setFormData({
                lead_name: '',
                lead_phone: '',
                lead_email: '',
                budget_range: ''
            });

            // Redirect after success message
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Error submitting lead:', err);
            const errorMsg =
                err.response?.data?.error ||
                err.message ||
                'Failed to submit information';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="referral-landing-page">
                <div className="loading-spinner">
                    <p>Loading project information...</p>
                </div>
            </main>
        );
    }

    if (error && !projectInfo) {
        return (
            <main className="referral-landing-page">
                <div className="container">
                    <div className="error-box">
                        <h2>Invalid Referral Link</h2>
                        <p style={{ color: '#c33', marginBottom: '20px' }}>{error}</p>
                        <a href="/" className="btn btn-primary">
                            Return Home
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    if (formSubmitted) {
        return (
            <main className="referral-landing-page">
                <div className="container">
                    <div className="success-box">
                        <div className="success-icon">✓</div>
                        <h2>Thank You!</h2>
                        <p>Your information has been submitted successfully.</p>
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                            We'll contact you soon with project details and special offers.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="referral-landing-page">
            <div className="container">
                {/* Project Header */}
                <section className="project-header">
                    <h1>{projectInfo?.project_name}</h1>
                    <p className="location">📍 {projectInfo?.location}</p>
                    {projectInfo?.description && (
                        <p className="description">{projectInfo.description}</p>
                    )}
                </section>

                {/* Project Details Grid */}
                <section className="project-details">
                    {projectInfo?.units && (
                        <div className="detail-card">
                            <p className="label">Total Units</p>
                            <p className="value">{projectInfo.units}</p>
                        </div>
                    )}
                    {projectInfo?.total_budget && (
                        <div className="detail-card">
                            <p className="label">Project Value</p>
                            <p className="value">₹{(projectInfo.total_budget / 10000000).toFixed(1)}Cr</p>
                        </div>
                    )}
                    {projectInfo?.developer && (
                        <div className="detail-card">
                            <p className="label">Developer</p>
                            <p className="value">{projectInfo.developer}</p>
                        </div>
                    )}
                </section>

                {/* Lead Form */}
                <section className="lead-form-card">
                    <h2>Get Special Referral Offer</h2>
                    <p className="subtitle">Share your information to receive exclusive pricing and details</p>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmitLead}>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="lead_name"
                                value={formData.lead_name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                name="lead_phone"
                                value={formData.lead_phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email (Optional)</label>
                            <input
                                type="email"
                                name="lead_email"
                                value={formData.lead_email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label>Budget Range (Optional)</label>
                            <select
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleInputChange}
                            >
                                <option value="">Select budget range</option>
                                <option value="below_50L">Below ₹50 Lakhs</option>
                                <option value="50L_1Cr">₹50 Lakhs - ₹1 Crore</option>
                                <option value="1Cr_2Cr">₹1 Crore - ₹2 Crores</option>
                                <option value="above_2Cr">Above ₹2 Crores</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="submit-btn"
                        >
                            {submitting ? 'Submitting...' : 'Get Exclusive Offer'}
                        </button>
                    </form>

                    <p className="privacy-note">
                        Your information is safe with us. We'll contact you only regarding this project.
                    </p>
                </section>
            </div>
        </main>
    );
}
