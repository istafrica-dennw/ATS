import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileDropdown from '../components/common/UserProfileDropdown';
import ChatWidget from '../components/chat/ChatWidget';
import { Role } from '../types/user';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  console.log('MainLayout: Current location:', location.pathname);

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
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Common navigation items */}
                <Link 
                  to="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname.startsWith('/profile') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Profile
                </Link>

                <Link 
                  to="/jobs" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname.startsWith('/jobs') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Jobs
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.startsWith('/admin') 
                        ? 'border-indigo-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </div>
      </div>

      {/* Chat Widget - Only for candidates */}
      {user && user.role === Role.CANDIDATE && (
        <ChatWidget 
          userId={user.id} 
          userName={`${user.firstName} ${user.lastName}`} 
          userRole="CANDIDATE" 
        />
      )}
    </div>
  );
};

export default MainLayout; 