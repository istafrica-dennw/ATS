import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Current location:', location.pathname);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles)

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not allowed, redirect to appropriate dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - User role not allowed:', user.role);
    console.log('ProtectedRoute - Allowed roles:', allowedRoles);
    switch (user.role) {
      case Role.ADMIN:
        console.log('ProtectedRoute - Redirecting to admin dashboard');
        return <Navigate to="/admin" replace />;
      case Role.INTERVIEWER:
      case Role.HIRING_MANAGER:
        console.log('ProtectedRoute - Redirecting to recruiter dashboard');
        return <Navigate to="/recruiter" replace />;
      case Role.CANDIDATE:
        console.log('ProtectedRoute - Redirecting to candidate dashboard');
        return <Navigate to="/candidate" replace />;
      default:
        console.log('ProtectedRoute - Unknown role, redirecting to login');
        return <Navigate to="/login" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute; 