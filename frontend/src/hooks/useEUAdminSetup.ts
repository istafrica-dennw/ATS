import { useState, useEffect } from 'react';
import { euAdminSetupService, EUAdminSetupStatus, EUAdminSetupResponse } from '../services/euAdminSetupService';
import { toast } from 'react-toastify';

interface EUAdminSetupState {
  status: EUAdminSetupStatus | null;
  loading: boolean;
  error: string | null;
}

export const useEUAdminSetup = () => {
  const [state, setState] = useState<EUAdminSetupState>({
    status: null,
    loading: true,
    error: null
  });

  const loadStatus = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const status = await euAdminSetupService.getSetupStatus();
      setState({
        status,
        loading: false,
        error: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load EU admin setup status'
      }));
    }
  };

  const becomeFirstEUAdmin = async (): Promise<boolean> => {
    try {
      const response = await euAdminSetupService.becomeFirstEUAdmin();
      
      if (response.success) {
        toast.success(response.message || 'Successfully became the first EU admin!');
        // Reload status to reflect changes
        await loadStatus();
        return true;
      } else {
        toast.error(response.message || 'Failed to become EU admin');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to become EU admin';
      toast.error(message);
      return false;
    }
  };

  const assignEURegion = async (userId: number): Promise<boolean> => {
    try {
      const response = await euAdminSetupService.assignEURegion(userId);
      
      if (response.success) {
        toast.success(response.message || 'Successfully assigned EU region to user');
        return true;
      } else {
        toast.error(response.message || 'Failed to assign EU region');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to assign EU region';
      toast.error(message);
      return false;
    }
  };

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  return {
    ...state,
    loadStatus,
    becomeFirstEUAdmin,
    assignEURegion,
    refresh: loadStatus
  };
};