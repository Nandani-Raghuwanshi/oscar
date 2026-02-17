import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './ProfileUpdate.css';

function ProfileUpdate() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        project_name: '',
        plot_number: ''
    });

    // Initialize form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                project_name: user.project_name || '',
                plot_number: user.plot_number || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Validate required fields
            if (!formData.full_name.trim()) {
                setError('Full name is required');
                setLoading(false);
                return;
            }

            if (!formData.email.trim()) {
                setError('Email is required');
                setLoading(false);
                return;
            }

            if (!formData.email.includes('@')) {
                setError('Invalid email format');
                setLoading(false);
                return;
            }

            // Call API to update profile
            const response = await userAPI.updateProfile(formData);

            // Update user data in localStorage
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage('✅ Profile updated successfully!');

            // Refresh user data by fetching from localStorage (auto-updated by backend)
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-update-container">
            <div className="profile-update-card">
                <div className="profile-header">
                    <h1>👤 Update Profile</h1>
                    <p>Keep your information up to date</p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="full_name">Full Name *</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            disabled={loading}
                        />
                    </div>

                    {/* Project Name */}
                    <div className="form-group">
                        <label htmlFor="project_name">Project Name</label>
                        <input
                            type="text"
                            id="project_name"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            disabled={loading}
                        />
                    </div>

                    {/* Plot Number */}
                    <div className="form-group">
                        <label htmlFor="plot_number">Plot Number</label>
                        <input
                            type="text"
                            id="plot_number"
                            name="plot_number"
                            value={formData.plot_number}
                            onChange={handleChange}
                            placeholder="Enter plot number"
                            disabled={loading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? '⏳ Updating...' : '💾 Save Changes'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                        >
                            ← Cancel
                        </button>
                    </div>
                </form>

                <div className="profile-footer">
                    <p className="info-text">ℹ️ Need to change your password? <a href="/reset-password">Click here</a></p>
                </div>
            </div>
        </div>
    );
}

export default ProfileUpdate;
