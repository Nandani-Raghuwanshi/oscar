import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
    const [menuOpen, setMenuOpen] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        setMenuOpen(false)
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">🏗️</span>
                    <h1>BuiltCred</h1>
                </div>

                <button
                    className={`hamburger ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            onClick={() => setMenuOpen(false)}
                        >
                            🏠 Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/about"
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            onClick={() => setMenuOpen(false)}
                        >
                            ℹ️ About
                        </NavLink>
                    </li>

                    {isAuthenticated ? (
                        <>
                            <li className="nav-item">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    📊 Dashboard
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/referral/new"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    ➕ New Referral
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/rewards"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    🎁 Rewards
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    ⚙️ Admin
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <span className="user-info">👤 {user?.full_name}</span>
                            </li>
                            <li className="nav-item">
                                <button
                                    className="nav-link logout-btn"
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    🔐 Login
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/signup"
                                    className={({ isActive }) => isActive ? 'nav-link active nav-link-signup' : 'nav-link nav-link-signup'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    📝 Sign Up
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    )
}
