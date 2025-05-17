import React from 'react';
import { Card, CardContent, Typography, FormControlLabel, Switch, Box, Divider, Alert } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import { useSecurity } from '../../contexts/SecurityContext';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/user';

/**
 * Component for admins to manage 2FA requirements by role
 */
const SecurityRoleSettings: React.FC = () => {
  const { user } = useAuth();
  const { requirementByRole, updateRequirementByRole } = useSecurity();
  
  // Only admins can access this component
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }
  
  const handleToggle = (role: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateRequirementByRole(role, event.target.checked);
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AdminPanelSettingsIcon sx={{ mr: 1 }} color="primary" />
          Two-Factor Authentication Requirements
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          As an administrator, you can set which user roles are required to have two-factor authentication enabled.
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.ADMIN} 
                onChange={handleToggle('ADMIN')}
                disabled={true} // Admin 2FA is always required and can't be toggled
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminPanelSettingsIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography>Administrators (Always Required)</Typography>
              </Box>
            }
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.HIRING_MANAGER || false} 
                onChange={handleToggle('HIRING_MANAGER')}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessCenterIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography>Hiring Managers</Typography>
              </Box>
            }
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.INTERVIEWER || false} 
                onChange={handleToggle('INTERVIEWER')}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupsIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography>Interviewers</Typography>
              </Box>
            }
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.CANDIDATE || false} 
                onChange={handleToggle('CANDIDATE')}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography>Candidates</Typography>
              </Box>
            }
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary">
          Changes will take effect immediately for new logins. Users who need to enable 2FA will be 
          prompted to do so when accessing restricted areas.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SecurityRoleSettings; 