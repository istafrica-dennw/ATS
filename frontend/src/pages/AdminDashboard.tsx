import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  // Sample data for dashboard cards
  const stats = [
    {
      name: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Jobs',
      value: '47',
      change: '+8.2%',
      changeType: 'increase',
      icon: BriefcaseIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Applications',
      value: '1,423',
      change: '-2.1%',
      changeType: 'decrease',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Interviews Scheduled',
      value: '89',
      change: '+15.3%',
      changeType: 'increase',
      icon: CalendarIcon,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'New Application',
      description: 'John Doe applied for Senior Developer position',
      time: '5 minutes ago',
      status: 'new',
    },
    {
      id: 2,
      type: 'Interview Scheduled',
      description: 'Interview scheduled with Sarah Wilson',
      time: '1 hour ago',
      status: 'scheduled',
    },
    {
      id: 3,
      type: 'Job Posted',
      description: 'Marketing Manager position posted',
      time: '2 hours ago',
      status: 'active',
    },
    {
      id: 4,
      type: 'User Registered',
      description: 'New candidate Michael Johnson registered',
      time: '3 hours ago',
      status: 'new',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your ATS system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'increase'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'new'
                        ? 'bg-green-500'
                        : activity.status === 'scheduled'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.type}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Post New Job
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Add User
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Reports
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Send Emails
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Database
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Operational
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Email Service
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Operational
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  File Storage
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Degraded Performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 