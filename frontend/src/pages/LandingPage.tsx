import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import ThemeToggleButton from '../components/common/ThemeToggleButton';
import ATSAnimationShowcase from '../components/ATSAnimationShowcase';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  CheckBadgeIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  postedDate: string;
  salaryRange: string;
  workSetting: 'REMOTE' | 'ONSITE' | 'HYBRID';
}

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        // Sort jobs by posted date (most recent first) and take only published jobs
        const publishedJobs = response.data.filter((job: Job & { jobStatus: string }) => {
          // Include both PUBLISHED and REOPENED jobs
          const status = job.jobStatus?.toUpperCase();
          return status === 'PUBLISHED' || status === 'REOPENED';
        });
        
        const sortedJobs = publishedJobs
          .sort((a: Job, b: Job) => 
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          )
          .slice(0, 3); // Take only the 3 most recent jobs
        setJobs(sortedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const content = (
    <div className="bg-white dark:bg-gray-900" style={{ scrollBehavior: 'smooth' }}>
      {!user && (
        <nav className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    ATS System
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <a 
                    href="#about" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    About
                  </a>
                  <a 
                    href="#careers" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Careers
                  </a>
                  <a 
                    href="#contact" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Contact
                  </a>
                  <Link 
                    to="/jobs" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Jobs
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:flex md:items-center md:space-x-2">
                <ThemeToggleButton />
                <Link
                  to="/login"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transform hover:scale-[1.02] transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>

              <div className="md:hidden flex items-center space-x-2">
                <ThemeToggleButton />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                  aria-expanded="false"
                  aria-label="Toggle navigation menu"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                  ) : (
                    <Bars3Icon className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 md:hidden" 
                 onClick={() => setMobileMenuOpen(false)} />
          )}

          <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex items-center justify-between px-6 py-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">ATS</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ATS System</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto h-full">
              <div className="space-y-2 mb-8">
                                <a
                  href="#about"
                  className="group flex items-center px-0 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BuildingOfficeIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  About
                </a>
                
                <a
                  href="#careers"
                  className="group flex items-center px-0 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UsersIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  Careers
                </a>
                
                <a
                  href="#contact"
                  className="group flex items-center px-0 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  Contact
                </a>
                
                <Link
                  to="/jobs"
                  className="group flex items-center px-0 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BriefcaseIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  Jobs
                </Link>
              </div>

              <div className="space-y-4 mt-auto pt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-6 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                
                <Link
                  to="/signup"
                  className="flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>

              <div className="mt-8 pt-6 text-center border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Streamline your hiring process
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Trusted by 1000+ companies worldwide
                </p>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div id="about" className="relative bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
              Built for People. Driven by Progress
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
                The all-in-one platform to discover opportunities, track your applications, and land your dream job faster.
              </p>
              <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  to="/signup"
                  className="rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-8 py-3 text-center text-base font-medium text-white shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  Get Started Free
                </Link>

                <Link
                  to="/contact"
                  style={{ display: 'none' }}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-8 py-3 text-center text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <ATSAnimationShowcase />
            </div>
          </div>
        </div>
      </div>

      <div id="careers" className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-bold text-gray-900 dark:text-gray-100 mb-8 sm:text-4xl">
            Job Board
          </h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="w-full text-center py-8">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                No jobs available at the moment
              </div>
            ) : jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform hover:scale-[1.02] transition-all duration-200 w-full max-w-sm flex-1 basis-80">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.department}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.location}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.workSetting.toLocaleLowerCase()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.salaryRange}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {job.employmentType}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{job.salaryRange}</span>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/jobs" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300">
              View all open positions
              <svg className="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Your All-in-One Career Companion
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need to find and land your dream job
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transform hover:scale-[1.02] transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <BriefcaseIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Find Your Next Career Move</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Discover job opportunities tailored to your skills and experience from top companies.
              </p>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transform hover:scale-[1.02] transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Smart Profile Matching</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Our AI matches your profile to the best-fit roles, so you can stop searching and start interviewing.
              </p>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transform hover:scale-[1.02] transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Simplified Interview Scheduling</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Easily coordinate interview times with recruiters through a simple, integrated calendar system.
              </p>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transform hover:scale-[1.02] transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <CheckBadgeIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Track Your Application Status</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Stay informed at every step. Track your application's progress from submission to decision in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Three simple steps to accelerate your job search
            </p>
          </div>
          <div className="mt-16">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <DocumentPlusIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-gray-100">1. Create Your Profile</h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Build a standout profile in minutes. Upload your resume and let our system highlight your key skills.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <DocumentCheckIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-gray-100">2. Apply with Ease</h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Browse personalized job recommendations and apply to your dream job with a single click.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <CheckBadgeIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-gray-100">3. Get Hired</h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Track your applications, schedule interviews, and receive offers all within one seamless platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="contact" className="bg-indigo-700 dark:bg-indigo-800 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <svg className="mx-auto h-12 w-12 text-indigo-300 dark:text-indigo-400" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="mt-6 text-xl font-medium text-white">
              "This ATS cut our hiring time by 80%. A game changer."
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 dark:bg-indigo-300 flex items-center justify-center text-indigo-600 dark:text-indigo-800 font-bold">
                    DN
                  </div>
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-indigo-200 dark:text-indigo-300">Denis Niwemugisha</p>
                  <p className="text-xs text-indigo-300 dark:text-indigo-400">Head of People & Talent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-indigo-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 px-6 py-16 sm:p-16">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-gray-100 sm:text-4xl">
                Let's move forward — together.
              </h2>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="inline-block rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-10 py-3 text-center text-base font-medium text-white shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  Start Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-2">ATS System</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Revolutionizing recruitment through innovative technology solutions.
              </p>
            </div>

            <div className="text-center md:text-right">
              <div className="flex flex-col sm:flex-row sm:justify-center md:justify-end items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex space-x-4 text-sm">
                  <Link to="/privacy-policy" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300">
                    Privacy Policy
                  </Link>
                  <Link to="/terms-of-service" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300">
                    Terms of Service
                  </Link>
                </div>
                
                <div className="flex space-x-3">
                  <span className="text-gray-600 dark:text-gray-700 opacity-50 cursor-not-allowed">
                    <span className="sr-only">Facebook (Coming Soon)</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </span>

                  <span className="text-gray-600 dark:text-gray-700 opacity-50 cursor-not-allowed">
                    <span className="sr-only">Instagram (Coming Soon)</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </span>

                  <span className="text-gray-600 dark:text-gray-700 opacity-50 cursor-not-allowed">
                    <span className="sr-only">Twitter (Coming Soon)</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </span>

                  <a 
                    href="https://www.linkedin.com/company/ist-africa/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-400"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 dark:border-gray-900">
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {!user && <ScrollToTopButton />}
    </div>
  );

  return user ? <MainLayout>{content}</MainLayout> : content;
};

export default LandingPage;