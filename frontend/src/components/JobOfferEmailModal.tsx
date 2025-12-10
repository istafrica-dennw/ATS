import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface JobOfferEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => Promise<void>;
  candidateName: string;
  jobTitle: string;
  applicationId: string;
}

const JobOfferEmailModal: React.FC<JobOfferEmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  candidateName,
  jobTitle,
  applicationId,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSend();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Job Offer Email Preview
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-900">Job Offer - {jobTitle}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Preview
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-900 mb-2">Dear {'<< Applicant Name >>'},</p>
                      <p className="text-gray-900 mb-2">We are delighted to extend you an offer for the position of:</p>
                      <div className="bg-gray-100 p-3 rounded-md mb-2">
                        <p className="font-medium text-gray-900">{jobTitle}</p>
                        <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
                      </div>
                      <p className="text-gray-900 mb-2">🎉 Congratulations! We are excited to have you join our team!</p>
                      <p className="text-gray-900 mb-2">Next Steps:</p>
                      <ul className="list-disc pl-5 mb-2">
                        <li>Please review the offer details in your candidate portal</li>
                        <li>Accept or decline the offer through the portal</li>
                        <li>If you have any questions, please contact us</li>
                      </ul>
                      <p className="text-gray-900 mb-2">We believe your skills and experience will be a great addition to our team, and we're looking forward to having you on board!</p>
                      <p className="text-gray-900 mb-2">Best regards,<br />IST Recruiting Team</p>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
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