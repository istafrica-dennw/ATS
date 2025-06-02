import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  postedDate: string;
  workSetting: 'REMOTE' | 'ONSITE' | 'HYBRID';
  jobStatus: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'REOPENED';
  salaryRange: string;
  company: string;
}

interface Application {
  id: number;
  jobId: number;
  candidateId: number;
  // These fields might not be directly available from the backend
  candidateName?: string;
  candidateEmail?: string;
  status: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminJobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{[key: string]: number}>({});
  const [candidateDetails, setCandidateDetails] = useState<{[key: number]: {name: string, email: string}}>({});
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        // Fetch job details
        const jobResponse = await axios.get(`/api/jobs/${jobId}`);
        setJob(jobResponse.data);
        setError(null);
        
        try {
          // Fetch applications for this job
          const applicationsResponse = await axios.get(`/api/applications/job/${jobId}`);
          const applicationsData = applicationsResponse.data.content || [];
          setApplications(applicationsData);
          
          // Fetch candidate details for each application
          const candidateIds: number[] = applicationsData.map((app: Application) => app.candidateId);
          const uniqueCandidateIds: number[] = Array.from(new Set(candidateIds));
          
          const candidateDetailsMap: {[key: number]: {name: string, email: string}} = {};
          
          await Promise.all(uniqueCandidateIds.map(async (candidateId) => {
            try {
              const userResponse = await axios.get(`/api/users/${candidateId}`);
              const userData = userResponse.data;
              candidateDetailsMap[candidateId] = {
                name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || `User ${candidateId}`,
                email: userData.email || 'No email available'
              };
            } catch (error) {
              console.warn(`Could not fetch details for candidate ${candidateId}:`, error);
              candidateDetailsMap[candidateId] = {
                name: `Candidate ${candidateId}`,
                email: 'No email available'
              };
            }
          }));
          
          setCandidateDetails(candidateDetailsMap);
          
          // Try to fetch application stats
          try {
            const statsResponse = await axios.get(`/api/applications/stats/job/${jobId}`);
            setStats(statsResponse.data);
          } catch (statsErr) {
            console.warn('Could not fetch application stats:', statsErr);
            // Continue without stats - not a critical failure
            // Calculate basic stats from applications data
            const calculatedStats: {[key: string]: number} = {};
            applications.forEach(app => {
              const status = app.status.toUpperCase();
              calculatedStats[status] = (calculatedStats[status] || 0) + 1;
            });
            setStats(calculatedStats);
          }
        } catch (appErr) {
          console.warn('Could not fetch applications:', appErr);
          // This is not a critical failure - we can show job details without applications
          toast.warning('Could not load applications for this job.');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);
  
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await axios.patch(`/api/applications/${applicationId}`, {
        status: newStatus
      });
      
      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus } 
            : app
        )
      );
      
      // Update stats
      const updatedStats = { ...stats };
      
      // Decrement old status count
      const oldApp = applications.find(app => app.id === applicationId);
      if (oldApp) {
        const oldStatus = oldApp.status;
        if (updatedStats[oldStatus]) {
          updatedStats[oldStatus] -= 1;
        }
      }
      
      // Increment new status count
      if (updatedStats[newStatus]) {
        updatedStats[newStatus] += 1;
      } else {
        updatedStats[newStatus] = 1;
      }
      
      setStats(updatedStats);
      
      toast.success(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Failed to update application status. Please try again.');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <ClockIcon className="h-4 w-4 mr-1" /> Applied
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <UserGroupIcon className="h-4 w-4 mr-1" /> Interview
          </span>
        );
      case 'OFFER':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <DocumentTextIcon className="h-4 w-4 mr-1" /> Offer
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <XIcon className="h-4 w-4 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert severity="error">{error}</Alert>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
        </button>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert severity="warning">Job not found</Alert>
        <button
          onClick={() => navigate('/admin/jobs')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Jobs
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/jobs')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Job Management
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{job.title}</h1>
        <p className="text-lg text-gray-500">{job.company || 'IST Africa'}</p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" /> Location
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.location || 'Remote'} ({job.workSetting})
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400" /> Department
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.department}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-400" /> Employment Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.employmentType}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" /> Salary Range
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.salaryRange || 'Competitive'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" /> Posted Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(job.postedDate)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-gray-400" /> Skills
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.map((skill, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {job.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.INTERVIEW || 0}</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Offers Extended</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.OFFER || 0}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejections</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.REJECTED || 0}</p>
              </div>
              <XIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
        
        {applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Applications Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are no applications for this job posting yet.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.candidateName || 
                               (candidateDetails[application.candidateId]?.name) || 
                               `Candidate ${application.candidateId}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.candidateEmail || 
                               candidateDetails[application.candidateId]?.email || 
                               'No email available'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.currentPosition || 'Not specified'} 
                        {application.currentCompany && `at ${application.currentCompany}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.resumeUrl ? (
                          <a 
                            href={application.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <PaperClipIcon className="h-5 w-5 mr-1" /> View
                          </a>
                        ) : (
                          'No resume'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative inline-block text-left">
                          <div>
                            <button
                              type="button"
                              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              id={`options-menu-${application.id}`}
                              aria-expanded="true"
                              aria-haspopup="true"
                              onClick={() => {
                                const dropdown = document.getElementById(`status-dropdown-${application.id}`);
                                if (dropdown) {
                                  dropdown.classList.toggle('hidden');
                                }
                              }}
                            >
                              Change Status
                              <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                          
                          <div
                            id={`status-dropdown-${application.id}`}
                            className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby={`options-menu-${application.id}`}
                          >
                            <div className="py-1" role="none">
                              <button
                                onClick={() => handleStatusChange(application.id, 'APPLIED')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                Applied
                              </button>
                              <button
                                onClick={() => handleStatusChange(application.id, 'INTERVIEW')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                Interview
                              </button>
                              <button
                                onClick={() => handleStatusChange(application.id, 'OFFER')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                Offer
                              </button>
                              <button
                                onClick={() => handleStatusChange(application.id, 'REJECTED')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                Rejected
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add missing icons
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default AdminJobDetailsPage;
