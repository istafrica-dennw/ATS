import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'styles/react-quill.css';

interface Job {
  id: number;
  title: string;
  department: string;
  status: string;
}

interface ApplicationStatus {
  value: string;
  label: string;
}

interface Applicant {
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: string;
  appliedDate: string;
}

interface EmailPreview {
  totalApplicants: number;
  applicants: Applicant[];
  jobTitle: string;
  statusFilter: string;
}

interface BulkEmailRequest {
  jobId: number | null;
  status: string | null;
  subject: string;
  content: string;
  isHtml: boolean;
  sendTest: boolean;
  testEmailRecipient: string;
}

interface BulkEmailResponse {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  status: string;
  failures: Array<{
    applicationId?: number;
    candidateEmail: string;
    candidateName: string;
    errorMessage: string;
  }>;
}

const BulkEmailPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendResult, setSendResult] = useState<BulkEmailResponse | null>(null);

  const [formData, setFormData] = useState<BulkEmailRequest>({
    jobId: null,
    status: null,
    subject: '',
    content: '',
    isHtml: true,
    sendTest: false,
    testEmailRecipient: user?.email || ''
  });

  // Fetch jobs and statuses on component mount
  useEffect(() => {
    fetchJobs();
    fetchStatuses();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get('/admin/bulk-email/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axiosInstance.get('/admin/bulk-email/statuses');
      setStatuses(response.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      toast.error('Failed to load statuses');
    }
  };

  const fetchEmailPreview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (formData.jobId) params.append('jobId', formData.jobId.toString());
      if (formData.status) params.append('status', formData.status);

      const response = await axiosInstance.get(`/admin/bulk-email/preview?${params}`);
      setEmailPreview(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching email preview:', error);
      toast.error('Failed to load email preview');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please provide both subject and content');
      return;
    }

    setSending(true);
    try {
      const response = await axiosInstance.post('/admin/bulk-email/send', formData);
      setSendResult(response.data);
      
      if (response.data.status === 'SUCCESS') {
        toast.success(`Successfully sent ${response.data.successCount} emails!`);
      } else if (response.data.status === 'PARTIAL_SUCCESS') {
        toast.warning(`Sent ${response.data.successCount} emails, ${response.data.failureCount} failed`);
      } else {
        toast.error('Bulk email sending failed');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Failed to send bulk email');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (field: keyof BulkEmailRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset preview when filters change
    if (field === 'jobId' || field === 'status') {
      setShowPreview(false);
      setEmailPreview(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <EnvelopeIcon className="h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400" />
            Bulk Email to Applicants
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Send emails to applicants based on job and status filters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Email Filters & Content
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job (Optional)
                  </label>
                  <select
                    value={formData.jobId || ''}
                    onChange={(e) => handleInputChange('jobId', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Jobs</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status (Optional)
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <button
                  onClick={fetchEmailPreview}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Preview Recipients'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Content *
                  </label>
                  <div className="react-quill-no-outline dark:border-gray-700 bg-white dark:bg-gray-700 rounded-md overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(html) => handleInputChange('content', html)}
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['link'],
                          ['clean']
                        ],
                        clipboard: { matchVisual: false }
                      }}
                      formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link']}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Available placeholders: {"{candidateName}"}, {"{firstName}"}, {"{lastName}"}, {"{jobTitle}"}, {"{jobDepartment}"}, {"{applicationStatus}"}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isHtml}
                      onChange={(e) => handleInputChange('isHtml', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">HTML Content</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendTest}
                      onChange={(e) => handleInputChange('sendTest', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Send Test Email First</span>
                  </label>
                </div>

                {formData.sendTest && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Email Recipient
                    </label>
                    <input
                      type="email"
                      value={formData.testEmailRecipient}
                      onChange={(e) => handleInputChange('testEmailRecipient', e.target.value)}
                      placeholder="Enter test email address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={sendBulkEmail}
                  disabled={sending || !formData.subject.trim() || !formData.content.trim()}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  {sending ? 'Sending...' : 'Send Bulk Email'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {showPreview && emailPreview && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Recipients Preview
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Job Filter:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{emailPreview.jobTitle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status Filter:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{emailPreview.statusFilter}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Recipients:</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{emailPreview.totalApplicants}</span>
                  </div>
                </div>

                {emailPreview.totalApplicants > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {emailPreview.applicants.slice(0, 10).map((applicant, index) => (
                        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                          <div className="font-medium text-gray-900 dark:text-white">{applicant.candidateName}</div>
                          <div className="text-gray-600 dark:text-gray-400">{applicant.candidateEmail}</div>
                          <div className="text-gray-500 dark:text-gray-500">{applicant.jobTitle} - {applicant.status}</div>
                        </div>
                      ))}
                      {emailPreview.applicants.length > 10 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          ... and {emailPreview.applicants.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {sendResult && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  {sendResult.status === 'SUCCESS' ? (
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  Send Results
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Attempted:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{sendResult.totalAttempted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Successful:</span>
                    <span className="text-sm font-medium text-green-600">{sendResult.successCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Failed:</span>
                    <span className="text-sm font-medium text-red-600">{sendResult.failureCount}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Status:</span>
                    <span className={`text-sm font-bold ${
                      sendResult.status === 'SUCCESS' 
                        ? 'text-green-600' 
                        : sendResult.status === 'PARTIAL_SUCCESS' 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {sendResult.status}
                    </span>
                  </div>
                </div>

                {sendResult.failures && sendResult.failures.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Failed Emails:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {sendResult.failures.map((failure, index) => (
                        <div key={index} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          <div className="font-medium">{failure.candidateName} ({failure.candidateEmail})</div>
                          <div>{failure.errorMessage}</div>
                        </div>
                      ))}
                    </div>
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

export default BulkEmailPage;