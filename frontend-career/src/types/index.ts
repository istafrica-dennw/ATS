export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location: string;
  salaryRange?: string;
  employmentType: string; // Full Time, Part Time, Contract
  workSetting: string; // ONSITE, HYBRID, REMOTE
  jobStatus: string; // PUBLISHED, DRAFT, CLOSED, EXPIRED
  postedDate?: string;
  department?: string;
  skills?: string[];
}

export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeFile: File | null;
  coverLetter: string;
}

export interface Application {
  id: number;
  jobId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumePath: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
}
