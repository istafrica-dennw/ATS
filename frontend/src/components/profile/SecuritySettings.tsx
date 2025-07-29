import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Switch, Button, Card, CardContent, 
  Divider, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, TextField 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MfaSetupForm from './MfaSetupForm';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import WarningIcon from '@mui/icons-material/Warning';
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const SecuritySettings: React.FC = () => {
  const { user, disableMfa, token } = useAuth();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const navigate = useNavigate();
  
  console.log("Current MFA state:", isMfaEnabled);

  // Check MFA status using the dedicated endpoint
  useEffect(() => {
    const fetchMfaStatus = async () => {
      try {
        setStatusLoading(true);
        console.log("Fetching MFA status from dedicated endpoint...");
        const response = await axiosInstance.get('/auth/2fa/status');
        console.log("2FA status response:", response.data);
        setIsMfaEnabled(response.data.enabled || false);
      } catch (err) {
        console.error('Failed to get MFA status:', err);
        // Fallback to user object if available
        if (user) {
          setIsMfaEnabled(!!user.mfaEnabled);
        } else {
          setIsMfaEnabled(false);
        }
      } finally {
        setStatusLoading(false);
      }
    };

    // Only fetch if we have a token
    if (token) {
      fetchMfaStatus();
    } else {
      setStatusLoading(false);
    }
  }, [user, token]);

  const handleSetupComplete = () => {
    console.log("MFA setup completed successfully");
    setShowMfaSetup(false);
    setSuccess('Two-factor authentication has been enabled successfully.');
    
    // Update the local state
    setIsMfaEnabled(true);
  };
  
  const handleDisable2FA = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!token) {
        setError('You must be logged in to disable MFA. Please log in and try again.');
        setLoading(false);
        return;
      }
      
      // Proceed with disabling MFA
      await disableMfa(currentPassword);
      console.log("MFA disabled successfully");
      setShowDisableConfirm(false);
      setSuccess('Two-factor authentication has been disabled successfully.');
      setCurrentPassword('');
      
      // Update the local state
      setIsMfaEnabled(false);
    } catch (err: any) {
      console.error('Disable MFA error:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please check your password and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to disable two-factor authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching MFA status
  if (statusLoading) {
    return (
      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200,
        backgroundColor: 'background.paper'
      }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 2,
      backgroundColor: 'background.default'
    }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} /> Security Settings
      </Typography>
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            backgroundColor: 'success.light',
            color: 'success.contrastText',
            '& .MuiAlert-icon': {
              color: 'success.main'
            }
          }}
        >
          {success}
        </Alert>
      )}
      
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VpnKeyIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Add an extra layer of security to your account by requiring a verification code.
                </Typography>
              </Box>
            </Box>
            <Switch 
              checked={isMfaEnabled} 
              onChange={() => {
                if (isMfaEnabled) {
                  setShowDisableConfirm(true);
                } else {
                  setShowMfaSetup(true);
                }
              }}
              inputProps={{ 'aria-label': 'Two-Factor Authentication' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                }
              }}
            />
          </Box>
          
          <Divider sx={{ my: 3, borderColor: 'divider' }} />
          
          <Box>
            {isMfaEnabled ? (
              <>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: 'success.light',
                    color: 'success.contrastText',
                    '& .MuiAlert-icon': {
                      color: 'success.main'
                    }
                  }}
                >
                  Two-factor authentication is enabled for your account.
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowDisableConfirm(true)}
                  sx={{
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'error.light'
                    }
                  }}
                >
                  Disable Two-Factor Authentication
                </Button>
              </>
            ) : (
              <>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: 'info.light',
                    color: 'info.contrastText',
                    '& .MuiAlert-icon': {
                      color: 'info.main'
                    }
                  }}
                >
                  Protect your account with two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy.
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => setShowMfaSetup(true)}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    },
                    boxShadow: 2
                  }}
                >
                  Enable Two-Factor Authentication
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* MFA Setup Dialog */}
      <Dialog 
        open={showMfaSetup} 
        onClose={() => setShowMfaSetup(false)} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.3)'
              : theme.shadows[24]
          }
        }}
      >
        <DialogContent sx={{ backgroundColor: 'background.paper' }}>
          <MfaSetupForm onSetupComplete={handleSetupComplete} />
        </DialogContent>
      </Dialog>
      
      {/* Disable 2FA Confirmation Dialog */}
      <Dialog 
        open={showDisableConfirm} 
        onClose={() => !loading && setShowDisableConfirm(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.3)'
              : theme.shadows[24]
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} /> 
          Disable Two-Factor Authentication
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'background.paper', pt: 3 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              backgroundColor: 'warning.light',
              color: 'warning.contrastText',
              '& .MuiAlert-icon': {
                color: 'warning.main'
              }
            }}
          >
            Disabling two-factor authentication will make your account less secure.
          </Alert>
          <Typography variant="body1" gutterBottom sx={{ color: 'text.primary' }}>
            Please enter your current password to confirm this action.
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="currentPassword"
            label="Current Password"
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoFocus
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
                '&.Mui-focused': {
                  color: 'primary.main',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'text.primary',
              }
            }}
          />
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                backgroundColor: 'error.light',
                color: 'error.contrastText',
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 3
        }}>
          <Button 
            onClick={() => setShowDisableConfirm(false)} 
            disabled={loading}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDisable2FA} 
            variant="contained" 
            color="error" 
            disabled={loading || !currentPassword}
            sx={{
              backgroundColor: 'error.main',
              color: 'error.contrastText',
              '&:hover': {
                backgroundColor: 'error.dark'
              },
              '&.Mui-disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings; 