import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Nav.css';

function AdvocateNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isPendingApproval, isRejected } = useContext(AuthContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <nav className="navbar advocate-navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
                    BuiltCred Advocate
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

                    {/* Referral Menu - Only if approved */}
                    {!isPendingApproval && !isRejected && (
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
                                        My Link & QR
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}

                    {/* Dashboard Menu - Only if approved */}
                    {!isPendingApproval && !isRejected && (
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
                                        Projects
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

                    {/* Status Info */}
                    {isPendingApproval && (
                        <li className="nav-item">
                            <span className="nav-link status-pending">⏳ Approval Pending</span>
                        </li>
                    )}
                    {isRejected && (
                        <li className="nav-item">
                            <span className="nav-link status-rejected">❌ Registration Rejected</span>
                        </li>
                    )}

                    {/* User Dropdown */}
                    <li className="nav-item dropdown">
                        <span className="nav-link">👤 {user?.full_name || 'User'}</span>
                        <ul className="dropdown-menu">
                            <li>
                                <Link to="/profile" onClick={() => setIsOpen(false)}>
                                    👤 Edit Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/reset-password" onClick={() => setIsOpen(false)}>
                                    🔐 Reset Password
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="dropdown-logout">
                                    🚪 Logout
                                </button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default AdvocateNav;
