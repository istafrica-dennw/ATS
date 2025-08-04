import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/user';
import LinkedInLoginButton from './LinkedInLoginButton';
import ForgotPasswordModal from './ForgotPasswordModal';
import MfaLoginForm from './MfaLoginForm';
import { toast } from 'react-toastify';
import { AuthResponse } from '../../services/authService';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check for MFA verification needed on mount
  useEffect(() => {
    // Check if we're being redirected from ProtectedRoute because MFA is needed
    const locationState = location.state as any;
    if (locationState?.requireMfa && user) {
      console.log('LoginForm - MFA verification required from protected route');
      setUserEmail(user.email);
      setNeeds2FA(true);
    }
  }, [location, user]);

  // Check for error query parameters on component mount or URL change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');
    
    if (errorParam) {
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'account_deactivated': 'This account has been deactivated. Please contact an administrator.',
        'invalid_credentials': 'Invalid email or password.',
        'email_not_verified': 'Please verify your email before logging in.'
      };
      
      const errorMessage = errorMessages[errorParam] || 'An error occurred during login.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Remove the error parameter from URL without reloading the page
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if 2FA is required
      if ('requires2FA' in response && response.requires2FA) {
        setUserEmail(response.email);
        setNeeds2FA(true);
        return;
      }
      
      // Normal login flow
      const authResponse = response as AuthResponse;
      // Always redirect to /dashboard, which will handle role-based redirection
      console.log('LoginForm - Login successful, redirecting to /dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Handle specific error messages from the server
        if (error.response.data?.message) {
          if (error.response.data.message.includes('deactivated')) {
            setError('This account has been deactivated. Please contact an administrator.');
          } else if (error.response.data.message.includes('verify your email')) {
            setError('Please verify your email before logging in.');
          } else {
            setError(error.response.data.message);
          }
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('Failed to login. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMfaSuccess = () => {
    console.log('LoginForm - MFA verification successful');
    setNeeds2FA(false);
    
    // Get from location state if available
    const locationState = location.state as any;
    if (locationState?.from) {
      console.log('LoginForm - Navigating to previous route:', locationState.from.pathname);
      navigate(locationState.from.pathname, { replace: true });
    } else {
      console.log('LoginForm - Navigating to dashboard');
      navigate('/dashboard', { replace: true });
    }
    
    console.log('LoginForm - Navigation triggered');
    
    // Force a page reload as a last resort if navigation doesn't work
    setTimeout(() => {
      if (window.location.pathname.includes('login')) {
        console.log('LoginForm - Still on login page after navigation, forcing a redirect');
        window.location.href = '/dashboard';
      }
    }, 1000);
  };

  // If 2FA is needed, show the 2FA form instead
  if (needs2FA) {
    return <MfaLoginForm email={userEmail} onLoginSuccess={handleMfaSuccess} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:z-10 sm:text-sm transition-all"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:z-10 sm:text-sm transition-all"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all transform hover:scale-[1.02] disabled:transform-none ${
                  isLoading 
                    ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <LinkedInLoginButton />
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginForm; 