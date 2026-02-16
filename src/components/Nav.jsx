import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Nav.css';

function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, isAdmin, isPendingApproval, isRejected, user, logout } = useContext(AuthContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
                    BuiltCred
                </Link>

                <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                            Home
                        </Link>
                    </li>

                    {/* Referral Menu - Only if authenticated and approved */}
                    {isAuthenticated && !isPendingApproval && !isRejected && (
                        <li className="nav-item dropdown">
                            <span className="nav-link">Referral</span>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link to="/referral/select-type" onClick={() => setIsOpen(false)}>
                                        Start Referral
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/referral/link-qr" onClick={() => setIsOpen(false)}>
                                        My Referral Link
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}

                    {/* Dashboard Menu - Only if authenticated and approved */}
                    {isAuthenticated && !isPendingApproval && !isRejected && (
                        <li className="nav-item dropdown">
                            <span className="nav-link">Dashboard</span>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                                        Overview
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/my-referrals" onClick={() => setIsOpen(false)}>
                                        My Referrals
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/projects" onClick={() => setIsOpen(false)}>
                                        My Projects
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/rewards" onClick={() => setIsOpen(false)}>
                                        Rewards
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/documents" onClick={() => setIsOpen(false)}>
                                        Documents
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/share" onClick={() => setIsOpen(false)}>
                                        Share & Promote
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}

                    {/* Admin Menu - Only if admin */}
                    {isAdmin && (
                        <li className="nav-item">
                            <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>
                                👨‍💼 Admin Panel
                            </Link>
                        </li>
                    )}

                    {/* Status Badge for Pending/Rejected */}
                    {isAuthenticated && (isPendingApproval || isRejected) && (
                        <li className="nav-item">
                            <span className="nav-link" style={{
                                backgroundColor: isPendingApproval ? '#ffe6cc' : '#fee',
                                color: isPendingApproval ? '#cc6600' : '#c33',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                cursor: 'default'
                            }}>
                                {isPendingApproval ? '⏳ Pending' : '❌ Rejected'}
                            </span>
                        </li>
                    )}

                    <li className="nav-item">
                        <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
                            About
                        </Link>
                    </li>

                    {/* Authentication links */}
                    {!isAuthenticated ? (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/signup" className="nav-link nav-link-btn" onClick={() => setIsOpen(false)}>
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item dropdown">
                            <span className="nav-link">
                                👤 {user?.full_name?.split(' ')[0] || 'User'}
                            </span>
                            <ul className="dropdown-menu">
                                <li>
                                    <span style={{
                                        display: 'block',
                                        padding: '10px 15px',
                                        fontSize: '12px',
                                        color: '#666',
                                        borderBottom: '1px solid #ddd'
                                    }}>
                                        {user?.email}
                                    </span>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '10px 15px',
                                            textAlign: 'left',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#c33'
                                        }}
                                    >
                                        🚪 Logout
                                    </button>
                                </li>
                            </ul>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Nav;
