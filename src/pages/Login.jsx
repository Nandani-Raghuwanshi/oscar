import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLoginRedirect } from '../hooks/useLoginRedirect';

export default function Login() {
    const { login, isLoading, error: contextError, loginStatus } = useContext(AuthContext);

    // Use custom hook for login redirects
    useLoginRedirect(loginStatus !== 'pending' && loginStatus !== 'rejected');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    // Show pending/rejected message
    useEffect(() => {
        if (loginStatus === 'pending') {
            setSubmitError('Your registration is pending admin approval. Please check back later.');
        } else if (loginStatus === 'rejected') {
            setSubmitError('Your registration has been rejected. Please contact support.');
        }
    }, [loginStatus]);

    // Validation rules
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
            if (errors.email) setErrors({ ...errors, email: '' });
        } else if (name === 'password') {
            setPassword(value);
            if (errors.password) setErrors({ ...errors, password: '' });
        }
        setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        try {
            await login(email, password);

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Redirect happens automatically via useEffect when isAuthenticated changes
        } catch (err) {
            // Error is handled by loginStatus effect above
            if (loginStatus !== 'pending' && loginStatus !== 'rejected') {
                setSubmitError(contextError || 'Login failed. Please try again.');
            }
        }
    };

    // Pre-fill email if remembered
    useEffect(() => {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    return (
        <main>
            <div className="page-header">
                <h1>Login</h1>
                <p>Access your BuiltCred account</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <div className="login-form-wrapper" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <h2>Sign In to BuiltCred</h2>

                        {submitError && (
                            <div className={`status-box ${loginStatus === 'pending' ? 'pending' : 'error'}`} style={{
                                padding: '12px',
                                marginBottom: '20px',
                                backgroundColor: loginStatus === 'pending' ? '#ffe6cc' : '#fee',
                                border: `1px solid ${loginStatus === 'pending' ? '#ffb366' : '#fcc'}`,
                                borderRadius: '4px',
                                color: loginStatus === 'pending' ? '#cc6600' : '#c33',
                                fontSize: '14px'
                            }}>
                                {submitError}
                                {loginStatus === 'pending' && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                                        💡 Admins will review your registration shortly
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
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
                                    disabled={isLoading || loginStatus === 'pending' || loginStatus === 'rejected'}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.email ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: isLoading || loginStatus === 'pending' || loginStatus === 'rejected' ? 0.6 : 1
                                    }}
                                />
                                {errors.email && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

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
                                    placeholder="Enter your password"
                                    disabled={isLoading || loginStatus === 'pending' || loginStatus === 'rejected'}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors.password ? '2px solid #e74c3c' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: isLoading || loginStatus === 'pending' || loginStatus === 'rejected' ? 0.6 : 1
                                    }}
                                />
                                {errors.password && (
                                    <span style={{ color: '#e74c3c', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading || loginStatus === 'pending' || loginStatus === 'rejected'}
                                    style={{ cursor: 'pointer', opacity: isLoading || loginStatus === 'pending' || loginStatus === 'rejected' ? 0.6 : 1 }}
                                />
                                <label htmlFor="rememberMe" style={{ cursor: 'pointer', marginBottom: 0 }}>
                                    Remember me on this device
                                </label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading || loginStatus === 'pending' || loginStatus === 'rejected'}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: isLoading || loginStatus === 'pending' || loginStatus === 'rejected' ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isLoading || loginStatus === 'pending' || loginStatus === 'rejected' ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Login
                            </button>
                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                                <p>
                                    Don't have an account?{' '}
                                    <a href="/signup" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                                        Sign up here
                                    </a>
                                </p>
                                <p>
                                    <a href="/forgot-password" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
                                        Forgot your password?
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
