import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './components/admin/AdminLayout';
import MainLayout from './layouts/MainLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import EmailManagementPage from './pages/admin/EmailManagementPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Role } from './types/user';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to handle public routes (login, signup) with redirection for authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  if (user && token) {
    switch (user.role) {
      case Role.ADMIN:
        return <Navigate to="/admin" replace />;
      case Role.INTERVIEWER:
      case Role.HIRING_MANAGER:
        return <Navigate to="/recruiter" replace />;
      case Role.CANDIDATE:
        return <Navigate to="/candidate" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
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
          {/* Public routes with redirection for authenticated users */}
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
          
          {/* Main authenticated routes using MainLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={undefined}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Profile Routes - accessible to all authenticated users */}
            <Route path="/profile">
              <Route index element={<ProfilePage />} />
              <Route path="settings" element={<ProfileSettingsPage />} />
            </Route>

            {/* Candidate Routes */}
            <Route path="/candidate" element={<CandidateDashboardPage />} />

            {/* Recruiter Routes */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRoles={[Role.INTERVIEWER, Role.HIRING_MANAGER]}>
                  <div>
                    <h1>Recruiter Dashboard (Coming Soon)</h1>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* Admin Routes */}
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
            <Route path="emails" element={<EmailManagementPage />} />
          </Route>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 