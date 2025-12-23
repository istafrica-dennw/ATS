export type WorkSetting = "REMOTE" | "ONSITE" | "HYBRID";
export type JobStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED"
  | "EXPIRED"
  | "REOPENED";

export interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  postedDate: string;
  workSetting: WorkSetting;
  jobStatus: JobStatus;
  salaryRange: string;
  region?: string;
  expirationDate?: string;
  customQuestions?: CustomQuestion[];
}

export interface CustomQuestion {
  id: number;
  question: string;
  questionType: "TEXT" | "TEXTAREA" | "SELECT" | "MULTI_SELECT" | "BOOLEAN";
  required: boolean;
  options?: string[];
}

export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
  isHeadquarters?: boolean;
}

export interface FilterOptions {
  workSettings: WorkSetting[];
  departments: string[];
  locations: string[];
}
