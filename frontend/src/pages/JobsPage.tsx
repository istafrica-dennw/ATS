import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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

// Filter options
const DEPARTMENTS = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'Tech Innovations',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120K - $150K',
    posted: '2 days ago',
    description: 'We are looking for an experienced software engineer to join our team and help build scalable web applications. The ideal candidate has experience with React, Node.js, and cloud infrastructure.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '5+ years of experience in software development',
      'Strong knowledge of JavaScript, React, and Node.js',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Excellent problem-solving and communication skills'
    ]
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Growth Startup',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$110K - $130K',
    posted: '1 week ago',
    description: 'Join our product team to help define and execute our product roadmap. You will work closely with engineering, design, and marketing teams to deliver exceptional user experiences.',
    requirements: [
      'Bachelor\'s degree in Business, Computer Science, or related field',
      '3+ years of experience in product management',
      'Strong analytical and problem-solving skills',
      'Excellent communication and stakeholder management abilities',
      'Experience with agile methodologies'
    ]
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'Creative Solutions',
    location: 'Remote',
    type: 'Contract',
    salary: '$80K - $100K',
    posted: '3 days ago',
    description: 'We are seeking a talented UX/UI Designer to create amazing user experiences. The ideal candidate should have a strong portfolio demonstrating their ability to create intuitive and visually appealing designs.',
    requirements: [
      'Bachelor\'s degree in Design, HCI, or related field',
      '3+ years of experience in UX/UI design',
      'Proficiency in design tools such as Figma, Sketch, or Adobe XD',
      'Strong portfolio showcasing user-centered design process',
      'Experience with user research and usability testing'
    ]
  },
  {
    id: 4,
    title: 'Marketing Specialist',
    company: 'Global Brand',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$70K - $90K',
    posted: '5 days ago',
    description: 'Join our marketing team to help develop and execute marketing campaigns across multiple channels. You will be responsible for creating content, analyzing campaign performance, and identifying growth opportunities.',
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      '2+ years of experience in digital marketing',
      'Experience with social media marketing and content creation',
      'Knowledge of SEO and SEM principles',
      'Strong analytical skills and experience with marketing analytics tools'
    ]
  },
  {
    id: 5,
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Boston, MA',
    type: 'Full-time',
    salary: '$130K - $160K',
    posted: '1 day ago',
    description: 'We are looking for a Data Scientist to help us extract insights from our data. You will work with large datasets, build predictive models, and communicate findings to stakeholders.',
    requirements: [
      'Master\'s or PhD in Computer Science, Statistics, or related field',
      '3+ years of experience in data science or machine learning',
      'Proficiency in Python, R, or similar programming languages',
      'Experience with machine learning frameworks and statistical analysis',
      'Strong communication skills to present complex findings to non-technical audiences'
    ]
  },
  {
    id: 6,
    title: 'Customer Success Manager',
    company: 'SaaS Platform',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$75K - $95K',
    posted: '1 week ago',
    description: 'Join our customer success team to help our clients achieve their goals using our platform. You will be responsible for onboarding, training, and supporting customers throughout their journey.',
    requirements: [
      'Bachelor\'s degree in Business, Communications, or related field',
      '2+ years of experience in customer success or account management',
      'Strong communication and interpersonal skills',
      'Problem-solving abilities and attention to detail',
      'Experience with CRM software and customer success tools'
    ]
  },
  {
    id: 7,
    title: 'DevOps Engineer',
    company: 'Cloud Services Inc',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$115K - $140K',
    posted: '3 days ago',
    description: 'We are seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You will be responsible for automating deployments, monitoring systems, and ensuring high availability.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience in DevOps or Site Reliability Engineering',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Knowledge of infrastructure as code tools (Terraform, CloudFormation)',
      'Experience with CI/CD pipelines and containerization technologies'
    ]
  },
  {
    id: 8,
    title: 'Sales Representative',
    company: 'Enterprise Solutions',
    location: 'Denver, CO',
    type: 'Full-time',
    salary: '$60K - $80K + Commission',
    posted: '4 days ago',
    description: 'Join our sales team to help grow our business by identifying and closing new opportunities. You will be responsible for prospecting, demonstrating our products, and building relationships with clients.',
    requirements: [
      'Bachelor\'s degree in Business, Marketing, or related field',
      '2+ years of experience in B2B sales',
      'Strong communication and negotiation skills',
      'Experience with CRM software and sales methodologies',
      'Self-motivated with a track record of meeting or exceeding sales targets'
    ]
  }
];

const WORK_SETTINGS = ['ALL', 'HYBRID', 'ONSITE', 'REMOTE'];

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkSetting, setSelectedWorkSetting] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs');
        const publishedJobs = response.data.filter((job: Job) => {
          const status = job.jobStatus?.toUpperCase();
          return status === 'PUBLISHED' || status === 'REOPENED';
        });
        setJobs(publishedJobs);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    // Work Setting filter
    const matchesWorkSetting = selectedWorkSetting === 'ALL' || job.workSetting === selectedWorkSetting;

    return matchesSearch && matchesWorkSetting;
  });

  // Toggle job details
  const toggleJobDetails = (jobId: number) => {
    if (selectedJob === jobId) {
      setSelectedJob(null);
    } else {
      setSelectedJob(jobId);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedWorkSetting('ALL');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with search and filters */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
              Find Your Next Opportunity
            </h1>
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">
              Back to Home
            </Link>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition-all"
                placeholder="Search jobs by title, company, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-4 flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
                <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
              </button>
              
              {selectedWorkSetting !== 'ALL' && (
                <button
                  type="button"
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                  onClick={resetFilters}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              )}
              
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </div>
            </div>
            
            {/* Filter options */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                {/* Work Setting filter */}
                <div>
                  <label htmlFor="work-setting" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work Setting
                  </label>
                  <select
                    id="work-setting"
                    name="work-setting"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm rounded-md transition-all"
                    value={selectedWorkSetting}
                    onChange={(e) => setSelectedWorkSetting(e.target.value)}
                  >
                    {WORK_SETTINGS.map((setting) => (
                      <option key={setting} value={setting}>
                        {setting === 'ALL' ? 'All Settings' : setting}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Job listings */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] overflow-hidden sm:rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <li className="px-4 py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </li>
            ) : error ? (
              <li className="px-4 py-12 text-center text-red-600 dark:text-red-400">{error}</li>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <li key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{job.title}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {job.employmentType}
                        </span>
                        <button
                          type="button"
                          className="ml-4 inline-flex items-center px-3 py-2 border border-indigo-600 dark:border-indigo-500 text-sm font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                          onClick={() => toggleJobDetails(job.id)}
                        >
                          {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          {job.location}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                          <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          {job.salaryRange}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <p>Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Job details (expanded view) */}
                    {selectedJob === job.id && (
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Job Description</h4>
                          <div 
                            className="mt-1 text-sm text-gray-500 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: job.description }}
                          />
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Requirements</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                            {job.requirements?.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Responsibilities</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                            {job.responsibilities?.map((resp, index) => (
                              <li key={index}>{resp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Benefits</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                            {job.benefits?.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-[1.02] transition-all"
                          >
                            View Full Details →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <div className="flex flex-col items-center">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    onClick={resetFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobsPage;
