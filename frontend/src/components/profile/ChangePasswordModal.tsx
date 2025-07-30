import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password changed successfully');
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
          
          <form className="mt-4" onSubmit={handleSubmit}>
            <div className="mt-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 text-left">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`mt-1 block w-full rounded-md border ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 text-left">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 text-left">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`mt-1 block w-full rounded-md border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 text-left">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-left">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`mt-1 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 text-left">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 