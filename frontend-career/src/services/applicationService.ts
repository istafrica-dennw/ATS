import api from "./api";
import { ApplicationFormData, Application } from "../types";

export const applicationService = {
  /**
   * Submit a job application
   * Endpoint: POST /api/applications
   * Requires authentication (token automatically added by interceptor)
   *
   * Backend expects:
   * - applicationDTO: JSON object with jobId and optional fields
   * - files: MultipartFile[] for resume and cover letter
   */
  submitApplication: async (
    jobId: string,
    formData: ApplicationFormData
  ): Promise<Application> => {
    const formDataToSend = new FormData();

    // Create ApplicationDTO object matching backend structure
    const applicationDTO = {
      jobId: Number(jobId),
      answers: [], // Empty for now, will add custom questions support later
    };

    // Append applicationDTO as JSON blob
    const applicationBlob = new Blob([JSON.stringify(applicationDTO)], {
      type: "application/json",
    });
    formDataToSend.append("applicationDTO", applicationBlob);

    // Append files array
    const files: File[] = [];

    if (formData.resumeFile) {
      files.push(formData.resumeFile);
    }

    // If cover letter is provided as text, create a file
    if (formData.coverLetter && formData.coverLetter.trim()) {
      const coverLetterBlob = new Blob([formData.coverLetter], {
        type: "text/plain",
      });
      const coverLetterFile = new File([coverLetterBlob], "cover_letter.txt", {
        type: "text/plain",
      });
      files.push(coverLetterFile);
    }

    // Append files
    files.forEach((file) => {
      formDataToSend.append("files", file);
    });

    // Submit application (token automatically added by interceptor)
    const response = await api.post("/applications", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Get application by ID
   * Requires authentication
   */
  getApplicationById: async (applicationId: string): Promise<Application> => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  /**
   * Get all applications for current user
   * Requires authentication
   */
  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get("/applications/my-applications");
    return response.data.content || response.data; // Handle paginated or array response
  },

  /**
   * Check if user has already applied to a job
   * Requires authentication
   */
  checkApplicationStatus: async (
    jobId: string
  ): Promise<{ hasApplied: boolean }> => {
    const response = await api.get(`/applications/check-status/${jobId}`);
    return response.data;
  },

  /**
   * Withdraw an application
   * Requires authentication
   */
  withdrawApplication: async (
    applicationId: string
  ): Promise<{ message: string }> => {
    const response = await api.patch(`/applications/${applicationId}/withdraw`);
    return response.data;
  },
};
