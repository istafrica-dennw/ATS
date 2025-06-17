import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

interface JobOfferResponseProps {
  applicationId: number;
  jobTitle: string;
  onResponse: (status: string, applicationId: number) => void;
}

const JobOfferResponse: React.FC<JobOfferResponseProps> = ({
  applicationId,
  jobTitle,
  onResponse,
}) => {
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (action: 'ACCEPT' | 'REJECT') => {
    setIsResponding(true);
    try {
      const response = await axios.post(`/api/applications/${applicationId}/respond-offer`, {
        action,
      });
      
      toast.success(`Offer ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully`);
      onResponse(response.data.status, applicationId);
    } catch (error) {
      console.error('Error responding to offer:', error);
      toast.error('Failed to process your response. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Job Offer</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">You have received a job offer for:</p>
        <p className="text-lg font-medium text-gray-900">{jobTitle}</p>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Please review the offer details and respond by either accepting or rejecting the offer.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => handleResponse('ACCEPT')}
            disabled={isResponding}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Accept Offer
          </button>
          
          <button
            onClick={() => handleResponse('REJECT')}
            disabled={isResponding}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <XCircleIcon className="h-5 w-5 mr-2" />
            Reject Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobOfferResponse; 