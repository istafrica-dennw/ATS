import axios from 'axios';

export interface JobDTO {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary: string;
  benefits: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export const jobService = {
  // Get job by ID
  getJobById: async (jobId: number): Promise<JobDTO> => {
    const response = await axios.get(`/api/jobs/${jobId}`);
    return response.data;
  },
  
  // Get all jobs
  getAllJobs: async (page = 0, size = 10): Promise<{
    content: JobDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    const response = await axios.get(`/api/jobs?page=${page}&size=${size}`);
    return response.data;
  }
};
