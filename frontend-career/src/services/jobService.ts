import api from "./api";
import { Job, CustomQuestion } from "../types/job";

export const jobService = {
  /**
   * Get all published jobs
   */
  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get("/jobs");
    // Filter to only show published and reopened jobs
    return response.data.filter((job: Job) => {
      const status = job.jobStatus?.toUpperCase();
      return status === "PUBLISHED" || status === "REOPENED";
    });
  },

  /**
   * Get a single job by ID
   */
  getJobById: async (id: number): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Get custom questions for a job
   */
  getJobCustomQuestions: async (jobId: number): Promise<CustomQuestion[]> => {
    const response = await api.get(`/jobs/${jobId}/custom-questions`);
    return response.data;
  },

  /**
   * Get unique departments from jobs
   */
  getDepartments: async (): Promise<string[]> => {
    const jobs = await jobService.getAllJobs();
    const departments = [
      ...new Set(jobs.map((job) => job.department).filter(Boolean)),
    ];
    return departments.sort();
  },

  /**
   * Get unique locations from jobs
   */
  getLocations: async (): Promise<string[]> => {
    const jobs = await jobService.getAllJobs();
    const locations = [
      ...new Set(jobs.map((job) => job.location).filter(Boolean)),
    ];
    return locations.sort();
  },
};

export default jobService;
