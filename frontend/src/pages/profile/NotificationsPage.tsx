import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionToggle from '../../components/subscription/SubscriptionToggle';
import { Tabs, Tab, Box, Typography, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Lock as LockIcon, Person as PersonIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile not found</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please log in to view your notification settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Paper sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)'
          : theme.shadows[3]
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={location.pathname}
            aria-label="profile settings tabs"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Profile" 
              value="/profile/settings"
              component={Link}
              to="/profile/settings"
              iconPosition="start"
            />
            <Tab 
              icon={<LockIcon />} 
              label="Security" 
              value="/profile/security"
              component={Link}
              to="/profile/security"
              iconPosition="start"
            />
            <Tab 
              icon={<NotificationsIcon />} 
              label="Notifications" 
              value="/profile/notifications"
              component={Link}
              to="/profile/notifications"
              iconPosition="start"
            />
          </Tabs>
        </Box>
        <Box p={3}>
          <Typography variant="h5" component="h1" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your notification preferences and subscriptions.
          </Typography>
          
          <div className="mt-6">
            <SubscriptionToggle />
          </div>
        </Box>
      </Paper>
    </div>
  );
};

export default NotificationsPage;

