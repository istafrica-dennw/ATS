import React from 'react';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage; 