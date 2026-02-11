import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Nav() {
    return (
        <nav className="nav">
            <ul>
                <li>
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
                        About
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}
