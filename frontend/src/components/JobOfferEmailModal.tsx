import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface JobOfferEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, content: string) => Promise<void>;
  candidateName: string;
  jobTitle: string;
  applicationId: string;
}

const getDefaultEmailContent = (jobTitle: string, applicationId: string): string => {
  return `Dear {{candidateName}},

We are delighted to extend you an offer for the position of:

**${jobTitle}**
Application ID: ${applicationId}

🎉 Congratulations! We are excited to have you join our team!

**Next Steps:**
• Please review the offer details in your candidate portal
• Accept or decline the offer through the portal
• If you have any questions, please contact us

We believe your skills and experience will be a great addition to our team, and we're looking forward to having you on board!

Best regards,
IST Recruiting Team`;
};

const JobOfferEmailModal: React.FC<JobOfferEmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  candidateName,
  jobTitle,
  applicationId,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState(`Job Offer - ${jobTitle}`);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Initialize content when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject(`Job Offer - ${jobTitle}`);
      setContent(getDefaultEmailContent(jobTitle, applicationId));
      setIsEditing(false);
    }
  }, [isOpen, jobTitle, applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSend(subject, content);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetToDefault = () => {
    setSubject(`Job Offer - ${jobTitle}`);
    setContent(getDefaultEmailContent(jobTitle, applicationId));
  };

  // Preview content with placeholder replaced
  const getPreviewContent = () => {
    return content.replace(/\{\{candidateName\}\}/g, candidateName || 'Candidate');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Job Offer Email {isEditing ? '(Editing)' : 'Preview'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      {isEditing ? 'Preview' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Subject Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        placeholder="Email subject"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-gray-100">{subject}</p>
                      </div>
                    )}
                  </div>

                  {/* Content Field */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Content
                      </label>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleResetToDefault}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm"
                          placeholder="Enter email content..."
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Available placeholder: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{{candidateName}}"}</code> - Will be replaced with the candidate's name
                        </p>
                      </>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-600 max-h-80 overflow-y-auto">
                        <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm">
                          {getPreviewContent()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipient Info */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Sending to:</strong> {candidateName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Application ID: {applicationId} • Position: {jobTitle}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSending || !subject.trim() || !content.trim()}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOfferEmailModal;
