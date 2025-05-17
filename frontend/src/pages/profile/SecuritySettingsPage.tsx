import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SecuritySettings from '../../components/profile/SecuritySettings';
import SecurityRoleSettings from '../../components/profile/SecurityRoleSettings';
import { Tabs, Tab, Box, Typography, Paper, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Lock as LockIcon, Person as PersonIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { Role } from '../../types/user';

const SecuritySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          Please log in to view your profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your account security settings and two-factor authentication.
          </Typography>
          
          {/* Personal 2FA settings for all users */}
          <SecuritySettings />
          
          {/* Admin-only 2FA role requirements section */}
          {user.role === Role.ADMIN && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Organization Security Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure two-factor authentication requirements for different user roles.
              </Typography>
              <SecurityRoleSettings />
            </>
          )}
        </Box>
      </Paper>
    </div>
  );
};

export default SecuritySettingsPage; 