import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Loader from './components/Loader'
import { AuthProvider, useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const AdvocateDashboard = lazy(() => import('./pages/AdvocateDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const RewardsDashboard = lazy(() => import('./pages/RewardsDashboard'))
const ReferralForm = lazy(() => import('./pages/ReferralForm'))

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Loader />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

function AppRoutes() {
    const { isAuthenticated } = useAuth()

    return (
        <>
            <Nav />
            <main>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
                        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><AdvocateDashboard /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/rewards" element={<ProtectedRoute><RewardsDashboard /></ProtectedRoute>} />
                        <Route path="/referral/new" element={<ProtectedRoute><ReferralForm /></ProtectedRoute>} />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
        </>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
