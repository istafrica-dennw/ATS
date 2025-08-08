import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LinkIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

interface CustomQuestion {
  id: number;
  jobId: number;
  questionText: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'RATING' | 'FILE_UPLOAD' | 'DATE';
  options?: string[];
  required: boolean;
}

interface ApplicationAnswer {
  id: number;
  applicationId: number;
  questionId: number;
  answer: string;
  createdAt: string;
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
  expectedSalary?: number;
  experienceYears?: number;
  createdAt: string;
  updatedAt: string;
  resumeAnalysis?: ResumeAnalysis;
  answers: ApplicationAnswer[];
}

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  jobTitle: string;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  jobTitle
}) => {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch custom questions for the job
  useEffect(() => {
    if (isOpen && application) {
      fetchCustomQuestions(application.jobId);
    }
  }, [isOpen, application]);

  const fetchCustomQuestions = async (jobId: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/jobs/${jobId}/custom-questions`);
      setCustomQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching custom questions:', error);
      toast.error('Failed to load custom questions');
      setCustomQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionText = (questionId: number): string => {
    const question = customQuestions.find(q => q.id === questionId);
    return question?.questionText || `Question ${questionId}`;
  };

  const getQuestionType = (questionId: number): string => {
    const question = customQuestions.find(q => q.id === questionId);
    return question?.questionType || 'TEXT';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'APPLIED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'REVIEWED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'SHORTLISTED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'HIRED': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    const scoreColor = getScoreColor(score);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
        {score.toFixed(1)}%
      </span>
    );
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Application Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Candidate Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Candidate Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-gray-100">{application.candidateName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900 dark:text-gray-100">{application.candidateEmail || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Position</label>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900 dark:text-gray-100">{application.currentPosition || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Company</label>
                  <p className="text-gray-900 dark:text-gray-100">{application.currentCompany || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience Years</label>
                  <p className="text-gray-900 dark:text-gray-100">{application.experienceYears || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Salary</label>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900 dark:text-gray-100">
                      {application.expectedSalary ? `$${application.expectedSalary.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Application Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied On</label>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(application.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume</label>
                  {application.resumeUrl ? (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View Resume
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cover Letter</label>
                  {application.coverLetterUrl ? (
                    <a
                      href={application.coverLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View Cover Letter
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio</label>
                  {application.portfolioUrl ? (
                    <a
                      href={application.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View Portfolio
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Analysis */}
            {application.resumeAnalysis && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  AI Resume Analysis
                </h3>
                <div className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall</p>
                      <p className={`text-2xl font-bold ${getScoreColor(application.resumeAnalysis.resume_score.overall_score)}`}>
                        {application.resumeAnalysis.resume_score.overall_score.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Match</p>
                      <p className={`text-2xl font-bold ${getScoreColor(application.resumeAnalysis.resume_score.job_match_score)}`}>
                        {application.resumeAnalysis.resume_score.job_match_score.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
                      <p className={`text-2xl font-bold ${getScoreColor(application.resumeAnalysis.resume_score.experience_score)}`}>
                        {application.resumeAnalysis.resume_score.experience_score.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills Match</p>
                      <p className={`text-2xl font-bold ${getScoreColor(application.resumeAnalysis.resume_score.skills_match_score)}`}>
                        {application.resumeAnalysis.resume_score.skills_match_score.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Experience Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Experience Summary</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{application.resumeAnalysis.total_experience_years}</span> years total experience
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        Worked at <span className="font-medium">{application.resumeAnalysis.total_companies_worked}</span> companies
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        Current: <span className="font-medium">{application.resumeAnalysis.current_position}</span> at {application.resumeAnalysis.current_company}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Extracted Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {application.resumeAnalysis.skills_extracted.slice(0, 8).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {skill}
                          </span>
                        ))}
                        {application.resumeAnalysis.skills_extracted.length > 8 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{application.resumeAnalysis.skills_extracted.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Metadata */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Processed on {new Date(application.resumeAnalysis.analysis_metadata.processed_at).toLocaleDateString()} 
                      using {application.resumeAnalysis.analysis_metadata.ai_model_used} 
                      (Confidence: {(application.resumeAnalysis.analysis_metadata.confidence_score * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Questions and Answers */}
            {application.answers && application.answers.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Application Questions & Answers
                </h3>
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {application.answers.map((answer, index) => (
                      <div key={answer.id} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {getQuestionText(answer.questionId)}
                        </p>
                        <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {answer.answer}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Answered on {formatDate(answer.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;