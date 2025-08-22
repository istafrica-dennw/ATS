import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { Interview, InterviewStatus } from '../../types/interview';
import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

const InterviewerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const fetchMyInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getMyInterviews();
      setInterviews(response.data);
      
      // Calculate stats
      const assigned = response.data.filter(i => i.status === InterviewStatus.ASSIGNED).length;
      const inProgress = response.data.filter(i => i.status === InterviewStatus.IN_PROGRESS).length;
      const completed = response.data.filter(i => i.status === InterviewStatus.COMPLETED).length;
      
      setStats({
        assigned,
        inProgress,
        completed,
        total: response.data.length
      });
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (interviewId: number) => {
    try {
      await interviewAPI.startInterview(interviewId);
      fetchMyInterviews(); // Refresh the list
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview');
    }
  };

  const handleViewInterview = (interviewId: number) => {
    navigate(`/interviewer/interviews/${interviewId}`);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your assigned interviews and track your progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.assigned}</p>
                <p className="text-gray-600 dark:text-gray-400">Assigned</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                <p className="text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                <p className="text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-md p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Recent Interviews */}
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">My Interviews</h2>
              <button
                onClick={() => navigate('/interviewer/interviews')}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {interviews.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No interviews assigned</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any interviews assigned yet.
                </p>
              </div>
            ) : (
              interviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {interview.application.candidateName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{interview.application.jobTitle}</span>
                        <span>{interview.skeletonName}</span>
                        {interview.scheduledAt && (
                          <span>Scheduled: {formatDate(interview.scheduledAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {interview.status === InterviewStatus.ASSIGNED && (
                        <button
                          onClick={() => handleStartInterview(interview.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleViewInterview(interview.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        <EyeIcon className="h-4 w-4 mr-1.5" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboardPage; 