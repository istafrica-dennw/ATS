import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { UserFormData, DeactivationRequest } from '../../types/user';
import { useNavigate } from 'react-router-dom';
import { CameraIcon } from '@heroicons/react/24/outline';

const ProfileSettingsPage: React.FC = () => {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserFormData>({} as UserFormData);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile data');
        
        const response = await fetch(`/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          console.log('Profile picture URL from backend:', data.profilePictureUrl);
          setProfileData(data);
          
          // If there's a profile picture URL, pre-fetch it to check availability
          if (data.profilePictureUrl) {
            console.log('Attempting to pre-fetch profile picture:', data.profilePictureUrl);
            const img = new Image();
            img.onload = () => console.log('Profile picture pre-fetch successful');
            img.onerror = (e) => console.error('Profile picture pre-fetch failed:', e);
            img.src = data.profilePictureUrl;
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingImage(true);
    setImageLoading(true);  // Reset image loading state
    setImageError(false);   // Clear any previous errors
    
    try {
      // Step 1: Upload the image file
      console.log('Uploading profile picture...');
      const response = await fetch('/api/files/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile picture upload response:', data);
        
        // Step 2: Update the profile data with the new profile picture URL
        const imageUrl = data.url;
        console.log('Setting profile picture URL to:', imageUrl);
        
        const updatedProfileData = {
          ...profileData,
          profilePictureUrl: imageUrl,
        };
        
        setProfileData(updatedProfileData);
        
        // Step 3: Update the user profile via correct endpoint for self-updates
        console.log('Saving updated profile with new picture URL to backend...');
        const updateResponse = await fetch(`/api/auth/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProfileData)
        });
        
        if (updateResponse.ok) {
          // Step 4: Update the user in the auth context
          if (user) {
            console.log('Updating user in AuthContext with profile picture URL:', imageUrl);
            setUser({
              ...user,
              profilePictureUrl: imageUrl
            });
          }
          
          toast.success('Profile picture uploaded and saved successfully');
        } else {
          console.error('Failed to update profile with new picture, status:', updateResponse.status);
          const errorData = await updateResponse.json();
          console.error('Error response:', errorData);
          toast.warning('Profile picture uploaded but not saved to profile');
        }
      } else {
        const error = await response.json();
        console.error('Failed to upload profile picture:', error);
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
    setSaving(true);

    try {
      console.log('Updating profile with data:', profileData);
      const response = await fetch(`/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        console.log('Updated user data received from backend:', updatedUserData);
        
        // Update the user in the auth context with the response data
        if (setUser) {
          setUser(updatedUserData);
        }
        
        toast.success('Profile updated successfully!');
        navigate('/profile'); // Navigate back to profile page after successful update
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        toast.error(errorData.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivationReason.trim()) {
      toast.error('Please provide a reason for deactivating your account.');
      return;
    }

    setDeactivating(true);
    try {
      const request: DeactivationRequest = { reason: deactivationReason };
      // Use the auth/deactivate endpoint for deactivating own account
      const response = await fetch(`/api/auth/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        toast.success('Your account has been deactivated.');
        // Logout the user after deactivation
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Error deactivating account:', errorData);
        toast.error(errorData.message || 'Failed to deactivate account.');
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Edit mode content (now the main content)
  return (
    <>
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal information.</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:p-6">
          {/* Profile Picture with File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <div className="mt-2 flex justify-center">
              <div className="relative">
                {profileData.profilePictureUrl ? (
                  <>
                    <div className="relative h-32 w-32">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full border-4 border-white shadow">
                          <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                      )}
                      <img 
                        src={profileData.profilePictureUrl} 
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        className={`h-32 w-32 rounded-full object-cover border-4 border-white shadow ${imageError ? 'hidden' : ''}`}
                        onLoad={() => {
                          console.log('Profile image loaded successfully');
                          setImageLoading(false);
                          setImageError(false);
                        }}
                        onError={(e) => {
                          console.error('Error loading profile image:', profileData.profilePictureUrl);
                          setImageLoading(false);
                          setImageError(true);
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite fallback loop
                        }}
                      />
                      {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-full border-4 border-white shadow">
                          <span className="text-red-500 text-sm text-center px-2">Image could not be loaded</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center w-32 break-words">
                      {imageError && (
                        <p className="text-red-500 mt-1">Error loading image. Please upload a new one.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-3xl font-medium border-4 border-white shadow">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
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
          </div>

          {/* Basic Information */}
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
                  value={profileData.firstName || ''}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  value={profileData.lastName || ''}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email || ''}
                  disabled
                  className="shadow-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={profileData.bio || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Brief description about yourself"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={profileData.phoneNumber || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Birth date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="birthDate"
                  id="birthDate"
                  value={profileData.birthDate || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="linkedinProfileUrl" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="linkedinProfileUrl"
                  id="linkedinProfileUrl"
                  value={profileData.linkedinProfileUrl || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="pt-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Address Information</h3>
            <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                Street address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="addressLine1"
                  id="addressLine1"
                  value={profileData.addressLine1 || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                Apartment, suite, etc.
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="addressLine2"
                  id="addressLine2"
                  value={profileData.addressLine2 || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={profileData.city || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State / Province
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={profileData.state || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                ZIP / Postal code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  value={profileData.postalCode || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={profileData.country || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-6 flex justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate Account
            </button>
          </div>
        </form>
      </div>

      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Deactivate Account
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to deactivate your account? This action cannot be undone. All of your data will be inaccessible until an administrator reactivates your account.
                    </p>
                    <div className="mt-4">
                      <label htmlFor="deactivationReason" className="block text-sm font-medium text-gray-700 text-left">
                        Please tell us why you're leaving:
                      </label>
                      <textarea
                        id="deactivationReason"
                        name="deactivationReason"
                        rows={3}
                        required
                        value={deactivationReason}
                        onChange={(e) => setDeactivationReason(e.target.value)}
                        className="mt-1 shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Your feedback helps us improve our service"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  disabled={deactivating}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleDeactivateAccount}
                >
                  {deactivating ? 'Deactivating...' : 'Deactivate'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowDeactivateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettingsPage; 