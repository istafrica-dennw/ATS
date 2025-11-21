import axiosInstance from '../utils/axios';

export interface RegionViewModeResponse {
  isEUAdmin: boolean;
  viewingAsNonEU: boolean;
  canToggle: boolean;
  effectiveFilter: string | null;
}

const regionViewAPI = {
  /**
   * Get current region view mode
   */
  getRegionViewMode: async (): Promise<RegionViewModeResponse> => {
    const response = await axiosInstance.get('/users/region-view-mode');
    return response.data;
  },

  /**
   * Toggle region view mode (EU admins can switch to view non-EU data)
   */
  toggleRegionView: async (viewingAsNonEU: boolean): Promise<any> => {
    const response = await axiosInstance.post('/users/toggle-region-view', null, {
      params: { viewingAsNonEU }
    });
    return response.data;
  },
};

export default regionViewAPI;

