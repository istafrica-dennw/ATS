import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import MainLayout from '../layouts/MainLayout';

// Helper function to format description with bold subtitles
const formatDescription = (description: string) => {
  if (!description) return 'No description provided.';
  
  // Define section headers with their common variations
  const sectionHeaders = {
    responsibilities: ['responsibilities', 'key responsibilities', 'your role', 'what you\'ll do', 'role and responsibilities'],
    requirements: ['requirements', 'qualifications', 'what we\'re looking for', 'must have', 'required skills'],
    benefits: ['benefits', 'perks', 'what we offer', 'why join us', 'company benefits'],
    compensation: ['salary', 'compensation', 'pay', 'remuneration', 'package'],
    location: ['location', 'work location', 'office location', 'where you\'ll work'],
    employment: ['employment type', 'job type', 'work type', 'contract type'],
    application: ['how to apply', 'application process', 'next steps', 'hiring process'],
    about: ['about us', 'company culture', 'our team', 'who we are'],
    contact: ['contact', 'get in touch', 'reach out', 'contact us']
  };
  
  let formatted = description;
  
  // Create a pattern for each group of synonyms
  Object.values(sectionHeaders).forEach(synonyms => {
    // Create a pattern that matches any of the synonyms
    const pattern = new RegExp(
      `(^|\\n)(?:${synonyms.join('|')}):?`,
      'gi'
    );
    
    // Replace with the first synonym in bold (for consistency)
    formatted = formatted.replace(pattern, (match, p1) => {
      return `${p1}**${synonyms[0].charAt(0).toUpperCase() + synonyms[0].slice(1)}**`;
    });
  });
  
  // Also handle common standalone patterns
  const commonPatterns = [
    // Time-related
    /(^|\n)(full[- ]?time|part[- ]?time|contract|internship|freelance|remote|hybrid|onsite)/gi,
    // Experience levels
    /(^|\n)(entry[- ]?level|mid[- ]?level|senior|lead|principal|manager|director|vp|executive)/gi,
    // Education
    /(^|\n)(bachelor[']?s|master[']?s|phd|degree|diploma|certification)/gi,
    // Skills
    /(^|\n)(skills?|technologies?|tools?|frameworks?|languages?|stack)/gi
  ];
  
  commonPatterns.forEach(pattern => {
    formatted = formatted.replace(pattern, '$1**$2**');
  });
  
  // Convert double asterisks to bold tags
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert newlines to <br> for proper line breaks
  return (
    <>
      {formatted.split('\n').map((line, i) => (
        <Fragment key={i}>
          <span dangerouslySetInnerHTML={{ __html: line }} />
          <br />
        </Fragment>
      ))}
    </>
  );
};

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
  const navigate = useNavigate();
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

  // Format the job description with bold subtitles
  const formattedDescription = useMemo(() => {
    return job ? formatDescription(job.description) : [];
  }, [job]);

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
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
        <div className="bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600 dark:text-red-400">
              {error || 'Job not found'}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Job Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{job.title}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>{job.workSetting}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>{job.employmentType}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>{job.salaryRange}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button 
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white px-8 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200"
                  onClick={() => navigate(`/apply/${job.id}`)}
                >
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Description</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  {formattedDescription}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Share Job</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      const text = `We're hiring for a ${job.title}! Check out the details and apply here: ${url}`;
                      
                      // Differentiate between mobile and desktop to use the best sharing method
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                      if (isMobile) {
                        // On mobile, use the official share-offsite link which is more reliable with native apps,
                        // even though it doesn't support pre-filled text. It generates a clean preview card.
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                      } else {
                        const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
                        window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0077B5] hover:bg-[#005E8E] transition-colors duration-200 transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </button>
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      const text = `IST Africa is hiring for a ${job.title}! Check out the details and apply here:`;
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1DA1F2] hover:bg-[#0C85D0] transition-colors duration-200 transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.208 3.791 4.649-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
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
