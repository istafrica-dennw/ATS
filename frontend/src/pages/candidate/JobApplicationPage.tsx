import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '../../layouts/MainLayout';
import JobApplicationForm from '../../components/application/JobApplicationForm';
import axiosInstance from '../../utils/axios';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
}

const JobApplicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Parse job ID as number
        const jobId = id ? parseInt(id, 10) : 0;
        
        if (isNaN(jobId) || jobId <= 0) {
          setError('Invalid job ID');
          setLoading(false);
          return;
        }
        
        // Fetch job details
        const response = await axiosInstance.get(`/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !job) {
    return (
      <MainLayout>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="container mx-auto px-3 py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error || 'Job not found'}
                  </h3>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/jobs"
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-3 py-6 sm:px-6 lg:px-8 sm:py-8">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                Apply for Position
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg px-2 sm:px-0 max-w-3xl mx-auto">
                Complete the application form below to apply for the <span className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</span> position at <span className="font-semibold text-indigo-600 dark:text-indigo-400">{job.department || 'Development & AI'}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 py-6 sm:px-6 lg:px-8 sm:py-8 max-w-4xl">
          <JobApplicationForm 
            jobId={job.id} 
            jobTitle={job.title} 
            department={job.department || 'the department'} 
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default JobApplicationPage;
