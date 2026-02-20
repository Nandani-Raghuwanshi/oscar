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
import BuilderDashboard from './pages/dashboards/BuilderDashboard';
import BuilderCustomersPage from './pages/builder/BuilderCustomersPage';
import BuilderReportsPage from './pages/builder/BuilderReportsPage';
import BuilderEscalationsPage from './pages/builder/BuilderEscalationsPage';

// CRM pages
import CRMDashboard from './pages/dashboards/CRMDashboard';
import CRMAdvocatesPage from './pages/crm/CRMAdvocatesPage';
import CRMReferralsPage from './pages/crm/CRMReferralsPage';
import CRMPipelinePage from './pages/crm/CRMPipelinePage';
import CRMPaymentsPage from './pages/crm/CRMPaymentsPage';

// Sales Associate pages
import SalesAssociateDashboard from './pages/dashboards/SalesAssociateDashboard';
import SalesAssociateReferralsPage from './pages/crm/SalesAssociateReferralsPage';
import SalesAssociatePerformancePage from './pages/crm/SalesAssociatePerformancePage';

// Advocate pages
import { AdvocateDashboard } from './pages/dashboards/AdvocateDashboard';
import { AdvocateReferralsPage } from './pages/advocate/AdvocateReferralsPage';
import { AdvocateRewardsPage } from './pages/advocate/AdvocateRewardsPage';
import { AdvocateDocumentationPage } from './pages/advocate/AdvocateDocumentationPage';

// Brand Advocate pages
import { BrandAdvocateDashboard } from './pages/dashboards/BrandAdvocateDashboard';
import { BrandReferralsPage } from './pages/brand/BrandReferralsPage';
import { BrandRewardsPage } from './pages/brand/BrandRewardsPage';
import { BrandProjectPage } from './pages/brand/BrandProjectPage';
import { BrandDocumentationPage } from './pages/brand/BrandDocumentationPage';
import { BrandAdvocateOutlet } from './pages/outlets/BrandAdvocateOutlet';

// Role-based dashboard component
const RoleDashboard = () => {
    const { user } = useAuthStore();
    if (user?.role === 'crm_manager') {
        return <CRMDashboard />;
    } else if (user?.role === 'sales_associate') {
        return <SalesAssociateDashboard />;
    }
    return <Navigate to="/login" />;
};

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
                    {/* Dynamic dashboard based on role */}
                    <Route 
                        path="dashboard" 
                        element={
                            <ProtectedRoute requiredRoles={['crm_manager', 'sales_associate']}>
                                <RoleDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* CRM Manager Only Routes */}
                    <Route 
                        path="advocates" 
                        element={
                            <ProtectedRoute requiredRole="crm_manager">
                                <CRMAdvocatesPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="referrals" 
                        element={
                            <ProtectedRoute requiredRole="crm_manager">
                                <CRMReferralsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="pipeline" 
                        element={
                            <ProtectedRoute requiredRole="crm_manager">
                                <CRMPipelinePage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="payments" 
                        element={
                            <ProtectedRoute requiredRole="crm_manager">
                                <CRMPaymentsPage />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Sales Associate Only Routes */}
                    <Route 
                        path="my-referrals" 
                        element={
                            <ProtectedRoute requiredRole="sales_associate">
                                <SalesAssociateReferralsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="my-performance" 
                        element={
                            <ProtectedRoute requiredRole="sales_associate">
                                <SalesAssociatePerformancePage />
                            </ProtectedRoute>
                        } 
                    />
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

                {/* Brand Advocate Routes */}
                <Route
                    path="/brand/*"
                    element={
                        <ProtectedRoute requiredRoles={['brand_advocate']}>
                            <BrandAdvocateOutlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<BrandAdvocateDashboard />} />
                    <Route path="referrals" element={<BrandReferralsPage />} />
                    <Route path="rewards" element={<BrandRewardsPage />} />
                    <Route path="project" element={<BrandProjectPage />} />
                    <Route path="documentation" element={<BrandDocumentationPage />} />
                </Route>

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
