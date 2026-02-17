import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
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
    return (
        <Router>
            <Nav />
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

                {/* Referral Engine Routes - Protected */}
                <Route path="/referral/select-type" element={
                    <ProtectedRoute>
                        <ReferralSelectType />
                    </ProtectedRoute>
                } />
                <Route path="/referral/select-project" element={
                    <ProtectedRoute>
                        <ReferralSelectProject />
                    </ProtectedRoute>
                } />
                <Route path="/referral/lead-form" element={
                    <ProtectedRoute>
                        <ReferralLeadForm />
                    </ProtectedRoute>
                } />
                <Route path="/referral/link-qr" element={
                    <ProtectedRoute>
                        <ReferralLinkQR />
                    </ProtectedRoute>
                } />

                {/* Dashboard Routes - Protected */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/my-referrals" element={
                    <ProtectedRoute>
                        <MyReferrals />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/projects" element={
                    <ProtectedRoute>
                        <MyProjects />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/rewards" element={
                    <ProtectedRoute>
                        <Rewards />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/documents" element={
                    <ProtectedRoute>
                        <Documents />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/share" element={
                    <ProtectedRoute>
                        <SharePromote />
                    </ProtectedRoute>
                } />

                {/* Admin Routes - Protected (Admin Only) */}
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
