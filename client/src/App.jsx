import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

// Outlet pages
import { AdminOutlet } from './pages/outlets/AdminOutlet';
import { BuilderOutlet } from './pages/outlets/BuilderOutlet';
import { CRMOutlet } from './pages/outlets/CRMOutlet';
import { AdvocateOutlet } from './pages/outlets/AdvocateOutlet';

// Admin pages
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminEscalationsPage } from './pages/admin/AdminEscalationsPage';

// Builder pages
import BuilderDashboard  from './pages/dashboards/BuilderDashboard';
import BuilderCustomersPage from './pages/builder/BuilderCustomersPage';
import BuilderReportsPage from './pages/builder/BuilderReportsPage';
import BuilderEscalationsPage from './pages/builder/BuilderEscalationsPage';

// CRM pages
import CRMDashboard from './pages/dashboards/CRMDashboard';
import CRMAdvocatesPage from './pages/crm/CRMAdvocatesPage';
import CRMReferralsPage from './pages/crm/CRMReferralsPage';
import CRMPipelinePage  from './pages/crm/CRMPipelinePage';
import CRMPaymentsPage  from './pages/crm/CRMPaymentsPage';

// Advocate pages
import { AdvocateDashboard } from './pages/dashboards/AdvocateDashboard';
import { AdvocateReferralsPage } from './pages/advocate/AdvocateReferralsPage';
import { AdvocateRewardsPage } from './pages/advocate/AdvocateRewardsPage';
import { AdvocateDocumentationPage } from './pages/advocate/AdvocateDocumentationPage';

function App() {
    const { token } = useAuthStore();

    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route
                    path="/login"
                    element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
                />

                {/* Legacy dashboard redirect */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminOutlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="projects" element={<AdminProjectsPage />} />
                    <Route path="escalations" element={<AdminEscalationsPage />} />
                </Route>

                {/* Builder Routes */}
                <Route
                    path="/builder/*"
                    element={
                        <ProtectedRoute requiredRole="builder">
                            <BuilderOutlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<BuilderDashboard />} />
                    <Route path="customers" element={<BuilderCustomersPage />} />
                    <Route path="reports" element={<BuilderReportsPage />} />
                    <Route path="escalations" element={<BuilderEscalationsPage />} />
                </Route>

                {/* CRM Routes */}
                <Route
                    path="/crm/*"
                    element={
                        <ProtectedRoute requiredRoles={['crm_manager', 'sales_associate']}>
                            <CRMOutlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<CRMDashboard />} />
                    <Route path="advocates" element={<CRMAdvocatesPage />} />
                    <Route path="referrals" element={<CRMReferralsPage />} />
                    <Route path="pipeline" element={<CRMPipelinePage />} />
                    <Route path="payments" element={<CRMPaymentsPage />} />
                </Route>

                {/* Advocate Routes */}
                <Route
                    path="/advocate/*"
                    element={
                        <ProtectedRoute requiredRoles={['project_advocate', 'brand_advocate']}>
                            <AdvocateOutlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdvocateDashboard />} />
                    <Route path="referrals" element={<AdvocateReferralsPage />} />
                    <Route path="rewards" element={<AdvocateRewardsPage />} />
                    <Route path="documentation" element={<AdvocateDocumentationPage />} />
                </Route>

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
