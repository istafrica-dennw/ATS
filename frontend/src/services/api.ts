import axiosInstance from '../utils/axios';
import {
  Interview,
  InterviewSkeletonDTO,
  CreateInterviewSkeletonRequest,
  AssignInterviewRequest,
  SubmitInterviewRequest,
  ApplicationSummary,
  InterviewStatus
} from '../types/interview';
import { User } from '../types/user';

// Interview Skeleton API
export const interviewSkeletonAPI = {
  // Create a new interview skeleton
  create: (data: CreateInterviewSkeletonRequest) =>
    axiosInstance.post<InterviewSkeletonDTO>('/interview-skeletons', data),

  // Update an existing interview skeleton
  update: (id: number, data: CreateInterviewSkeletonRequest) =>
    axiosInstance.put<InterviewSkeletonDTO>(`/interview-skeletons/${id}`, data),

  // Get skeleton by ID
  getById: (id: number) =>
    axiosInstance.get<InterviewSkeletonDTO>(`/interview-skeletons/${id}`),

  // Get all skeletons for a job
  getByJobId: (jobId: number) =>
    axiosInstance.get<InterviewSkeletonDTO[]>(`/interview-skeletons/job/${jobId}`),

  // Get skeletons created by current admin
  getMySkeletons: () =>
    axiosInstance.get<InterviewSkeletonDTO[]>('/interview-skeletons/my-skeletons'),

  // Get all skeletons (admin only)
  getAll: () =>
    axiosInstance.get<InterviewSkeletonDTO[]>('/interview-skeletons'),

  // Delete a skeleton
  delete: (id: number) =>
    axiosInstance.delete(`/interview-skeletons/${id}`)
};

// Interview API
export const interviewAPI = {
  // Assign an interview to an interviewer (admin only)
  assign: (data: AssignInterviewRequest) =>
    axiosInstance.post<Interview>('/interviews/assign', data),

  // Start an interview (interviewer only)
  startInterview: (interviewId: number) =>
    axiosInstance.post<Interview>(`/interviews/${interviewId}/start`),

  // Submit interview responses (interviewer only)
  submit: (interviewId: number, data: SubmitInterviewRequest) =>
    axiosInstance.post<Interview>(`/interviews/${interviewId}/submit`, data),

  // Get interview by ID
  getById: (interviewId: number) =>
    axiosInstance.get<Interview>(`/interviews/${interviewId}`),

  // Get all interviews for current interviewer
  getMyInterviews: () =>
    axiosInstance.get<Interview[]>('/interviews/my-interviews'),

  // Get interviews for current interviewer by status
  getMyInterviewsByStatus: (status: InterviewStatus) =>
    axiosInstance.get<Interview[]>(`/interviews/my-interviews/status/${status}`),

  // Get all interviews for an application (admin only)
  getByApplicationId: (applicationId: number) =>
    axiosInstance.get<Interview[]>(`/interviews/application/${applicationId}`),

  // Get all interviews for a job (admin only)
  getByJobId: (jobId: number) =>
    axiosInstance.get<Interview[]>(`/interviews/job/${jobId}`),

  // Get interviews assigned by current admin
  getAssignedByMe: () =>
    axiosInstance.get<Interview[]>('/interviews/assigned-by-me'),

  // Get all completed interviews for admin results viewing
  getAllCompletedInterviews: () =>
    axiosInstance.get<Interview[]>('/interviews/completed'),

  // Shortlist an application (admin only)
  shortlistApplication: (applicationId: number) =>
    axiosInstance.post(`/interviews/applications/${applicationId}/shortlist`),

  // Get shortlisted applications for a job (admin only)
  getShortlistedApplications: (jobId: number) =>
    axiosInstance.get<ApplicationSummary[]>(`/interviews/applications/shortlisted/${jobId}`),

  // Get all shortlisted applications across all jobs (admin only)
  getAllShortlistedApplications: () =>
    axiosInstance.get<ApplicationSummary[]>('/interviews/applications/shortlisted'),

  // Get available interviewers (admin only)
  getAvailableInterviewers: () =>
    axiosInstance.get<User[]>('/interviews/interviewers'),

  // Get interviews for current candidate (candidate only)
  getMyCandidateInterviews: () =>
    axiosInstance.get<Interview[]>('/interviews/my-candidate-interviews'),

  // Cancel an interview assignment (admin only)
  cancelInterview: (interviewId: number) =>
    axiosInstance.delete(`/interviews/${interviewId}`)
};

// Skeleton Job Association API
export const skeletonJobAssociationAPI = {
  // Associate skeleton with jobs
  associateSkeletonWithJobs: (data: { skeletonId: number; jobIds: number[] }) =>
    axiosInstance.post('/skeleton-job-associations', data),

  // Remove skeleton-job association
  removeSkeletonJobAssociation: (skeletonId: number, jobId: number) =>
    axiosInstance.delete(`/skeleton-job-associations/skeleton/${skeletonId}/job/${jobId}`),

  // Get all skeletons with their job associations
  getSkeletonsWithJobs: () =>
    axiosInstance.get('/skeleton-job-associations/skeletons-with-jobs'),

  // Get skeleton IDs for a job
  getSkeletonIdsByJobId: (jobId: number) =>
    axiosInstance.get<number[]>(`/skeleton-job-associations/job/${jobId}/skeletons`),

  // Get focus areas for a job
  getFocusAreasForJob: (jobId: number) =>
    axiosInstance.get<string[]>(`/skeleton-job-associations/job/${jobId}/focus-areas`),

  // Check if skeleton is associated with job
  isSkeletonAssociatedWithJob: (skeletonId: number, jobId: number) =>
    axiosInstance.get<boolean>(`/skeleton-job-associations/skeleton/${skeletonId}/job/${jobId}/exists`)
}; 