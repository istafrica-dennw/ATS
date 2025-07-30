import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error('Invalid verification link');
        navigate('/login');
        return;
      }

      try {
        await axiosInstance.get(`/auth/verify-email?token=${token}`);
        toast.success('Email verified successfully! Please login.');
        navigate('/login');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to verify email');
        navigate('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {verifying ? 'Verifying your email...' : 'Email Verification'}
            </h2>
            {verifying && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 