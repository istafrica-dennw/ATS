import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './components/admin/AdminLayout';
import MainLayout from './layouts/MainLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminUserProfilePage from './pages/admin/AdminUserProfilePage';
import EmailManagementPage from './pages/admin/EmailManagementPage';
import JobManagementPage from './pages/admin/JobManagementPage';
import AdminJobDetailsPage from './pages/admin/AdminJobDetailsPage';
import InterviewManagementPage from './pages/admin/InterviewManagementPage';

import AdminChatPage from './pages/admin/AdminChatPage';
import BulkEmailPage from './pages/admin/BulkEmailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Role } from './types/user';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptConnectConsentPage from './pages/AcceptConnectConsentPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import SecuritySettingsPage from './pages/profile/SecuritySettingsPage';
import NotificationsPage from './pages/profile/NotificationsPage';
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import InterviewerDashboardPage from './pages/interviewer/InterviewerDashboardPage';
import InterviewDetailPage from './pages/interviewer/InterviewDetailPage';
import InterviewListPage from './pages/interviewer/InterviewListPage';
import LandingPage from './pages/LandingPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobApplicationPage from './pages/candidate/JobApplicationPage';
import ChatTestPage from './pages/ChatTestPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyRouter from './components/common/PrivacyPolicyRouter';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isJWTToken, logTokenInfo } from './utils/tokenUtils';

// List of paths that should always be accessible, even when authenticated
const ALWAYS_ACCESSIBLE_PATHS = ['/reset-password', '/verify-email', '/dashboard', '/accept-connect-consent'];

// URL Token Handler - This component processes authentication tokens in the URL
// Separate from PublicRoute to ensure it runs on every route
const URLTokenHandler = () => {
  const location = useLocation();
  const { manuallySetToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Log token info for debugging (safe - doesn't expose actual token)
      logTokenInfo(token, 'URLTokenHandler');
      
      // Check if this is a JWT token (authentication) or a simple token (email/password reset)
      if (isJWTToken(token)) {
        console.log('URLTokenHandler - Detected JWT authentication token from URL');
        
        // Process the token as an authentication token
        manuallySetToken(token)
          .then(() => {
            console.log('URLTokenHandler - JWT authentication token processed successfully');
            
            // Clean URL by removing token
            window.history.replaceState({}, document.title, location.pathname);
          })
          .catch(error => {
            console.error('URLTokenHandler - Failed to process JWT authentication token:', error);
          });
      } else {
        console.log('URLTokenHandler - Detected non-JWT token, skipping authentication processing (likely email verification or password reset token)');
      }
    }
  }, [location.search, location.pathname, manuallySetToken, navigate]);

  return null; // This component doesn't render anything
};

// Component to handle public routes (login, signup) with redirection for authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Check if the current path should always be accessible
  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_PATHS.some(path => currentPath.startsWith(path));
  
  // If path should always be accessible, render children regardless of auth state
  if (isAlwaysAccessible) {
    return <>{children}</>;
  }

  // Otherwise, apply normal redirection logic for authenticated users
  // Use multiple authentication indicators for more robust checking
  if (user && token && isAuthenticated) {
    // Check if user is already on a valid path for their role
    const userRole = user.role;
    
    // If user is already on the correct role-based path, don't redirect
    if (
      (userRole === 'ADMIN' && currentPath.startsWith('/admin')) ||
      (userRole === 'INTERVIEWER' && currentPath.startsWith('/interviewer')) ||
      (userRole === 'HIRING_MANAGER' && currentPath.startsWith('/hiring-manager')) ||
      (userRole === 'CANDIDATE' && currentPath.startsWith('/candidate'))
    ) {
      // User is already on the correct path, no need to redirect
      return <>{children}</>;
    }
    
    // Otherwise redirect to dashboard which will handle role-based redirection
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SecurityProvider>
        <ThemeProvider>
          <Router>
            <URLTokenHandler />
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } />
              <Route path="/verify-email" element={
                <PublicRoute>
                  <EmailVerificationPage />
                </PublicRoute>
              } />
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } />
              <Route path="/accept-connect-consent" element={
                <PublicRoute>
                  <AcceptConnectConsentPage />
                </PublicRoute>
              } />
              
              <Route path="/dashboard" element={<DashboardPage />} />
              
              <Route
                element={
                  <ProtectedRoute allowedRoles={undefined}>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/profile">
                  <Route index element={<ProfilePage />} />
                  <Route path="settings" element={<ProfileSettingsPage />} />
                  <Route path="security" element={<SecuritySettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                <Route path="/candidate" element={<CandidateDashboardPage />} />

                <Route
                  path="/interviewer"
                  element={
                    <ProtectedRoute allowedRoles={[Role.INTERVIEWER]}>
                      <InterviewerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/interviews"
                  element={
                    <ProtectedRoute allowedRoles={[Role.INTERVIEWER]}>
                      <InterviewListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/interviews/:interviewId"
                  element={
                    <ProtectedRoute allowedRoles={[Role.INTERVIEWER]}>
                      <InterviewDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/hiring-manager"
                  element={
                    <ProtectedRoute allowedRoles={[Role.HIRING_MANAGER]}>
                      <div>
                        <h1>Hiring Manager Dashboard (Coming Soon)</h1>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                    <AdminLayout>
                      <Outlet />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              >
                               <Route index element={<AdminDashboardPage />} />
               <Route path="users" element={<UserManagementPage />} />
               <Route path="users/:userId" element={<AdminUserProfilePage />} />
               <Route path="emails" element={<EmailManagementPage />} />
               <Route path="bulk-email" element={<BulkEmailPage />} />
               <Route path="jobs" element={<JobManagementPage />} />
               <Route path="jobs/:jobId" element={<AdminJobDetailsPage />} />
               <Route path="interview-management" element={<InterviewManagementPage />} />
               <Route path="chat" element={<AdminChatPage />} />
              </Route>
              
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/apply/:id" element={<JobApplicationPage />} />
              {/* <Route path="/chat-test" element={<ChatTestPage />} /> */}
              {/* <Route path="/about" element={<AboutPage />} /> */}
              <Route path="/careers" element={<CareersPage />} />
              {/* <Route path="/contact" element={<ContactPage />} /> */}
              <Route path="/privacy-policy" element={<PrivacyPolicyRouter />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </SecurityProvider>
    </AuthProvider>
  );
};

export default App; 