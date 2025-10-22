import axiosInstance from '../utils/axios';
import { Region } from '../types/user';

export interface RegionAssignmentRequest {
  userId: number;
  region: Region;
}

export interface RegionAssignmentResponse {
  success: boolean;
  message?: string;
  user?: any;
}

export const regionManagementService = {
  /**
   * Assign a region to a user
   */
  assignRegion: async (userId: number, region: Region): Promise<RegionAssignmentResponse> => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/region`, { region });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning region:', error);
      throw error;
    }
  },

  /**
   * Remove region from a user (set to null)
   */
  removeRegion: async (userId: number): Promise<RegionAssignmentResponse> => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/region`, { region: null });
      return response.data;
    } catch (error: any) {
      console.error('Error removing region:', error);
      throw error;
    }
  },

  /**
   * Get available regions for assignment
   */
  getAvailableRegions: (): { value: Region; label: string; description: string }[] => {
    return [
      {
        value: Region.EU,
        label: 'Europe (EU)',
        description: 'GDPR region - European Union countries'
      },
      {
        value: Region.RW,
        label: 'Rwanda',
        description: 'Rwanda region'
      },
      {
        value: Region.OTHER,
        label: 'Other',
        description: 'Other regions'
      }
    ];
  }
};

export default regionManagementService;