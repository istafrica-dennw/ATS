import axiosInstance from '../utils/axios';

export interface ApplicationDTO {
  id: number;
  jobId: number;
  candidateId: number;
  status: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  createdAt?: string;
  updatedAt?: string;
  // We'll need to transform this data to display job title
}

export interface ApplicationsResponse {
  content: ApplicationDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const candidateService = {
  // Get all applications for the logged-in candidate
  getMyApplications: async (page = 0, size = 10): Promise<ApplicationsResponse> => {
    const response = await axiosInstance.get(`/applications/my-applications?page=${page}&size=${size}`);
    return response.data;
  },

  // Get application statistics
  getApplicationStats: async (): Promise<{
    totalApplications: number;
    interviews: number;
    offers: number;
    rejections: number;
  }> => {
    const response = await axiosInstance.get('/applications/my-statistics');
    return response.data;
  }
};
