import api from "./api";
import { Job } from "../types";

export const jobService = {
  /**
   * Get all jobs with optional filters
   * Matches backend: GET /api/jobs?jobStatuses=PUBLISHED&workSetting=REMOTE&description=keyword
   */
  getAllJobs: async (filters?: {
    jobStatuses?: string[];
    workSetting?: string[];
    description?: string;
  }): Promise<Job[]> => {
    const params = new URLSearchParams();

    // Add filters if provided
    if (filters?.jobStatuses) {
      filters.jobStatuses.forEach((status) =>
        params.append("jobStatuses", status)
      );
    }
    if (filters?.workSetting) {
      filters.workSetting.forEach((setting) =>
        params.append("workSetting", setting)
      );
    }
    if (filters?.description) {
      params.append("description", filters.description);
    }

    const response = await api.get(
      `/jobs${params.toString() ? "?" + params.toString() : ""}`
    );
    return response.data;
  },

  /**
   * Get a specific job by ID
   * Matches backend: GET /api/jobs/{id}
   */
  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Get only published jobs (for public career portal)
   */
  getPublishedJobs: async (searchTerm?: string): Promise<Job[]> => {
    return jobService.getAllJobs({
      jobStatuses: ["PUBLISHED"],
      description: searchTerm,
    });
  },
};
