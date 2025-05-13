import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const DashboardPage: React.FC = () => {
    console.log('DashboardPage - Rendering');
  const { user, setUser, setToken, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        console.log('DashboardPage - No user found, fetching from URL');
      // Get token from URL parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
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
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading user information...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 