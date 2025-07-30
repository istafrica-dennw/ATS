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
        return 'text-green-600';
      case 'job_reopened':
        return 'text-blue-600';
      case 'application_received':
        return 'text-purple-600';
      case 'user_registered':
        return 'text-indigo-600';
      case 'interview_scheduled':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
              <div className="h-12 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your admin dashboard. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.name === 'Conversion Rate' ? `${stat.value}%` : stat.value}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.changeType === 'increase' ? '↗' : '↘'}
                {stat.change}%
              </p>
              <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <span className="text-gray-600">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Latest system activities and updates
            </p>
          </div>
          <div className="border-t border-gray-200">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <li key={activity.id} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {activity.message}
                          </p>
                          {activity.relatedEntity && (
                            <p className="text-xs text-gray-500">
                              {activity.relatedEntity}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <ClockIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Common administrative tasks
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleAddUser}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New User
              </button>
              <button
                type="button"
                onClick={handleCreateJob}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Create Job Posting
              </button>
              <button
                type="button"
                onClick={handleScheduleInterview}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors cursor-not-allowed"
                disabled
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Schedule Interview
              </button>
              <button
                type="button"
                onClick={handleViewReports}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 