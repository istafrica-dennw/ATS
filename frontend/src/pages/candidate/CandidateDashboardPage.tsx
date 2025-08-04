import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { candidateService, ApplicationDTO } from '../../services/candidateService';
import { jobService, JobDTO } from '../../services/jobService';
import { interviewAPI } from '../../services/api';
import { Interview } from '../../types/interview';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import JobOfferResponse from '../../components/JobOfferResponse';

interface ApplicationStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  acceptedOffers?: number;
}

interface EnhancedApplicationDTO extends ApplicationDTO {
  jobTitle?: string;
  department?: string;
  appliedDate?: string;
}

const CandidateDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<EnhancedApplicationDTO[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingJobDetails, setLoadingJobDetails] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplications: 0,
    interviews: 0,
    offers: 0,
    rejections: 0
  });
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch applications and interviews in parallel
        const [applicationsResponse, interviewsResponse] = await Promise.all([
          candidateService.getMyApplications(),
          interviewAPI.getMyCandidateInterviews()
        ]);
        
        // Enhance applications with date information
        const enhancedApplications = applicationsResponse.content.map(app => ({
          ...app,
          appliedDate: app.createdAt
        }));
        
        setApplications(enhancedApplications);
        setInterviews(interviewsResponse.data);
        
        // Calculate stats based on application status and actual interviews
        const interviewingStatus = applicationsResponse.content.filter(app => app.status === 'INTERVIEWING').length;
        const actualInterviews = interviewsResponse.data.length;
        const offers = applicationsResponse.content.filter(app => app.status === 'OFFERED').length;
        const rejections = applicationsResponse.content.filter(app => app.status === 'REJECTED').length;
        
        setStats({
          totalApplications: applicationsResponse.content.length,
          interviews: Math.max(interviewingStatus, actualInterviews), // Use the higher count
          offers,
          rejections
        });
        
        // Fetch job details for each application
        fetchJobDetails(enhancedApplications);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your applications. Please try again later.');
        setLoading(false);
      }
    };
    
    const fetchJobDetails = async (apps: EnhancedApplicationDTO[]) => {
      try {
        setLoadingJobDetails(true);
        
        // Create a copy of the applications to update
        const updatedApplications = [...apps];
        
        // Fetch job details for each application
        await Promise.all(
          apps.map(async (app, index) => {
            try {
              const jobDetails = await jobService.getJobById(app.jobId);
              updatedApplications[index] = {
                ...updatedApplications[index],
                jobTitle: jobDetails.title,
                department: jobDetails.department
              };
            } catch (err) {
              console.error(`Error fetching job details for job ID ${app.jobId}:`, err);
              // Keep the default values if there's an error
              updatedApplications[index] = {
                ...updatedApplications[index],
                jobTitle: 'Software Engineer Position',
                department: 'IST Africa'
              };
            }
          })
        );
        
        setApplications(updatedApplications);
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoadingJobDetails(false);
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
      case 'interview':
        return <CalendarIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'offer':
        return <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'interview':
        return 'Interview Scheduled';
      case 'offer':
        return 'Offer Received';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  const handleOfferResponse = (newStatus: string, applicationId: number) => {
    // Update the application status in the local state
    setApplications(prevApplications => 
      prevApplications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
    
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      offers: prevStats.offers - 1,
      ...(newStatus === 'OFFER_ACCEPTED' ? { acceptedOffers: (prevStats.acceptedOffers || 0) + 1 } : {})
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidate Dashboard</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-[1.02] transition-all"
          >
            <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Browse Jobs
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            Update Resume
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Here's a summary of your job applications and upcoming interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalApplications}</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Interviews</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.interviews}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Offers</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.offers}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200/50 dark:border-red-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejections</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.rejections}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Upcoming Interviews Section */}
      {interviews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Upcoming Interviews</h3>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <div className="space-y-4">
              {interviews
                .filter(interview => interview.status === 'ASSIGNED' || interview.status === 'IN_PROGRESS')
                .sort((a, b) => {
                  // Sort by scheduled date if available, otherwise by creation date
                  const dateA = a.scheduledAt ? new Date(a.scheduledAt) : new Date(a.createdAt);
                  const dateB = b.scheduledAt ? new Date(b.scheduledAt) : new Date(b.createdAt);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{interview.application.jobTitle}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">with {interview.interviewerName}</p>
                        {/* <p className="text-xs text-gray-500">Template: {interview.skeletonName}</p> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {interview.scheduledAt 
                            ? new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Date TBD'
                          }
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        interview.status === 'ASSIGNED' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {interview.status === 'ASSIGNED' ? 'Scheduled' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" className="mb-6">{error}</Alert>
      ) : loadingJobDetails ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Your Applications</h3>
          <div className="flex justify-center items-center py-5">
            <CircularProgress size={24} />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading job details...</span>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Your Applications</h3>
          {applications.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 text-center rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <p className="text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-[1.02] transition-all"
              >
                <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Browse Available Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show job offer response component for applications with OFFERED status */}
              {applications
                .filter(app => app.status === 'OFFERED')
                .map(app => (
                  <JobOfferResponse
                    key={app.id}
                    applicationId={app.id}
                    jobTitle={app.jobTitle || 'Software Engineer Position'}
                    onResponse={handleOfferResponse}
                  />
                ))}

              {/* Applications table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Applied On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {app.jobTitle || 'Software Engineer Position'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{app.department || 'IST Africa'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(app.status.toLowerCase())}
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{getStatusLabel(app.status.toLowerCase())}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {app.appliedDate && !isNaN(new Date(app.appliedDate).getTime()) 
                            ? new Date(app.appliedDate).toLocaleDateString() 
                            : new Date().toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboardPage; 