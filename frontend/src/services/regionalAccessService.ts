import axiosInstance from '../utils/axios';

export interface RegionalAccessInfo {
  accessibleRegion: string | null;
  isEUAdmin: boolean;
  isNonEUAdmin: boolean;
  regionFilter: string | null;
  userRegion: string | null;
}

export const regionalAccessService = {
  /**
   * Get regional access information for the current user
   */
  getRegionalAccess: async (): Promise<RegionalAccessInfo> => {
    try {
      const response = await axiosInstance.get('/users/regional-access');
      return response.data;
    } catch (error) {
      console.error('Error getting regional access information:', error);
      throw error;
    }
  }
};

export default regionalAccessService;