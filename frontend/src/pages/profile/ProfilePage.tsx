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
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { getFullProfilePictureUrl } from '../../utils/imageUtils';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import RoleSwitcher from '../../components/RoleSwitcher';
import RegionalAccessIndicator from '../../components/common/RegionalAccessIndicator';
import RegionBadge from '../../components/common/RegionBadge';
import { useEUAdminSetup } from '../../hooks/useEUAdminSetup';
import { useGeolocation } from '../../hooks/useGeolocation';

const ProfilePage: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(user);
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // EU Admin Setup hooks
  const { 
    status: euAdminStatus,
    loading: setupLoading, 
    becomeFirstEUAdmin 
  } = useEUAdminSetup();
  
  const { region: detectedRegion, isEU: accessingFromEU, loading: geoLoading } = useGeolocation();

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

  const handleBecomeEUAdmin = async () => {
    try {
      await becomeFirstEUAdmin();
      // Refresh user data after becoming EU admin
      const response = await fetch(`/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to become EU admin:', error);
    }
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
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-6">
              <div className="flex-shrink-0 mb-4 md:mb-0">
                {userData.profilePictureUrl ? (
                  <img
                    src={getFullProfilePictureUrl(userData.profilePictureUrl)}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 text-3xl font-medium ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400">
                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {userData.firstName} {userData.lastName}
                </h1>
                <div className="mt-1">
                  <RoleSwitcher />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 mt-4 md:mt-0 w-full lg:w-auto shrink-0">
                <Link
                  to="/profile/settings"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-[1.02] transition-all"
                >
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleChangePasswordClick}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                >
                  <LockClosedIcon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Change Password
                </button>
                <Link
                  to="/profile/security"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                >
                  <ShieldCheckIcon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Personal Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Your personal details, as you've provided them.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {userData.email}
                </dd>
              </div>
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {userData.phoneNumber || 'Not set'}
                </dd>
              </div>
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Birth date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {userData.birthDate ? formatDate(userData.birthDate) : 'Not set'}
                </dd>
              </div>
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Department
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {userData.department || 'Not set'}
                </dd>
              </div>
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Region
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  <RegionBadge region={userData.region || null} size="sm" />
                </dd>
              </div>
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
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
                <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
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
              <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Account Status
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userData.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Regional Access Information - Only for Admins */}
        {userData.role === 'ADMIN' && (
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Regional Access Information
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your regional data access permissions and GDPR compliance status.
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Access Level:
                  </span>
                  <RegionalAccessIndicator />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Regional Data Access
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Your Region:</strong> {userData.region ? (
                        <RegionBadge region={userData.region} size="sm" />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not assigned</span>
                      )}
                    </p>
                    <p>
                      <strong>Access Scope:</strong> Your regional assignment determines which user data you can view and manage.
                    </p>
                    <p>
                      <strong>GDPR Compliance:</strong> Regional data isolation ensures compliance with data protection regulations.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    This shows what regional data you can access and manage as an administrator.
                    Your access level is determined by your assigned region and admin role.
                  </p>
                </div>

                {/* EU Admin Self-Assignment Section */}
                {!euAdminStatus?.hasEUAdmin && userData.role === 'ADMIN' && !userData.region && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Become First EU Administrator
                        </h4>
                        <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                          <p className="mb-3">
                            You can become the first EU administrator if you're accessing from an EU country.
                            This is a one-time setup for GDPR compliance.
                          </p>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                accessingFromEU 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {accessingFromEU ? '✓' : '✗'} EU Access Detected
                              </span>
                              <span className="ml-2 text-blue-700 dark:text-blue-300">
                                {detectedRegion ? `Detected region: ${detectedRegion}` : 'Detecting...'}
                              </span>
                            </div>
                            
                            {/* Debug Information - IP and Region Details */}
                            {/* <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                              <div className="font-mono text-gray-600 dark:text-gray-300">
                                <div><strong>Debug Info (Temporary):</strong></div>
                                <div>IP: {euAdminStatus?.clientIP || 'Loading...'}</div>
                                <div>Region: {detectedRegion || 'Detecting...'}</div>
                                <div>EU Access: {accessingFromEU ? 'Yes' : 'No'}</div>
                                <div>API EU Check: {euAdminStatus?.isEUAccess ? 'Yes' : 'No'}</div>
                              </div>
                            </div> */}
                            
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                !euAdminStatus?.hasEUAdmin 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {!euAdminStatus?.hasEUAdmin ? '✓' : '✗'} No EU Admin Exists
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                !userData.region 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {!userData.region ? '✓' : '✗'} No Region Assigned
                              </span>
                            </div>
                          </div>
                          
                          {euAdminStatus?.canBecomeFirstEUAdmin && accessingFromEU && (
                            <div className="mt-4">
                              <button
                                onClick={handleBecomeEUAdmin}
                                disabled={setupLoading || geoLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {setupLoading || geoLoading ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </>
                                ) : (
                                  'Become First EU Admin'
                                )}
                              </button>
                            </div>
                          )}
                          
                          {!euAdminStatus?.canBecomeFirstEUAdmin && (
                            <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                              {!accessingFromEU && (
                                <p>❌ You must be accessing from an EU country to become the first EU admin.</p>
                              )}
                              {userData.region && (
                                <p>❌ You already have a region assigned ({userData.region}).</p>
                              )}
                              {euAdminStatus?.hasEUAdmin && (
                                <p>❌ An EU administrator already exists.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default ProfilePage; 