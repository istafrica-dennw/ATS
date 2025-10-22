import axiosInstance from '../utils/axios';

export interface GeolocationResponse {
  success: boolean;
  ip?: string;
  region?: string;
  isEU?: boolean;
  isRwanda?: boolean;
  message?: string;
}

export const geolocationService = {
  /**
   * Detect the user's region based on their IP address
   */
  detectRegion: async (): Promise<GeolocationResponse> => {
    try {
      const response = await axiosInstance.get('/geolocation/detect');
      return response.data;
    } catch (error) {
      console.error('Error detecting region:', error);
      return {
        success: false,
        message: 'Failed to detect region'
      };
    }
  },

  /**
   * Check if the user is accessing from EU region
   */
  checkEUAccess: async (): Promise<GeolocationResponse> => {
    try {
      const response = await axiosInstance.get('/geolocation/check-eu');
      return response.data;
    } catch (error) {
      console.error('Error checking EU access:', error);
      return {
        success: false,
        message: 'Failed to check EU access'
      };
    }
  }
};

export default geolocationService;