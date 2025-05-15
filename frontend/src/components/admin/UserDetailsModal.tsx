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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl rounded bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {userData ? `User Details: ${userData.firstName} ${userData.lastName}` : 'Loading User Details...'}
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-3xl font-medium border-4 border-white shadow">
                      {userData.firstName?.[0]}{userData.lastName?.[0]}
                    </div>
                  )}
                  <div 
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    {uploadingImage ? (
                      <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <CameraIcon className="h-6 w-6 text-white" />
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

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userData.firstName || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={userData.lastName || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email || ''}
                      disabled
                      className="shadow-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={userData.role || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value={Role.ADMIN}>Admin</option>
                      <option value={Role.INTERVIEWER}>Interviewer</option>
                      <option value={Role.HIRING_MANAGER}>Hiring Manager</option>
                      <option value={Role.CANDIDATE}>Candidate</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={userData.department || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={userData.phoneNumber || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={userData.isActive || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active Account
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {userData.isActive 
                      ? 'User can log in and access the system' 
                      : 'User is deactivated and cannot log in'}
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-gray-500">Email Verification Status:</dt>
                    <dd className="ml-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        userData.isEmailVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </dd>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {userData.isEmailVerified 
                      ? 'User has verified their email address' 
                      : 'User has not yet verified their email address'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex justify-between items-center">
                  <div>
                    <button
                      type="button"
                      onClick={toggleUserStatus}
                      disabled={saving}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        userData.isActive 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        userData.isActive ? 'focus:ring-red-500' : 'focus:ring-green-500'
                      }`}
                    >
                      {userData.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-gray-500">
              User not found or error loading user details
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserDetailsModal; 