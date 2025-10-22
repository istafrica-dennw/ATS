import { useState, useCallback } from 'react';
import { Region } from '../types/user';
import { regionManagementService } from '../services/regionManagementService';
import { toast } from 'react-toastify';

interface RegionManagementState {
  isAssigning: boolean;
  error: string | null;
}

export const useRegionManagement = () => {
  const [state, setState] = useState<RegionManagementState>({
    isAssigning: false,
    error: null
  });

  const assignRegion = useCallback(async (userId: number, region: Region, userName: string) => {
    setState(prev => ({ ...prev, isAssigning: true, error: null }));
    
    try {
      await regionManagementService.assignRegion(userId, region);
      toast.success(`Successfully assigned ${region} region to ${userName}`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to assign region';
      setState(prev => ({ ...prev, error: message }));
      toast.error(message);
      return false;
    } finally {
      setState(prev => ({ ...prev, isAssigning: false }));
    }
  }, []);

  const removeRegion = useCallback(async (userId: number, userName: string) => {
    setState(prev => ({ ...prev, isAssigning: true, error: null }));
    
    try {
      await regionManagementService.removeRegion(userId);
      toast.success(`Successfully removed region from ${userName}`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove region';
      setState(prev => ({ ...prev, error: message }));
      toast.error(message);
      return false;
    } finally {
      setState(prev => ({ ...prev, isAssigning: false }));
    }
  }, []);

  const getAvailableRegions = useCallback(() => {
    return regionManagementService.getAvailableRegions();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    assignRegion,
    removeRegion,
    getAvailableRegions,
    clearError
  };
};