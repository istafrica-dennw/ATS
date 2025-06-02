import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PaperClipIcon,
  ChartBarIcon,
  XMarkIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { ClockIcon } from '@heroicons/react/24/solid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

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

interface ResumeAnalysis {
  total_experience_years: number;
  total_companies_worked: number;
  current_company: string;
  current_position: string;
  previous_positions?: Array<{
    company: string;
    position: string;
    duration_months: number;
    start_date: string;
    end_date: string;
    responsibilities: string[];
  }>;
  skills_extracted: string[];
  education?: Array<{
    degree: string;
    institution: string;
    graduation_year: number;
    grade: string;
  }>;
  resume_score: {
    overall_score: number;
    job_match_score: number;
    experience_score: number;
    skills_match_score: number;
    scoring_criteria: {
      required_skills_match: number;
      experience_level_match: number;
      industry_relevance: number;
      education_level_match: number;
    };
  };
  analysis_metadata: {
    processed_at: string;
    ai_model_used: string;
    confidence_score: number;
    processing_time_ms: number;
    processingNotes: string[];
  };
}

interface Application {
  id: number;
  jobId: number;
  candidateId: number;
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
  resumeAnalysis?: ResumeAnalysis;
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
  
  // New state for sorting and modal
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredApplication, setHoveredApplication] = useState<number | null>(null);
  const [rescoringApplications, setRescoringApplications] = useState<Set<number>>(new Set());

  // Sorting function
  const sortApplications = useCallback((apps: Application[], criteria: 'date' | 'score', order: 'asc' | 'desc') => {
    return [...apps].sort((a, b) => {
      let compareValue = 0;
      
      if (criteria === 'date') {
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (criteria === 'score') {
        const scoreA = a.resumeAnalysis?.resume_score?.overall_score || 0;
        const scoreB = b.resumeAnalysis?.resume_score?.overall_score || 0;
        compareValue = scoreA - scoreB;
      }
      
      return order === 'asc' ? compareValue : -compareValue;
    });
  }, []);

  // Get sorted applications
  const sortedApplications = sortApplications(applications, sortBy, sortOrder);

  // Handle sort change
  const handleSortChange = (criteria: 'date' | 'score') => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('desc');
    }
  };

  // Handle rescore
  const handleRescore = async (applicationId: number) => {
    setRescoringApplications(prev => new Set(prev).add(applicationId));
    
    try {
      // Find the application to check if analysis exists
      const application = applications.find(app => app.id === applicationId);
      
      if (application?.resumeAnalysis) {
        // Use rescore endpoint for existing analysis
        await axiosInstance.post(`/resume-analysis/rescore?applicationId=${applicationId}&newJobId=${jobId}`);
      } else {
        // Use analyze endpoint for applications without analysis
        await axiosInstance.post(`/resume-analysis/applications/${applicationId}/analyze`);
      }
      
      // Fetch updated application data
      const applicationsResponse = await axiosInstance.get(`/applications/job/${jobId}`);
      const applicationsData = applicationsResponse.data.content || [];
      setApplications(applicationsData);
      
      toast.success('Resume analysis updated successfully!');
    } catch (err) {
      console.error('Error rescoring resume:', err);
      toast.error('Failed to rescore resume. Please try again.');
    } finally {
      setRescoringApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  // Handle bulk rescore
  const handleBulkRescore = async () => {
    const applicationsWithResumes = applications.filter(app => app.resumeUrl);
    
    if (applicationsWithResumes.length === 0) {
      toast.warning('No applications with resumes found to rescore.');
      return;
    }

    const applicationIds = applicationsWithResumes.map(app => app.id);
    // Add all applications to rescoring state
    setRescoringApplications(new Set(applicationIds));
    
    try {
      // Group applications by whether they have existing analysis
      const applicationsWithAnalysis = applicationsWithResumes.filter(app => app.resumeAnalysis);
      const applicationsWithoutAnalysis = applicationsWithResumes.filter(app => !app.resumeAnalysis);
      
      const apiCalls: Promise<any>[] = [];
      
      // Rescore existing analyses
      applicationsWithAnalysis.forEach(app => {
        apiCalls.push(
          axiosInstance.post(`/resume-analysis/rescore?applicationId=${app.id}&newJobId=${jobId}`)
        );
      });
      
      // Analyze applications without existing analysis
      applicationsWithoutAnalysis.forEach(app => {
        apiCalls.push(
          axiosInstance.post(`/resume-analysis/applications/${app.id}/analyze`)
        );
      });
      
      await Promise.all(apiCalls);
      
      // Fetch updated application data
      const applicationsResponse = await axiosInstance.get(`/applications/job/${jobId}`);
      const applicationsData = applicationsResponse.data.content || [];
      setApplications(applicationsData);
      
      const rescoreCount = applicationsWithAnalysis.length;
      const analyzeCount = applicationsWithoutAnalysis.length;
      
      let message = '';
      if (rescoreCount > 0 && analyzeCount > 0) {
        message = `Successfully rescored ${rescoreCount} and analyzed ${analyzeCount} resume${applicationsWithResumes.length > 1 ? 's' : ''}!`;
      } else if (rescoreCount > 0) {
        message = `Successfully rescored ${rescoreCount} resume${rescoreCount > 1 ? 's' : ''}!`;
      } else {
        message = `Successfully analyzed ${analyzeCount} resume${analyzeCount > 1 ? 's' : ''}!`;
      }
      
      toast.success(message);
    } catch (err) {
      console.error('Error bulk rescoring resumes:', err);
      toast.error('Failed to rescore resumes. Please try again.');
    } finally {
      setRescoringApplications(new Set());
    }
  };

  // Handle modal open/close
  const openAnalysisModal = (analysis: ResumeAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const closeAnalysisModal = () => {
    setSelectedAnalysis(null);
    setIsModalOpen(false);
  };

  // Format score with color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format score badge
  const getScoreBadge = (score: number) => {
    const color = score >= 80 ? 'bg-green-100 text-green-800' : 
                  score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {score.toFixed(1)}%
      </span>
    );
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        // Fetch job details
        const jobResponse = await axiosInstance.get(`/jobs/${jobId}`);
        setJob(jobResponse.data);
        setError(null);
        
        try {
          // Fetch applications for this job
          const applicationsResponse = await axiosInstance.get(`/applications/job/${jobId}`);
          const applicationsData = applicationsResponse.data.content || [];
          setApplications(applicationsData);
          
          // Fetch candidate details for each application
          const candidateIds: number[] = applicationsData.map((app: Application) => app.candidateId);
          const uniqueCandidateIds: number[] = Array.from(new Set(candidateIds));
          
          const candidateDetailsMap: {[key: number]: {name: string, email: string}} = {};
          
          await Promise.all(uniqueCandidateIds.map(async (candidateId) => {
            try {
              const userResponse = await axiosInstance.get(`/users/${candidateId}`);
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
            const statsResponse = await axiosInstance.get(`/applications/stats/job/${jobId}`);
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
      await axiosInstance.patch(`/applications/${applicationId}`, {
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
  
  const handleViewResume = (resumeUrl: string) => {
    // Construct the proper URL for viewing - use backend URL from environment
    let backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Remove trailing /api if it exists to avoid double /api
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    
    console.log('handleViewResume - backendUrl:', backendUrl);
    console.log('handleViewResume - resumeUrl:', resumeUrl);
    
    let fullUrl;
    if (resumeUrl.startsWith('http')) {
      fullUrl = resumeUrl;
    } else if (resumeUrl.startsWith('/api')) {
      // URL already includes /api, just prepend the base backend URL
      fullUrl = `${backendUrl}${resumeUrl}`;
    } else {
      // URL doesn't include /api, add it
      fullUrl = `${backendUrl}/api${resumeUrl}`;
    }
    
    console.log('handleViewResume - final fullUrl:', fullUrl);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleDownloadResume = (resumeUrl: string) => {
    // Create a download link and trigger it - use backend URL from environment
    let backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Remove trailing /api if it exists to avoid double /api
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    
    let fullUrl;
    if (resumeUrl.startsWith('http')) {
      fullUrl = resumeUrl;
    } else if (resumeUrl.startsWith('/api')) {
      // URL already includes /api, just prepend the base backend URL
      fullUrl = `${backendUrl}${resumeUrl}`;
    } else {
      // URL doesn't include /api, add it
      fullUrl = `${backendUrl}/api${resumeUrl}`;
    }
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = resumeUrl.split('/').pop() || 'resume';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleViewCoverLetter = (coverLetterUrl: string) => {
    let backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Remove trailing /api if it exists to avoid double /api
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    
    let fullUrl;
    if (coverLetterUrl.startsWith('http')) {
      fullUrl = coverLetterUrl;
    } else if (coverLetterUrl.startsWith('/api')) {
      // URL already includes /api, just prepend the base backend URL
      fullUrl = `${backendUrl}${coverLetterUrl}`;
    } else {
      // URL doesn't include /api, add it
      fullUrl = `${backendUrl}/api${coverLetterUrl}`;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleDownloadCoverLetter = (coverLetterUrl: string) => {
    let backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Remove trailing /api if it exists to avoid double /api
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    
    let fullUrl;
    if (coverLetterUrl.startsWith('http')) {
      fullUrl = coverLetterUrl;
    } else if (coverLetterUrl.startsWith('/api')) {
      // URL already includes /api, just prepend the base backend URL
      fullUrl = `${backendUrl}${coverLetterUrl}`;
    } else {
      // URL doesn't include /api, add it
      fullUrl = `${backendUrl}/api${coverLetterUrl}`;
    }
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = coverLetterUrl.split('/').pop() || 'cover-letter';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleViewPortfolio = (portfolioUrl: string) => {
    let backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Remove trailing /api if it exists to avoid double /api
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    
    let fullUrl;
    if (portfolioUrl.startsWith('http')) {
      fullUrl = portfolioUrl;
    } else if (portfolioUrl.startsWith('/api')) {
      // URL already includes /api, just prepend the base backend URL
      fullUrl = `${backendUrl}${portfolioUrl}`;
    } else {
      // URL doesn't include /api, add it
      fullUrl = `${backendUrl}/api${portfolioUrl}`;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
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
            <XMarkIcon className="h-4 w-4 mr-1" /> Rejected
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
                <ClockIcon className="h-5 w-5 mr-2 text-gray-400" /> Posted Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(job.postedDate)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-gray-400" /> Skills
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
              <XMarkIcon className="h-8 w-8 text-red-500" />
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
            {/* Sorting Controls */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Applications ({applications.length})</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <button
                    onClick={() => handleSortChange('date')}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      sortBy === 'date' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Date Applied
                    {sortBy === 'date' && (
                      <ArrowsUpDownIcon className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('score')}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      sortBy === 'score' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Resume Score
                    {sortBy === 'score' && (
                      <ArrowsUpDownIcon className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Bulk Rescore Button */}
                  <div className="border-l border-gray-300 pl-4">
                    <button
                      onClick={handleBulkRescore}
                      disabled={rescoringApplications.size > 0}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Rescore all resumes for this job"
                    >
                      {rescoringApplications.size > 0 ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Rescoring...
                        </>
                      ) : (
                        <>
                          <ChartBarIcon className="h-4 w-4 mr-2" />
                          Rescore All
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
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
                      Resume Analysis
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedApplications.map((application) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.resumeAnalysis ? (
                          <div className="relative">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openAnalysisModal(application.resumeAnalysis!)}
                                onMouseEnter={() => setHoveredApplication(application.id)}
                                onMouseLeave={() => setHoveredApplication(null)}
                                className="group flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors duration-150"
                              >
                                <ChartBarIcon className="h-4 w-4 text-indigo-500" />
                                {getScoreBadge(application.resumeAnalysis.resume_score.overall_score)}
                                <span className="text-xs text-gray-400 group-hover:text-gray-600">
                                  View Details
                                </span>
                              </button>
                              
                              {/* Rescore Button */}
                              <button
                                onClick={() => handleRescore(application.id)}
                                disabled={rescoringApplications.has(application.id)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Rescore resume analysis"
                              >
                                {rescoringApplications.has(application.id) ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Rescoring...
                                  </>
                                ) : (
                                  <>
                                    <ArrowsUpDownIcon className="h-3 w-3 mr-1" />
                                    Rescore
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {/* Hover Tooltip */}
                            {hoveredApplication === application.id && (
                              <div className="absolute z-10 w-64 p-3 mt-1 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Overall Score:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.overall_score)}>
                                      {application.resumeAnalysis.resume_score.overall_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Job Match:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.job_match_score)}>
                                      {application.resumeAnalysis.resume_score.job_match_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Experience:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.experience_score)}>
                                      {application.resumeAnalysis.resume_score.experience_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Skills Match:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.skills_match_score)}>
                                      {application.resumeAnalysis.resume_score.skills_match_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      Experience: {application.resumeAnalysis.total_experience_years} years
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Companies: {application.resumeAnalysis.total_companies_worked}
                                    </div>
                                  </div>
                                  <div className="text-xs text-indigo-600 font-medium">
                                    Click to view full analysis
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <ChartBarIcon className="h-4 w-4" />
                              <span className="text-xs">
                                {rescoringApplications.has(application.id) ? 'Rescoring...' : 'Processing...'}
                              </span>
                            </div>
                            
                            {/* Rescore Button for when no analysis exists yet */}
                            {application.resumeUrl && (
                              <button
                                onClick={() => handleRescore(application.id)}
                                disabled={rescoringApplications.has(application.id)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Trigger resume analysis"
                              >
                                {rescoringApplications.has(application.id) ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <ChartBarIcon className="h-3 w-3 mr-1" />
                                    Analyze
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {application.resumeUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewResume(application.resumeUrl!)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Resume
                              </button>
                              <button
                                onClick={() => handleDownloadResume(application.resumeUrl!)}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                          
                          {application.coverLetterUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewCoverLetter(application.coverLetterUrl!)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Cover Letter
                              </button>
                              <button
                                onClick={() => handleDownloadCoverLetter(application.coverLetterUrl!)}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                          
                          {application.portfolioUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewPortfolio(application.portfolioUrl!)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Portfolio
                              </button>
                            </div>
                          )}
                          
                          {!application.resumeUrl && !application.coverLetterUrl && !application.portfolioUrl && (
                            <span className="text-gray-400 text-xs">No documents</span>
                          )}
                        </div>
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
      
      {/* Resume Analysis Modal */}
      {isModalOpen && selectedAnalysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAnalysisModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Resume Analysis Details
                    </h3>
                    <div className="mt-4">
                      {/* Score Overview */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Score Overview</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.overall_score)}`}>
                              {selectedAnalysis.resume_score.overall_score.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.job_match_score)}`}>
                              {selectedAnalysis.resume_score.job_match_score.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Job Match</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.experience_score)}`}>
                              {selectedAnalysis.resume_score.experience_score.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Experience</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.skills_match_score)}`}>
                              {selectedAnalysis.resume_score.skills_match_score.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Skills Match</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Scoring Criteria */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Detailed Scoring Criteria</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Required Skills Match:</span>
                            <span className="text-sm font-medium">{selectedAnalysis.resume_score.scoring_criteria.required_skills_match.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Experience Level Match:</span>
                            <span className="text-sm font-medium">{selectedAnalysis.resume_score.scoring_criteria.experience_level_match.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Industry Relevance:</span>
                            <span className="text-sm font-medium">{selectedAnalysis.resume_score.scoring_criteria.industry_relevance.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Education Level Match:</span>
                            <span className="text-sm font-medium">{selectedAnalysis.resume_score.scoring_criteria.education_level_match.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Professional Summary */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Professional Summary</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Total Experience:</span>
                              <span className="ml-2 text-sm text-gray-900">{selectedAnalysis.total_experience_years} years</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Companies Worked:</span>
                              <span className="ml-2 text-sm text-gray-900">{selectedAnalysis.total_companies_worked}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current Company:</span>
                              <span className="ml-2 text-sm text-gray-900">{selectedAnalysis.current_company || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current Position:</span>
                              <span className="ml-2 text-sm text-gray-900">{selectedAnalysis.current_position || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Extracted Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnalysis.skills_extracted?.map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            )) || <span className="text-sm text-gray-500">No skills extracted</span>}
                          </div>
                        </div>
                      </div>

                      {/* Previous Positions */}
                      {selectedAnalysis.previous_positions && selectedAnalysis.previous_positions.length > 0 && (
                        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Work Experience</h4>
                          <div className="space-y-4">
                            {selectedAnalysis.previous_positions.map((position, index) => (
                              <div key={index} className="border-l-4 border-indigo-200 pl-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">{position.position}</h5>
                                    <p className="text-sm text-gray-600">{position.company}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{position.start_date} - {position.end_date}</p>
                                    <p className="text-xs text-gray-500">{position.duration_months} months</p>
                                  </div>
                                </div>
                                {position.responsibilities && position.responsibilities.length > 0 && (
                                  <ul className="mt-2 list-disc list-inside text-xs text-gray-600">
                                    {position.responsibilities.slice(0, 3).map((resp, respIndex) => (
                                      <li key={respIndex}>{resp}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {selectedAnalysis.education && selectedAnalysis.education.length > 0 && (
                        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Education</h4>
                          <div className="space-y-3">
                            {selectedAnalysis.education.map((edu, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                                  <p className="text-sm text-gray-600">{edu.institution}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-900">{edu.graduation_year}</p>
                                  {edu.grade && <p className="text-xs text-gray-500">{edu.grade}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Metadata */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Analysis Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Processed:</span>
                            <span className="ml-2 text-gray-900">{new Date(selectedAnalysis.analysis_metadata.processed_at).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">AI Model:</span>
                            <span className="ml-2 text-gray-900">{selectedAnalysis.analysis_metadata.ai_model_used}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 text-gray-900">{(selectedAnalysis.analysis_metadata.confidence_score * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Processing Time:</span>
                            <span className="ml-2 text-gray-900">{selectedAnalysis.analysis_metadata.processing_time_ms}ms</span>
                          </div>
                        </div>
                        {selectedAnalysis.analysis_metadata.processingNotes && selectedAnalysis.analysis_metadata.processingNotes.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm text-gray-600">Processing Notes:</span>
                            <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                              {selectedAnalysis.analysis_metadata.processingNotes.map((note, index) => (
                                <li key={index}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeAnalysisModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
