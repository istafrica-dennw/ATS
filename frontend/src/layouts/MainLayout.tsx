import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileDropdown from '../components/common/UserProfileDropdown';
import ChatWidget from '../components/chat/ChatWidget';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { Role } from '../types/user';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  console.log('MainLayout: Current location:', location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation - Fixed */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                  ATS System
                </Link>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                <Link 
                  to="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/profile') 
                      ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Profile
                </Link>

                <Link 
                  to="/jobs" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/jobs') 
                      ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Jobs
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') 
                        ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                
                <div className="border-l border-gray-300 dark:border-gray-600 h-6 self-center mx-2"></div>
                
                <Link 
                  to="/about" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  About
                </Link>
                <Link 
                  to="/careers" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Careers
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Contact
                </Link>
              </div>

              <div className="lg:hidden ml-6 flex items-center">
                <div className="relative">
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 mr-4 hidden sm:block">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </div>
      </div>

      {user && user.role === Role.CANDIDATE && (
        <ChatWidget 
          userId={user.id} 
          userName={`${user.firstName} ${user.lastName}`} 
          userRole="CANDIDATE" 
        />
      )}

      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout; 