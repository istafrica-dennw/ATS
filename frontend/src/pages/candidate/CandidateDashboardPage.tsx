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
} from '@heroicons/react/24/outline';
import { candidateService, ApplicationDTO } from '../../services/candidateService';
import { jobService, JobDTO } from '../../services/jobService';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface ApplicationStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

interface EnhancedApplicationDTO extends ApplicationDTO {
  jobTitle?: string;
  company?: string;
  appliedDate?: string;
}

const CandidateDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<EnhancedApplicationDTO[]>([]);
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
        
        const response = await candidateService.getMyApplications();
        
        // Enhance applications with date information
        const enhancedApplications = response.content.map(app => ({
          ...app,
          appliedDate: app.createdAt
        }));
        
        setApplications(enhancedApplications);
        
        // Calculate stats
        const interviews = response.content.filter(app => app.status === 'INTERVIEW').length;
        const offers = response.content.filter(app => app.status === 'OFFER').length;
        const rejections = response.content.filter(app => app.status === 'REJECTED').length;
        
        setStats({
          totalApplications: response.content.length,
          interviews,
          offers,
          rejections
        });
        
        // Fetch job details for each application
        fetchJobDetails(enhancedApplications);
        
      } catch (err) {
        console.error('Error fetching applications:', err);
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
                company: jobDetails.company
              };
            } catch (err) {
              console.error(`Error fetching job details for job ID ${app.jobId}:`, err);
              // Keep the default values if there's an error
              updatedApplications[index] = {
                ...updatedApplications[index],
                jobTitle: 'Software Engineer Position',
                company: 'IST Africa'
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
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      case 'interview':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'offer':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Browse Jobs
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Update Resume
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Here's a summary of your job applications and upcoming interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Interviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.interviews}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Offers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.offers}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejections</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.rejections}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" className="mb-6">{error}</Alert>
      ) : loadingJobDetails ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your Applications</h3>
          <div className="flex justify-center items-center py-5">
            <CircularProgress size={24} />
            <span className="ml-2 text-gray-600">Loading job details...</span>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your Applications</h3>
          {applications.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-lg">
              <p className="text-gray-500">You haven't applied to any jobs yet.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Browse Available Jobs
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.jobTitle || 'Software Engineer Position'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{app.company || 'IST Africa'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(app.status.toLowerCase())}
                          <span className="ml-2 text-sm text-gray-700">{getStatusLabel(app.status.toLowerCase())}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.appliedDate && !isNaN(new Date(app.appliedDate).getTime()) 
                          ? new Date(app.appliedDate).toLocaleDateString() 
                          : new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboardPage; 