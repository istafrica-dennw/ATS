export enum InterviewStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface InterviewResponse {
  title: string;
  feedback: string;
  rating: number; // 0-100
}

export interface ApplicationSummary {
  id: number;
  candidateName: string;
  candidateEmail: string;
  jobId: number;
  jobTitle: string;
  resumeUrl?: string;
  appliedAt: string;
}

export interface InterviewSkeleton {
  id: number;
  name: string;
  description?: string;
  focusAreas: FocusArea[];
}

export interface FocusArea {
  title: string;
  description?: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  interviewerId: number;
  interviewerName: string;
  interviewerEmail: string;
  skeletonId: number;
  skeletonName: string;
  responses: InterviewResponse[];
  status: InterviewStatus;
  scheduledAt?: string;
  completedAt?: string;
  assignedById: number;
  assignedByName: string;
  createdAt: string;
  updatedAt: string;
  application: ApplicationSummary;
  skeleton: InterviewSkeleton;
}

export interface CreateInterviewSkeletonRequest {
  name: string;
  description?: string;
  focusAreas: CreateFocusAreaRequest[];
}

export interface CreateFocusAreaRequest {
  title: string;
  description?: string;
}

export interface AssignInterviewRequest {
  applicationId: number;
  interviewerId: number;
  skeletonId: number;
  scheduledAt?: string;
  notes?: string;
}

export interface SubmitInterviewRequest {
  responses: SubmitInterviewResponseRequest[];
}

export interface SubmitInterviewResponseRequest {
  title: string;
  feedback: string;
  rating: number;
}

export interface InterviewSkeletonDTO {
  id: number;
  name: string;
  description?: string;
  focusAreas: FocusArea[];
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
} 