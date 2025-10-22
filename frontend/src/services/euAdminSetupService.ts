import axiosInstance from '../utils/axios';

export interface EUAdminSetupStatus {
  hasEUAdmin: boolean;
  canBecomeFirstEUAdmin: boolean;
  canAssignEURegion: boolean;
  isEUAccess: boolean;
  clientIP: string;
  currentUserRegion: string | null;
}

export interface EUAdminSetupResponse {
  success: boolean;
  message?: string;
  user?: any;
}

export const euAdminSetupService = {
  /**
   * Get EU admin setup status
   */
  getSetupStatus: async (): Promise<EUAdminSetupStatus> => {
    try {
      const response = await axiosInstance.get('/eu-admin-setup/status');
      return response.data;
    } catch (error) {
      console.error('Error getting EU admin setup status:', error);
      throw error;
    }
  },

  /**
   * Become the first EU admin
   */
  becomeFirstEUAdmin: async (): Promise<EUAdminSetupResponse> => {
    try {
      const response = await axiosInstance.post('/eu-admin-setup/become-first-eu-admin');
      return response.data;
    } catch (error) {
      console.error('Error becoming first EU admin:', error);
      throw error;
    }
  },

  /**
   * Assign EU region to a user
   */
  assignEURegion: async (userId: number): Promise<EUAdminSetupResponse> => {
    try {
      const response = await axiosInstance.post(`/eu-admin-setup/assign-eu-region/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning EU region:', error);
      throw error;
    }
  }
};

export default euAdminSetupService;