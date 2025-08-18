import React, { useState, useEffect } from 'react';
import { interviewAPI, interviewSkeletonAPI } from '../../services/api';
import { InterviewSkeleton, AssignInterviewRequest, Interview } from '../../types/interview';
import { 
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon
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
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      
      // Fetch all shortlisted applications, available interviewers, interview templates, and existing interviews
      const [applicationsResponse, interviewersResponse, skeletonsResponse, interviewsResponse] = await Promise.all([
        interviewAPI.getAllShortlistedApplications(),
        interviewAPI.getAvailableInterviewers(),
        interviewSkeletonAPI.getAll(),
        interviewAPI.getAssignedByMe() // Get interviews assigned by current admin
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
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get interview for a specific application
  const getInterviewForApplication = (applicationId: number): Interview | null => {
    return interviews.find(interview => interview.applicationId === applicationId) || null;
  };

  const handleAssignInterview = (application: Application) => {
    setSelectedApplication(application);
    setFormData({
      interviewerId: '',
      skeletonId: '',
      scheduledAt: '',
      notes: ''
    });
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

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Shortlisted Applications ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No shortlisted applications</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Applications will appear here when they are shortlisted for interviews.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {applications.map((application) => {
              const interview = getInterviewForApplication(application.id);
              
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
                      </div>

                      {interview && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700/50">
                          <div className="flex items-center space-x-2">
                            <UserGroupIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              Assigned to: {interview.interviewerName}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {interview.scheduledAt 
                              ? `Scheduled: ${formatDate(interview.scheduledAt)}`
                              : 'Date TBD'
                            }
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            Status: {interview.status}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {interview ? (
                        <>
                          <button
                            onClick={() => handleAssignInterview(application)}
                            className="inline-flex items-center px-3 py-1 border border-indigo-300 dark:border-indigo-600 rounded text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                          >
                            Re-assign
                          </button>
                          <button
                            onClick={() => handleCancelInterview(interview.id)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            De-assign
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAssignInterview(application)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Assign Interview
                        </button>
                      )}
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
                  {skeletons.map((skeleton) => (
                    <option key={skeleton.id} value={skeleton.id}>
                      {skeleton.name} ({skeleton.focusAreas.length} focus areas)
                    </option>
                  ))}
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