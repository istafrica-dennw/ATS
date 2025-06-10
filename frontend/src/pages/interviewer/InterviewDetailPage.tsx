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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const InterviewDetailPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: { feedback: string; rating: number } }>({});

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

  const handleStartInterview = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
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

    try {
      setSubmitting(true);
      
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
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800';
      case InterviewStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case InterviewStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Interview not found</h3>
          <p className="mt-2 text-gray-600">The interview you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/interviewer')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/interviewer')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interview with {interview.application.candidateName}
              </h1>
              <p className="mt-2 text-gray-600">
                {interview.application.jobTitle} • {interview.skeletonName}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
              {interview.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Interview Info Card */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Interview Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Candidate</h3>
                  <p className="text-sm text-gray-600">{interview.application.candidateName}</p>
                  <p className="text-sm text-gray-500">{interview.application.candidateEmail}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Position</h3>
                  <p className="text-sm text-gray-600">{interview.application.jobTitle}</p>
                  <p className="text-sm text-gray-500">Applied: {formatDate(interview.application.appliedAt)}</p>
                </div>
              </div>

              {interview.scheduledAt && (
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Scheduled</h3>
                    <p className="text-sm text-gray-600">{formatDate(interview.scheduledAt)}</p>
                  </div>
                </div>
              )}

              {interview.application.resumeUrl && (
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Resume</h3>
                    <a 
                      href={interview.application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interview Actions */}
        {(canStart || canSubmit) && (
          <div className="mb-8 flex justify-center">
            {canStart && (
              <button
                onClick={handleStartInterview}
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                {submitting ? 'Starting...' : 'Start Interview'}
              </button>
            )}

            {canSubmit && (
              <button
                onClick={handleSubmitInterview}
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            )}
          </div>
        )}

        {/* Interview Skeleton & Responses */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Interview Questions & Responses</h2>
            {interview.skeleton.description && (
              <p className="mt-1 text-sm text-gray-600">{interview.skeleton.description}</p>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {interview.skeleton.focusAreas.map((area, index) => (
              <div key={index} className="px-6 py-6">
                <div className="mb-4">
                  <h3 className="text-base font-medium text-gray-900">{area.title}</h3>
                  {area.description && (
                    <p className="mt-1 text-sm text-gray-600">{area.description}</p>
                  )}
                </div>

                {canSubmit ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Feedback
                      </label>
                      <textarea
                        rows={4}
                        value={responses[area.title]?.feedback || ''}
                        onChange={(e) => updateResponse(area.title, 'feedback', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your feedback for this area..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rating (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={responses[area.title]?.rating || 0}
                        onChange={(e) => updateResponse(area.title, 'rating', parseInt(e.target.value) || 0)}
                        className="mt-1 block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Feedback</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {responses[area.title]?.feedback || 'No feedback provided yet'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Rating</h4>
                      <p className="mt-1 text-sm text-gray-900">
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
          <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Interview Completed</h3>
                <p className="mt-1 text-sm text-green-700">
                  This interview was completed on {formatDate(interview.completedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetailPage; 