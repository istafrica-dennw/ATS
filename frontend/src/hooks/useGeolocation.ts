import { useState, useEffect } from 'react';
import { geolocationService, GeolocationResponse } from '../services/geolocationService';
import { Region } from '../types/user';

interface GeolocationState {
  region: Region | null;
  isEU: boolean;
  isRwanda: boolean;
  ip: string | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    region: null,
    isEU: false,
    isRwanda: false,
    ip: null,
    loading: true,
    error: null
  });

  const detectRegion = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await geolocationService.detectRegion();
      
      if (response.success) {
        setState({
          region: response.region as Region || null,
          isEU: response.isEU || false,
          isRwanda: response.isRwanda || false,
          ip: response.ip || null,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to detect region'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error while detecting region'
      }));
    }
  };

  const checkEUAccess = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await geolocationService.checkEUAccess();
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isEU: response.isEU || false,
          ip: response.ip || null,
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to check EU access'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error while checking EU access'
      }));
    }
  };

  // Auto-detect region on mount
  useEffect(() => {
    detectRegion();
  }, []);

  return {
    ...state,
    detectRegion,
    checkEUAccess,
    refresh: detectRegion
  };
};