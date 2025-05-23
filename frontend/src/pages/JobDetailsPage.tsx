import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import MainLayout from '../layouts/MainLayout';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  workSetting: string;
  employmentType: string;
  salaryRange: string;
  postedDate: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  jobStatus: string;
}

const JobDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/api/jobs/${id}`);
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load job details');
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              {error || 'Job not found'}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{job.workSetting}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{job.employmentType}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{job.salaryRange}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200">
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-600">
                  {job.description}
                </div>
              </div>

              {/* Key Responsibilities */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {job.responsibilities?.map((responsibility, index) => (
                    <li key={index} className="ml-4">{responsibility}</li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {job.requirements?.map((requirement, index) => (
                    <li key={index} className="ml-4">{requirement}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-3">
                  {job.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share Job */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Job</h2>
                <div className="flex space-x-4">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    LinkedIn
                  </button>
                  <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailsPage;
