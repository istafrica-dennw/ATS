import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import { User, Role, UserFormData } from '../../types/user';
import { toast } from 'react-toastify';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  token: string;
  onUserUpdated: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  token,
  onUserUpdated
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Network error when loading user details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!userData) return;
    
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) return;
    
    const { name, checked } = e.target;
    setUserData({
      ...userData,
      [name]: checked
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userData) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingImage(true);
    
    try {
      const response = await fetch('/api/files/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the user data with the new profile picture URL
        setUserData({
          ...userData,
          profilePictureUrl: data.url,
        });
        
        toast.success('Profile picture uploaded successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Network error when uploading profile picture');
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        onUserUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!userData || !userId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}/status?isActive=${!userData.isActive}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`User ${userData.isActive ? 'deactivated' : 'activated'} successfully`);
        // Update local state
        setUserData({
          ...userData,
          isActive: !userData.isActive
        });
        onUserUpdated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${userData.isActive ? 'deactivate' : 'activate'} user`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 bg-opacity-75 transition-opacity" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center rounded-xl justify-center p-4 overflow-hidden">
        <Dialog.Panel className="mx-auto max-w-5xl rounded-xl overflow-hidden bg-white dark:bg-gray-800 text-left shadow-xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 w-full">
          <div className="bg-white dark:bg-gray-800 px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {userData ? `User Details: ${userData.firstName} ${userData.lastName}` : 'Loading User Details...'}
              </Dialog.Title>
              <button
                type="button"
                className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
              </div>
            ) : userData ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div className="relative">
                    {userData.profilePictureUrl ? (
                      <img
                        src={userData.profilePictureUrl}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="h-24 w-24 rounded-full object-cover border-3 border-white dark:border-gray-600 shadow-lg"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-xl font-semibold border-3 border-white dark:border-gray-600 shadow-lg">
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </div>
                    )}
                    <div
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={handleImageClick}
                    >
                      {uploadingImage ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      ) : (
                        <CameraIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userData.firstName || ''}
                      onChange={handleChange}
                      className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={userData.lastName || ''}
                      onChange={handleChange}
                      className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email || ''}
                      disabled
                      className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 focus:outline-none shadow-sm cursor-not-allowed"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={userData.role || ''}
                        onChange={handleChange}
                        className="block w-full py-2.5 px-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 appearance-none"
                      >
                        <option value={Role.ADMIN}>Admin</option>
                        <option value={Role.INTERVIEWER}>Interviewer</option>
                        <option value={Role.HIRING_MANAGER}>Hiring Manager</option>
                        <option value={Role.CANDIDATE}>Candidate</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={userData.department || ''}
                      onChange={handleChange}
                      className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={userData.phoneNumber || ''}
                      onChange={handleChange}
                      className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4 border border-gray-200/50 dark:border-gray-600/50">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Account Status</h4>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-6">
                        <input
                          id="isActive"
                          name="isActive"
                          type="checkbox"
                          checked={userData.isActive || false}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-offset-0 transition-colors duration-200"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Active Account
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {userData.isActive
                            ? 'User can log in and access the system'
                            : 'User is deactivated and cannot log in'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Verification:</span>
                        <span className={`ml-3 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.isEmailVerified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {userData.isEmailVerified
                        ? 'User has verified their email address'
                        : 'User has not yet verified their email address'}
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-base font-medium mb-1">User not found</div>
                <div className="text-sm">Error loading user details or user does not exist</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {userData && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 sm:px-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <div>
                  <button
                    type="button"
                    onClick={toggleUserStatus}
                    disabled={saving}
                    className={`inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      userData.isActive 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 dark:focus:ring-red-400' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500 dark:focus:ring-green-400'
                    }`}
                  >
                    {userData.isActive ? 'Deactivate User' : 'Activate User'}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserDetailsModal; 