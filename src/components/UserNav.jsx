import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Nav.css';

function UserNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <nav className="navbar user-navbar">
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

                    <li className="nav-item">
                        <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
                            About
                        </Link>
                    </li>

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

export default UserNav;
