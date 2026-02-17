import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './ResetPassword.css';

function ResetPassword() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain lowercase letters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain uppercase letters';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain numbers';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Validation
            if (!formData.current_password) {
                setError('Current password is required');
                setLoading(false);
                return;
            }

            if (!formData.new_password) {
                setError('New password is required');
                setLoading(false);
                return;
            }

            // Validate new password strength
            const passwordError = validatePassword(formData.new_password);
            if (passwordError) {
                setError(passwordError);
                setLoading(false);
                return;
            }

            if (formData.new_password !== formData.confirm_password) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (formData.current_password === formData.new_password) {
                setError('New password must be different from current password');
                setLoading(false);
                return;
            }

            // Call API to reset password
            const response = await userAPI.resetPassword(
                formData.current_password,
                formData.new_password
            );

            setMessage('✅ Password changed successfully! Redirecting...');

            // Redirect after showing success message
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
        <div className="reset-password-container">
            <div className="reset-password-card">
                <div className="password-header">
                    <h1>🔐 Reset Password</h1>
                    <p>Change your password to keep your account secure</p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="password-form">
                    {/* Current Password */}
                    <div className="form-group">
                        <label htmlFor="current_password">Current Password *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                id="current_password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('current')}
                                disabled={loading}
                            >
                                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="new_password">New Password *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                id="new_password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Enter a new password"
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={loading}
                            >
                                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <div className="password-requirements">
                            <p className={formData.new_password.length >= 8 ? 'met' : ''}>✓ At least 8 characters</p>
                            <p className={/[a-z]/.test(formData.new_password) ? 'met' : ''}>✓ Lowercase letters</p>
                            <p className={/[A-Z]/.test(formData.new_password) ? 'met' : ''}>✓ Uppercase letters</p>
                            <p className={/[0-9]/.test(formData.new_password) ? 'met' : ''}>✓ Numbers</p>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={loading}
                            >
                                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {formData.new_password && formData.confirm_password && (
                            <p className={formData.new_password === formData.confirm_password ? 'match' : 'mismatch'}>
                                {formData.new_password === formData.confirm_password ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? '⏳ Changing...' : '🔒 Change Password'}
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

                <div className="password-footer">
                    <div className="security-tips">
                        <h4>🛡️ Security Tips:</h4>
                        <ul>
                            <li>Use a strong, unique password</li>
                            <li>Don't share your password with anyone</li>
                            <li>Change your password regularly</li>
                            <li>Avoid using common words or patterns</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
