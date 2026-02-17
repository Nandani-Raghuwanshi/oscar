import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Nav.css';

function AdminNav() {
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
        <nav className="navbar admin-navbar">
            <div className="nav-container">
                <Link to="/admin" className="nav-logo" onClick={() => setIsOpen(false)}>
                    BuiltCred Admin
                </Link>

                <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>
                            Admin Dashboard
                        </Link>
                    </li>

                    {/* User Dropdown */}
                    <li className="nav-item dropdown">
                        <span className="nav-link">👤 {user?.full_name || 'Admin'}</span>
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

export default AdminNav;
