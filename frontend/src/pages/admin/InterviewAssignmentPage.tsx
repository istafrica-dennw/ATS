import React, { useState, useEffect } from 'react';
import { interviewAPI, interviewSkeletonAPI, skeletonJobAssociationAPI } from '../../services/api';
import { jobService, JobDTO } from '../../services/jobService';
import { InterviewSkeleton, AssignInterviewRequest, Interview } from '../../types/interview';
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
  EyeIcon
} from '@heroicons/react/24/outline';

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
    notes: ''
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
        interviewAPI.getAssignedByMe(), // Get interviews assigned by current admin
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
      notes: ''
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
        notes: formData.notes || undefined
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
        <div className="px-6 py-4">
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
            <div className="sm:w-64">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm"
                >
                  <option value="">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id.toString()}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
                <div key={application.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {application.candidateName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{application.candidateEmail}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          <span>{application.jobTitle}</span>
                        </div>
                        <span>•</span>
                        <span>Applied: {formatDate(application.appliedAt)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {application.status}
                        </span>
                        {applicationInterviews.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {applicationInterviews.length} Interview{applicationInterviews.length !== 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Display all interviews for this application */}
                      {applicationInterviews.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {applicationInterviews.map((interview, index) => (
                            <div key={interview.id} className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-200/50 dark:border-blue-700/50 transform transition-transform duration-300 hover:scale-[1.01] shadow-inner">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <UserGroupIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    <div>
                                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                        {interview.skeletonName}
                                      </span>
                                      <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Assigned to: {interview.interviewerName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 ml-8 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <p>
                                      {interview.scheduledAt 
                                        ? `Scheduled: ${formatDate(interview.scheduledAt)}`
                                        : 'Date TBD'
                                      }
                                    </p>
                                    <p>Status: <span className={`font-medium ${
                                      interview.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' :
                                      interview.status === 'IN_PROGRESS' ? 'text-blue-600 dark:text-blue-400' :
                                      'text-yellow-600 dark:text-yellow-400'
                                    }`}>{interview.status}</span></p>
                                    {interview.completedAt && (
                                      <p>Completed: {formatDate(interview.completedAt)}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                  {interview.status === 'COMPLETED' && (
                                    <button
                                      onClick={() => handleViewResults(interview)}
                                      className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
                                    >
                                      <EyeIcon className="h-4 w-4 mr-1.5" />
                                      View Results
                                    </button>
                                  )}
                                  {interview.status === 'ASSIGNED' && (
                                    <button
                                      onClick={() => handleCancelInterview(interview.id)}
                                      className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
                                    >
                                      <TrashIcon className="h-4 w-4 mr-1.5" />
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Always show the assign interview button */}
                    <div className="flex items-center ml-4">
                      <button
                        onClick={() => handleAssignInterview(application)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 font-medium transform hover:scale-[1.02] transition-all"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {applicationInterviews.length > 0 ? 'Add Interview' : 'Assign Interview'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] sm:max-w-[90vw] md:w-2/3 lg:w-1/2 shadow-lg dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Assign Interview - {selectedApplication.candidateName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <select
                  value={formData.interviewerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, interviewerId: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  required
                >
                  <option value="">Select an interviewer</option>
                  {interviewers.map((interviewer) => (
                    <option key={interviewer.id} value={interviewer.id}>
                      {interviewer.firstName} {interviewer.lastName} ({interviewer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interview Template *</label>
                <select
                  value={formData.skeletonId}
                  onChange={(e) => setFormData(prev => ({ ...prev, skeletonId: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  required
                >
                  <option value="">Select an interview template</option>
                  {filteredSkeletons.map((skeleton) => (
                    <option key={skeleton.id} value={skeleton.id}>
                      {skeleton.name} ({skeleton.focusAreas.length} focus areas)
                    </option>
                  ))}
                  {filteredSkeletons.length === 0 && (
                    <option value="" disabled>No interview templates associated with this job</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Optional notes for the interviewer"
                />
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
      )}

      {/* Interview Results Modal */}
      {showResultsModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-6">
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