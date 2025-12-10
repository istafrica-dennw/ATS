import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { jobService } from '../services/jobService';
import { Job } from '../types';
import { format } from 'date-fns';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  const fetchJobDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (error) {
      toast.error('Failed to load job details');
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2">
              <BriefcaseIcon className="h-8 w-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Career Portal</h1>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400">Job not found</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-8"
        >
          {/* Job Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{job.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPinIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span>{job.salaryRange || 'Competitive Salary'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span>{job.employmentType}</span>
              </div>
              {job.postedDate && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
                  <span>Posted: {format(new Date(job.postedDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                {job.workSetting}
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                {job.jobStatus}
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Job Description</h2>
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Requirements</h2>
              <div
                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Responsibilities</h2>
              <div
                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: job.responsibilities }}
              />
            </div>
          )}

          {/* Apply Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => navigate(`/jobs/${job.id}/apply`)}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Apply Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
