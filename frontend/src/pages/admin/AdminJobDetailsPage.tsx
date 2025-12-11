import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { interviewAPI } from '../../services/api';
import { Interview } from '../../types/interview';
import { toast } from 'react-toastify';
import { getProfilePictureUrl, getUserInitials } from '../../utils/profilePictureUtils';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  ChartBarIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  UserGroupIcon,
  XMarkIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  CalendarIcon,
  XMarkIcon as XIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { ClockIcon as SolidClockIcon } from '@heroicons/react/24/solid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import JobOfferEmailModal from '../../components/JobOfferEmailModal';
import ApplicationDetailsModal from '../../components/admin/ApplicationDetailsModal';

interface CustomQuestion {
  id: number;
  jobId: number;
  questionText: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'RATING' | 'FILE_UPLOAD' | 'DATE';
  options?: string[];
  required: boolean;
  active: boolean;
  displayOrder?: number;
  maxCharacterLimit?: number;
}

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
  customQuestions?: CustomQuestion[];
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

interface ApplicationAnswer {
  id: number;
  applicationId: number;
  questionId: number;
  answer: string;
  createdAt: string;
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
  expectedSalary?: number;
  experienceYears?: number;
  createdAt: string;
  updatedAt: string;
  resumeAnalysis?: ResumeAnalysis;
  answers: ApplicationAnswer[];
}

const AdminJobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{[key: string]: number}>({});
  const [candidateDetails, setCandidateDetails] = useState<{[key: number]: {name: string, email: string, profilePictureUrl?: string, linkedinProfileUrl?: string}}>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(false);
  
  // New state for sorting and modal
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredApplication, setHoveredApplication] = useState<number | null>(null);
  const [rescoringApplications, setRescoringApplications] = useState<Set<number>>(new Set());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<number | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Application Details Modal state
  const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<Application | null>(null);

  // Sorting function (client-side sorting for current page only)
  const sortApplications = (apps: Application[], criteria: 'date' | 'score', order: 'asc' | 'desc') => {
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
  };

  // Get sorted applications (server-side search is handled in fetchApplications)
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
      
      // Update candidate details for any new applications
      await fetchCandidateDetails(applicationsData);
      
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

    const applicationIds = Array.from(new Set(applicationsWithResumes.map(app => app.id)));
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

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      const jobResponse = await axiosInstance.get(`/jobs/${jobId}`);
      setJob(jobResponse.data);
      
      // Fetch interviews for this job
      await fetchInterviews();
      
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      
      const params: any = {
        page: currentPage,
        size: pageSize,
        sort: 'createdAt,desc' // Sort by creation date descending
      };
      
      // Add search parameter if search query exists
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const applicationsResponse = await axiosInstance.get(`/applications/job/${jobId}`, {
        params
      });
      
      const pageData = applicationsResponse.data;
      const applicationsData = pageData.content || [];
      
      setApplications(applicationsData);
      const elements = (pageData.totalElements ?? applicationsData.length ?? 0) as number;
      const pages = (pageData.totalPages ?? (elements > 0 ? Math.ceil(elements / pageSize) : 0)) as number;
      setTotalElements(elements);
      setTotalPages(pages);
      
      // Fetch candidate details for each application
      await fetchCandidateDetails(applicationsData);
      
      // Calculate statistics (only for current page - we'll need separate call for all stats)
      const stats = applicationsData.reduce((acc: any, app: Application) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchCandidateDetails = async (applications: Application[]) => {
    try {
      const candidateIds = Array.from(new Set(applications.map(app => app.candidateId)));
      const candidateDetailsMap: {[key: number]: {name: string, email: string, profilePictureUrl?: string, linkedinProfileUrl?: string}} = {};
      
      // Fetch details for each unique candidate
      const candidatePromises = candidateIds.map(async (candidateId) => {
        try {
          const response = await axiosInstance.get(`/users/${candidateId}`);
          const user = response.data;
          candidateDetailsMap[candidateId] = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            linkedinProfileUrl: user.linkedinProfileUrl
          };
        } catch (error) {
          console.error(`Error fetching candidate ${candidateId}:`, error);
          candidateDetailsMap[candidateId] = {
            name: `Candidate ${candidateId}`,
            email: 'No email available'
          };
        }
      });
      
      await Promise.all(candidatePromises);
      setCandidateDetails(candidateDetailsMap);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    }
  };

  const fetchInterviews = async () => {
    if (!jobId) return;
    
    try {
      setLoadingInterviews(true);
      const response = await interviewAPI.getByJobId(parseInt(jobId));
      setInterviews(response.data);
      console.log('Fetched interviews for job:', jobId, response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      // Don't show error toast for interviews as it's not critical
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  }, [jobId, currentPage, pageSize, searchQuery]);
  
  // Reset to first page when search query changes
  useEffect(() => {
    if (searchQuery !== '') {
      setCurrentPage(0);
    }
  }, [searchQuery]);
  
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`/applications/${applicationId}/status`, {
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

  // Handler for opening application details modal
  const handleViewApplicationDetails = (application: Application) => {
    setSelectedApplicationForDetails(application);
    setIsApplicationDetailsModalOpen(true);
  };

  const handleCloseApplicationDetailsModal = () => {
    setIsApplicationDetailsModalOpen(false);
    setSelectedApplicationForDetails(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <ClockIcon className="h-4 w-4 mr-1" /> Applied
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <DocumentTextIcon className="h-4 w-4 mr-1" /> Reviewed
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
            <UserGroupIcon className="h-4 w-4 mr-1" /> Shortlisted
          </span>
        );
      case 'INTERVIEWING':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <UserGroupIcon className="h-4 w-4 mr-1" /> Interviewing
          </span>
        );
      case 'OFFERED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <DocumentTextIcon className="h-4 w-4 mr-1" /> Offered
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
            <DocumentTextIcon className="h-4 w-4 mr-1" /> Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <XMarkIcon className="h-4 w-4 mr-1" /> Rejected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <XMarkIcon className="h-4 w-4 mr-1" /> Withdrawn
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get interview for a specific application
  const getInterviewForApplication = (applicationId: number): Interview | null => {
    const found = interviews.find(interview => interview.applicationId === applicationId) || null;
    console.log(`Looking for interview for application ${applicationId}:`, found);
    console.log('All interviews:', interviews);
    return found;
  };

      // Handle interview assignment (redirect to interview management page)
  const handleAssignInterview = (applicationId: number) => {
      navigate('/admin/interview-management');
  };

  // Handle interview cancellation
  const handleCancelInterview = async (interviewId: number) => {
    if (!window.confirm('Are you sure you want to cancel this interview assignment?')) {
      return;
    }

    try {
      await interviewAPI.cancelInterview(interviewId);
      toast.success('Interview assignment cancelled successfully');
      await fetchInterviews(); // Refresh interviews
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast.error('Failed to cancel interview assignment');
    }
  };

  const handleSendJobOfferEmail = async (applicationId: number) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;
    
    setSelectedApplication(application);
    setIsEmailModalOpen(true);
  };

  const handleEmailSend = async (subject: string, content: string) => {
    if (!selectedApplication) return;
    
    try {
      await axiosInstance.post(`/applications/${selectedApplication.id}/send-offer-email`, {
        subject,
        content
      });
      toast.success('Job offer email sent successfully');
    } catch (error) {
      console.error('Error sending job offer email:', error);
      toast.error('Failed to send job offer email');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <CircularProgress sx={{ color: 'primary.main' }} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Alert 
          severity="error"
          sx={{
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            '& .MuiAlert-icon': {
              color: 'error.main'
            }
          }}
        >
          {error}
        </Alert>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transform hover:scale-[1.02] transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
        </button>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Alert 
          severity="warning"
          sx={{
            backgroundColor: 'warning.light',
            color: 'warning.contrastText',
            '& .MuiAlert-icon': {
              color: 'warning.main'
            }
          }}
        >
          Job not found
        </Alert>
        <button
          onClick={() => navigate('/admin/jobs')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transform hover:scale-[1.02] transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Jobs
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/jobs')}
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Job Management
        </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{job.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">{job.department || 'IST Africa'}</p>
      </div>
      
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] overflow-hidden sm:rounded-lg border border-gray-200/50 dark:border-gray-700/50 mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Job Details</h2>
        </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Location
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {job.location || 'Remote'} ({job.workSetting})
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Department
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {job.department}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Employment Type
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {job.employmentType}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Salary Range
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {job.salaryRange || 'Competitive'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Posted Date
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {formatDate(job.postedDate)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Skills
              </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </dd>
            </div>
            {/* Custom Questions Section */}
            {job.customQuestions && job.customQuestions.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Custom Questions
                </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  <div className="space-y-4">
                    {job.customQuestions.map((question, index) => (
                        <div key={question.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Question {index + 1}
                              </span>
                              {question.required && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  Required
                                </span>
                              )}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {question.questionType.replace('_', ' ').toLowerCase()}
                              </span>
                            </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {question.questionText}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Options:</p>
                                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  {question.options.map((option, optionIndex) => (
                                    <li key={optionIndex}>{option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {question.maxCharacterLimit && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Character limit: {question.maxCharacterLimit}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Applications</h2>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, position, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedApplications.length} of {applications.length} applications
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalElements}</p>
              </div>
                <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interviews Scheduled</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.INTERVIEWING || 0}</p>
              </div>
                <UserGroupIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offers Extended</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.OFFERED || 0}</p>
              </div>
                <DocumentTextIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted Offers</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.OFFER_ACCEPTED || 0}</p>
              </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        {applications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Applications Yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              There are no applications for this job posting yet.
            </p>
          </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] overflow-hidden sm:rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            {/* Sorting Controls */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Applications ({searchQuery ? `${sortedApplications.length} of ${applications.length}` : applications.length})
                  </h3>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                  <button
                    onClick={() => handleSortChange('date')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      sortBy === 'date' 
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Date Applied
                    {sortBy === 'date' && (
                      <ArrowsUpDownIcon className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('score')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      sortBy === 'score' 
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Resume Score
                    {sortBy === 'score' && (
                      <ArrowsUpDownIcon className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Bulk Rescore Button */}
                    <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                    <button
                      onClick={handleBulkRescore}
                      disabled={rescoringApplications.size > 0}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Candidate
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Applied On
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Position
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resume Analysis
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Interview Assignment
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Documents
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            {(() => {
                              const candidate = candidateDetails[application.candidateId];
                              const profilePictureUrl = candidate ? getProfilePictureUrl(candidate) : null;
                              const initials = candidate ? getUserInitials(candidate) : (application.candidateName || `Candidate ${application.candidateId}`).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                              
                              return profilePictureUrl ? (
                                <img
                                  src={profilePictureUrl}
                                  alt={application.candidateName || `Candidate ${application.candidateId}`}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 text-sm font-medium ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-indigo-500 dark:ring-indigo-400">
                                  {initials}
                                </div>
                              );
                            })()}
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {application.candidateName || 
                               (candidateDetails[application.candidateId]?.name) || 
                               `Candidate ${application.candidateId}`}
                            </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                              {application.candidateEmail || 
                               candidateDetails[application.candidateId]?.email || 
                               'No email available'}
                            </div>
                          </div>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(application.createdAt)}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {application.currentPosition || 'Not specified'} 
                        {application.currentCompany && `at ${application.currentCompany}`}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {application.resumeAnalysis ? (
                          <div className="relative">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openAnalysisModal(application.resumeAnalysis!)}
                                onMouseEnter={() => setHoveredApplication(application.id)}
                                onMouseLeave={() => setHoveredApplication(null)}
                                  className="group flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors duration-150"
                              >
                                  <ChartBarIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                {getScoreBadge(application.resumeAnalysis.resume_score.overall_score)}
                                  <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                                  View Details
                                </span>
                              </button>
                              
                              {/* Rescore Button */}
                              <button
                                onClick={() => handleRescore(application.id)}
                                disabled={rescoringApplications.has(application.id)}
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                <div className="absolute z-10 w-64 p-3 mt-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)]">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Overall Score:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.overall_score)}>
                                      {application.resumeAnalysis.resume_score.overall_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Job Match:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.job_match_score)}>
                                      {application.resumeAnalysis.resume_score.job_match_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.experience_score)}>
                                      {application.resumeAnalysis.resume_score.experience_score.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Skills Match:</span>
                                    <span className={getScoreColor(application.resumeAnalysis.resume_score.skills_match_score)}>
                                      {application.resumeAnalysis.resume_score.skills_match_score.toFixed(1)}%
                                    </span>
                                  </div>
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Experience: {application.resumeAnalysis.total_experience_years} years
                                    </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Companies: {application.resumeAnalysis.total_companies_worked}
                                    </div>
                                  </div>
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    Click to view full analysis
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
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
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          const interview = getInterviewForApplication(application.id);
                          console.log('Interview check for application', application.id, ':', interview);
                          if (interview) {
                            // Show current interview assignment
                            return (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <UserGroupIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {interview.interviewerName}
                                  </span>
                                </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {interview.scheduledAt 
                                    ? formatDate(interview.scheduledAt)
                                    : 'Date TBD'
                                  }
                                </div>
                              </div>
                            );
                          } else if (application.status === 'SHORTLISTED') {
                            // Show assign button for shortlisted applications
                            return (
                              <button
                                onClick={() => handleAssignInterview(application.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transform hover:scale-[1.02] transition-all"
                                title="Assign interview"
                              >
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Assign Interview
                              </button>
                            );
                          } else {
                            // Show status info for non-shortlisted applications
                            return (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                {application.status === 'APPLIED' && 'Application under review'}
                                {application.status === 'REVIEWED' && 'Ready for shortlisting'}
                                {application.status === 'INTERVIEWING' && 'Interview in progress'}
                                {application.status === 'OFFERED' && 'Offer extended'}
                                  {application.status === 'OFFER_ACCEPTED' && 'Offer accepted'}
                                  {application.status === 'OFFER_REJECTED' && 'Offer rejected'}
                                {application.status === 'REJECTED' && 'Application rejected'}
                                {application.status === 'WITHDRAWN' && 'Application withdrawn'}
                              </span>
                            );
                          }
                        })()}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getStatusBadge(application.status)}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="space-y-1">
                          {application.resumeUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewResume(application.resumeUrl!)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center text-xs transition-colors"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Resume
                              </button>
                              <button
                                onClick={() => handleDownloadResume(application.resumeUrl!)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs transition-colors"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                          
                          {application.coverLetterUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewCoverLetter(application.coverLetterUrl!)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center text-xs transition-colors"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Cover Letter
                              </button>
                              <button
                                onClick={() => handleDownloadCoverLetter(application.coverLetterUrl!)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs transition-colors"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                          
                          {application.portfolioUrl && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewPortfolio(application.portfolioUrl!)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center text-xs transition-colors"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" /> Portfolio
                              </button>
                            </div>
                          )}
                          
                          {!application.resumeUrl && !application.coverLetterUrl && !application.portfolioUrl && (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">No documents</span>
                          )}
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="space-y-2">
                            <button
                              onClick={() => handleViewApplicationDetails(application)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                              title="View full application details"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View Application
                            </button>
                            {application.status === 'OFFERED' && (
                              <button
                                onClick={() => handleSendJobOfferEmail(application.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 transform hover:scale-[1.02] transition-all"
                                title="Send job offer email"
                              >
                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                Send Offer Email
                              </button>
                            )}
                            {application.status !== 'REJECTED' && application.status !== 'OFFER_ACCEPTED' && (
                              <div className="relative">
                            <button
                              type="button"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                              onClick={() => {
                                    setOpenStatusDropdownId(openStatusDropdownId === application.id ? null : application.id);
                              }}
                            >
                                  <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                              Change Status
                                  <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform duration-200 ${openStatusDropdownId === application.id ? 'rotate-180' : ''}`} />
                            </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                          </div>
                          
              {/* Pagination Controls */}
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                              <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0 || loadingApplications}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                              </button>
                              <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1 || loadingApplications}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                              </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{' '}
                      <span className="font-medium">{currentPage * pageSize + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalElements}</span>
                      {' '}applications
                      {loadingApplications && (
                        <span className="ml-2 text-indigo-600 dark:text-indigo-400">Loading...</span>
                      )}
                    </p>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="pageSize" className="text-sm text-gray-700 dark:text-gray-300">
                        Show:
                      </label>
                      <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(0); // Reset to first page when changing page size
                        }}
                        disabled={loadingApplications}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0 || loadingApplications}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                              </button>
                      
                      {/* Page numbers */}
                      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = index;
                        } else if (currentPage < 3) {
                          pageNum = index;
                        } else if (currentPage > totalPages - 4) {
                          pageNum = totalPages - 5 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        
                        return (
                              <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loadingApplications}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum + 1}
                              </button>
                        );
                      })}
                      
                              <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1 || loadingApplications}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                              </button>
                    </nav>
                            </div>
                          </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Resume Analysis Modal */}
      {isModalOpen && selectedAnalysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 dark:opacity-85" onClick={closeAnalysisModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 sm:mx-0 sm:h-10 sm:w-10">
                      <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                      Resume Analysis Details
                    </h3>
                        <button
                          onClick={closeAnalysisModal}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full p-1 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    <div className="mt-4">
                      {/* Score Overview */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Score Overview</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.overall_score)}`}>
                              {selectedAnalysis.resume_score.overall_score.toFixed(1)}%
                            </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.job_match_score)}`}>
                              {selectedAnalysis.resume_score.job_match_score.toFixed(1)}%
                            </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Job Match</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.experience_score)}`}>
                              {selectedAnalysis.resume_score.experience_score.toFixed(1)}%
                            </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.resume_score.skills_match_score)}`}>
                              {selectedAnalysis.resume_score.skills_match_score.toFixed(1)}%
                            </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Skills Match</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Scoring Criteria */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Detailed Scoring Criteria</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Required Skills Match:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAnalysis.resume_score.scoring_criteria.required_skills_match.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Experience Level Match:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAnalysis.resume_score.scoring_criteria.experience_level_match.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Industry Relevance:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAnalysis.resume_score.scoring_criteria.industry_relevance.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Education Level Match:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAnalysis.resume_score.scoring_criteria.education_level_match.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Professional Summary */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Professional Summary</h4>
                          <div className="space-y-2">
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Experience:</span>
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedAnalysis.total_experience_years} years</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies Worked:</span>
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedAnalysis.total_companies_worked}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Company:</span>
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedAnalysis.current_company || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Position:</span>
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedAnalysis.current_position || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Extracted Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnalysis.skills_extracted?.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                              )) || <span className="text-sm text-gray-500 dark:text-gray-400">No skills extracted</span>}
                          </div>
                        </div>
                      </div>

                      {/* Previous Positions */}
                      {selectedAnalysis.previous_positions && selectedAnalysis.previous_positions.length > 0 && (
                          <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Work Experience</h4>
                          <div className="space-y-4">
                            {selectedAnalysis.previous_positions.map((position, index) => (
                                <div key={index} className="border-l-4 border-indigo-200 dark:border-indigo-700 pl-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">{position.position}</h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{position.company}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{position.start_date} - {position.end_date}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{position.duration_months} months</p>
                                  </div>
                                </div>
                                {position.responsibilities && position.responsibilities.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
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
                          <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Education</h4>
                          <div className="space-y-3">
                            {selectedAnalysis.education.map((edu, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{edu.degree}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{edu.graduation_year}</p>
                                    {edu.grade && <p className="text-xs text-gray-500 dark:text-gray-400">{edu.grade}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Metadata */}
                        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Analysis Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <span className="text-gray-600 dark:text-gray-400">Processed:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{new Date(selectedAnalysis.analysis_metadata.processed_at).toLocaleString()}</span>
                          </div>
                          <div>
                              <span className="text-gray-600 dark:text-gray-400">AI Model:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedAnalysis.analysis_metadata.ai_model_used}</span>
                          </div>
                          <div>
                              <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{(selectedAnalysis.analysis_metadata.confidence_score * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                              <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedAnalysis.analysis_metadata.processing_time_ms}ms</span>
                          </div>
                        </div>
                        {selectedAnalysis.analysis_metadata.processingNotes && selectedAnalysis.analysis_metadata.processingNotes.length > 0 && (
                          <div className="mt-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Processing Notes:</span>
                              <ul className="mt-1 list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
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
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={closeAnalysisModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Job Offer Email Modal */}
        {selectedApplication && (
          <JobOfferEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => {
              setIsEmailModalOpen(false);
              setSelectedApplication(null);
            }}
            onSend={handleEmailSend}
            candidateName={selectedApplication?.candidateName || ''}
            jobTitle={job?.title || ''}
            applicationId={selectedApplication?.id.toString() || ''}
          />
        )}

        {/* Application Details Modal */}
        <ApplicationDetailsModal
          isOpen={isApplicationDetailsModalOpen}
          onClose={handleCloseApplicationDetailsModal}
          application={selectedApplicationForDetails}
          jobTitle={job?.title || ''}
        />

        {/* Status Change Popover - Fixed Overlay */}
        {openStatusDropdownId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-700 w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Application Status</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Application #{openStatusDropdownId} • Current: <span className="font-medium text-indigo-600 dark:text-indigo-400">{applications.find(app => app.id === openStatusDropdownId)?.status}</span>
                    </p>
    </div>
                  <button
                    onClick={() => setOpenStatusDropdownId(null)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-700 dark:hover:bg-opacity-50 rounded-lg p-2 transition-all duration-150"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="max-h-96 overflow-y-auto py-4">
                <div className="px-6 space-y-2">
                  {[
                    { value: 'APPLIED', label: 'Applied', icon: '📝', color: 'text-blue-600 dark:text-blue-400', bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', desc: 'Application received and pending review' },
                    { value: 'REVIEWED', label: 'Reviewed', icon: '👀', color: 'text-purple-600 dark:text-purple-400', bgColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20', desc: 'Application has been reviewed by HR' },
                    { value: 'SHORTLISTED', label: 'Shortlisted', icon: '⭐', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20', desc: 'Candidate selected for next round' },
                    { value: 'INTERVIEWING', label: 'Interviewing', icon: '🎤', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20', desc: 'Interview process is ongoing' },
                    { value: 'OFFERED', label: 'Offered', icon: '🎉', color: 'text-green-600 dark:text-green-400', bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20', desc: 'Job offer has been extended' },
                    { value: 'REJECTED', label: 'Rejected', icon: '❌', color: 'text-red-600 dark:text-red-400', bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20', desc: 'Application has been rejected' },
                    { value: 'WITHDRAWN', label: 'Withdrawn', icon: '🔙', color: 'text-gray-600 dark:text-gray-400', bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700/50', desc: 'Candidate withdrew application' }
                  ].map((status) => {
                    const currentApplication = applications.find(app => app.id === openStatusDropdownId);
                    const isCurrentStatus = currentApplication?.status === status.value;
                    
                    return (
                      <button
                        key={status.value}
                        onClick={() => {
                          if (openStatusDropdownId && !isCurrentStatus) {
                            handleStatusChange(openStatusDropdownId, status.value);
                            setOpenStatusDropdownId(null);
                          }
                        }}
                        disabled={isCurrentStatus}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4 ${
                          isCurrentStatus 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 cursor-not-allowed opacity-75' 
                            : `border-gray-100 dark:border-gray-700 ${status.bgColor} hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer hover:shadow-md transform hover:scale-[1.02]`
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{status.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-base font-semibold ${status.color}`}>
                              {status.label}
                            </p>
                            {isCurrentStatus && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full mr-1.5"></div>
                                Current Status
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{status.desc}</p>
                        </div>
                        {!isCurrentStatus && (
                          <div className="flex-shrink-0">
                            <ArrowsUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Status changes are automatically logged and tracked
                  </p>
                  <button
                    onClick={() => setOpenStatusDropdownId(null)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobDetailsPage;