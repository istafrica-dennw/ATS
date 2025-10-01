import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { Interview, InterviewStatus, SubmitInterviewRequest } from '../../types/interview';
import { getProfilePictureUrl, getUserInitials } from '../../utils/profilePictureUtils';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] rounded-xl sm:rounded-2xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6 sm:mb-8">
              <button
                onClick={() => navigate('/interviewer')}
                className="inline-flex items-center justify-center sm:justify-start px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] w-full sm:w-auto"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <span className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(interview.status)} w-full sm:w-auto`}>
                {interview.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-center mb-8 sm:mb-10">
              <div className="flex flex-col items-center space-y-4">
                {(() => {
                  const profilePictureUrl = getProfilePictureUrl({
                    profilePictureUrl: interview.application.candidateProfilePictureUrl,
                    linkedinProfileUrl: interview.application.candidateLinkedinProfileUrl,
                    name: interview.application.candidateName
                  });
                  const initials = getUserInitials({ name: interview.application.candidateName });
                  
                  return profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={interview.application.candidateName}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400"
                    />
                  ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 text-lg sm:text-xl font-semibold ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400">
                      {initials}
                    </div>
                  );
                })()}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Interview with {interview.application.candidateName}
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {interview.application.jobTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    {interview.skeletonName}
                  </p>
                </div>
              </div>
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

            <div className="bg-white shadow-lg rounded-xl mb-6 sm:mb-8 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Interview Information</h2>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
                    {(() => {
                      const profilePictureUrl = getProfilePictureUrl({
                        profilePictureUrl: interview.application.candidateProfilePictureUrl,
                        linkedinProfileUrl: interview.application.candidateLinkedinProfileUrl,
                        name: interview.application.candidateName
                      });
                      const initials = getUserInitials({ name: interview.application.candidateName });
                      
                      return profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={interview.application.candidateName}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400">
                          <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-300">
                            {initials}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Candidate</h3>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium truncate">{interview.application.candidateName}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{interview.application.candidateEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Position</h3>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{interview.application.jobTitle}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Applied: {formatDate(interview.application.appliedAt)}</p>
                    </div>
                  </div>

                  {interview.scheduledAt && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scheduled</h3>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{formatDate(interview.scheduledAt)}</p>
                      </div>
                    </div>
                  )}

                  {interview.application.resumeUrl && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Resume</h3>
                        <a 
                          href={constructResumeUrl(interview.application.resumeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm sm:text-base text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
                        >
                          View Resume
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Resume Analysis */}
            {interview.application.resumeAnalysis && (
              <div className="bg-white shadow-lg rounded-xl mb-6 sm:mb-8 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    AI Resume Analysis
                  </h2>
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                  <div className="space-y-6">
                    {/* Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall</p>
                        <p className={`text-2xl font-bold ${getScoreColor(interview.application.resumeAnalysis.resume_score.overall_score)}`}>
                          {interview.application.resumeAnalysis.resume_score.overall_score.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Match</p>
                        <p className={`text-2xl font-bold ${getScoreColor(interview.application.resumeAnalysis.resume_score.job_match_score)}`}>
                          {interview.application.resumeAnalysis.resume_score.job_match_score.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
                        <p className={`text-2xl font-bold ${getScoreColor(interview.application.resumeAnalysis.resume_score.experience_score)}`}>
                          {interview.application.resumeAnalysis.resume_score.experience_score.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills Match</p>
                        <p className={`text-2xl font-bold ${getScoreColor(interview.application.resumeAnalysis.resume_score.skills_match_score)}`}>
                          {interview.application.resumeAnalysis.resume_score.skills_match_score.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Experience Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Experience Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{interview.application.resumeAnalysis.total_experience_years}</span> years total experience
                        </div>
                        <div>
                          Worked at <span className="font-medium">{interview.application.resumeAnalysis.total_companies_worked}</span> companies
                        </div>
                        <div className="md:col-span-2">
                          Current: <span className="font-medium">{interview.application.resumeAnalysis.current_position}</span> at {interview.application.resumeAnalysis.current_company}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {interview.application.resumeAnalysis.skills_extracted && interview.application.resumeAnalysis.skills_extracted.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Key Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {interview.application.resumeAnalysis.skills_extracted.slice(0, 8).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {skill}
                            </span>
                          ))}
                          {interview.application.resumeAnalysis.skills_extracted.length > 8 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{interview.application.resumeAnalysis.skills_extracted.length - 8} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Analysis Metadata */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                      Processed on {new Date(interview.application.resumeAnalysis.analysis_metadata.processed_at).toLocaleDateString()}
                      using {interview.application.resumeAnalysis.analysis_metadata.ai_model_used}
                      (Confidence: {(interview.application.resumeAnalysis.analysis_metadata.confidence_score * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(canStart || canSubmit) && (
              <div className="mb-6 sm:mb-8 flex justify-center px-4 sm:px-0">
                {canStart && (
                  <button
                    onClick={handleStartInterview}
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-3.5 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {submitting ? 'Starting...' : 'Start Interview'}
                  </button>
                )}

                {canSubmit && (
                  <button
                    onClick={handleSubmitInterview}
                    disabled={!isFormValid() || submitting}
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-3.5 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white ${
                      !isFormValid() 
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    } disabled:opacity-50 transition-all duration-200`}
                    title={!isFormValid() ? 'Please fill in all required fields' : ''}
                  >
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">
                      {submitting ? 'Submitting...' : !isFormValid() ? 'Complete All Fields to Submit' : 'Submit Interview'}
                    </span>
                    <span className="sm:hidden">
                      {submitting ? 'Submitting...' : !isFormValid() ? 'Complete All Fields' : 'Submit Interview'}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="bg-white shadow-lg rounded-xl dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Interview Questions & Responses</h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {interview.skeleton.description && (
                  <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Interview Guidelines</h3>
                      <ul className="list-none space-y-2">
                        {interview.skeleton.description.split('\n').filter(line => line.trim()).map((line, index) => (
                          <li key={index} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {line.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {interview.skeleton.focusAreas.map((area, index) => (
                  <div key={index} className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{area.title}</h3>
                      {area.description && (
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focus Points:</h4>
                          <div className="flex flex-wrap gap-2">
                            {area.description.split(/[,.]|\d+\.\s*/).filter(item => item.trim()).map((item, itemIndex) => (
                              <span key={itemIndex} className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-medium px-2.5 py-1.5 rounded-full dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                                {item.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {canSubmit ? (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                          <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Feedback <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={responses[area.title]?.feedback || ''}
                            onChange={(e) => updateResponse(area.title, 'feedback', e.target.value)}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg shadow-sm transition-all duration-200 text-sm sm:text-base
                                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    placeholder-gray-500 dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-600
                                    ${isFieldInvalid(area.title, 'feedback') 
                                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                                      : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            placeholder="Enter your detailed feedback for this area..."
                            required
                          />
                          {validationErrors.includes(`Feedback is required for "${area.title}"`) && (
                            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {validationErrors.find(e => e === `Feedback is required for "${area.title}"`)}
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                          <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Rating (0-100) <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={responses[area.title]?.rating === 0 ? '' : (responses[area.title]?.rating || '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateResponse(area.title, 'rating', 0);
                                } else {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                    updateResponse(area.title, 'rating', numValue);
                                  }
                                }
                              }}
                              placeholder="0-100"
                              className={`w-20 sm:w-24 px-3 py-2.5 sm:py-3 border rounded-lg shadow-sm transition-all duration-200 text-sm sm:text-base text-center font-medium
                                      bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                      focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-600
                                      ${isFieldInvalid(area.title, 'rating') 
                                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                                        : 'border-gray-300 dark:border-gray-600'
                                      }`}
                              required
                            />
                            <div className="flex-1">
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Scale:</span> 0 (Poor) - 100 (Excellent)
                              </div>
                              {responses[area.title]?.rating > 0 && (
                                <div className="mt-1">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${responses[area.title]?.rating || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {validationErrors.includes(`Rating is required for "${area.title}" (must be greater than 0)`) && (
                            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {validationErrors.find(e => e === `Rating is required for "${area.title}" (must be greater than 0)`)}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback</h4>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                            {responses[area.title]?.feedback || 'No feedback provided yet'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</h4>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                              {responses[area.title]?.rating || 0}/100
                            </span>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${responses[area.title]?.rating || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isCompleted && interview.completedAt && (
              <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800/30 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/40">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200">Interview Completed Successfully</h3>
                    <p className="mt-1 text-xs sm:text-sm text-green-700 dark:text-green-300">
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