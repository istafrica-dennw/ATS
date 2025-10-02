import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  UserIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getFullProfilePictureUrl } from '../../utils/imageUtils';
import { User, UserFormData } from '../../types/user';
import RoleManager from '../../components/RoleManager';
import { toast } from 'react-toastify';

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: number;
  experienceYears?: number;
}

interface UserProfileData extends User {
  applications?: Application[];
  createdAt?: string;
}

const AdminUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'details'>('profile');
  const [error, setError] = useState<string | null>(null);
  
  // User details editing state
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Network error when loading user profile');
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  const fetchUserApplications = useCallback(async () => {
    if (!userId || !token) return;
    
    try {
      setApplicationsLoading(true);
      
      const response = await fetch(`/api/applications/user/${userId}?size=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.content || []);
      } else {
        console.error('Failed to load user applications');
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userId && token) {
      fetchUserApplications();
    }
  }, [userId, token, fetchUserApplications]);

  useEffect(() => {
    if (activeTab === 'applications' && applications.length === 0) {
      fetchUserApplications();
    }
  }, [activeTab, applications.length, fetchUserApplications]);

  // Initialize editing user data when userData changes
  useEffect(() => {
    if (userData) {
      setEditingUser({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        department: userData.department || '',
        phoneNumber: userData.phoneNumber || '',
        profilePictureUrl: userData.profilePictureUrl || '',
        isActive: userData.isActive || false,
        isEmailVerified: userData.isEmailVerified || false,
        role: userData.role
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingUser) return;
    
    const { name, value } = e.target;
    setEditingUser({
      ...editingUser,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingUser) return;
    
    const { name, checked } = e.target;
    setEditingUser({
      ...editingUser,
      [name]: checked
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingUser) return;
    
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
        
        // Update the editing user data with the new profile picture URL
        setEditingUser({
          ...editingUser,
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
    if (!editingUser || !userId) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingUser)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        // Refresh user data
        await fetchUserProfile();
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
    if (!editingUser || !userId) return;
    
    // Check if current user is trying to deactivate themselves
    if (currentUser && userId && currentUser.id === parseInt(userId) && currentUser.role === 'ADMIN' && editingUser.isActive) {
      toast.error('Cannot deactivate your own admin account. Please ask another admin to do this.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}/status?isActive=${!editingUser.isActive}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`User ${editingUser.isActive ? 'deactivated' : 'activated'} successfully`);
        // Update local state
        setEditingUser({
          ...editingUser,
          isActive: !editingUser.isActive
        });
        // Refresh user data
        await fetchUserProfile();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${editingUser.isActive ? 'deactivate' : 'activate'} user`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Users
          </button>
          
          <div className="flex items-center space-x-4">
            {userData.profilePictureUrl ? (
              <img
                src={getFullProfilePictureUrl(userData.profilePictureUrl)}
                alt={`${userData.firstName} ${userData.lastName}`}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 text-2xl font-medium ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400">
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{userData.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
                {userData.mfaEnabled && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    2FA Enabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Applications ({applications.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Basic Information</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {userData.firstName} {userData.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {userData.email}
                    </dd>
                  </div>
                  {userData.phoneNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {userData.phoneNumber}
                      </dd>
                    </div>
                  )}
                  {(userData.city || userData.country) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {[userData.city, userData.country].filter(Boolean).join(', ')}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Two-Factor Authentication</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.mfaEnabled ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {userData.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>


            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Account Information</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {userData.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {userData.role}
                    </dd>
                  </div>
                  {userData.createdAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(userData.createdAt)}
                      </dd>
                    </div>
                  )}
                  {userData.lastLogin && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {userData.lastLogin instanceof Date ? formatDate(userData.lastLogin.toISOString()) : formatDate(String(userData.lastLogin))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Job Applications</h2>
            </div>
            <div className="px-6 py-4">
              {applicationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Expected Salary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {applications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {application.jobTitle}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Job ID: {application.jobId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(application.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(application.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {application.experienceYears ? `${application.experienceYears} years` : 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {application.expectedSalary ? `$${application.expectedSalary.toLocaleString()}` : 'Not specified'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Details Tab */}
        {activeTab === 'details' && editingUser && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit User Details</h2>
              </div>
              <div className="px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {editingUser.profilePictureUrl ? (
                        <img
                          src={editingUser.profilePictureUrl}
                          alt={`${editingUser.firstName} ${editingUser.lastName}`}
                          className="h-24 w-24 rounded-full object-cover border-3 border-white dark:border-gray-600 shadow-lg"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-xl font-semibold border-3 border-white dark:border-gray-600 shadow-lg">
                          {editingUser.firstName?.[0]}{editingUser.lastName?.[0]}
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
                        value={editingUser.firstName || ''}
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
                        value={editingUser.lastName || ''}
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
                        value={editingUser.email || ''}
                        disabled
                        className="block w-full py-2.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 focus:outline-none shadow-sm cursor-not-allowed"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Roles
                      </label>
                      {userId && (
                        <RoleManager 
                          userId={parseInt(userId)}
                          onUserUpdated={() => {
                            // Refresh user data after role changes
                            fetchUserProfile();
                          }}
                          className="mb-4"
                        />
                      )}
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={editingUser.department || ''}
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
                        value={editingUser.phoneNumber || ''}
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
                            checked={editingUser.isActive || false}
                            onChange={handleCheckboxChange}
                            className="h-5 w-5 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-offset-0 transition-colors duration-200"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Active Account
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {editingUser.isActive
                              ? 'User can log in and access the system'
                              : 'User is deactivated and cannot log in'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Verification:</span>
                          <span className={`ml-3 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            editingUser.isEmailVerified 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {editingUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {editingUser.isEmailVerified
                          ? 'User has verified their email address'
                          : 'User has not yet verified their email address'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {(() => {
                        const isCurrentUserAdmin = currentUser && userId && currentUser.id === parseInt(userId) && currentUser.role === 'ADMIN';
                        const isDeactivatingSelf = Boolean(isCurrentUserAdmin && editingUser.isActive);
                        
                        return (
                          <button
                            type="button"
                            onClick={toggleUserStatus}
                            disabled={saving || isDeactivatingSelf}
                            className={`inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                              editingUser.isActive 
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 dark:focus:ring-red-400' 
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500 dark:focus:ring-green-400'
                            }`}
                            title={isDeactivatingSelf ? 'Cannot deactivate your own admin account' : ''}
                          >
                            {editingUser.isActive ? 'Deactivate User' : 'Activate User'}
                          </button>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserProfilePage;