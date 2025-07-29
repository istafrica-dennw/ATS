import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './components/admin/AdminLayout';
import MainLayout from './layouts/MainLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import EmailManagementPage from './pages/admin/EmailManagementPage';
import JobManagementPage from './pages/admin/JobManagementPage';
import AdminJobDetailsPage from './pages/admin/AdminJobDetailsPage';
import InterviewSkeletonManagementPage from './pages/admin/InterviewSkeletonManagementPage';
import InterviewAssignmentPage from './pages/admin/InterviewAssignmentPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Role } from './types/user';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import SecuritySettingsPage from './pages/profile/SecuritySettingsPage';
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import InterviewerDashboardPage from './pages/interviewer/InterviewerDashboardPage';
import InterviewDetailPage from './pages/interviewer/InterviewDetailPage';
import InterviewListPage from './pages/interviewer/InterviewListPage';
import LandingPage from './pages/LandingPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobApplicationPage from './pages/candidate/JobApplicationPage';
import ChatTestPage from './pages/ChatTestPage';
import TwoFactorAuthDashboard from './pages/candidate/TwoFactorAuthDashboard';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI Theme Provider Component
const MUIThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: prefersDarkMode ? '#6366f1' : '#4f46e5', // indigo-500 : indigo-600
            light: prefersDarkMode ? '#818cf8' : '#6366f1', // indigo-400 : indigo-500
            dark: prefersDarkMode ? '#4338ca' : '#3730a3', // indigo-600 : indigo-700
          },
          secondary: {
            main: prefersDarkMode ? '#64748b' : '#475569', // slate-500 : slate-600
          },
          background: {
            default: prefersDarkMode ? '#111827' : '#f9fafb', // gray-900 : gray-50
            paper: prefersDarkMode ? '#1f2937' : '#ffffff', // gray-800 : white
          },
          text: {
            primary: prefersDarkMode ? '#f9fafb' : '#111827', // gray-50 : gray-900
            secondary: prefersDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
          },
          divider: prefersDarkMode ? '#374151' : '#e5e7eb', // gray-700 : gray-200
          action: {
            hover: prefersDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(0, 0, 0, 0.04)', // gray-700/50 : default
            selected: prefersDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(0, 0, 0, 0.08)',
            disabled: prefersDarkMode ? '#6b7280' : '#9ca3af', // gray-500 : gray-400
            disabledBackground: prefersDarkMode ? '#374151' : '#f3f4f6', // gray-700 : gray-100
          },
          success: {
            main: prefersDarkMode ? '#10b981' : '#059669', // emerald-500 : emerald-600
            light: prefersDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5', // emerald-500/20 : emerald-100
            contrastText: prefersDarkMode ? '#ecfdf5' : '#064e3b', // emerald-50 : emerald-900
          },
          error: {
            main: prefersDarkMode ? '#ef4444' : '#dc2626', // red-500 : red-600
            light: prefersDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', // red-500/20 : red-100
            contrastText: prefersDarkMode ? '#fef2f2' : '#991b1b', // red-50 : red-800
          },
          warning: {
            main: prefersDarkMode ? '#f59e0b' : '#d97706', // amber-500 : amber-600
            light: prefersDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', // amber-500/20 : amber-100
            contrastText: prefersDarkMode ? '#fffbeb' : '#92400e', // amber-50 : amber-800
          },
          info: {
            main: prefersDarkMode ? '#3b82f6' : '#2563eb', // blue-500 : blue-600
            light: prefersDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', // blue-500/20 : blue-100
            contrastText: prefersDarkMode ? '#eff6ff' : '#1d4ed8', // blue-50 : blue-700
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '0.375rem', // rounded-md
                fontWeight: 500,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.375rem', // rounded-md
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '0.5rem', // rounded-lg
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: '0.5rem', // rounded-lg
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: '0.5rem', // rounded-lg
              },
              standardInfo: {
                backgroundColor: prefersDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
                color: prefersDarkMode ? '#dbeafe' : '#1e40af',
                '& .MuiAlert-icon': {
                  color: prefersDarkMode ? '#60a5fa' : '#3b82f6',
                },
              },
              standardSuccess: {
                backgroundColor: prefersDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                color: prefersDarkMode ? '#d1fae5' : '#065f46',
                '& .MuiAlert-icon': {
                  color: prefersDarkMode ? '#34d399' : '#10b981',
                },
              },
              standardError: {
                backgroundColor: prefersDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                color: prefersDarkMode ? '#fecaca' : '#991b1b',
                '& .MuiAlert-icon': {
                  color: prefersDarkMode ? '#f87171' : '#ef4444',
                },
              },
              standardWarning: {
                backgroundColor: prefersDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                color: prefersDarkMode ? '#fde68a' : '#92400e',
                '& .MuiAlert-icon': {
                  color: prefersDarkMode ? '#fbbf24' : '#f59e0b',
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Token handler component for extracting tokens from URL
const URLTokenHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('Token found in URL, setting token:', token);
      setToken(token);
      
      // Remove token from URL for security
      urlParams.delete('token');
      const newUrl = location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate, setToken]);

  return null;
};

// Public route wrapper - redirects authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SecurityProvider>
        <MUIThemeProvider>
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
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } />

              {/* Dashboard route - needs to be accessible with token in URL */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Main authenticated routes using MainLayout */}
              <Route
                path="/main"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/settings" element={<ProfileSettingsPage />} />
                <Route path="profile/security" element={<SecuritySettingsPage />} />

                {/* Candidate routes */}
                <Route
                  path="candidate"
                  element={
                    <ProtectedRoute allowedRoles={[Role.CANDIDATE]}>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CandidateDashboardPage />} />
                  <Route path="2fa" element={<TwoFactorAuthDashboard />} />
                </Route>

                {/* Interviewer routes */}
                <Route
                  path="interviewer"
                  element={
                    <ProtectedRoute allowedRoles={[Role.INTERVIEWER, Role.HIRING_MANAGER, Role.ADMIN]}>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<InterviewerDashboardPage />} />
                  <Route path="interviews" element={<InterviewListPage />} />
                  <Route path="interviews/:interviewId" element={<InterviewDetailPage />} />
                </Route>
              </Route>

              {/* Profile routes accessible from MainLayout */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfilePage />} />
                <Route path="settings" element={<ProfileSettingsPage />} />
                <Route path="security" element={<SecuritySettingsPage />} />
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
                <Route path="jobs" element={<JobManagementPage />} />
                <Route path="jobs/:jobId" element={<AdminJobDetailsPage />} />
                <Route path="interview-skeletons" element={<InterviewSkeletonManagementPage />} />
                <Route path="interview-assignments" element={<InterviewAssignmentPage />} />
                <Route path="chat" element={<AdminChatPage />} />
              </Route>

              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/apply/:id" element={<JobApplicationPage />} />
              <Route path="/chat-test" element={<ChatTestPage />} />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </MUIThemeProvider>
      </SecurityProvider>
    </AuthProvider>
  );
};

export default App; 