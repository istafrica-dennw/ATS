import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { getFullProfilePictureUrl } from '../../utils/imageUtils';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';

const ProfilePage: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(user);
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile data from /api/auth/me');
        const response = await fetch(`/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received successfully:', data);
          setUserData(data);
        } else {
          console.error('Failed to fetch profile data, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token, location.pathname]);

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile not found</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We couldn't find your profile information.
        </p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] overflow-hidden sm:rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and application.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleChangePasswordClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            >
              <LockClosedIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Change Password
            </button>
            <Link
              to="/profile/security"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            >
              <ShieldCheckIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Security Settings
            </Link>
            <Link
              to="/profile/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-[1.02] transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Content */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <div className="flex items-center">
              {userData.profilePictureUrl ? (
                <img 
                  src={getFullProfilePictureUrl(userData.profilePictureUrl)} 
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-600"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 text-xl font-medium ring-4 ring-gray-200 dark:ring-gray-600">
                  {userData.firstName?.[0]}{userData.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.firstName} {userData.lastName}</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">{userData.role}</p>
              {userData.bio && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">{userData.bio}</p>
              )}
            </div>
          </div>

          <dl>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{userData.email}</dd>
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {userData.phoneNumber || 'Not set'}
              </dd>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Birth date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {userData.birthDate ? formatDate(userData.birthDate) : 'Not set'}
              </dd>
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Department
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {userData.department || 'Not set'}
              </dd>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {userData.addressLine1 ? (
                  <div>
                    <p>{userData.addressLine1}</p>
                    {userData.addressLine2 && <p>{userData.addressLine2}</p>}
                    <p>
                      {[userData.city, userData.state, userData.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p>{userData.country}</p>
                  </div>
                ) : (
                  'Not set'
                )}
              </dd>
            </div>
            
            {userData.linkedinProfileUrl && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <IdentificationIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  LinkedIn
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  <a 
                    href={userData.linkedinProfileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                  >
                    {userData.linkedinProfileUrl}
                  </a>
                </dd>
              </div>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Account Status
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  userData.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </>
  );
};

export default ProfilePage; 