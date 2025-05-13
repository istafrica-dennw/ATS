import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/user';
import axiosInstance from '../../utils/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, manuallySetToken } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  console.log('ProtectedRoute - Current location:', location.pathname);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);

  useEffect(() => {
    const checkAndValidateToken = async () => {
      console.log('ProtectedRoute - Checking and validating token');
      if (!isAuthenticated && !validationAttempted) {
        console.log('ProtectedRoute - No authentication, validating token');
        setIsValidating(true);
        setValidationAttempted(true);

        try {
          // Extract token from URL params
          const params = new URLSearchParams(window.location.search);
          const urlToken = params.get('token');
          
          // If there's token in URL, use it
          if (urlToken) {
            console.log('ProtectedRoute - Found token in URL parameters:', urlToken.substring(0, 15) + '...');
            
            try {
              // Use the new utility function that handles all storage methods
              await manuallySetToken(urlToken);
              console.log('ProtectedRoute - Successfully authenticated with URL token');
              
              // Remove token from URL for security
              window.history.replaceState({}, document.title, location.pathname);
              
              setIsValidating(false);
              return; // Successfully authenticated
            } catch (error) {
              console.error('ProtectedRoute - Failed to authenticate with URL token:', error);
            }
          }
          
          // Hardcode the provided token if necessary (for debugging)
          const hardcodedToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkbml3ZW11Z2lzaGFAZ21haWwuY29tIiwicm9sZXMiOiJST0xFX0NBTkRJREFURSIsImlhdCI6MTc0NzEzOTg4OCwiZXhwIjoxNzQ3MjI2Mjg4fQ.kAPZjqUpZ5W6d3_6dwf0HsSA7AsamDJnhBtH2M9f36E";
          
          // If debugging is necessary, you can uncomment this to test with hardcoded token
          // console.log('ProtectedRoute - Using hardcoded token for testing');
          // try {
          //   await manuallySetToken(hardcodedToken);
          //   console.log('ProtectedRoute - Successfully authenticated with hardcoded token');
          //   setIsValidating(false);
          //   return;
          // } catch (error) {
          //   console.error('ProtectedRoute - Failed with hardcoded token too:', error);
          // }
        } catch (error) {
          console.error('ProtectedRoute - Error during token validation:', error);
        }
        
        setIsValidating(false);
      }
    };
    
    checkAndValidateToken();
  }, [isAuthenticated, validationAttempted, location.pathname, manuallySetToken]);

  // Show loading while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If not authenticated after validation, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated after validation, redirecting to login');
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