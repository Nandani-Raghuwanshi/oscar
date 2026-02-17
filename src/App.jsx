import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AdminNav from './components/AdminNav';
import AdvocateNav from './components/AdvocateNav';
import UserNav from './components/UserNav';
import GuestNav from './components/GuestNav';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import NotFound from './pages/NotFound';
import ProfileUpdate from './pages/ProfileUpdate';
import ResetPassword from './pages/ResetPassword';
import ReferralSelectType from './pages/referral/ReferralSelectType';
import ReferralSelectProject from './pages/referral/ReferralSelectProject';
import ReferralLeadForm from './pages/referral/ReferralLeadForm';
import ReferralLinkQR from './pages/referral/ReferralLinkQR';
import Dashboard from './pages/dashboard/Dashboard';
import MyReferrals from './pages/dashboard/MyReferrals';
import MyProjects from './pages/dashboard/MyProjects';
import Rewards from './pages/dashboard/Rewards';
import Documents from './pages/dashboard/Documents';
import SharePromote from './pages/dashboard/SharePromote';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

function App() {
    const { isAuthenticated, user } = useContext(AuthContext);

    // Render navbar based on user role
    const renderNavbar = () => {
        if (!isAuthenticated) {
            return <GuestNav />;
        }

        if (user?.role === 'admin') {
            return <AdminNav />;
        }

        if (user?.role === 'advocate' || user?.role === 'brand_advocate') {
            return <AdvocateNav />;
        }

        return <UserNav />;
    };

    return (
        <Router>
            {renderNavbar()}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />

                {/* Profile Management Routes - Protected */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfileUpdate />
                    </ProtectedRoute>
                } />
                <Route path="/reset-password" element={
                    <ProtectedRoute>
                        <ResetPassword />
                    </ProtectedRoute>
                } />

                {/* Referral Engine Routes - Protected (Advocates only) */}
                <Route path="/referral/select-type" element={
                    <ProtectedRoute requiredRole="advocate">
                        <ReferralSelectType />
                    </ProtectedRoute>
                } />
                <Route path="/referral/select-project" element={
                    <ProtectedRoute requiredRole="advocate">
                        <ReferralSelectProject />
                    </ProtectedRoute>
                } />
                <Route path="/referral/lead-form" element={
                    <ProtectedRoute requiredRole="advocate">
                        <ReferralLeadForm />
                    </ProtectedRoute>
                } />
                <Route path="/referral/link-qr" element={
                    <ProtectedRoute requiredRole="advocate">
                        <ReferralLinkQR />
                    </ProtectedRoute>
                } />

                {/* Dashboard Routes - Protected (Advocates only) */}
                <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="advocate">
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/my-referrals" element={
                    <ProtectedRoute requiredRole="advocate">
                        <MyReferrals />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/projects" element={
                    <ProtectedRoute requiredRole="advocate">
                        <MyProjects />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/rewards" element={
                    <ProtectedRoute requiredRole="advocate">
                        <Rewards />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/documents" element={
                    <ProtectedRoute requiredRole="advocate">
                        <Documents />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/share" element={
                    <ProtectedRoute requiredRole="advocate">
                        <SharePromote />
                    </ProtectedRoute>
                } />

                {/* Admin Routes - Protected (Admin only) */}
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
