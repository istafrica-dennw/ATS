import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface DashboardStats {
  name: string;
  value: number;
  icon: React.ElementType;
  change: number;
  changeType: 'increase' | 'decrease';
}

interface RecentActivity {
  id: string;
  type: 'job_posted' | 'application_received' | 'job_reopened' | 'user_registered' | 'interview_scheduled';
  message: string;
  timestamp: string;
  relatedEntity?: string;
}

const AdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats[]>([
    {
      name: 'Total Users',
      value: 0,
      icon: UserGroupIcon,
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Active Jobs',
      value: 0,
      icon: BriefcaseIcon,
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Upcoming Interviews',
      value: 0,
      icon: CalendarIcon,
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Conversion Rate',
      value: 0,
      icon: ChartBarIcon,
      change: 0,
      changeType: 'increase',
    },
  ]);
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users count
        const usersResponse = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        // Fetch jobs count
        const jobsResponse = await fetch('/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        let totalUsers = 0;
        let activeJobs = 0;
        let activities: RecentActivity[] = [];
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          totalUsers = Array.isArray(usersData) ? usersData.length : 0;
          
          // Create recent user registrations
          if (Array.isArray(usersData) && usersData.length > 0) {
            const recentUsers = usersData.slice(-3).map((user: any) => ({
              id: `user-${user.id}`,
              type: 'user_registered' as const,
              message: `New user registered: ${user.firstName} ${user.lastName}`,
              timestamp: user.createdAt || new Date().toISOString(),
              relatedEntity: user.email
            }));
            activities.push(...recentUsers);
          }
        }
        
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          if (Array.isArray(jobsData)) {
            // Count active jobs (PUBLISHED and REOPENED)
            activeJobs = jobsData.filter(job => 
              job.jobStatus === 'PUBLISHED' || job.jobStatus === 'REOPENED'
            ).length;
            
            // Create recent job activities
            const recentJobs: RecentActivity[] = [];
            jobsData.slice(-5).forEach((job: any) => {
              if (job.jobStatus === 'PUBLISHED') {
                recentJobs.push({
                  id: `job-${job.id}`,
                  type: 'job_posted' as const,
                  message: `New job posted: ${job.title}`,
                  timestamp: job.createdAt || new Date().toISOString(),
                  relatedEntity: job.department
                });
              } else if (job.jobStatus === 'REOPENED') {
                recentJobs.push({
                  id: `job-reopened-${job.id}`,
                  type: 'job_reopened' as const,
                  message: `Job reopened: ${job.title}`,
                  timestamp: job.updatedAt || new Date().toISOString(),
                  relatedEntity: job.department
                });
              }
            });
            activities.push(...recentJobs);
          }
        }
        
        // Fetch applications for recent activity
        try {
          const applicationsResponse = await fetch('/api/applications', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            if (Array.isArray(applicationsData)) {
              // Group applications by job
              const jobApplications = applicationsData.reduce((acc: any, app: any) => {
                const jobId = app.jobId;
                if (!acc[jobId]) {
                  acc[jobId] = { count: 0, jobTitle: app.jobTitle || 'Unknown Job', latest: app.createdAt };
                }
                acc[jobId].count++;
                if (new Date(app.createdAt) > new Date(acc[jobId].latest)) {
                  acc[jobId].latest = app.createdAt;
                }
                return acc;
              }, {});
              
              // Create application activities
              Object.entries(jobApplications).slice(-3).forEach(([jobId, data]: [string, any]) => {
                activities.push({
                  id: `applications-${jobId}`,
                  type: 'application_received' as const,
                  message: `${data.count} application${data.count > 1 ? 's' : ''} received for ${data.jobTitle}`,
                  timestamp: data.latest,
                  relatedEntity: jobId
                });
              });
            }
          }
        } catch (error) {
          console.log('Applications endpoint not available');
        }
        
        // Update stats
        setStats(prevStats => [
          { ...prevStats[0], value: totalUsers },
          { ...prevStats[1], value: activeJobs },
          { ...prevStats[2], value: 0 }, // Interviews - TODO: implement when available
          { ...prevStats[3], value: activeJobs > 0 ? Math.round((totalUsers / activeJobs) * 10) : 0 }, // Simple conversion metric
        ]);
        
        // Sort activities by timestamp and take the most recent ones
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 8));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_posted':
      case 'job_reopened':
        return BriefcaseIcon;
      case 'application_received':
        return DocumentTextIcon;
      case 'user_registered':
        return UserGroupIcon;
      case 'interview_scheduled':
        return CalendarIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'job_posted':
        return 'text-green-600 dark:text-green-400';
      case 'job_reopened':
        return 'text-blue-600 dark:text-blue-400';
      case 'application_received':
        return 'text-purple-600 dark:text-purple-400';
      case 'user_registered':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'interview_scheduled':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleAddUser = () => {
    navigate('/admin/users', { state: { openAddModal: true } });
  };

  const handleCreateJob = () => {
    navigate('/admin/jobs', { state: { openCreateModal: true } });
  };

  const handleScheduleInterview = () => {
    toast.info('Interview scheduling coming soon!');
  };

  const handleViewReports = () => {
    navigate('/admin/analytics');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full max-w-full">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 sm:w-1/4 mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 sm:w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50">
              <div className="h-10 sm:h-12 bg-gray-300 dark:bg-gray-600 rounded mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome to your admin dashboard. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white dark:bg-gray-800 pt-4 px-3 pb-8 sm:pt-5 sm:px-4 sm:pb-12 lg:pt-6 lg:px-6 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] transition-all duration-300"
          >
            <dt>
              <div className="absolute bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg p-2 sm:p-3 shadow-lg">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-12 sm:ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-12 sm:ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stat.name === 'Conversion Rate' ? `${stat.value}%` : stat.value}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {stat.change}%
              </p>
              <div className="absolute bottom-0 inset-x-0 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 sm:px-4 sm:py-4 rounded-b-xl">
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {stat.name === 'Total Users' && 'Registered users'}
                    {stat.name === 'Active Jobs' && 'Published & reopened'}
                    {stat.name === 'Upcoming Interviews' && 'Next 7 days'}
                    {stat.name === 'Conversion Rate' && 'Approximate metric'}
                  </span>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest system activities and updates
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <li 
                      key={activity.id} 
                      className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {activity.message}
                          </p>
                          {activity.relatedEntity && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.relatedEntity}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <ClockIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                <p className="mt-2">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Common administrative tasks
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <button
                type="button"
                onClick={handleAddUser}
                className="w-full inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">Add New User</span>
              </button>
              <button
                type="button"
                onClick={handleCreateJob}
                className="w-full inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">Create Job Posting</span>
              </button>
              <button
                type="button"
                onClick={handleScheduleInterview}
                className="w-full inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-all duration-200 cursor-not-allowed opacity-75"
                disabled
              >
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">Schedule Interview</span>
              </button>
              <button
                type="button"
                onClick={handleViewReports}
                className="w-full inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 