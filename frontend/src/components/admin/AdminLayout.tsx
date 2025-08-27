import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileDropdown from '../common/UserProfileDropdown';
import ThemeToggleButton from '../common/ThemeToggleButton';
import AdminChatNotifications from './AdminChatNotifications';
import '../../styles/sidebar.css';
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  SparklesIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon, color: 'from-green-500 to-green-600' },
  { name: 'Email Notifications', href: '/admin/emails', icon: EnvelopeIcon, color: 'from-purple-500 to-purple-600' },
  { name: 'Bulk Email', href: '/admin/bulk-email', icon: SparklesIcon, color: 'from-rose-500 to-rose-600' },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon, color: 'from-orange-500 to-orange-600' },
  { name: 'Interview Management', href: '/admin/interview-management', icon: DocumentTextIcon, color: 'from-teal-500 to-teal-600' },
  { name: 'Chat Support', href: '/admin/chat', icon: ChatBubbleLeftRightIcon, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, color: 'from-gray-500 to-gray-600' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, navigation.length * 100 + 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const SidebarContent = () => (
    <>
      <div className="flex-shrink-0 flex items-center min-h-[4rem] h-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-effect"></div>
        <div className="relative flex items-center">
          <ShieldCheckIcon className="h-6 w-6 text-white mr-3" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white tracking-wide">
            Admin Portal
          </h2>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col py-6 space-y-2 overflow-y-auto bg-white dark:bg-gray-900">
        {navigation.map((item, index) => {
          const isCurrent = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`${isInitialLoad ? 'nav-item-animation' : ''} nav-item-hover group relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-400 ease-in ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-800 text-white shadow-xl border border-white/20 dark:border-gray-600/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:via-purple-900/30 dark:hover:to-indigo-900/30 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-lg dark:hover:shadow-gray-700/50'
                }`}
              style={isInitialLoad ? {
                animationDelay: `${index * 100}ms`,
              } : undefined}
            >
              <div className={`flex-shrink-0 mr-4 p-2 rounded-lg transition-all duration-400 ease-in ${isCurrent
                  ? 'bg-white/30 dark:bg-gray-600/40 shadow-lg backdrop-blur-sm'
                  : `bg-gradient-to-br ${item.color} dark:from-gray-600 dark:to-gray-700 text-white group-hover:scale-110 shadow-md dark:shadow-gray-700/50`
                }`}>
                <item.icon
                  className="h-5 w-5 transition-all duration-400 ease-in text-white"
                  aria-hidden="true"
                />
              </div>

              <span className="flex-1 font-medium">{item.name}</span>

              {isCurrent && (
                <div className="absolute right-3 w-2 h-2 bg-white dark:bg-gray-300 rounded-full animate-pulse shadow-lg transition-all duration-400 ease-in"></div>
              )}

              <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-400 ease-in ${isCurrent
                  ? 'border-white/30 dark:border-gray-500/30'
                  : 'border-transparent group-hover:border-gray-200/50 dark:group-hover:border-gray-600/50'
                }`}></div>
            </Link>
          );
        })}
      </div>

      <div className="flex-shrink-0 min-h-[5rem] px-4 py-4 border-t border-gray-200/30 dark:border-gray-700/50 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 shadow-lg backdrop-blur-sm">
          <div className="flex-shrink-0">
            {user?.profilePictureUrl ? (
              <img
                className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-300 shadow-lg"
                src={user.profilePictureUrl}
                alt={`${user?.firstName} ${user?.lastName}`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white font-semibold shadow-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
              <span>{user?.role}</span>
              <span className="text-green-600 dark:text-green-400 font-medium ml-2">Online</span>
            </p>
          </div>
          <div className="h-3 w-3 bg-green-400 dark:bg-green-500 rounded-full status-online shadow-lg"></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`hidden md:flex md:w-72 md:flex-col md:flex-shrink-0 ${isInitialLoad ? 'sidebar-animation' : ''}`}>
        <div className="flex flex-col flex-grow shadow-2xl custom-scrollbar overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          <SidebarContent />
        </div>
      </div>

      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full shadow-2xl custom-scrollbar overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <SidebarContent />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <nav className="shadow-xl border-b border-white/20 dark:border-gray-700/50 flex-shrink-0 relative z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5"></div>
          <div className="relative px-4 sm:px-6 md:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
                  <Link to="/" className="flex items-center space-x-2 text-xl font-bold gradient-text dark:text-gradient-dark">
                    <SparklesIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 icon-float" />
                    <span className="text-gray-900 dark:text-gray-100">ATS System</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggleButton />
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 flex items-center justify-center shadow-lg">
                    <div className="h-2 w-2 bg-white rounded-full status-online"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Welcome, {user?.firstName} {user?.lastName}
                  </span>
                </div>
                {user && (
                  <AdminChatNotifications
                    adminId={user.id}
                    adminName={`${user.firstName} ${user.lastName}`}
                  />
                )}
                <div className="ml-3">
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800/50 dark:to-gray-900/30">
          <main className="flex-1">
            <div className="py-6 px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;