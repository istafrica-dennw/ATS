import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Job } from '../../types/job';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact' | 'featured';
}

const JobCard: React.FC<JobCardProps> = ({ job, variant = 'default' }) => {
  const workSettingLabel = {
    REMOTE: 'Remote',
    ONSITE: 'On-site',
    HYBRID: 'Hybrid',
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/jobs/${job.id}`}
        className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-300 job-card"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              {job.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {job.department}
              </span>
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {job.location}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            {workSettingLabel[job.workSetting] || job.workSetting}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={`/jobs/${job.id}`}
        className="block bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-primary-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 job-card"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300">
            Featured
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {new Date(job.postedDate).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {job.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            {job.department}
          </span>
          <span className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {job.location}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {job.employmentType}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {workSettingLabel[job.workSetting] || job.workSetting}
            </span>
          </div>
          <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
            View job →
          </span>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 job-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">
            {job.department}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {job.location}
        </span>
        <span className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          {workSettingLabel[job.workSetting] || job.workSetting}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {job.employmentType}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Posted {new Date(job.postedDate).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
