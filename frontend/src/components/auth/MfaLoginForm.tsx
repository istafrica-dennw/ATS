import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Link, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import { authService, MfaLoginRequest } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../contexts/AuthContext';

interface MfaLoginFormProps {
  email: string;
  onLoginSuccess: () => void;
}

const MfaLoginForm: React.FC<MfaLoginFormProps> = ({ email, onLoginSuccess }) => {
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { setMfaVerified, token } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const request: MfaLoginRequest = {
        email,
        code: tabValue === 0 ? code : '',
        recoveryCode: tabValue === 1 ? recoveryCode : undefined
      };

      const response = await authService.loginWithMfa(request);
      console.log('MfaLoginForm - MFA verification successful, response:', response);
      
      authService.setAuthData(response);
      localStorage.setItem('mfaVerified', 'true');
      setMfaVerified(true);
      
      console.log('MfaLoginForm - Auth data set, calling onLoginSuccess callback');
      onLoginSuccess();
      
      // If the callback doesn't navigate for some reason, force navigation as a fallback
      console.log('MfaLoginForm - Forcing navigation to dashboard as fallback');
      setTimeout(() => {
        console.log('MfaLoginForm - Checking if we need to navigate');
        if (window.location.pathname.includes('login')) {
          console.log('MfaLoginForm - Still on login page, navigating to dashboard');
          navigate('/dashboard');
        }
      }, 500);
    } catch (err: any) {
      console.error('MFA verification error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <LockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Additional verification is required to continue
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Authenticator App" />
        <Tab label="Recovery Code" />
      </Tabs>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {tabValue === 0 ? (
          <TextField
            margin="normal"
            required
            fullWidth
            id="code"
            label="6-digit code"
            name="code"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            placeholder="123456"
            helperText="Enter the 6-digit code from your authenticator app"
          />
        ) : (
          <TextField
            margin="normal"
            required
            fullWidth
            id="recoveryCode"
            label="Recovery Code"
            name="recoveryCode"
            autoFocus
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="ABCD123456"
            helperText="Enter one of your recovery codes"
          />
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || (tabValue === 0 ? !code : !recoveryCode)}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify & Continue'}
        </Button>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="textSecondary">
            Don't have access to your authenticator app?
          </Typography>
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => setTabValue(tabValue === 0 ? 1 : 0)}
          >
            {tabValue === 0 ? 'Use a recovery code instead' : 'Use authenticator app instead'}
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default MfaLoginForm;
 