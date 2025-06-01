import axios from 'axios';

const API_URL = '/api/applications';

export interface ApplicationDTO {
  id?: number;
  jobId: number;
  candidateId?: number;
  resumeUrl?: string;
  coverLetterUrl?: string;
  status?: string;
  submissionDate?: string;
  answers: ApplicationAnswer[];
}

export interface ApplicationAnswer {
  questionId: number;
  answer: string;
}

export const applicationService = {
  // Submit a job application
  submitApplication: async (application: ApplicationDTO) => {
    try {
      const response = await axios.post(API_URL, application);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if user has already applied to a job
  checkApplicationStatus: async (jobId: number) => {
    try {
      const response = await axios.get(`${API_URL}/check-status/${jobId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's applications
  getMyApplications: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(`${API_URL}/my-applications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (applicationId: number) => {
    try {
      const response = await axios.get(`${API_URL}/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an application
  deleteApplication: async (applicationId: number) => {
    try {
      await axios.delete(`${API_URL}/${applicationId}`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default applicationService;
