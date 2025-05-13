import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Role } from './types/user';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DashboardPage from './pages/DashboardPage';
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
        <ToastContainer position="top-right" autoClose={5000} />
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
          
          {/* Dashboard route - protected so only logged in users can access */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={undefined}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
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
          </Route>

          {/* Recruiter Routes */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={[Role.INTERVIEWER, Role.HIRING_MANAGER]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Recruiter Dashboard</div>} />
          </Route>

          {/* Candidate Routes */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={[Role.CANDIDATE]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Candidate Dashboard</div>} />
          </Route>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 