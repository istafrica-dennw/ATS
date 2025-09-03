import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { Interview, InterviewStatus } from '../../types/interview';
import { 
  FunnelIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronUpDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';

const InterviewListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filterInterviews = useCallback(() => {
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
  }, [interviews, statusFilter, searchTerm]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [filterInterviews]);

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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case InterviewStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case InterviewStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
          <button
            onClick={() => navigate('/interviewer')}
              className="inline-flex items-center justify-center sm:justify-start w-full sm:w-auto mb-4 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
          >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back to Dashboard
          </button>
          
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Interviews</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage and track all your assigned interviews
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-md p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <div className="relative">
                <Listbox value={statusFilter} onChange={setStatusFilter}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm border border-gray-300 dark:border-gray-600 transition-all duration-200">
                      <span className="block truncate text-gray-900 dark:text-gray-100">
                        {statusFilter === 'all' ? `All (${statusCounts.all})` : 
                         statusFilter === InterviewStatus.ASSIGNED ? `Assigned (${statusCounts.assigned})` :
                         statusFilter === InterviewStatus.IN_PROGRESS ? `In Progress (${statusCounts.inProgress})` :
                         statusFilter === InterviewStatus.COMPLETED ? `Completed (${statusCounts.completed})` :
                         'Select Status'}
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
                      <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-2 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-600">
                        <Listbox.Option
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${
                              active 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200' 
                                : selected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                            }`
                          }
                          value="all"
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                All ({statusCounts.all})
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        <Listbox.Option
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${
                              active 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200' 
                                : selected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                            }`
                          }
                          value={InterviewStatus.ASSIGNED}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                Assigned ({statusCounts.assigned})
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        <Listbox.Option
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${
                              active 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200' 
                                : selected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                            }`
                          }
                          value={InterviewStatus.IN_PROGRESS}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                In Progress ({statusCounts.inProgress})
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        <Listbox.Option
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${
                              active 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200' 
                                : selected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                            }`
                          }
                          value={InterviewStatus.COMPLETED}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                Completed ({statusCounts.completed})
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
              <input
                type="text"
                  placeholder="Search by candidate name, job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full py-2.5 px-4 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Interviews ({filteredInterviews.length})
            </h2>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700/50">
                <CheckCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {statusFilter === 'all' ? 'No interviews found' : `No ${statusFilter.toLowerCase().replace('_', ' ')} interviews`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Interviews will appear here when they are assigned to you.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {interview.application.candidateName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)} self-start sm:self-auto`}>
                          <span className="mr-1.5">{getStatusIcon(interview.status)}</span>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{interview.application.jobTitle}</span>
                          <span className="hidden sm:inline">•</span>
                        <span>{interview.skeletonName}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(interview.createdAt)}</span>
                        {interview.scheduledAt && (
                          <>
                              <span className="hidden sm:inline">•</span>
                            <span>Scheduled: {formatDate(interview.scheduledAt)}</span>
                          </>
                        )}
                        </div>
                      </div>
                      
                      {interview.completedAt && (
                        <div className="mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Completed: {formatDate(interview.completedAt)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-3 pt-2 lg:pt-0">
                      {interview.status === InterviewStatus.ASSIGNED && (
                        <button
                          onClick={() => handleStartInterview(interview.id)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                          Start
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/interviewer/interviews/${interview.id}`)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
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