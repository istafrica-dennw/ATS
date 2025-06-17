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
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

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