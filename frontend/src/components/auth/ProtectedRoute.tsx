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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not allowed, redirect to appropriate dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case Role.ADMIN:
        return <Navigate to="/admin" replace />;
      case Role.RECRUITER:
        return <Navigate to="/recruiter" replace />;
      case Role.CANDIDATE:
        return <Navigate to="/candidate" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 