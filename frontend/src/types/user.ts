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
  birthDate?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
  deactivationReason?: string;
  deactivationDate?: string;
  authenticationMethod?: string;
  isEmailPasswordEnabled?: boolean;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface UserFormData extends Omit<User, 'id' | 'lastLogin'> {
  password?: string;
  confirmPassword?: string;
}

export interface DeactivationRequest {
  reason: string;
} 