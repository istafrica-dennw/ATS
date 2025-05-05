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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
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
              <ProtectedRoute allowedRoles={[Role.RECRUITER]}>
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