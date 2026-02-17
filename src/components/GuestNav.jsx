import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Nav.css';

function GuestNav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar guest-navbar">
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

                    <li className="nav-item">
                        <Link to="/login" className="nav-link nav-link-primary" onClick={() => setIsOpen(false)}>
                            Login
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link to="/signup" className="nav-link nav-link-secondary" onClick={() => setIsOpen(false)}>
                            Sign Up
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default GuestNav;
