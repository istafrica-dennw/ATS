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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your assigned interviews and track your progress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:px-6 sm:py-4 transition-all duration-200 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mb-3 sm:mb-0 sm:mr-4">
                <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.assigned}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Assigned</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:px-6 sm:py-4 transition-all duration-200 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-3 sm:mb-0 sm:mr-4">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:px-6 sm:py-4 transition-all duration-200 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/30 mb-3 sm:mb-0 sm:mr-4">
                <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:px-6 sm:py-4 transition-all duration-200 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mb-3 sm:mb-0 sm:mr-4">
                <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-md p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">My Interviews</h2>
              <button
                onClick={() => navigate('/interviewer/interviews')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {interviews.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No interviews assigned</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any interviews assigned yet.
                </p>
              </div>
            ) : (
              interviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {interview.application.candidateName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)} self-start sm:self-auto`}>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="block sm:inline font-medium">{interview.application.jobTitle}</span>
                        <span className="block sm:inline">{interview.skeletonName}</span>
                        {interview.scheduledAt && (
                          <span className="block sm:inline">Scheduled: {formatDate(interview.scheduledAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 pt-2 sm:pt-0">
                      {interview.status === InterviewStatus.ASSIGNED && (
                        <button
                          onClick={() => handleStartInterview(interview.id)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 transform hover:scale-105"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleViewInterview(interview.id)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
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