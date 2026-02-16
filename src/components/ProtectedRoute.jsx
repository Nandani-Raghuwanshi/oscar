import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Protected Route Component
 * Restricts access based on authentication and user roles
 * 
 * Usage:
 * <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
 * <ProtectedRoute><Dashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
    const { isAuthenticated, user, isAdmin, isAdvocate, isPendingApproval, isRejected } = useContext(AuthContext);

    // If rejected, show rejection page
    if (isRejected) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div className="content-box">
                        <h2 style={{ color: '#c33', marginBottom: '20px' }}>❌ Access Denied</h2>
                        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                            Your registration has been rejected and you do not have access to this page.
                        </p>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                            Please contact support for more information.
                        </p>
                        <a href="/" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px'
                        }}>
                            Return to Home
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    // If pending approval, show waiting page
    if (isPendingApproval) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div className="content-box">
                        <h2 style={{ color: '#cc6600', marginBottom: '20px' }}>⏳ Pending Approval</h2>
                        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                            your account is pending admin approval. {requiredRole === 'advocate' ? 'Your advocate' : 'Your'} registration is being reviewed.
                        </p>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            We'll notify you once your account has been approved. This typically takes 24-48 hours.
                        </p>
                        <div style={{
                            backgroundColor: '#ffe6cc',
                            border: '1px solid #ffb366',
                            borderRadius: '4px',
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>What happens next?</p>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                <li>Our admin team will review your application</li>
                                <li>We'll verify your information</li>
                                <li>You'll receive an email once approved or if we need more information</li>
                            </ul>
                        </div>
                        <a href="/" style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px'
                        }}>
                            Return to Home
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If role is required and user doesn't have it, deny access
    if (requiredRole && requiredRole === 'admin' && !isAdmin) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div className="content-box">
                        <h2 style={{ color: '#c33', marginBottom: '20px' }}>❌ Admin Access Required</h2>
                        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                            You do not have permission to access this page. Only administrators can view this section.
                        </p>
                        <a href="/dashboard" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px'
                        }}>
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    if (requiredRole && requiredRole === 'advocate' && !isAdvocate) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div className="content-box">
                        <h2 style={{ color: '#c33', marginBottom: '20px' }}>❌ Access Denied</h2>
                        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                            You do not have advocate permissions to access this page.
                        </p>
                        <a href="/dashboard" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px'
                        }}>
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    // User is authenticated and has required role (or no role required)
    return children;
}
