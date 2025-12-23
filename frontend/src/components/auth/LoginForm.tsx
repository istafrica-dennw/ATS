import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LinkedInLoginButton from './LinkedInLoginButton';
import ForgotPasswordModal from './ForgotPasswordModal';
import MfaLoginForm from './MfaLoginForm';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { storeCurrentRouteIfNeeded } from '../../utils/routeUtils';

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
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check for returnUrl on mount and store it
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const returnUrl = urlParams.get("returnUrl");
    if (returnUrl) {
      sessionStorage.setItem("lastVisitedRoute", returnUrl);
      console.log('LoginForm - Stored returnUrl for after login:', returnUrl);
    }
  }, [location.search]);

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError(null);
    }
    
    if (name === 'email') {
      if (emailError) {
        setEmailError('');
      }
      if (value && !validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      }
    }
    
    if (name === 'password') {
      if (passwordError) {
        setPasswordError('');
      }
      if (value && value.length < 6) {
        setPasswordError('Password must be at least 6 characters');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let hasErrors = false;

    if (!formData.email) {
      setEmailError('Email address is required');
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!formData.password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if 2FA is required
      if ('requires2FA' in response && response.requires2FA) {
        setUserEmail(response.email);
        setNeeds2FA(true);
        return;
      }
      
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // If 2FA is needed, show the 2FA form instead
  if (needs2FA) {
    return <MfaLoginForm email={userEmail} onLoginSuccess={handleMfaSuccess} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8 transform hover:scale-[1.01] transition-all duration-200">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Sign in to your account
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full pl-10 py-3 border rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 ${
                    emailError 
                      ? 'pr-10 border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400' 
                      : 'pr-3 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full pl-10 py-3 border rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 ${
                    passwordError 
                      ? 'pr-20 border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400' 
                      : 'pr-12 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {passwordError && (
                    <div className="pr-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all transform hover:scale-[1.02] disabled:transform-none shadow-md hover:shadow-lg ${
                  isLoading 
                    ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
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
          
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginForm; 