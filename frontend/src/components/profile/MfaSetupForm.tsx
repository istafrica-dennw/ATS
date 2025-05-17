import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Alert, Paper, 
  Stepper, Step, StepLabel, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemText, DialogActions,
  CircularProgress
} from '@mui/material';
import { authService, MfaSetupResponse } from '../../services/authService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';

interface MfaSetupFormProps {
  onSetupComplete: () => void;
}

const MfaSetupForm: React.FC<MfaSetupFormProps> = ({ onSetupComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  
  const handleInitiateSetup = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.setupMfa(currentPassword);
      setSetupData(response);
      setRecoveryCodes(response.recoveryCodes);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate MFA setup. Please verify your password.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!setupData) return;
    
    setError('');
    setLoading(true);
    
    try {
      await authService.verifyAndEnableMfa(verificationCode, setupData.secret);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = () => {
    onSetupComplete();
  };
  
  const copyRecoveryCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
    }
  };
  
  const steps = ['Verify Password', 'Configure App', 'Backup Recovery Codes'];
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Set Up Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enhance your account security with an additional verification step
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === 0 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            To set up two-factor authentication, please verify your current password.
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
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            fullWidth
            variant="contained"
            onClick={handleInitiateSetup}
            sx={{ mt: 3 }}
            disabled={loading || !currentPassword}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue'}
          </Button>
        </Box>
      )}
      
      {activeStep === 1 && setupData && (
        <Box>
          <Typography variant="body1" gutterBottom>
            Scan the QR code below with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
          </Typography>
          
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <img 
              src={setupData.qrCodeImageUrl} 
              alt="QR Code for authenticator app" 
              style={{ maxWidth: '200px' }}
            />
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            If you can't scan the QR code, manually add this key to your app:
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'background.default',
            p: 2,
            borderRadius: 1,
            mb: 3
          }}>
            <Typography 
              variant="body2" 
              fontFamily="monospace" 
              sx={{ flexGrow: 1 }}
              data-testid="secret-key"
            >
              {setupData.secret}
            </Typography>
            <Button 
              startIcon={<ContentCopyIcon />}
              size="small"
              onClick={() => navigator.clipboard.writeText(setupData.secret)}
            >
              Copy
            </Button>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the 6-digit verification code from your authenticator app:
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="verificationCode"
            label="Verification Code"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            placeholder="123456"
            autoFocus
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyCode}
            sx={{ mt: 3 }}
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify & Continue'}
          </Button>
        </Box>
      )}
      
      {activeStep === 2 && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Two-factor authentication has been successfully set up for your account!
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            Save these recovery codes in a safe place. You'll need them if you lose access to your authenticator app.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2 
          }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowRecoveryCodes(true)}
              sx={{ mt: 1 }}
            >
              View Recovery Codes
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<ContentCopyIcon />} 
              onClick={copyRecoveryCodes}
              sx={{ mt: 1 }}
            >
              Copy Codes
            </Button>
          </Box>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            Important: Each recovery code can only be used once. Keep them secure and don't share them with anyone.
          </Alert>
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleComplete}
            sx={{ mt: 3 }}
          >
            Complete Setup
          </Button>
        </Box>
      )}
      
      <Dialog open={showRecoveryCodes} onClose={() => setShowRecoveryCodes(false)}>
        <DialogTitle>Recovery Codes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Each code can only be used once. Store these somewhere safe.
          </Typography>
          <List dense>
            {recoveryCodes.map((code, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={code} 
                  primaryTypographyProps={{ fontFamily: 'monospace' }} 
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecoveryCodes(false)}>Close</Button>
          <Button onClick={copyRecoveryCodes} startIcon={<ContentCopyIcon />}>
            Copy All
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MfaSetupForm; 