export enum Role {
  ADMIN = 'ADMIN',
  CANDIDATE = 'CANDIDATE',
  INTERVIEWER = 'INTERVIEWER',
  HIRING_MANAGER = 'HIRING_MANAGER'
}

export enum Region {
  EU = 'EU',
  RW = 'RW',
  OTHER = 'OTHER'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department?: string;
  region?: string;
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
  isEmailVerified?: boolean;
  mfaEnabled?: boolean;
  isSubscribed?: boolean;
  privacyPolicyAccepted?: boolean;
  privacyPolicyAcceptedAt?: string;
  applicationConsentGiven?: boolean;
  applicationConsentGivenAt?: string;
  connectConsentGiven?: boolean;
  connectConsentGivenAt?: string;
}

export interface UserFormData extends Omit<User, 'id' | 'lastLogin'> {
  password?: string;
  confirmPassword?: string;
}

export interface DeactivationRequest {
  reason: string;
} 