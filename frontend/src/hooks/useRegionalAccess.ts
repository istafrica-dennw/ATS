import { useState, useEffect } from 'react';
import { regionalAccessService, RegionalAccessInfo } from '../services/regionalAccessService';

interface RegionalAccessState {
  accessInfo: RegionalAccessInfo | null;
  loading: boolean;
  error: string | null;
}

export const useRegionalAccess = () => {
  const [state, setState] = useState<RegionalAccessState>({
    accessInfo: null,
    loading: true,
    error: null
  });

  const loadAccessInfo = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const accessInfo = await regionalAccessService.getRegionalAccess();
      setState({
        accessInfo,
        loading: false,
        error: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load regional access information'
      }));
    }
  };

  // Load access info on mount
  useEffect(() => {
    loadAccessInfo();
  }, []);

  return {
    ...state,
    loadAccessInfo,
    refresh: loadAccessInfo
  };
};