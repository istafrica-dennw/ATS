import React from 'react';

interface LinkedInLoginButtonProps {
  className?: string;
  text?: string;
}

const LinkedInLoginButton: React.FC<LinkedInLoginButtonProps> = ({ className = '', text = 'Sign in with LinkedIn' }) => {
  const handleLinkedInLogin = () => {
    // Use REACT_APP_API_URL environment variable, remove /api suffix if present
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix if present
    
    // Debug log to see what's actually happening
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('Final baseUrl:', baseUrl);
    
    window.location.href = `${baseUrl}/oauth2/authorization/linkedin`;
  };

  return (
    <button
      onClick={handleLinkedInLogin}
      className={`w-full flex items-center justify-center gap-2 bg-[#0077B5] text-white px-4 py-2 rounded-md hover:bg-[#006399] transition-colors ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
      {text}
    </button>
  );
};

export default LinkedInLoginButton; 