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

// Location options for filter
const LOCATIONS = [
  'All Locations',
  'San Francisco, CA',
  'New York, NY',
  'Remote',
  'Chicago, IL',
  'Boston, MA',
  'Austin, TX',
  'Seattle, WA',
  'Denver, CO'
];

// Job type options for filter
const JOB_TYPES = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
];

// Salary range options for filter
const SALARY_RANGES = [
  'All Salaries',
  'Under $50K',
  '$50K - $80K',
  '$80K - $100K',
  '$100K - $130K',
  '$130K+'
];

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedSalary, setSelectedSalary] = useState('All Salaries');
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
    
    // Location filter
    const matchesLocation = selectedLocation === 'All Locations' || job.location === selectedLocation;
    const matchesType = selectedType === 'All Types' || job.employmentType === selectedType;
    // Helper function to extract numeric value from salary string
    const extractSalaryValue = (salary: string): number => {
      const match = salary.match(/\d+/g);
      return match ? Math.max(...match.map(Number)) : 0;
    };

    // Helper function to match salary ranges
    const matchesSalaryRange = (jobSalary: string, filterRange: string): boolean => {
      const jobValue = extractSalaryValue(jobSalary);
      
      switch (filterRange) {
        case 'Under $50K':
          return jobValue < 50;
        case '$50K - $80K':
          return jobValue >= 50 && jobValue <= 80;
        case '$80K - $100K':
          return jobValue >= 80 && jobValue <= 100;
        case '$100K - $130K':
          return jobValue >= 100 && jobValue <= 130;
        case '$130K+':
          return jobValue >= 130;
        default:
          return true;
      }
    };

    const matchesSalary = selectedSalary === 'All Salaries' || matchesSalaryRange(job.salaryRange, selectedSalary);

    return matchesSearch && matchesLocation && matchesType && matchesSalary;
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
    setSelectedLocation('All Locations');
    setSelectedType('All Types');
    setSelectedSalary('All Salaries');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with search and filters */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              Find Your Next Opportunity
            </h1>
            <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Back to Home
            </Link>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search jobs by title, company, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-4 flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
                <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
              </button>
              
              {(selectedLocation !== 'All Locations' || selectedType !== 'All Types' || selectedSalary !== 'All Salaries') && (
                <button
                  type="button"
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={resetFilters}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              )}
              
              <div className="ml-auto text-sm text-gray-500">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </div>
            </div>
            
            {/* Filter options */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Location filter */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <select
                    id="location"
                    name="location"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Job type filter */}
                <div>
                  <label htmlFor="job-type" className="block text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    id="job-type"
                    name="job-type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Salary range filter */}
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Salary Range
                  </label>
                  <select
                    id="salary"
                    name="salary"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedSalary}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                  >
                    {SALARY_RANGES.map((range) => (
                      <option key={range} value={range}>
                        {range}
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
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="px-4 py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </li>
            ) : error ? (
              <li className="px-4 py-12 text-center text-red-600">{error}</li>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-indigo-600">{job.title}</h3>
                          <p className="text-sm font-medium text-gray-900">{job.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {job.employmentType}
                        </span>
                        <button
                          type="button"
                          className="ml-4 inline-flex items-center px-3 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => toggleJobDetails(job.id)}
                        >
                          {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {job.location}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {job.salaryRange}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Job details (expanded view) */}
                    {selectedJob === job.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
                          <p className="mt-1 text-sm text-gray-600">{job.description}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Requirements</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                            {job.requirements?.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Responsibilities</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                            {job.responsibilities?.map((resp, index) => (
                              <li key={index}>{resp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Benefits</h4>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                            {job.benefits?.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  <BriefcaseIcon className="h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
      <footer className="bg-white mt-8 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobsPage;
