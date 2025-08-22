import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { Interview, InterviewStatus, SubmitInterviewRequest } from '../../types/interview';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const InterviewDetailPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: { feedback: string; rating: number } }>({});

  // Backend URL for file downloads
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Function to construct proper resume URL
  const constructResumeUrl = (resumeUrl: string): string => {
    if (!resumeUrl) return '';
    
    // If it's already a full URL, return as is
    if (resumeUrl.startsWith('http')) {
      return resumeUrl;
    }
    
    // If it starts with /api, prepend backend URL
    if (resumeUrl.startsWith('/api')) {
      return `${backendUrl}${resumeUrl.slice(4)}`;
    }
    
    // Otherwise, assume it needs /api prefix
    return `${backendUrl}${resumeUrl}`;
  };

  useEffect(() => {
    if (interviewId) {
      fetchInterview(parseInt(interviewId));
    }
  }, [interviewId]);

  const fetchInterview = async (id: number) => {
    try {
      setLoading(true);
      const response = await interviewAPI.getById(id);
      const interviewData = response.data;
      setInterview(interviewData);
      
      // Initialize responses from existing data
      const initialResponses: { [key: string]: { feedback: string; rating: number } } = {};
      interviewData.skeleton.focusAreas.forEach(area => {
        const existingResponse = interviewData.responses.find(r => r.title === area.title);
        initialResponses[area.title] = {
          feedback: existingResponse?.feedback || '',
          rating: existingResponse?.rating || 0
        };
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error('Error fetching interview:', err);
      setError('Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!interview) return false;
    
    const errors: string[] = [];
    
    interview.skeleton.focusAreas.forEach(area => {
      const response = responses[area.title];
      
      if (!response?.feedback || response.feedback.trim() === '') {
        errors.push(`Feedback is required for "${area.title}"`);
      }
      
      if (!response?.rating || response.rating <= 0) {
        errors.push(`Rating is required for "${area.title}" (must be greater than 0)`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleStartInterview = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      setError(null);
      await interviewAPI.startInterview(interview.id);
      await fetchInterview(interview.id); // Refresh data
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInterview = async () => {
    if (!interview) return;

    // Validate all fields before submission
    if (!validateForm()) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setValidationErrors([]);
      
      const submitData: SubmitInterviewRequest = {
        responses: Object.entries(responses).map(([title, data]) => ({
          title,
          feedback: data.feedback,
          rating: data.rating
        }))
      };

      await interviewAPI.submit(interview.id, submitData);
      await fetchInterview(interview.id); // Refresh data
    } catch (err) {
      console.error('Error submitting interview:', err);
      setError('Failed to submit interview');
    } finally {
      setSubmitting(false);
    }
  };

  const updateResponse = (title: string, field: 'feedback' | 'rating', value: string | number) => {
    setResponses(prev => ({
      ...prev,
      [title]: {
        ...prev[title],
        [field]: value
      }
    }));
    // Clear validation errors when user starts typing/updating
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const isFieldInvalid = (areaTitle: string, field: 'feedback' | 'rating'): boolean => {
    const response = responses[areaTitle];
    if (field === 'feedback') {
      return !response?.feedback || response.feedback.trim() === '';
    } else {
      return !response?.rating || response.rating <= 0;
    }
  };

  const isFormValid = (): boolean => {
    if (!interview) return false;
    
    return interview.skeleton.focusAreas.every(area => {
      const response = responses[area.title];
      return response?.feedback && response.feedback.trim() !== '' && response.rating > 0;
    });
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case InterviewStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case InterviewStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCompleted = interview?.status === InterviewStatus.COMPLETED;
  const canStart = interview?.status === InterviewStatus.ASSIGNED;
  const canSubmit = interview?.status === InterviewStatus.IN_PROGRESS;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Interview not found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The interview you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/interviewer')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] rounded-2xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/interviewer')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                {interview.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Interview with {interview.application.candidateName}
              </h1>
              <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
                {interview.application.jobTitle} • {interview.skeletonName}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/30 dark:border-red-800/30">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500" />
                  <div className="ml-3">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/30 dark:border-red-800/30">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Please fix the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg mb-8 dark:bg-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Interview Information</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Candidate</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{interview.application.candidateName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{interview.application.candidateEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Position</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{interview.application.jobTitle}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Applied: {formatDate(interview.application.appliedAt)}</p>
                    </div>
                  </div>

                  {interview.scheduledAt && (
                    <div className="flex items-start space-x-3">
                      <ClockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Scheduled</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(interview.scheduledAt)}</p>
                      </div>
                    </div>
                  )}

                  {interview.application.resumeUrl && (
                    <div className="flex items-start space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Resume</h3>
                        <a 
                          href={constructResumeUrl(interview.application.resumeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          View Resume
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(canStart || canSubmit) && (
              <div className="mb-8 flex justify-center">
                {canStart && (
                  <button
                    onClick={handleStartInterview}
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 transition-colors"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    {submitting ? 'Starting...' : 'Start Interview'}
                  </button>
                )}

                {canSubmit && (
                  <button
                    onClick={handleSubmitInterview}
                    disabled={!isFormValid() || submitting}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                      !isFormValid() 
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800'
                    } disabled:opacity-50 transition-colors`}
                    title={!isFormValid() ? 'Please fill in all required fields' : ''}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {submitting ? 'Submitting...' : !isFormValid() ? 'Complete All Fields to Submit' : 'Submit Interview'}
                  </button>
                )}
              </div>
            )}

            <div className="bg-white shadow rounded-lg dark:bg-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Interview Questions & Responses</h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {interview.skeleton.description && (
                  <div className="px-6 py-6 bg-gray-50/50 dark:bg-gray-900/20">
                    <ul className="list-none space-y-2">
                      {interview.skeleton.description.split('\n').filter(line => line.trim()).map((line, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {line.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {interview.skeleton.focusAreas.map((area, index) => (
                  <div key={index} className="px-6 py-6">
                    <div className="mb-4">
                      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{area.title}</h3>
                      {area.description && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {area.description.split(/[,.]|\d+\.\s*/).filter(item => item.trim()).map((item, itemIndex) => (
                            <span key={itemIndex} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {canSubmit ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Feedback <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={responses[area.title]?.feedback || ''}
                            onChange={(e) => updateResponse(area.title, 'feedback', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    placeholder-gray-500 dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                                    ${isFieldInvalid(area.title, 'feedback') 
                                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                                      : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            placeholder="Enter your feedback for this area..."
                            required
                          />
                          {validationErrors.includes(`Feedback is required for "${area.title}"`) && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                              {validationErrors.find(e => e === `Feedback is required for "${area.title}"`)}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rating (0-100) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={responses[area.title]?.rating || 0}
                            onChange={(e) => updateResponse(area.title, 'rating', parseInt(e.target.value) || 0)}
                            className={`w-32 px-4 py-2 border rounded-lg shadow-sm transition-all duration-200
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                                    ${isFieldInvalid(area.title, 'rating') 
                                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                                      : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            required
                          />
                          {validationErrors.includes(`Rating is required for "${area.title}" (must be greater than 0)`) && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                              {validationErrors.find(e => e === `Rating is required for "${area.title}" (must be greater than 0)`)}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            {responses[area.title]?.feedback || 'No feedback provided yet'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            {responses[area.title]?.rating || 0}/100
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isCompleted && interview.completedAt && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4 dark:bg-green-900/30 dark:border-green-800/30">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Interview Completed</h3>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      This interview was completed on {formatDate(interview.completedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailPage; 