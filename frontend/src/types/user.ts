export enum Role {
  ADMIN = 'ADMIN',
  CANDIDATE = 'CANDIDATE',
  INTERVIEWER = 'INTERVIEWER',
  HIRING_MANAGER = 'HIRING_MANAGER'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department?: string;
  linkedinProfileUrl?: string;
  profilePictureUrl?: string;
  authenticationMethod?: string;
  isEmailPasswordEnabled?: boolean;
  lastLogin?: Date;
  isActive?: boolean;
} 