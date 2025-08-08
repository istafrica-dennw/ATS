import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CodeBracketIcon,
  HeartIcon
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
  description?: string;
}

const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        const publishedJobs = response.data.filter((job: Job & { jobStatus: string }) => {
          const status = job.jobStatus?.toUpperCase();
          return status === 'PUBLISHED' || status === 'REOPENED';
        });
        setJobs(publishedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const benefits = [
    {
      icon: HeartIcon,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs"
    },
    {
      icon: ChartBarIcon,
      title: "Growth & Development",
      description: "Professional development budget, conference attendance, and skill training programs"
    },
    {
      icon: UserGroupIcon,
      title: "Work-Life Balance",
      description: "Flexible working hours, remote work options, and generous PTO policy"
    },
    {
      icon: CurrencyDollarIcon,
      title: "Competitive Package",
      description: "Market-competitive salary, equity options, and performance bonuses"
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Help us revolutionize the future of recruitment. Build innovative solutions that connect talent with opportunity worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Our Culture</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Innovation at Heart</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We foster a culture of continuous learning and innovation where every team member is encouraged to 
                share ideas, experiment with new technologies, and contribute to our mission of transforming recruitment.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                From hackathons to innovation days, we provide the time and resources for creativity to flourish. 
                Our team is passionate about building solutions that make a real difference in people's careers and companies' success.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CodeBracketIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Cutting-edge technology stack
                </li>
                <li className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Collaborative team environment
                </li>
                <li className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Growth-oriented mindset
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Fast-Growing Team</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Join a dynamic, fast-paced environment where your contributions directly impact millions of job seekers and thousands of companies worldwide.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Open Positions</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading positions...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Open Positions</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                We don't have any open positions at the moment, but we're always growing! Check back soon or reach out to us directly.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                Contact Us
                <svg className="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span className="flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location} • {job.workSetting.toLowerCase()}
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {job.salaryRange}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {job.employmentType}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {job.workSetting}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white font-medium rounded-md transform hover:scale-[1.02] transition-all duration-200"
                      >
                        Apply Now
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Don't See the Right Role?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for innovation. Send us your resume and tell us how you'd like to contribute to our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white px-8 py-3 rounded-md font-medium transform hover:scale-[1.02] transition-all duration-200"
            >
              Get In Touch
            </Link>
            <Link
              to="/jobs"
              className="border border-indigo-300 dark:border-gray-600 text-indigo-700 dark:text-gray-300 px-8 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default CareersPage; 