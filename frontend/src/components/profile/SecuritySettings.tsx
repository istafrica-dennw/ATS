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
  const { user, disableMfa, token, validateTokenAndGetUser } = useAuth();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
  const navigate = useNavigate();
  
  console.log("Current MFA state:", isMfaEnabled);

  // Check actual MFA status on load rather than forcing to true
  useEffect(() => {
    const checkActualMfaStatus = async () => {
      try {
        console.log("Checking MFA status...");
        // Check if we're being forced to use MFA when logging in
        if (user) {
          const response = await axiosInstance.get('/auth/me');
          console.log("API response MFA status:", response.data.mfaEnabled);
          console.log("User object MFA status:", user.mfaEnabled);
          
          // First check if mfaEnabled is explicitly true
          if (response.data.mfaEnabled === true) {
            console.log("Setting MFA enabled based on API response");
            setIsMfaEnabled(true);
            return;
          }
          
          // If null but we know we had to use MFA to login, it's actually enabled
          if (response.data.mfaEnabled === null && user.mfaEnabled) {
            console.log("Setting MFA enabled based on user object");
            setIsMfaEnabled(true);
            return;
          }
          
          // Default to whatever the user object says
          console.log("Defaulting to user object MFA status");
          setIsMfaEnabled(!!user.mfaEnabled);
        }
      } catch (err) {
        console.error('Failed to get MFA status:', err);
        // If we can't determine, don't assume it's enabled
        setIsMfaEnabled(false);
      }
    };

    checkActualMfaStatus();
  }, [user]);

  // Ensure we have a valid token when the component mounts
  useEffect(() => {
    const refreshAuthIfNeeded = async () => {
      // Check if token exists
      if (token) {
        try {
          // Validate current token by making a request to /auth/me
          await axiosInstance.get('/auth/me');
          console.log('Token is valid, no need to refresh');
        } catch (err) {
          console.error('Error validating token, redirecting to login:', err);
          window.location.href = '/login'; // Redirect to login if token is invalid
        }
      } else {
        console.log('No token found, redirecting to login');
        window.location.href = '/login';
      }
    };

    refreshAuthIfNeeded();
  }, [token]);

  const handleSetupComplete = () => {
    console.log("MFA setup completed successfully");
    setShowMfaSetup(false);
    setSuccess('Two-factor authentication has been enabled successfully.');
    
    // Explicitly set MFA as enabled
    setIsMfaEnabled(true);
    
    // Actually reload the page to ensure latest status from the backend
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
  
  const handleDisable2FA = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Force token refresh - log out and log back in automatically if needed
      if (!token) {
        setError('You must be logged in to disable MFA. Please log in and try again.');
        setLoading(false);
        return;
      }
      
      // Explicitly set the auth header for this request
      const tokenHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Using token for MFA disable:', tokenHeader.substring(0, 20) + '...');
      
      // Set authorization header for all future requests
      axiosInstance.defaults.headers.common['Authorization'] = tokenHeader;
      
      // Try to validate the token first 
      try {
        await axiosInstance.get('/auth/me');
        console.log('Token validated before MFA disable');
      } catch (tokenErr) {
        console.error('Token validation failed:', tokenErr);
        setError('Session has expired. Please log in again and try disabling MFA.');
        setLoading(false);
        return;
      }
      
      // Proceed with disabling MFA
      await disableMfa(currentPassword);
      console.log("MFA disabled successfully");
      setShowDisableConfirm(false);
      setSuccess('Two-factor authentication has been disabled successfully.');
      setCurrentPassword('');
      
      // Explicitly set MFA as disabled
      setIsMfaEnabled(false);
      
      // Reload to ensure latest status from backend
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Disable MFA error:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again and try disabling MFA.');
      } else {
        setError(err.response?.data?.message || 'Failed to disable two-factor authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ mr: 1 }} /> Security Settings
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VpnKeyIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">Two-Factor Authentication</Typography>
                <Typography variant="body2" color="textSecondary">
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
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            {isMfaEnabled ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Two-factor authentication is enabled for your account.
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowDisableConfirm(true)}
                >
                  Disable Two-Factor Authentication
                </Button>
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Protect your account with two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy.
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => setShowMfaSetup(true)}
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
      >
        <DialogContent>
          <MfaSetupForm onSetupComplete={handleSetupComplete} />
        </DialogContent>
      </Dialog>
      
      {/* Disable 2FA Confirmation Dialog */}
      <Dialog 
        open={showDisableConfirm} 
        onClose={() => !loading && setShowDisableConfirm(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} /> Disable Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Disabling two-factor authentication will make your account less secure.
          </Alert>
          <Typography variant="body1" gutterBottom>
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
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDisableConfirm(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDisable2FA} 
            variant="contained" 
            color="error" 
            disabled={loading || !currentPassword}
          >
            {loading ? <CircularProgress size={24} /> : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings; 