import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  CheckIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  workSetting: string;
  employmentType: string;
  salaryRange: string;
  postedDate: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  jobStatus: string;
  region?: string;
}

const WORK_SETTINGS = [
  { value: 'ALL', name: 'All Settings' },
  { value: 'HYBRID', name: 'Hybrid' },
  { value: 'ONSITE', name: 'On-site' },
  { value: 'REMOTE', name: 'Remote' }
];

const JobsPage: React.FC = () => {
  const { isEU } = useGeolocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkSetting, setSelectedWorkSetting] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs');
        const publishedJobs = response.data.filter((job: Job) => {
          const status = job.jobStatus?.toUpperCase();
          return status === 'PUBLISHED' || status === 'REOPENED';
        });
        setJobs(publishedJobs);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search, filter criteria, and region
  const filteredJobs = jobs.filter(job => {
    // Region filter - if isEU (from subdomain or IP), only show EU jobs
    if (isEU) {
      if (job.region !== 'EU') {
        return false;
      }
    }
    
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    // Work Setting filter
    const matchesWorkSetting = selectedWorkSetting === 'ALL' || job.workSetting === selectedWorkSetting;

    return matchesSearch && matchesWorkSetting;
  });

  // Toggle job details
  const toggleJobDetails = (jobId: number) => {
    if (selectedJob === jobId) {
      setSelectedJob(null);
    } else {
      setSelectedJob(jobId);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedWorkSetting('ALL');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20 shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700 overflow-visible">
        <div className="container mx-auto px-3 py-6 sm:px-6 lg:px-8 sm:py-8 overflow-visible">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                Find Your Next Opportunity
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base px-2 sm:px-0">
                Discover amazing career opportunities that match your skills and aspirations
              </p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              ← Back to Home
            </Link>
          </div>
          
          <div className="space-y-3 sm:space-y-4 overflow-visible">
            <div className="relative max-w-2xl mx-auto px-1 sm:px-0">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl leading-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl focus:shadow-xl"
                placeholder="Search jobs by title, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 px-1 sm:px-0 overflow-visible">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Filters
                  <ChevronDownIcon className={`ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${showFilters ? 'transform rotate-180' : ''}`} />
                </button>
                
                {selectedWorkSetting !== 'ALL' && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-red-300 dark:border-red-600 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-200 transform hover:scale-105"
                    onClick={resetFilters}
                  >
                    <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Clear
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-end">
                <div className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                  <BriefcaseIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                  </span>
                </div>
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 p-4 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg mx-1 sm:mx-0 overflow-visible relative z-[9000]">
                <div className="overflow-visible">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                    <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-600 dark:text-indigo-400" />
                    Work Setting
                  </label>
                  <div className="relative overflow-visible z-[10000]">
                    <Listbox value={selectedWorkSetting} onChange={setSelectedWorkSetting}>
                      <div className="relative overflow-visible z-[10000]">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm border border-gray-300 dark:border-gray-600 transition-all duration-200">
                          <span className="block truncate text-gray-900 dark:text-gray-100">
                            {WORK_SETTINGS.find(setting => setting.value === selectedWorkSetting)?.name || 'Select Work Setting'}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Listbox.Options className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-2 text-sm shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-300 dark:border-gray-600">
                            {WORK_SETTINGS.map((setting) => (
                              <Listbox.Option
                                key={setting.value}
                                className={({ active, selected }) =>
                                  `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${
                                    active 
                                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100' 
                                      : selected 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100'
                                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                                  }`
                                }
                                value={setting.value}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                      {setting.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 py-6 sm:px-6 lg:px-8 sm:py-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] overflow-hidden rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Available Positions
            </h2>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <li className="px-4 py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </li>
            ) : error ? (
              <li className="px-4 py-12 text-center text-red-600 dark:text-red-400">{error}</li>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <li key={job.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/50 dark:hover:from-indigo-900/10 dark:hover:to-blue-900/10 transition-all duration-200 transform hover:scale-[1.01]">
                  <div className="px-3 py-4 sm:px-6 sm:py-6">
                    <div className="flex flex-col space-y-3 sm:space-y-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                          <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{job.title}</h3>
                          <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400">
                              <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {job.department}
                            </span>
                            <span className="inline-flex items-center">
                              <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="inline-flex items-center">
                              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {job.workSetting}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800 w-max">
                            {job.employmentType}
                          </span>
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-max">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            {job.salaryRange}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 border border-indigo-600 dark:border-indigo-500 text-xs sm:text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md w-full sm:w-auto"
                          onClick={() => toggleJobDetails(job.id)}
                        >
                          {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <p>Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                    </div>
                    
                    {selectedJob === job.id && (
                      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-700/30 dark:to-indigo-900/20 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                          <div className="space-y-4 sm:space-y-6">
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-2 sm:mb-3">
                                <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-indigo-600 dark:text-indigo-400" />
                                Job Description
                              </h4>
                              <div 
                                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50"
                                dangerouslySetInnerHTML={{ __html: job.description }}
                              />
                            </div>
                            
                            {job.requirements && job.requirements.length > 0 && (
                              <div>
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-2 sm:mb-3">
                                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-600 dark:text-green-400" />
                                  Requirements
                                </h4>
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                                  <ul className="space-y-2">
                                    {job.requirements.map((req, index) => (
                                      <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 sm:space-y-6">
                            {job.responsibilities && job.responsibilities.length > 0 && (
                              <div>
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-2 sm:mb-3">
                                  <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-blue-600 dark:text-blue-400" />
                                  Responsibilities
                                </h4>
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                                  <ul className="space-y-2">
                                    {job.responsibilities.map((resp, index) => (
                                      <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                                        {resp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {job.benefits && job.benefits.length > 0 && (
                              <div>
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-2 sm:mb-3">
                                  <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-purple-600 dark:text-purple-400" />
                                  Benefits
                                </h4>
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                                  <ul className="space-y-2">
                                    {job.benefits.map((benefit, index) => (
                                      <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 sm:mt-8 flex justify-center">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center w-full sm:w-auto justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                          >
                            <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Apply for this Position
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <div className="flex flex-col items-center">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    onClick={resetFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobsPage;
