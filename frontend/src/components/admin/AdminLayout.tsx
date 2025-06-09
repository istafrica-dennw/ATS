import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileDropdown from '../common/UserProfileDropdown';
import AdminChatNotifications from './AdminChatNotifications';
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Email Notifications', href: '/admin/emails', icon: EnvelopeIcon },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
  { name: 'Interviews', href: '/admin/interviews', icon: CalendarIcon, disabled: true },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('AdminLayout: Current location:', location.pathname);
  
  // Handle page refresh - ensure we stay on the correct admin page
  React.useEffect(() => {
    // Store the current path in session storage to handle page refreshes
    if (location.pathname.startsWith('/admin/') && location.pathname !== '/admin') {
      sessionStorage.setItem('lastAdminRoute', location.pathname);
      console.log('AdminLayout - Stored current admin route:', location.pathname);
    }
    
    // Removed automatic redirect logic - allow users to navigate to /admin dashboard freely
    // Previous logic was redirecting users away from /admin when they tried to access it
  }, [location.pathname]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation - Fixed */}
      <nav className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  ATS System
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
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
        {/* Sidebar - Fixed */}
        <div className="hidden md:flex md:w-64 md:flex-col md:flex-shrink-0">
          <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => {
                  const isCurrent = location.pathname === item.href;
                  
                  return (
                    <li key={item.name}>
                      {item.disabled ? (
                        <span
                          className="flex items-center px-2 py-2 text-sm font-medium text-gray-400 rounded-md cursor-not-allowed"
                          title="Coming soon"
                        >
                          <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                          {item.name}
                        </span>
                      ) : (
                        <Link
                          to={item.href}
                          className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isCurrent
                              ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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