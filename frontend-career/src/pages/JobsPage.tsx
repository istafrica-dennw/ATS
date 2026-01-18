import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import jobService from '../services/jobService';
import { Job } from '../types/job';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkSetting, setSelectedWorkSetting] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Filter options
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getAllJobs();
        setJobs(data);
        setFilteredJobs(data);
        
        // Extract unique departments and locations
        const uniqueDepartments = [...new Set(data.map((job) => job.department).filter(Boolean))];
        const uniqueLocations = [...new Set(data.map((job) => job.location).filter(Boolean))];
        setDepartments(uniqueDepartments.sort());
        setLocations(uniqueLocations.sort());
        
        setError(null);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...jobs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.department?.toLowerCase().includes(term) ||
          job.description?.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
      );
    }

    // Work setting filter
    if (selectedWorkSetting !== 'ALL') {
      result = result.filter((job) => job.workSetting === selectedWorkSetting);
    }

    // Department filter
    if (selectedDepartment) {
      result = result.filter((job) => job.department === selectedDepartment);
    }

    // Location filter
    if (selectedLocation) {
      result = result.filter((job) => job.location === selectedLocation);
    }

    setFilteredJobs(result);
  }, [jobs, searchTerm, selectedWorkSetting, selectedDepartment, selectedLocation]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedWorkSetting('ALL');
    setSelectedDepartment('');
    setSelectedLocation('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedWorkSetting !== 'ALL' || selectedDepartment !== '' || selectedLocation !== '';

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Job Openings
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 dark:text-gray-300 max-w-2xl mx-auto">
              Find your perfect role at IST. We're always looking for talented people to join our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <JobFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedWorkSetting={selectedWorkSetting}
            onWorkSettingChange={setSelectedWorkSetting}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            departments={departments}
            locations={locations}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredJobs.length}</span>{' '}
            {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <BriefcaseIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <BriefcaseIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Open Application CTA */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Don't see the right role?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              We're always looking for talented people. Send us an open application and we'll keep you in mind 
              for future opportunities.
            </p>
            <a
              href="/apply/open"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              Submit Open Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobsPage;
