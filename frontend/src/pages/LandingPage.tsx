import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  CheckBadgeIcon,
  PlayIcon
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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        console.log('API Response:', response.data);
        console.log('All job statuses:', response.data.map((job: any) => job.jobStatus));
        // Sort jobs by posted date (most recent first) and take only published jobs
        const publishedJobs = response.data.filter((job: Job & { jobStatus: string }) => {
          console.log(`Job ${job.id} - Title: ${job.title}, Status: ${job.jobStatus}`);
          // Include both PUBLISHED and REOPENED jobs
          const status = job.jobStatus?.toUpperCase();
          return status === 'PUBLISHED' || status === 'REOPENED';
        });
        console.log('Published jobs:', publishedJobs);
        
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
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Built for People. Driven by Progress
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                All-in-one applicant tracking system to attract, evaluate, and hire top talent faster.
              </p>
              <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-8 py-3 text-center text-base font-medium text-white shadow-md hover:bg-indigo-700"
                >
                  Get Started Free
                </Link>


                <Link
                  to="/contact"
                  style={{ display: 'none' }}
                  className="rounded-md border border-gray-300 bg-white px-8 py-3 text-center text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="overflow-hidden rounded-xl shadow-xl">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-full h-80 flex flex-col items-center justify-center p-8 text-white">
                  <div className="text-2xl font-bold mb-4">ATS Dashboard Preview</div>
                  <div className="text-lg mb-8">Streamlined candidate management</div>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white bg-opacity-20 rounded-lg p-3 h-16 flex items-center justify-center">
                        <div className="text-sm">Feature {i}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-75 text-indigo-600 shadow-md hover:bg-opacity-90">
                    <PlayIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Jobs */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-bold text-gray-900 mb-8 sm:text-4xl">
            Job Board
          </h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="w-full text-center py-8">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="w-full text-center py-8 text-gray-500">
                No jobs available at the moment
              </div>
            ) : jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 w-full max-w-sm flex-1 basis-80">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">{job.department}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>
                  <p className="text-sm text-gray-600">{job.workSetting.toLocaleLowerCase()}</p>
                  <p className="text-sm text-gray-600">{job.salaryRange}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.employmentType}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{job.salaryRange}</span>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/jobs" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-500">
              View all open positions
              <svg className="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful features to streamline your hiring
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to find and hire the best candidates
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <BriefcaseIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Post Jobs Everywhere</h3>
              <p className="mt-2 text-base text-gray-600">
                Distribute jobs to multiple boards with one click.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Smart Candidate Ranking</h3>
              <p className="mt-2 text-base text-gray-600">
                AI-powered ranking to identify the most qualified candidates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Interview Scheduling</h3>
              <p className="mt-2 text-base text-gray-600">
                Seamlessly schedule interviews with calendar integration.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Team Collaboration</h3>
              <p className="mt-2 text-base text-gray-600">
                Collaborate with your team to make better hiring decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to transform your hiring process
            </p>
          </div>
          <div className="mt-16">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <DocumentPlusIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Create a Job</h3>
                <p className="mt-2 text-base text-gray-600">
                  Create and publish job listings to multiple job boards with a single click.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <DocumentCheckIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Review Applications</h3>
                <p className="mt-2 text-base text-gray-600">
                  Easily review and rank applications with our intuitive interface.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <CheckBadgeIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Hire With Confidence</h3>
                <p className="mt-2 text-base text-gray-600">
                  Make data-driven hiring decisions and onboard new employees seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-indigo-700 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <svg className="mx-auto h-12 w-12 text-indigo-300" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="mt-6 text-xl font-medium text-white">
              "This ATS cut our hiring time by 80%. A game changer."
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                    DN
                  </div>
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-indigo-200">Denis Niwemugisha</p>
                  <p className="text-xs text-indigo-300">Head of People & Talent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-indigo-50 px-6 py-16 sm:p-16">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-indigo-900 sm:text-4xl">
                Ready to streamline your hiring?
              </h2>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="inline-block rounded-md bg-indigo-600 px-10 py-3 text-center text-base font-medium text-white shadow-md hover:bg-indigo-700"
                >
                  Start Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Product
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/features" className="text-base text-gray-300 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-base text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="text-base text-gray-300 hover:text-white">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Company
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/about" className="text-base text-gray-300 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-base text-gray-300 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-base text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/privacy" className="text-base text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-base text-gray-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Connect
              </h3>
              <div className="mt-4 flex space-x-6">
                {/* Facebook */}
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>

                {/* Instagram */}
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>

                {/* Twitter */}
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} ATS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  return user ? (
    <MainLayout>
      {content}
    </MainLayout>
  ) : content;
};

export default LandingPage;
