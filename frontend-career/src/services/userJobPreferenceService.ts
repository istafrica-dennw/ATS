import api from "./api";

export interface UserJobPreferenceDTO {
  id?: number;
  email: string;
  categoryIds: number[];
  consentAccepted: boolean;
  consentAcceptedAt?: string;
  categoryNames?: string[];
  createdAt?: string;
}

export const userJobPreferenceService = {
  /**
   * Save user job preferences
   */
  savePreference: async (
    preference: UserJobPreferenceDTO
  ): Promise<UserJobPreferenceDTO> => {
    const response = await api.post("/user-job-preferences", preference);
    return response.data;
  },

  /**
   * Check if email already exists
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    const response = await api.get("/user-job-preferences/check-email", {
      params: { email },
    });
    return response.data;
  },
};

export default userJobPreferenceService;

