import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileDropdown from '../common/UserProfileDropdown';
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
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon, color: 'from-green-500 to-green-600' },
  { name: 'Email Notifications', href: '/admin/emails', icon: EnvelopeIcon, color: 'from-purple-500 to-purple-600' },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon, color: 'from-orange-500 to-orange-600' },
  { name: 'Interview Skeletons', href: '/admin/interview-skeletons', icon: DocumentTextIcon, color: 'from-teal-500 to-teal-600' },
  { name: 'Interview Assignments', href: '/admin/interview-assignments', icon: CalendarIcon, color: 'from-pink-500 to-pink-600' },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, color: 'from-gray-500 to-gray-600' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center justify-center h-16 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-effect"></div>
        <h2 className="relative text-lg font-semibold text-white tracking-wide">Admin Portal</h2>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute right-4 p-1 rounded-md text-white hover:bg-white/20"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-grow flex flex-col px-3 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isCurrent = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when link is clicked
              className={`nav-item-animation nav-item-hover group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isCurrent
                  ? 'sidebar-item-active text-white shadow-xl active-glow'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-lg'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon with gradient background for active state */}
              <div className={`flex-shrink-0 mr-4 p-2 rounded-lg transition-all duration-300 ${
                isCurrent 
                  ? 'bg-white/20 shadow-lg' 
                  : `bg-gradient-to-br ${item.color} text-white group-hover:scale-110 shadow-md`
              }`}>
                <item.icon 
                  className={`h-5 w-5 transition-all duration-300 ${
                    isCurrent ? 'text-white' : 'text-white'
                  }`} 
                  aria-hidden="true" 
                />
              </div>
              
              {/* Text */}
              <span className="flex-1 font-medium">{item.name}</span>
              
              {/* Active indicator */}
              {isCurrent && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
              )}
              
              {/* Hover effect border */}
              <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 ${
                isCurrent 
                  ? 'border-white/30' 
                  : 'border-transparent group-hover:border-gray-200/50'
              }`}></div>
            </Link>
          );
        })}
      </div>
      
      {/* Sidebar Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200/30">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-blue-50/80 border border-gray-200/50 shadow-lg backdrop-blur-sm">
          <div className="flex-shrink-0">
            {user?.profilePictureUrl ? (
              <img
                className="h-10 w-10 rounded-full ring-2 ring-white shadow-lg"
                src={user.profilePictureUrl}
                alt={`${user?.firstName} ${user?.lastName}`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate flex items-center">
              <span>{user?.role}</span>
              <span className="mx-1">•</span>
              <span className="text-green-600 font-medium">Online</span>
            </p>
          </div>
          <div className="h-3 w-3 bg-green-400 rounded-full status-online shadow-lg"></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Top Navigation - Enhanced */}
      <nav className="glass-effect shadow-xl border-b border-white/20 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold gradient-text">
                  <SparklesIcon className="h-8 w-8 text-blue-600 icon-float" />
                  <span className="hidden sm:block">ATS System</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                  <div className="h-2 w-2 bg-white rounded-full status-online"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.firstName} {user?.lastName}
                </span>
              </div>
              {/* Admin Chat Notifications */}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-72 md:flex-col md:flex-shrink-0 sidebar-animation">
          <div className="flex flex-col flex-grow glass-effect shadow-2xl custom-scrollbar overflow-y-auto">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full glass-effect shadow-2xl custom-scrollbar overflow-y-auto">
            <SidebarContent />
          </div>
        </div>

        {/* Main Content - Enhanced */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-blue-50/30">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 