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

export interface ResumeAnalysis {
  total_experience_years: number;
  total_companies_worked: number;
  current_company: string;
  current_position: string;
  previous_positions?: Array<{
    company: string;
    position: string;
    duration_months: number;
    start_date: string;
    end_date: string;
    responsibilities: string[];
  }>;
  skills_extracted: string[];
  education?: Array<{
    degree: string;
    institution: string;
    graduation_year: number;
    grade: string;
  }>;
  resume_score: {
    overall_score: number;
    job_match_score: number;
    experience_score: number;
    skills_match_score: number;
    scoring_criteria: {
      required_skills_match: number;
      experience_level_match: number;
      industry_relevance: number;
      education_level_match: number;
    };
  };
  analysis_metadata: {
    processed_at: string;
    ai_model_used: string;
    confidence_score: number;
    processing_time_ms: number;
    processingNotes: string[];
  };
}

export interface ApplicationSummary {
  id: number;
  candidateName: string;
  candidateEmail: string;
  candidateProfilePictureUrl?: string;
  candidateLinkedinProfileUrl?: string;
  jobId: number;
  jobTitle: string;
  resumeUrl?: string;
  appliedAt: string;
  resumeAnalysis?: ResumeAnalysis;
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
  durationMinutes?: number;
  locationType: 'OFFICE' | 'ONLINE';
  locationAddress?: string;
  notes?: string;
  sendCalendarInvite?: boolean;
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