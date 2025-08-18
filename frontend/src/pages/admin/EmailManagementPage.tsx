import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';


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

const statusOptions = [
    { name: 'All Status', value: 'all' },
    { name: 'Sent', value: EmailStatus.SENT },
    { name: 'Pending', value: EmailStatus.PENDING },
    { name: 'Failed', value: EmailStatus.FAILED },
];

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
        return <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case EmailStatus.FAILED:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case EmailStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: EmailStatus) => {
    switch (status) {
      case EmailStatus.SENT:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case EmailStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case EmailStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && emails.length === 0) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Management</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Manage and monitor all email notifications sent from the system.
            </p>
          </div>
          {stats && stats.failedEmails > 0 && (
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={handleResendAllFailed}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Resend All Failed ({stats.failedEmails})
              </button>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:scale-[1.02]">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg p-3 shadow-lg">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Emails</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:scale-[1.02]">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-3 shadow-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Sent</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.sentEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:scale-[1.02]">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-lg p-3 shadow-lg">
                  <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:scale-[1.02]">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg p-3 shadow-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Failed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.failedEmails}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-auto relative"> 
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sr-only">
                Filter by Status
              </label>
              <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                <div className="relative">
                  <Listbox.Button className="relative w-full sm:w-48 cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border dark:border-gray-600">
                    <span className="block truncate">{statusOptions.find(s => s.value === selectedStatus)?.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full sm:w-48 overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {statusOptions.map((status, statusIdx) => (
                        <Listbox.Option
                          key={statusIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                            }`
                          }
                          value={status.value}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {status.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className="w-full sm:w-auto relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent block w-full pl-10 py-2.5 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md transition-all duration-200"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                  Recipient
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Subject
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Template
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sent At
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No email notifications found
                  </td>
                </tr>
              ) : (
                filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                      {email.recipientEmail}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {email.subject}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {email.templateName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(email.status)}`}>
                        {getStatusIcon(email.status)}
                        <span className="ml-1">{email.status}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(email.createdAt)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleViewEmail(email)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                          title="View email"
                        >
                          View
                        </button>
                        {email.status === EmailStatus.FAILED && (
                          <button
                            type="button"
                            onClick={() => handleResendEmail(email.id)}
                            disabled={resending.includes(email.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 flex items-center p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend email"
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
      </div>

      {viewEmail && (
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 bg-opacity-75 transition-opacity z-50">
          <div className="flex min-h-full items-end justify-center p-2 sm:p-4 text-center sm:items-center">
            <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 text-left shadow-xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transition-all border border-gray-200/50 dark:border-gray-700/50 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <button
                  type="button"
                  onClick={() => setViewEmail(null)}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0">
                  <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 pr-10 mb-4">Email Details</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recipient:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 break-all">{viewEmail.recipientEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</p>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(viewEmail.status)}`}>
                            {getStatusIcon(viewEmail.status)}
                            <span className="ml-1">{viewEmail.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{viewEmail.subject}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Template:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{viewEmail.templateName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(viewEmail.createdAt)}</p>
                      </div>
                    </div>
                    {(viewEmail.errorMessage || viewEmail.lastRetryAt || (viewEmail.retryCount !== undefined && viewEmail.retryCount > 0)) && (
                      <div className="grid grid-cols-1 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        {viewEmail.errorMessage && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Error:</p>
                            <p className="text-sm text-red-600 dark:text-red-400 break-words">{viewEmail.errorMessage}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {viewEmail.lastRetryAt && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Retry:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(viewEmail.lastRetryAt)}</p>
                            </div>
                          )}
                          {viewEmail.retryCount !== undefined && viewEmail.retryCount > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Retries:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{viewEmail.retryCount}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 mt-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Email Content:</p>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50 h-40 sm:h-48 md:h-56 overflow-y-auto">
                      <div className="text-gray-900 dark:text-gray-100 text-sm break-words" dangerouslySetInnerHTML={{ __html: viewEmail.body }} />
                    </div>
                  </div>

                  <div className="flex-shrink-0 mt-4 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                    {viewEmail.status === EmailStatus.FAILED && (
                      <button
                        type="button"
                        onClick={() => {
                          handleResendEmail(viewEmail.id);
                          setViewEmail(null);
                        }}
                        disabled={resending.includes(viewEmail.id)}
                        className="inline-flex w-full sm:w-auto justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {resending.includes(viewEmail.id) ? 'Resending...' : 'Resend Email'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewEmail(null)}
                      className="inline-flex w-full sm:w-auto justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagementPage; 