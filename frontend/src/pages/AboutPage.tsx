import React from 'react';
import { Link } from 'react-router-dom';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  GlobeAmericasIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              About ATS System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Revolutionizing the way companies attract, evaluate, and hire top talent through innovative technology solutions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              We're dedicated to transforming the hiring process by providing intelligent, user-friendly tools that help organizations 
              find the perfect candidates while creating a seamless experience for job seekers. Our platform bridges the gap between 
              talent and opportunity, making recruitment more efficient, fair, and data-driven.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <LightBulbIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Continuously evolving our platform with cutting-edge technology to stay ahead of industry needs.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">People First</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Putting people at the center of everything we do, creating meaningful connections between talent and teams.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Committed to delivering exceptional quality and results that exceed expectations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Companies Trust Us</div>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Successful Hires</div>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">80%</div>
              <div className="text-gray-600 dark:text-gray-400">Faster Hiring Process</div>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <GlobeAmericasIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">25+</div>
              <div className="text-gray-600 dark:text-gray-400">Countries Served</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">DN</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Denis Niwemugisha</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Chief Executive Officer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leading the vision of transforming global recruitment through innovative technology solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">JM</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Jean Marie Muhirwa</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Chief Technology Officer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Driving technical excellence and platform innovation to deliver best-in-class solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">TA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Team ATS</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Head of Operations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ensuring seamless operations and exceptional customer experience across all touchpoints.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of companies already using our platform to streamline their recruitment process and find exceptional talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white px-8 py-3 rounded-md font-medium transform hover:scale-[1.02] transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="border border-indigo-300 dark:border-gray-600 text-indigo-700 dark:text-gray-300 px-8 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default AboutPage; 