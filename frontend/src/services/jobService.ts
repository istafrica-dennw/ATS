import axiosInstance from '../utils/axios';

export interface JobDTO {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  postedDate: string;
  workSetting: string;
  jobStatus: string;
  salaryRange: string;
  customQuestions?: any[];
}

export const jobService = {
  // Get job by ID
  getJobById: async (jobId: number): Promise<JobDTO> => {
    const response = await axiosInstance.get(`/jobs/${jobId}`);
    return response.data;
  },
  
  // Get all jobs (returns list directly, not paginated)
  getAllJobs: async (): Promise<JobDTO[]> => {
    const response = await axiosInstance.get(`/jobs`);
    return response.data;
  }
};
