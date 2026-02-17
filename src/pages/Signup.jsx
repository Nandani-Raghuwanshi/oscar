import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLoginRedirect } from '../hooks/useLoginRedirect';

export default function Signup() {
    const { signup, isLoading, error: contextError, loginStatus, isAuthenticated, user } = useContext(AuthContext);

    // Use custom hook for login redirects (only redirect if approved, not pending)
    useLoginRedirect(isAuthenticated && loginStatus === 'approved');

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user'); // 'user', 'advocate', 'brand_advocate'
    const [advocateType, setAdvocateType] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Show pending message after signup
    useEffect(() => {
        if (loginStatus === 'pending') {
            // Show pending message but don't redirect (hook handles redirect on approval)
            setSubmitError('✓ Registration submitted! Your account is pending admin approval.');
        }
    }, [loginStatus]);

    // Calculate password strength (0-4)
    const calculatePasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        /[!@#$%^&*]/.test(pwd) && strength++;
        return Math.min(strength, 4);
    };

    // Validation rules
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain both uppercase and lowercase letters';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (role !== 'user' && !advocateType) {
            newErrors.advocateType = 'Please select an advocate type';
        }

        if (!agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'fullName':
                setFullName(value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
                break;
            case 'email':
                setEmail(value);
                if (errors.email) setErrors({ ...errors, email: '' });
                break;
            case 'password':
                setPassword(value);
                setPasswordStrength(calculatePasswordStrength(value));
                if (errors.password) setErrors({ ...errors, password: '' });
                if (confirmPassword && value !== confirmPassword) {
                    if (!errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                    }
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirmPassword;
                        return newErrors;
                    });
                }
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                break;
            case 'role':
                setRole(value);
                setAdvocateType(''); // Reset advocate type when role changes
                if (errors.advocateType) setErrors({ ...errors, advocateType: '' });
                break;
            case 'advocateType':
                setAdvocateType(value);
                if (errors.advocateType) setErrors({ ...errors, advocateType: '' });
                break;
            default:
                break;
        }
        setSubmitError('');
    };

    const getPasswordStrengthLabel = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return labels[passwordStrength] || '';
    };

    const getPasswordStrengthColor = () => {
        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#16a085'];
        return colors[passwordStrength] || '#ccc';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        try {
            const finalAdvocateType = role !== 'user' ? advocateType : null;
            await signup(email, password, fullName, role, finalAdvocateType);
            // The useEffect above handles the response based on loginStatus
        } catch (err) {
            if (loginStatus !== 'pending') {
                setSubmitError(contextError || 'Signup failed. Please try again.');
            }
        }
    };

    return (
        <main>
            <div className="page-header">
                <h1>Sign Up</h1>
                <p>Create your BuiltCred account</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <div className="signup-form-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2>Create Your Account</h2>

                        {submitError && (
                            <div className={`status-box ${loginStatus === 'pending' ? 'pending' : 'error'}`} style={{
                                padding: '12px',
                                marginBottom: '20px',
                                backgroundColor: loginStatus === 'pending' ? '#d4edda' : '#fee',
                                border: `1px solid ${loginStatus === 'pending' ? '#c3e6cb' : '#fcc'}`,
                                borderRadius: '4px',
                                color: loginStatus === 'pending' ? '#155724' : '#c33',
                                fontSize: '14px'
                            }}>
                                {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Full Name Field */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="fullName" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.fullName ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.fullName && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.fullName}
                                    </span>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleInputChange}
                                    onBlur={() => {
                                        if (email && !validateEmail(email)) {
                                            setErrors({ ...errors, email: 'Please enter a valid email address' });
                                        }
                                    }}
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.email ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.email && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="role" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Account Type
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <option value="user">Regular User</option>
                                    <option value="advocate">Project Advocate</option>
                                    <option value="brand_advocate">Brand Advocate</option>
                                </select>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    {role === 'user' && 'Browse and participate in referral opportunities'}
                                    {role === 'advocate' && 'Refer projects and build your network (requires approval)'}
                                    {role === 'brand_advocate' && 'Represent a brand as an advocate (requires approval)'}
                                </div>
                            </div>

                            {/* Advocate Type (only if not user) */}
                            {role !== 'user' && (
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label htmlFor="advocateType" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Advocate Type
                                    </label>
                                    <select
                                        id="advocateType"
                                        name="advocateType"
                                        value={advocateType}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: errors.advocateType ? '2px solid #e74c3c' : '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <option value="">-- Select advocate type --</option>
                                        <option value="project_advocate">Project Advocate</option>
                                        <option value="brand_advocate">Brand Advocate</option>
                                    </select>
                                    {errors.advocateType && (
                                        <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                            {errors.advocateType}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Password Field */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={handleInputChange}
                                    placeholder="Enter a strong password"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.password ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '4px',
                                            marginBottom: '5px'
                                        }}>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        height: '4px',
                                                        backgroundColor: i < passwordStrength ? getPasswordStrengthColor() : '#ddd',
                                                        borderRadius: '2px',
                                                        transition: 'background-color 0.3s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span style={{
                                            fontSize: '12px',
                                            color: getPasswordStrengthColor(),
                                            fontWeight: 'bold'
                                        }}>
                                            Strength: {getPasswordStrengthLabel()}
                                        </span>
                                    </div>
                                )}

                                {errors.password && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.confirmPassword ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.confirmPassword && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.confirmPassword}
                                    </span>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    checked={agreeTerms}
                                    onChange={(e) => {
                                        setAgreeTerms(e.target.checked);
                                        if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
                                    }}
                                    disabled={isLoading}
                                    style={{ marginTop: '4px', cursor: 'pointer' }}
                                />
                                <label htmlFor="agreeTerms" style={{ cursor: 'pointer', marginBottom: 0, fontSize: '14px' }}>
                                    I agree to the{' '}
                                    <a href="/terms" style={{ color: '#007bff', textDecoration: 'none' }}>
                                        Terms and Conditions
                                    </a>
                                    {role !== 'user' && ' and understand that my account requires admin approval'}
                                </label>
                                {errors.agreeTerms && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.agreeTerms}
                                    </span>
                                )}
                            </div>

                            {/* Signup Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            {/* Link to Login */}
                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                                <p>
                                    Already have an account?{' '}
                                    <a href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                                        Sign in here
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
