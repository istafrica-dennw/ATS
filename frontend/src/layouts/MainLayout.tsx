import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileDropdown from '../components/common/UserProfileDropdown';
import ChatWidget from '../components/chat/ChatWidget';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import ThemeToggleButton from '../components/common/ThemeToggleButton';
import Logo from '../components/common/Logo';
import { Role } from '../types/user';
import { Bars3Icon, XMarkIcon, HomeIcon, UserCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { getFullProfilePictureUrl } from '../utils/imageUtils';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('MainLayout: Current location:', location.pathname);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="lg:hidden mr-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  aria-controls="mobile-menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <Logo height="h-8 sm:h-10" alt="IST Logo" />
                </Link>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      (item.href !== '/' && location.pathname.startsWith(item.href)) || location.pathname === item.href
                        ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
               <ThemeToggleButton />

              <span className="text-gray-700 dark:text-gray-300 mr-4 hidden sm:block">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full shadow-2xl bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <Logo height="h-8" alt="IST Logo" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                  <XMarkIcon className="h-6 w-6" />
              </button>
          </div>
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  (item.href !== '/' && location.pathname.startsWith(item.href)) || location.pathname === item.href
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                aria-current={location.pathname === item.href ? 'page' : undefined}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div>
                {user?.profilePictureUrl ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={getFullProfilePictureUrl(user.profilePictureUrl)}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto min-h-0 ${location.pathname === '/' ? '' : 'bg-gray-50 dark:bg-gray-900'}`}>
        {location.pathname === '/' ? (
          <div>
            {children || <Outlet />}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </div>
        )}
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