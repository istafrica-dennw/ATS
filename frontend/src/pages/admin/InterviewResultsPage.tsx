import React, { useState, useEffect } from 'react';
import { interviewAPI, skeletonJobAssociationAPI } from '../../services/api';
import { jobService } from '../../services/jobService';
import { Interview, InterviewStatus } from '../../types/interview';
import { JobDTO } from '../../services/jobService';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface InterviewResult {
  candidateName: string;
  candidateEmail: string;
  jobId: number;
  jobTitle: string;
  interviews: {
    id: number;
    skeletonName: string;
    interviewerName: string;
    status: InterviewStatus;
    completedAt?: string;
    responses: {
      title: string;
      feedback: string;
      rating: number;
    }[];
  }[];
  overallRating: number;
  allResponses: {
    [focusArea: string]: {
      rating: number;
      feedback: string;
      interviewType: string;
    }[];
  };
}

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = 
  ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
        type === 'success' 
          ? 'bg-green-100 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-300' 
          : 'bg-red-100 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300'
      }`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          )}
          <span>{message}</span>
        </div>
      </div>
    );
  };

const InterviewResultsPage: React.FC = () => {
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [jobFocusAreas, setJobFocusAreas] = useState<{[jobId: number]: string[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Filter and search states
  const [jobFilter, setJobFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sorting states
  const [sortField, setSortField] = useState<'candidateName' | 'jobTitle' | 'overallRating' | 'completedAt'>('completedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Tooltip state
  const [hoveredCell, setHoveredCell] = useState<{ resultId: string; responseTitle: string } | null>(null);
  
  // Modal state for detailed feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    focusArea: string;
    candidateName: string;
    jobTitle: string;
    responses: {
      rating: number;
      feedback: string;
      interviewType: string;
    }[];
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all completed interviews and jobs
      const [interviewsResponse, jobsResponse] = await Promise.all([
        interviewAPI.getAssignedByMe(),
        jobService.getAllJobs()
      ]);
      
      // Filter only completed interviews and process them
      const completedInterviews = interviewsResponse.data.filter(
        (interview: Interview) => interview.status === InterviewStatus.COMPLETED
      );

      // Group interviews by candidate and job
      const candidateGroups = new Map<string, InterviewResult>();

      completedInterviews.forEach((interview: Interview) => {
        const key = `${interview.application.candidateEmail}-${interview.application.jobId}`;
        
        if (!candidateGroups.has(key)) {
          candidateGroups.set(key, {
            candidateName: interview.application.candidateName,
            candidateEmail: interview.application.candidateEmail,
            jobId: interview.application.jobId,
            jobTitle: interview.application.jobTitle,
            interviews: [],
            overallRating: 0,
            allResponses: {}
          });
        }

        const candidateResult = candidateGroups.get(key)!;
        
        // Add this interview to the candidate's interviews
        candidateResult.interviews.push({
          id: interview.id,
          skeletonName: interview.skeletonName,
          interviewerName: interview.interviewerName,
          status: interview.status,
          completedAt: interview.completedAt,
          responses: interview.responses || []
        });

        // Process responses for focus areas
        (interview.responses || []).forEach(response => {
          if (!candidateResult.allResponses[response.title]) {
            candidateResult.allResponses[response.title] = [];
          }
          candidateResult.allResponses[response.title].push({
            rating: response.rating,
            feedback: response.feedback,
            interviewType: interview.skeletonName
          });
        });
      });

      // Load focus areas for each job first
      const jobFocusAreasMap: {[jobId: number]: string[]} = {};
      await Promise.all(
        jobsResponse.map(async (job: JobDTO) => {
          try {
            const focusAreasResponse = await skeletonJobAssociationAPI.getFocusAreasForJob(job.id);
            jobFocusAreasMap[job.id] = focusAreasResponse.data || [];
          } catch (error) {
            console.error(`Error loading focus areas for job ${job.id}:`, error);
            jobFocusAreasMap[job.id] = [];
          }
        })
      );

      // Calculate overall ratings ONLY based on associated focus areas
      const processedResults: InterviewResult[] = Array.from(candidateGroups.values()).map(result => {
        const jobFocusAreasList = jobFocusAreasMap[result.jobId] || [];
        
        // STRICT: Calculate average based ONLY on associated focus areas (including 0 for missing)
        const ratingsForAllAreas: number[] = [];
        jobFocusAreasList.forEach(focusArea => {
          const responses = result.allResponses[focusArea] || [];
          if (responses.length > 0) {
            // Use the average of all responses for this focus area
            const areaAverage = responses.reduce((sum, resp) => sum + resp.rating, 0) / responses.length;
            ratingsForAllAreas.push(areaAverage);
          } else {
            // No responses for this focus area, count as 0
            ratingsForAllAreas.push(0);
          }
        });

        const overallRating = ratingsForAllAreas.length > 0 
          ? Math.round(ratingsForAllAreas.reduce((sum, rating) => sum + rating, 0) / ratingsForAllAreas.length)
          : 0;

        return {
          ...result,
          overallRating
        };
      });

      setResults(processedResults);
      setJobs(jobsResponse);
      setJobFocusAreas(jobFocusAreasMap);
      
    } catch (err) {
      console.error('Error fetching interview results:', err);
      setError('Failed to load interview results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort results
  const getFilteredAndSortedResults = () => {
    let filtered = results.filter(result => {
      const matchesJob = !jobFilter || result.jobId.toString() === jobFilter;
      // Since we're grouping completed interviews, all results have COMPLETED status
      const matchesStatus = !statusFilter || statusFilter === 'COMPLETED';
      
      // Search in candidate info, job title, and all interview types/interviewers
      const interviewTypes = result.interviews.map(i => i.skeletonName).join(' ');
      const interviewers = result.interviews.map(i => i.interviewerName).join(' ');
      
      const matchesSearch = !searchTerm || 
        result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interviewTypes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interviewers.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesJob && matchesStatus && matchesSearch;
    });

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (sortField === 'completedAt') {
        // Get most recent completion date for each result
        const getLatestCompletionDate = (result: InterviewResult) => {
          const completedDates = result.interviews
            .filter(interview => interview.completedAt)
            .map(interview => interview.completedAt!);
          return completedDates.length > 0 
            ? Math.max(...completedDates.map(date => new Date(date).getTime()))
            : 0;
        };
        aValue = getLatestCompletionDate(a);
        bValue = getLatestCompletionDate(b);
      } else {
        // Handle direct property access
        aValue = a[sortField];
        bValue = b[sortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 70) return 'text-green-600 dark:text-green-400';
    if (rating >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (rating > 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 70) return 'bg-green-100 dark:bg-green-900/30';
    if (rating >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (rating > 0) return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-gray-100 dark:bg-gray-900/30';
  };

  // Get unique focus areas ONLY from jobs that appear in the current filtered results
  const getAllFocusAreas = (filteredResults: InterviewResult[]) => {
    const focusAreas = new Set<string>();
    
    // Get unique job IDs from currently filtered results
    const relevantJobIds = new Set(filteredResults.map(result => result.jobId));
    
    // STRICT: Only add focus areas from job associations for jobs that are currently displayed
    relevantJobIds.forEach(jobId => {
      const areas = jobFocusAreas[jobId] || [];
      areas.forEach(area => focusAreas.add(area));
    });
    
    return Array.from(focusAreas).sort();
  };

  const getResponsesForArea = (result: InterviewResult, areaTitle: string) => {
    return result.allResponses[areaTitle] || [];
  };

  const handleFeedbackClick = (result: InterviewResult, focusArea: string) => {
    const responses = getResponsesForArea(result, focusArea);
    if (responses.length > 0) {
      setSelectedFeedback({
        focusArea,
        candidateName: result.candidateName,
        jobTitle: result.jobTitle,
        responses
      });
      setShowFeedbackModal(true);
    }
  };

  const filteredResults = getFilteredAndSortedResults();
  const allFocusAreas = getAllFocusAreas(filteredResults);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Results</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and analyze completed interview results across all jobs
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-md p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates, jobs, or interviewers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm"
              />
            </div>

            {/* Job Filter */}
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

            {/* Status Filter */}
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Interview Results ({filteredResults.length})
          </h3>
        </div>

        {filteredResults.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ExclamationTriangleIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No results found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {results.length === 0 
                ? 'No completed interviews found.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {/* Candidate */}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                    onClick={() => handleSort('candidateName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Candidate</span>
                      {sortField === 'candidateName' && (
                        sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>

                  {/* Job */}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                    onClick={() => handleSort('jobTitle')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Job</span>
                      {sortField === 'jobTitle' && (
                        sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>

                  {/* Interview Types */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interview Types
                  </th>

                  {/* Interviewers */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interviewers
                  </th>

                  {/* Focus Areas - Dynamic columns */}
                  {allFocusAreas.map(area => (
                    <th key={area} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="transform -rotate-45 origin-center whitespace-nowrap">
                        {area}
                      </div>
                    </th>
                  ))}

                  {/* Overall Rating */}
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                    onClick={() => handleSort('overallRating')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Overall</span>
                      {sortField === 'overallRating' && (
                        sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>

                  {/* Completed Date */}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                    onClick={() => handleSort('completedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Completed</span>
                      {sortField === 'completedAt' && (
                        sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={`${result.candidateEmail}-${result.jobId}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {/* Candidate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.candidateName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.candidateEmail}
                        </div>
                      </div>
                    </td>

                    {/* Job */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {result.jobTitle}
                      </div>
                    </td>

                    {/* Interview Types */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {result.interviews.map((interview, idx) => (
                          <div key={idx} className="text-xs text-gray-900 dark:text-gray-100">
                            {interview.skeletonName}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Interviewers */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {result.interviews.map((interview, idx) => (
                          <div key={idx} className="text-xs text-gray-900 dark:text-gray-100">
                            {interview.interviewerName}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Focus Area Ratings */}
                    {allFocusAreas.map(area => {
                      const responses = getResponsesForArea(result, area);
                      return (
                        <td 
                          key={area} 
                          className={`px-3 py-4 text-center relative ${responses.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}
                          onMouseEnter={() => responses.length > 0 && setHoveredCell({ resultId: result.candidateEmail + result.jobId.toString(), responseTitle: area })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleFeedbackClick(result, area)}
                        >
                          {responses.length > 0 ? (
                            <>
                              <div className="space-y-1">
                                {responses.map((response, idx) => (
                                  <div key={idx} className="flex flex-col items-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(response.rating)} ${getRatingColor(response.rating)}`}>
                                      {response.rating > 0 ? response.rating : 'N/R'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {response.interviewType}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Tooltip */}
                              {hoveredCell?.resultId === result.candidateEmail + result.jobId.toString() && hoveredCell?.responseTitle === area && (
                                <div className="absolute z-10 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg max-w-xs -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                                  <div className="font-medium mb-2">{area}</div>
                                  <div className="text-xs text-blue-300 dark:text-blue-700 mb-2">📖 Click to view detailed feedback</div>
                                  {responses.slice(0, 2).map((response, idx) => (
                                    <div key={idx} className="mb-1 last:mb-0">
                                      <div className="font-medium text-blue-300 dark:text-blue-700">{response.interviewType}: {response.rating}/100</div>
                                    </div>
                                  ))}
                                  {responses.length > 2 && (
                                    <div className="text-xs text-gray-300 dark:text-gray-700">...and {responses.length - 2} more</div>
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Overall Rating */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingBgColor(result.overallRating)} ${getRatingColor(result.overallRating)}`}>
                        {result.overallRating > 0 ? `${result.overallRating}/100` : 'N/R'}
                      </span>
                    </td>

                    {/* Completed Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        const completedDates = result.interviews
                          .filter(interview => interview.completedAt)
                          .map(interview => interview.completedAt!)
                          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                        return completedDates.length > 0 ? formatDate(completedDates[0]) : 'N/A';
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Feedback Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedFeedback.focusArea}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">{selectedFeedback.candidateName}</span> • {selectedFeedback.jobTitle}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-6">
                {selectedFeedback.responses.map((response, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200/50 dark:border-gray-600/50">
                    {/* Interview Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {response.interviewType}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Rating:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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

                    {/* Feedback Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Interviewer Feedback
                      </h4>
                      {response.feedback ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {response.feedback}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No detailed feedback was provided for this focus area.
                        </p>
                      )}
                    </div>

                    {/* Performance Indicator */}
                    {response.rating > 0 && (
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Performance Level:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                response.rating >= 70 ? 'bg-green-500' :
                                response.rating >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${response.rating}%` }}
                            ></div>
                          </div>
                          <span className={`font-medium ${
                            response.rating >= 70 ? 'text-green-600 dark:text-green-400' :
                            response.rating >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {response.rating >= 70 ? 'Excellent' :
                             response.rating >= 50 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              {selectedFeedback.responses.length > 1 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                    </svg>
                    Focus Area Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedFeedback.responses.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(
                          selectedFeedback.responses
                            .filter(r => r.rating > 0)
                            .reduce((sum, r) => sum + r.rating, 0) / 
                          selectedFeedback.responses.filter(r => r.rating > 0).length || 1
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                    </div>
                    <div className="text-center sm:col-span-2 lg:col-span-1">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedFeedback.responses.filter(r => r.feedback && r.feedback.trim() !== '').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">With Feedback</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Close
                </button>
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

export default InterviewResultsPage;