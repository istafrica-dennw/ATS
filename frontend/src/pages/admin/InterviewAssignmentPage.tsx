import React, { useState, useEffect } from 'react';
import { interviewAPI, interviewSkeletonAPI, skeletonJobAssociationAPI } from '../../services/api';
import { jobService, JobDTO } from '../../services/jobService';
import { InterviewSkeleton, AssignInterviewRequest, Interview, InterviewStatus } from '../../types/interview';
import { 
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronUpDownIcon,
  CheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Application {
  id: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobId: number;
  status: string;
  appliedAt: string;
}

interface Interviewer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Add toast notification component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
      type === 'success' 
        ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' 
        : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
    } border rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-4`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircleIcon className="h-5 w-5 mr-2" />
        ) : (
          <XMarkIcon className="h-5 w-5 mr-2" />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto -mr-1 -mt-1 h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const InterviewAssignmentPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [skeletons, setSkeletons] = useState<InterviewSkeleton[]>([]);
  const [filteredSkeletons, setFilteredSkeletons] = useState<InterviewSkeleton[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Filter states
  const [jobFilter, setJobFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    interviewerId: '',
    skeletonId: '',
    scheduledAt: '',
    notes: '',
    sendCalendarInvite: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all shortlisted applications, available interviewers, interview templates, existing interviews, and jobs
      const [applicationsResponse, interviewersResponse, skeletonsResponse, interviewsResponse, jobsResponse] = await Promise.all([
        interviewAPI.getAllShortlistedApplications(),
        interviewAPI.getAvailableInterviewers(),
        interviewSkeletonAPI.getAll(),
        interviewAPI.getAllInterviews(), // Get all interviews for admin assignment management
        jobService.getAllJobs()
      ]);
      
      // Map the API response to our local interface
      const mappedApplications: Application[] = applicationsResponse.data.map(app => ({
        id: app.id,
        candidateName: app.candidateName,
        candidateEmail: app.candidateEmail,
        jobTitle: app.jobTitle,
        jobId: app.jobId,
        status: 'SHORTLISTED',
        appliedAt: app.appliedAt
      }));

      // Map the interviewer response to our local interface
      const mappedInterviewers: Interviewer[] = interviewersResponse.data.map(interviewer => ({
        id: interviewer.id,
        firstName: interviewer.firstName,
        lastName: interviewer.lastName,
        email: interviewer.email
      }));

      setApplications(mappedApplications);
      setInterviewers(mappedInterviewers);
      setSkeletons(skeletonsResponse.data);
      setInterviews(interviewsResponse.data);
      setJobs(jobsResponse);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get all interviews for a specific application
  const getInterviewsForApplication = (applicationId: number): Interview[] => {
    return interviews.filter(interview => interview.applicationId === applicationId);
  };

  // Filter applications based on job and search term
  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesJob = !jobFilter || app.jobId.toString() === jobFilter;
      const matchesSearch = !searchTerm || 
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesJob && matchesSearch;
    });
  };

  const handleAssignInterview = async (application: Application) => {
    setSelectedApplication(application);
    setFormData({
      interviewerId: '',
      skeletonId: '',
      scheduledAt: '',
      notes: '',
      sendCalendarInvite: false
    });
    
    try {
      // Get skeletons associated with this job
      const associatedSkeletonIds = await skeletonJobAssociationAPI.getSkeletonIdsByJobId(application.jobId);
      
      // Filter skeletons to only show those associated with the job
      const jobSkeletons = skeletons.filter(skeleton => 
        associatedSkeletonIds.data.includes(skeleton.id)
      );
      
      // STRICT: Only show skeletons associated with this job
      setFilteredSkeletons(jobSkeletons);
    } catch (error) {
      console.error('Error loading job skeletons:', error);
      // STRICT: Show no skeletons if API fails
      setFilteredSkeletons([]);
    }
    
    setShowModal(true);
  };

  // Handle interview cancellation
  const handleCancelInterview = async (interviewId: number) => {
    if (!window.confirm('Are you sure you want to cancel this interview assignment?')) {
      return;
    }

    try {
      await interviewAPI.cancelInterview(interviewId);
      setToast({
        message: 'Interview assignment cancelled successfully',
        type: 'success'
      });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error cancelling interview:', error);
      setToast({
        message: 'Failed to cancel interview assignment',
        type: 'error'
      });
    }
  };

  // Handle viewing interview results
  const handleViewResults = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowResultsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedApplication || !formData.interviewerId || !formData.skeletonId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestData: AssignInterviewRequest = {
        applicationId: selectedApplication.id,
        interviewerId: parseInt(formData.interviewerId),
        skeletonId: parseInt(formData.skeletonId),
        scheduledAt: formData.scheduledAt || undefined,
        notes: formData.notes || undefined,
        sendCalendarInvite: formData.sendCalendarInvite
      };

      await interviewAPI.assign(requestData);
      
      // Show success toast
      setToast({
        message: `Interview successfully assigned to ${interviewers.find(i => i.id === parseInt(formData.interviewerId))?.firstName} ${interviewers.find(i => i.id === parseInt(formData.interviewerId))?.lastName}`,
        type: 'success'
      });
      
      // Close modal and refresh data
      setShowModal(false);
      fetchData(); // Refresh the applications list
      
    } catch (err) {
      console.error('Error assigning interview:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign interview';
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Assignment</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Assign interviews to shortlisted candidates
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-md p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates, emails, or job titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm"
                />
              </div>
            </div>

            {/* Job Filter */}
            <div className="w-full sm:w-64">
              <Listbox value={jobFilter} onChange={setJobFilter}>
              <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-3 pl-3 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500 sm:text-sm border border-gray-300 dark:border-gray-600">
                    <span className="block truncate">{jobs.find(j => j.id.toString() === jobFilter)?.title || 'All Jobs'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-3 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm border border-gray-300 dark:border-gray-600">
                      <Listbox.Option
                        key="all-jobs"
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-indigo-50 dark:bg-gray-700' : 'text-gray-900 dark:text-gray-100'
                          }`
                        }
                        value=""
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'font-normal'
                              }`}
                            >
                              All Jobs
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                      {jobs.map((job) => (
                        <Listbox.Option
                          key={job.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-50 dark:bg-gray-700' : 'text-gray-900 dark:text-gray-100'
                            }`
                          }
                          value={job.id.toString()}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'font-normal'
                                }`}
                              >
                      {job.title}
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
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Shortlisted Applications ({getFilteredApplications().length})
          </h2>
        </div>

        {getFilteredApplications().length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {applications.length === 0 ? 'No shortlisted applications' : 'No applications match your filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {applications.length === 0 
                ? 'Applications will appear here when they are shortlisted for interviews.'
                : 'Try adjusting your search or job filter to see more results.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {getFilteredApplications().map((application) => {
              const applicationInterviews = getInterviewsForApplication(application.id);
              
              return (
                <div key={application.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                                <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {application.candidateName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{application.candidateEmail}</p>
                        </div>
                      </div>
                      
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                                    <BriefcaseIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{application.jobTitle}</span>
                        </div>
                                <span className="hidden sm:inline">•</span>
                                <span className="mt-1 sm:mt-0">Applied: {formatDate(application.appliedAt)}</span>
                                <span className="hidden sm:inline">•</span>
                                <div className="mt-2 sm:mt-0 flex items-center gap-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {application.status}
                        </span>
                        {applicationInterviews.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {applicationInterviews.length} Interview{applicationInterviews.length !== 1 ? 's' : ''}
                            </span>
                        )}
                                </div>
                      </div>

                      {/* Display all interviews for this application */}
                            <div className="flex-grow mt-4">
                                {applicationInterviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {applicationInterviews.map((interview) => (
                                            <div key={interview.id} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50 flex-grow w-full">
                                                    <div className="flex items-center mb-2">
                                                        <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{interview.skeletonName}</h4>
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 pl-7">
                                                        <p>
                                                            <span className="font-medium">Assigned to:</span> {interview.interviewerName}
                                                        </p>
                                                        {interview.scheduledAt && (
                                                            <p>
                                                                <span className="font-medium">Scheduled:</span> {formatDate(interview.scheduledAt)}
                                                            </p>
                                                        )}
                                                        <p>
                                                            <span className="font-medium">Status:</span> 
                                                            <span className={`ml-1 font-semibold ${
                                                                interview.status === InterviewStatus.COMPLETED ? 'text-green-600 dark:text-green-400' :
                                                                interview.status === InterviewStatus.IN_PROGRESS ? 'text-yellow-600 dark:text-yellow-400' :
                                                                interview.status === InterviewStatus.ASSIGNED ? 'text-blue-600 dark:text-blue-400' :
                                                                'text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                                {interview.status}
                                      </span>
                                                        </p>
                                                        {interview.completedAt && (
                                                            <p>
                                                                <span className="font-medium">Completed:</span> {formatDate(interview.completedAt)}
                                                            </p>
                                    )}
                                  </div>
                                </div>
                                                <div className="w-full sm:w-auto flex flex-col items-center space-y-2 flex-shrink-0">
                                    <button
                                                        type="button"
                                                        onClick={() => handleAssignInterview(application)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200"
                                                        title="Assign another interview for this candidate"
                                                    >
                                                        <CalendarDaysIcon className="-ml-1 mr-2 h-5 w-5" />
                                                        Add Interview
                                    </button>
                                    {interview.status === 'COMPLETED' && (
                                        <button
                                            onClick={() => {
                                                setSelectedInterview(interview);
                                                setShowResultsModal(true);
                                            }}
                                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200"
                                        >
                                            <EyeIcon className="-ml-1 mr-2 h-5 w-5" />
                                            View Results
                                        </button>
                                    )}
                              </div>
                            </div>
                          ))}
                        </div>
                                ) : (
                                    <div className="flex items-center justify-end mt-4">
                      <button
                                            type="button"
                        onClick={() => handleAssignInterview(application)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200"
                      >
                                            <CalendarDaysIcon className="-ml-1 mr-2 h-5 w-5" />
                                            Add Interview
                      </button>
                                    </div>
                                )}
                            </div>
                        </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
              <button
                  type="button"
                onClick={() => setShowModal(false)}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Assign Interview - {selectedApplication.candidateName}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Candidate Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedApplication.candidateName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedApplication.candidateEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Position:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedApplication.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Applied:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedApplication.appliedAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interviewer *</label>
                    <Listbox value={formData.interviewerId} onChange={(value) => setFormData(prev => ({ ...prev, interviewerId: value }))}>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                          <span className="block truncate">{interviewers.find(i => i.id.toString() === formData.interviewerId)?.firstName || 'Select an interviewer'} {interviewers.find(i => i.id.toString() === formData.interviewerId)?.lastName}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {interviewers.map((interviewer) => (
                              <Listbox.Option
                                key={interviewer.id}
                                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'text-gray-900 dark:text-gray-100'}`}
                                value={interviewer.id.toString()}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{interviewer.firstName} {interviewer.lastName} ({interviewer.email})</span>
                                    {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interview Template *</label>
                    <Listbox value={formData.skeletonId} onChange={(value) => setFormData(prev => ({ ...prev, skeletonId: value }))}>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                          <span className="block truncate">{skeletons.find(s => s.id.toString() === formData.skeletonId)?.name || 'Select an interview template'}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredSkeletons.map((skeleton) => (
                              <Listbox.Option
                                key={skeleton.id}
                                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'text-gray-900 dark:text-gray-100'}`}
                                value={skeleton.id.toString()}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{skeleton.name} ({skeleton.focusAreas.length} focus areas)</span>
                                    {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}
                                  </>
                                )}
                              </Listbox.Option>
                  ))}
                  {filteredSkeletons.length === 0 && (
                              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-400">No interview templates associated with this job</div>
                  )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Date & Time</label>
                    <div className="relative mt-1">
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition-all duration-200"
                />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition-all duration-200"
                  placeholder="Optional notes for the interviewer"
                />
              </div>

              {/* Calendar Integration Option */}
              <div className="flex items-center">
                <input
                  id="sendCalendarInvite"
                  type="checkbox"
                  checked={formData.sendCalendarInvite}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendCalendarInvite: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="sendCalendarInvite" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  📅 Send calendar invites to all participants
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Sends Outlook/Google calendar invites to interviewer, candidate, and admin
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 disabled:opacity-50 font-medium transform hover:scale-[1.02]"
                >
                  {submitting ? 'Assigning...' : 'Assign Interview'}
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Results Modal */}
      {showResultsModal && selectedInterview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Interview Results</h2>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Interview Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidate</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedInterview.application.candidateName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Position</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedInterview.application.jobTitle}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Interviewer</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedInterview.interviewerName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Interview Template</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedInterview.skeletonName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Date</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedInterview.completedAt 
                        ? new Date(selectedInterview.completedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</h3>
                    <p className={`text-2xl font-bold ${
                      selectedInterview.responses && selectedInterview.responses.length > 0
                        ? (() => {
                            const avgRating = selectedInterview.responses
                              .filter(r => r.rating > 0)
                              .reduce((sum, r) => sum + r.rating, 0) / 
                              selectedInterview.responses.filter(r => r.rating > 0).length;
                            return avgRating >= 70
                              ? 'text-green-600 dark:text-green-400'
                              : avgRating >= 50
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400';
                          })()
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {selectedInterview.responses && selectedInterview.responses.length > 0
                        ? (() => {
                            const validRatings = selectedInterview.responses.filter(r => r.rating > 0);
                            if (validRatings.length === 0) return 'N/A';
                            const avgRating = validRatings.reduce((sum, r) => sum + r.rating, 0) / validRatings.length;
                            return `${Math.round(avgRating)}/100`;
                          })()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Focus Area Results */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Focus Area Results</h3>
                <div className="space-y-4">
                  {selectedInterview.responses && selectedInterview.responses.length > 0 ? (
                    selectedInterview.responses.map((response, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{response.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              response.rating >= 70
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : response.rating >= 50
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : response.rating > 0
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {response.rating > 0 ? `${response.rating}/100` : 'Not Rated'}
                            </span>
                          </div>
                        </div>
                        {response.feedback && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {response.feedback}
                            </p>
                          </div>
                        )}
                        {!response.feedback && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              No feedback provided for this focus area.
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No detailed responses available.</p>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default InterviewAssignmentPage; 