import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import UserProfileDropdown from '../common/UserProfileDropdown';
import ThemeToggleButton from '../common/ThemeToggleButton';
import AdminChatNotifications from './AdminChatNotifications';
import '../../styles/sidebar.css';
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CogIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  SparklesIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500' },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' },
  { name: 'Email Notifications', href: '/admin/emails', icon: EnvelopeIcon, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500' },
  { name: 'Bulk Email', href: '/admin/bulk-email', icon: SparklesIcon, color: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-500' },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500' },
  { name: 'Interview Management', href: '/admin/interview-management', icon: DocumentTextIcon, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500' },
  { name: 'Chat Support', href: '/admin/chat', icon: ChatBubbleLeftRightIcon, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500' },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500' },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved !== null) {
      setDesktopSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(desktopSidebarCollapsed));
  }, [desktopSidebarCollapsed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, navigation.length * 100 + 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
    const currentNavigation = navigation;
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 flex items-center h-16 px-3 bg-blue-600 dark:bg-gray-800 border-b border-blue-700 dark:border-gray-700">
          <Link 
            to="/" 
            className={`flex items-center cursor-pointer ${
              isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'
            } rounded-lg transition-all duration-200`}
            title={isCollapsed ? "ATS System - Go to Home" : "Go to Home"}
          >
            <div className={`flex-shrink-0 flex items-center justify-center ${
              isCollapsed ? 'w-12 h-12' : 'w-12 h-12 mr-3'
            }`}>
              <Logo height="h-10" alt="IST Logo" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base font-semibold text-white tracking-wide">
                  ATS System
                </h2>
                <p className="text-xs text-blue-100 dark:text-gray-300">
                  Talent Management
                </p>
              </div>
            )}
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <nav className="px-3 py-4 space-y-1">
            {currentNavigation.map((item, index) => {
              const isCurrent = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`${isInitialLoad ? 'nav-item-animation' : ''} nav-item-hover group relative flex items-center ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'} text-sm font-medium rounded-lg transition-all duration-200 ${
                    isCurrent
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  style={isInitialLoad ? {
                    animationDelay: `${index * 100}ms`,
                  } : undefined}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={`flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-3'} p-2 rounded-lg transition-colors duration-200 ${isCurrent
                      ? 'bg-white/20 dark:bg-gray-600/40'
                      : `${item.bgColor || 'bg-blue-500'} text-white`
                    }`}>
                    <item.icon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </div>

                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm">{item.name}</span>
                      {isCurrent && (
                        <div className="absolute right-3 w-2 h-2 bg-white dark:bg-gray-300 rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                  
                  {isCollapsed && (
                    <>
                      {isCurrent && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white dark:bg-gray-300 rounded-full"></div>
                      )}
                      <div className="sidebar-tooltip">
                        {item.name}
                      </div>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-3 p-3'} rounded-lg bg-gray-50 dark:bg-gray-800`}>
            <div className="flex-shrink-0">
              {user?.profilePictureUrl ? (
                <img
                  className={`${isCollapsed ? 'h-8 w-8' : 'h-10 w-10'} rounded-full`}
                  src={user.profilePictureUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                />
              ) : (
                <div className={`${isCollapsed ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-semibold`}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
                    <span>{user?.role}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium ml-2">Online</span>
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-400 dark:bg-green-500 rounded-full"></div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[55] md:hidden bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`hidden md:flex md:flex-col md:flex-shrink-0 transition-all duration-300 ${
        desktopSidebarCollapsed ? 'md:w-20' : 'md:w-72'
      } ${isInitialLoad ? 'sidebar-animation' : ''}`}>
        <div className="h-full shadow-2xl bg-white dark:bg-gray-900">
          <SidebarContent isCollapsed={desktopSidebarCollapsed} />
        </div>
      </div>

      <div className={`fixed inset-y-0 left-0 z-[60] w-72 transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full shadow-2xl bg-white dark:bg-gray-900">
          <SidebarContent />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <nav className="shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 z-50 bg-white dark:bg-gray-900">
          <div className="relative px-4 sm:px-6 md:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                
                <button
                  onClick={toggleDesktopSidebar}
                  className="hidden md:flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 transform hover:scale-105 sidebar-toggle"
                  title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {desktopSidebarCollapsed ? (
                    <ChevronDoubleRightIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDoubleLeftIcon className="h-5 w-5" />
                  )}
                </button>

                <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
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

        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50 dark:bg-gray-900">
          <main className="flex-1 w-full min-h-full">
            <div className="py-4 px-3 sm:py-6 sm:px-4 md:px-6 lg:px-8 max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;