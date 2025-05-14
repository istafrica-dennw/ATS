import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Define email notification types
export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

interface EmailNotification {
  id: number;
  recipientEmail: string;
  subject: string;
  body: string;
  templateName: string;
  status: EmailStatus;
  errorMessage?: string;
  retryCount?: number;
  lastRetryAt?: string;
  relatedUserId?: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailStats {
  totalEmails: number;
  pendingEmails: number;
  sentEmails: number;
  failedEmails: number;
}

const EmailManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewEmail, setViewEmail] = useState<EmailNotification | null>(null);
  const [resending, setResending] = useState<number[]>([]);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/emails';
      if (selectedStatus !== 'all') {
        url += `?status=${selectedStatus}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      } else {
        throw new Error('Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load email notifications');
    } finally {
      setLoading(false);
    }
  }, [token, selectedStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, [fetchEmails, fetchStats]);

  const handleResendEmail = async (id: number) => {
    try {
      setResending(prev => [...prev, id]);
      
      const response = await fetch(`/api/admin/emails/${id}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Fetch the updated email to check its actual status
        const emailResponse = await fetch(`/api/admin/emails/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          if (emailData.status === EmailStatus.SENT) {
            toast.success('Email resent successfully');
          } else if (emailData.status === EmailStatus.FAILED) {
            toast.error(`Failed to send email: ${emailData.errorMessage || 'Unknown error'}`);
          } else {
            toast.info('Email is pending delivery');
          }
        } else {
          toast.success('Email resend initiated');
        }
        
        fetchEmails();
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to resend email');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setResending(prev => prev.filter(emailId => emailId !== id));
    }
  };

  const handleResendAllFailed = async () => {
    try {
      setLoading(true);
      
      // Remember how many failed emails we had before
      const beforeFailedCount = stats?.failedEmails || 0;
      
      const response = await fetch('/api/admin/emails/resend-all-failed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Get the latest stats to see the current failed count
        const statsResponse = await fetch('/api/admin/emails/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (statsResponse.ok) {
          const latestStats = await statsResponse.json();
          const nowFailedCount = latestStats.failedEmails;
          const successCount = beforeFailedCount - nowFailedCount;
          
          if (successCount <= 0) {
            toast.error('Failed to resend any emails');
          } else if (nowFailedCount > 0) {
            toast.warning(`Partially successful: Fixed ${successCount} of ${beforeFailedCount} failed emails`);
          } else {
            toast.success(`Successfully resent all ${beforeFailedCount} failed emails`);
          }
        } else {
          // Fallback to the response data if we can't get latest stats
          if (data.successCount === 0) {
            toast.error('Failed to resend any emails');
          } else if (data.successCount < data.totalEmails) {
            toast.warning(`Partially successful: Resent ${data.successCount} of ${data.totalEmails} emails`);
          } else {
            toast.success(`Successfully resent all ${data.totalEmails} emails`);
          }
        }
        
        // Refresh the UI
        fetchEmails();
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to resend failed emails');
      }
    } catch (error) {
      console.error('Error resending failed emails:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend failed emails');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewEmail = (email: EmailNotification) => {
    setViewEmail(email);
  };

  const getStatusIcon = (status: EmailStatus) => {
    switch (status) {
      case EmailStatus.SENT:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case EmailStatus.FAILED:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case EmailStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: EmailStatus) => {
    switch (status) {
      case EmailStatus.SENT:
        return 'bg-green-100 text-green-800';
      case EmailStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case EmailStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && emails.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Email Notifications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all email notifications sent from the system.
          </p>
        </div>
        {stats && stats.failedEmails > 0 && (
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={handleResendAllFailed}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Resend All Failed ({stats.failedEmails})
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Emails</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sent</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.sentEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.pendingEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.failedEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 sr-only">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value={EmailStatus.SENT}>Sent</option>
            <option value={EmailStatus.PENDING}>Pending</option>
            <option value={EmailStatus.FAILED}>Failed</option>
          </select>
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Email List */}
      <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Recipient
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Subject
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Template
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Sent At
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  No email notifications found
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr key={email.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {email.recipientEmail}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {email.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {email.templateName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(email.status)}`}>
                      {getStatusIcon(email.status)}
                      <span className="ml-1">{email.status}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(email.createdAt)}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleViewEmail(email)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      {email.status === EmailStatus.FAILED && (
                        <button
                          type="button"
                          onClick={() => handleResendEmail(email.id)}
                          disabled={resending.includes(email.id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          {resending.includes(email.id) ? (
                            <>
                              <ArrowPathIcon className="animate-spin h-4 w-4 mr-1" />
                              Resending...
                            </>
                          ) : (
                            'Resend'
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Email Modal */}
      {viewEmail && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setViewEmail(null)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <span className="h-6 w-6">×</span>
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Email Details</h3>
                  <div className="mt-4 space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Recipient:</p>
                      <p className="mt-1 text-sm text-gray-900">{viewEmail.recipientEmail}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Subject:</p>
                      <p className="mt-1 text-sm text-gray-900">{viewEmail.subject}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Template:</p>
                      <p className="mt-1 text-sm text-gray-900">{viewEmail.templateName}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Status:</p>
                      <div className="mt-1 flex items-center">
                        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(viewEmail.status)}`}>
                          {getStatusIcon(viewEmail.status)}
                          <span className="ml-1">{viewEmail.status}</span>
                        </span>
                      </div>
                    </div>
                    {viewEmail.errorMessage && (
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-sm font-medium text-gray-500">Error Message:</p>
                        <p className="mt-1 text-sm text-red-600">{viewEmail.errorMessage}</p>
                      </div>
                    )}
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Created At:</p>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(viewEmail.createdAt)}</p>
                    </div>
                    {viewEmail.lastRetryAt && (
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-sm font-medium text-gray-500">Last Retry:</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(viewEmail.lastRetryAt)}</p>
                      </div>
                    )}
                    {viewEmail.retryCount !== undefined && viewEmail.retryCount > 0 && (
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-sm font-medium text-gray-500">Retry Count:</p>
                        <p className="mt-1 text-sm text-gray-900">{viewEmail.retryCount}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Content:</p>
                      <div className="mt-2 border border-gray-200 rounded-md p-4 max-h-96 overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: viewEmail.body }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setViewEmail(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                {viewEmail.status === EmailStatus.FAILED && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResendEmail(viewEmail.id);
                      setViewEmail(null);
                    }}
                    disabled={resending.includes(viewEmail.id)}
                    className="ml-3 inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {resending.includes(viewEmail.id) ? 'Resending...' : 'Resend Email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagementPage; 