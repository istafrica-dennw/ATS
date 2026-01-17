import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { manuallySetToken } = useAuth();
  const [authenticating, setAuthenticating] = useState(true);

  // GUARD: Prevents React 18 from running the effect twice and causing a 401
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !hasCalled.current) {
      hasCalled.current = true; // Mark as started

      const clientId = process.env.REACT_APP_IAA_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_IAA_CLIENT_SECRET;
      const iaaUrl = process.env.REACT_APP_IAA_URL;
      const tokenEndpoint = `${iaaUrl}/api/auth/tokens?code=${encodeURIComponent(code)}`;

      console.log("[IAA] Exchanging authorization code...");

      fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(async (data) => {
        if (data.access_token) {
          // 1. Sync tokens for the IAA Widget Watchdog
          localStorage.setItem('auth_tokens', JSON.stringify({
            accessToken: data.access_token,
            refreshToken: data.refresh_token
          }));
          localStorage.setItem('iaa_authenticated', 'true');

          // 2. Sync with ATS Auth Provider (This triggers the JIT logic in Java)
          await manuallySetToken(data.access_token);

          console.log("[IAA] Login successful, redirecting to Dashboard...");
          toast.success('Successfully authenticated via IAA!');

          // 3. Small delay to let storage settle before navigation
          // Navigate to /dashboard which will route user based on their role (ADMIN, INTERVIEWER, CANDIDATE, etc.)
          setTimeout(() => {
            navigate('/dashboard');
          }, 300);
        }
      })
      .catch(err => {
        console.error("IAA Callback Error:", err);
        setAuthenticating(false);
        toast.error('Failed to authenticate via IAA');

        // If we are already authenticated (from a previous attempt), just go to dashboard
        if (localStorage.getItem('iaa_authenticated') === 'true') {
            navigate('/dashboard');
        } else {
            setTimeout(() => {
              navigate('/login?error=iaa_failed');
            }, 2000);
        }
      });
    }
  }, [searchParams, navigate, manuallySetToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div>
            {/* Icon Container */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              <svg
                className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {authenticating ? 'Securely signing you in...' : 'Authentication'}
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {authenticating
                ? 'Synchronizing your IAA profile with ATS'
                : 'Redirecting you to login...'}
            </p>

            {authenticating && (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please wait while we securely authenticate your credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;