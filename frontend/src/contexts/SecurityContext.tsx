import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from './AuthContext';

interface SecurityContextType {
  is2FARequired: boolean;
  redirectToSetup2FA: () => void;
  requirementByRole: Record<string, boolean>;
  updateRequirementByRole: (role: string, required: boolean) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [is2FARequired, setIs2FARequired] = useState<boolean>(false);
  const [requirementByRole, setRequirementByRole] = useState<Record<string, boolean>>({
    ADMIN: true,            // Admins always require 2FA
    HIRING_MANAGER: false,  // Optional for Hiring managers
    INTERVIEWER: false,     // Optional for Interviewers
    CANDIDATE: false        // Optional for Candidates
  });

  // Check if the current user needs 2FA based on their role
  useEffect(() => {
    if (user) {
      const userRole = user.role.replace('ROLE_', '');
      setIs2FARequired(requirementByRole[userRole] || false);
    }
  }, [user, requirementByRole]);

  // Load 2FA requirements from backend
  useEffect(() => {
    const load2FARequirements = async () => {
      try {
        // This would be a real API call in production
        // const response = await axiosInstance.get('/api/security/2fa-requirements');
        // setRequirementByRole(response.data);
        
        // For now, just use the default settings
        console.log('SecurityContext - Using default 2FA requirements by role');
      } catch (error) {
        console.error('SecurityContext - Failed to load 2FA requirements:', error);
      }
    };

    load2FARequirements();
  }, []);

  // Function to redirect to 2FA setup page
  const redirectToSetup2FA = () => {
    window.location.href = '/profile/security';
  };

  // Function to update requirements by role (admin only)
  const updateRequirementByRole = async (role: string, required: boolean) => {
    try {
      // This would be a real API call in production
      // await axiosInstance.post('/api/security/2fa-requirements', { role, required });
      
      // For now, just update the local state
      setRequirementByRole(prev => ({
        ...prev,
        [role]: required
      }));
      
      console.log(`SecurityContext - Updated 2FA requirement for ${role} to ${required}`);
    } catch (error) {
      console.error('SecurityContext - Failed to update 2FA requirement:', error);
    }
  };

  const value = {
    is2FARequired,
    redirectToSetup2FA,
    requirementByRole,
    updateRequirementByRole
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}; 