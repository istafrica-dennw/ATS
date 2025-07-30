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
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 3,
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)'
          : theme.shadows[1]
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            color: 'text.primary',
            fontWeight: 600
          }}
        >
          <AdminPanelSettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          Two-Factor Authentication Requirements
        </Typography>
        
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            backgroundColor: 'info.light',
            color: 'info.contrastText',
            '& .MuiAlert-icon': {
              color: 'info.main'
            }
          }}
        >
          As an administrator, you can set which user roles are required to have two-factor authentication enabled.
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.ADMIN} 
                onChange={handleToggle('ADMIN')}
                disabled={true} // Admin 2FA is always required and can't be toggled
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-disabled': {
                    color: 'action.disabled',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: 'action.disabled',
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminPanelSettingsIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                <Typography sx={{ color: 'text.primary' }}>
                  Administrators (Always Required)
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: 'text.primary'
              }
            }}
          />
          
          <Divider sx={{ my: 2, borderColor: 'divider' }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.HIRING_MANAGER || false} 
                onChange={handleToggle('HIRING_MANAGER')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'primary.main',
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessCenterIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                <Typography sx={{ color: 'text.primary' }}>
                  Hiring Managers
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: 'text.primary'
              }
            }}
          />
          
          <Divider sx={{ my: 2, borderColor: 'divider' }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.INTERVIEWER || false} 
                onChange={handleToggle('INTERVIEWER')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'primary.main',
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                <Typography sx={{ color: 'text.primary' }}>
                  Interviewers
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: 'text.primary'
              }
            }}
          />
          
          <Divider sx={{ my: 2, borderColor: 'divider' }} />
          
          <FormControlLabel
            control={
              <Switch 
                checked={requirementByRole.CANDIDATE || false} 
                onChange={handleToggle('CANDIDATE')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'primary.main',
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                <Typography sx={{ color: 'text.primary' }}>
                  Candidates
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: 'text.primary'
              }
            }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          Changes will take effect immediately for new logins. Users who need to enable 2FA will be 
          prompted to do so when accessing restricted areas.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SecurityRoleSettings; 