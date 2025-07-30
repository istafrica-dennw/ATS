import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { Interview, InterviewStatus } from '../../types/interview';
import { 
  FunnelIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const InterviewListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, statusFilter, searchTerm]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getMyInterviews();
      setInterviews(response.data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = interviews;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(interview =>
        interview.application.candidateName.toLowerCase().includes(searchLower) ||
        interview.application.jobTitle.toLowerCase().includes(searchLower) ||
        interview.skeletonName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filtered = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredInterviews(filtered);
  };

  const handleStartInterview = async (interviewId: number) => {
    try {
      await interviewAPI.startInterview(interviewId);
      fetchInterviews(); // Refresh the list
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview');
    }
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

  const getStatusIcon = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.ASSIGNED:
        return <PlayIcon className="h-4 w-4" />;
      case InterviewStatus.IN_PROGRESS:
        return <EyeIcon className="h-4 w-4" />;
      case InterviewStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return null;
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

  const getStatusCounts = () => {
    return {
      all: interviews.length,
      assigned: interviews.filter(i => i.status === InterviewStatus.ASSIGNED).length,
      inProgress: interviews.filter(i => i.status === InterviewStatus.IN_PROGRESS).length,
      completed: interviews.filter(i => i.status === InterviewStatus.COMPLETED).length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
              <p className="mt-2 text-gray-600">
                Manage and track all your assigned interviews
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InterviewStatus | 'all')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All ({statusCounts.all})</option>
                <option value={InterviewStatus.ASSIGNED}>Assigned ({statusCounts.assigned})</option>
                <option value={InterviewStatus.IN_PROGRESS}>In Progress ({statusCounts.inProgress})</option>
                <option value={InterviewStatus.COMPLETED}>Completed ({statusCounts.completed})</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                placeholder="Search by candidate name, job title, or interview type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Interview List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Interviews ({filteredInterviews.length})
            </h2>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {statusFilter === 'all' ? 'No interviews found' : `No ${statusFilter.toLowerCase().replace('_', ' ')} interviews`}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Interviews will appear here when they are assigned to you.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {interview.application.candidateName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          <span className="mr-1">{getStatusIcon(interview.status)}</span>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium">{interview.application.jobTitle}</span>
                        <span>•</span>
                        <span>{interview.skeletonName}</span>
                        <span>•</span>
                        <span>Created: {formatDate(interview.createdAt)}</span>
                        {interview.scheduledAt && (
                          <>
                            <span>•</span>
                            <span>Scheduled: {formatDate(interview.scheduledAt)}</span>
                          </>
                        )}
                      </div>
                      
                      {interview.completedAt && (
                        <div className="mt-1 text-sm text-green-600">
                          Completed: {formatDate(interview.completedAt)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {interview.status === InterviewStatus.ASSIGNED && (
                        <button
                          onClick={() => handleStartInterview(interview.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Start
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/interviewer/interviews/${interview.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewListPage; 