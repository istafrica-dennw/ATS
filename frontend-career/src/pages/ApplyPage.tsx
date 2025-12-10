import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BriefcaseIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { Job } from '../types';
import api from '../services/api';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

const ApplyPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeFile: null as File | null,
    coverLetter: '',
  });

  // Fetch job details
  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  // Fetch and pre-fill user data from localStorage or API
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchJobDetails = async (id: string) => {
    try {
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (error) {
      toast.error('Failed to load job details');
      console.error('Error fetching job:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoadingUser(true);

      // Check if user is authenticated (has token)
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found - user not logged in, form will be empty');
        setIsAuthenticated(false);
        setLoadingUser(false);
        return;
      }

      setIsAuthenticated(true);

      // Try to get user from localStorage first (faster)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        console.log('Pre-filling form with cached user data:', user.email);
        
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
        }));
        
        setLoadingUser(false);
        
        // Still fetch from API in background to get latest data
        fetchUserFromAPI(token);
        return;
      }

      // If no cached user, fetch from API
      await fetchUserFromAPI(token);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't show error toast - user can still fill form manually
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchUserFromAPI = async (token: string) => {
    try {
      const response = await api.get<UserProfile>('/auth/me');
      const user = response.data;
      
      console.log('Pre-filling form with API user data:', user.email);
      
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
      }));

      // Update localStorage cache
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.log('Could not fetch user from API - user may not be logged in');
      // Silent fail - user can still fill form manually
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, resumeFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (!jobId) {
      toast.error('Job ID not found');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You need to be logged in to submit an application. Please login through the Admin Portal first.');
      console.error('No authentication token found. User must login first.');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting application for job:', jobId);
      console.log('Form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        hasResume: !!formData.resumeFile,
        hasCoverLetter: !!formData.coverLetter,
      });

      const response = await applicationService.submitApplication(jobId, formData);
      
      console.log('Application submitted successfully:', response);
      toast.success('Application submitted successfully! 🎉');
      
      // Redirect to jobs page after success
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login through the Admin Portal again.');
      } else if (error.response?.status === 409) {
        toast.error(error.response?.data?.error || 'You have already applied to this job.');
      } else if (error.response?.status === 404) {
        toast.error('Job not found or no longer available.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/jobs')}>
            <BriefcaseIcon className="h-8 w-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Career Portal</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Apply for Position</h2>
          {job && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{job.title}</p>
          )}

          {/* Authentication Status Banner */}
          {!loadingUser && (
            <>
              {/* Logged In - Pre-filled Info Banner */}
              {isAuthenticated && formData.email && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-medium">Welcome back!</span> We've pre-filled your information from your profile. You can edit any field before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Not Logged In - Login Required Banner */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Login Required
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                        To apply for this job, please login through the Admin Portal first at{' '}
                        <a 
                          href="http://localhost:3001/login" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-300"
                        >
                          localhost:3001
                        </a>
                        . Your information will then be automatically synced here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading Skeleton */}
          {loadingUser ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume * (PDF, DOC, DOCX - Max 5MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-300">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {formData.resumeFile && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formData.resumeFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                name="coverLetter"
                rows={6}
                value={formData.coverLetter}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Tell us why you're a great fit for this position..."
              />
            </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${jobId}`)}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ApplyPage;
