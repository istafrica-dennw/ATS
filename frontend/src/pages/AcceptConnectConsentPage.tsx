import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';
import { CheckCircleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AcceptConnectConsentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const verificationToken = searchParams.get('verificationToken');
  
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !verificationToken) {
      setError('Invalid or missing tokens. Please use the complete link from your email.');
    }
  }, [token, verificationToken]);

  const handleVerifyEmail = async () => {
    if (!token || !verificationToken) {
      setError('Invalid tokens');
      return;
    }

    if (!consentChecked) {
      setError('You must accept the Connect consent to verify your email');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      // Step 1: Accept Connect consent
      await axiosInstance.post(`/auth/accept-connect-consent?token=${token}`);
      
      // Step 2: Verify email
      await axiosInstance.get(`/auth/verify-email?token=${verificationToken}`);
      
      setSuccess(true);
      toast.success('Email verified successfully! You can now log in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to complete account setup. The link may have expired.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Account Activated!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your email has been verified and Connect consent accepted. You will be redirected to the login page shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-6">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complete Your Account Setup
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please accept the Connect consent terms to verify your email and activate your account.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="connect-consent-checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 cursor-pointer"
              />
              <label htmlFor="connect-consent-checkbox" className="ml-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
                I have read the{' '}
                <Link 
                  to="/privacy-policy" 
                  target="_blank"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline font-medium"
                >
                  privacy policy
                </Link>
                {' '}and confirm that IST store my personal details to be able to contact me for future job opportunities.
                <br /><br />
                IST will hold your data for future employment opportunities for a maximum period of 2 years, or until you decide to withdraw your consent, which you can do at any given time by contacting us.
              </label>
            </div>
          </div>

          {/* Verify Email Button */}
          <button
            onClick={handleVerifyEmail}
            disabled={verifying || !consentChecked || !token || !verificationToken}
            className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-all duration-200 ${
              consentChecked && token && verificationToken
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transform hover:scale-[1.02] cursor-pointer'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
          >
            {verifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Email Address'
            )}
          </button>

          {!consentChecked && (
            <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
              Please check the box above to enable email verification.
            </p>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← Back to Login
            </Link>
          </div>

          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            This link will expire in 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptConnectConsentPage;
