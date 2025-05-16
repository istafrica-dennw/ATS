import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { Role } from '../types/user';

const DashboardPage: React.FC = () => {
    console.log('DashboardPage - Rendering');
  const { user, setUser, setToken, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Function to redirect based on role
  const redirectBasedOnRole = (userRole: string) => {
    console.log('DashboardPage - Redirecting based on role:', userRole);
    
    // Normalize role by removing ROLE_ prefix if present
    const role = userRole.replace('ROLE_', '');
    
    switch (role) {
      case Role.ADMIN:
        console.log('DashboardPage - Redirecting to admin dashboard');
        navigate('/admin');
        break;
      case Role.INTERVIEWER:
      case Role.HIRING_MANAGER:
        console.log('DashboardPage - Redirecting to recruiter dashboard');
        navigate('/recruiter');
        break;
      case Role.CANDIDATE:
        console.log('DashboardPage - Redirecting to candidate dashboard');
        navigate('/candidate');
        break;
      default:
        console.log('DashboardPage - Unknown role, staying on generic dashboard');
        // Stay on the current dashboard for unknown roles
        break;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('\n\n\n DashboardPage - User found\n\n\n\n:', user);
      // If user is already loaded, redirect based on role
      redirectBasedOnRole(user.role);
    } else {
      console.log('DashboardPage - No user found, fetching from URL');
      // Get token from URL parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
        console.log('DashboardPage - Token found from url:', token);
        // Set token in context and localStorage
        localStorage.setItem('token', token);
        setToken(token);
        setIsAuthenticated(true);
        
        // Remove token from URL
        window.history.replaceState({}, document.title, '/dashboard');
        
        // Fetch user data with token
        const fetchUserData = async () => {
          try {
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            axiosInstance.defaults.headers.common['Authorization'] = formattedToken;
            
            const response = await axiosInstance.get('/auth/me');
            const userData = response.data;
            
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            // Redirect based on role after fetching user data
            redirectBasedOnRole(userData.role);
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            navigate('/login');
          }
        };
        
        fetchUserData();
      }
    }
  }, [user, setToken, setUser, setIsAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Welcome to User Dashboard</h2>
        <p className="text-center mb-4">Redirecting you to the appropriate dashboard...</p>
        
        {user ? (
          <div className="text-center">
            <p className="mb-2">
              <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
            </p>
            <p className="mb-2">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="mb-2">
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <div className="mt-4">
              <div className="animate-pulse flex justify-center">
                <div className="h-2 w-24 bg-indigo-500 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Loading user information...</p>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 