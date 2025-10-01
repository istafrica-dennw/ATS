/**
 * Utility functions for handling profile picture display with fallback logic
 */

export interface ProfilePictureData {
  profilePictureUrl?: string;
  linkedinProfileUrl?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

/**
 * Get the best available profile picture URL with fallback logic:
 * 1. User's uploaded profile picture (profilePictureUrl)
 * 2. LinkedIn profile picture (if available from LinkedIn profile URL)
 * 3. null (will show initials)
 */
export function getProfilePictureUrl(data: ProfilePictureData): string | null {
  // First priority: User's uploaded profile picture
  if (data.profilePictureUrl && data.profilePictureUrl.trim() !== '') {
    return data.profilePictureUrl;
  }

  // Second priority: Try to extract LinkedIn profile picture from LinkedIn profile URL
  if (data.linkedinProfileUrl && data.linkedinProfileUrl.trim() !== '') {
    const linkedinPictureUrl = getLinkedInProfilePictureUrl(data.linkedinProfileUrl);
    if (linkedinPictureUrl) {
      return linkedinPictureUrl;
    }
  }

  // No picture available, will show initials
  return null;
}

/**
 * Extract LinkedIn profile picture URL from LinkedIn profile URL
 * LinkedIn profile pictures follow the pattern: https://media.licdn.com/dms/image/[imageId]/profile-displayphoto-shrink_[size]_[size]/0/[timestamp]
 * We can construct a profile picture URL from the LinkedIn profile URL
 */
function getLinkedInProfilePictureUrl(linkedinProfileUrl: string): string | null {
  try {
    // Extract LinkedIn username from profile URL
    // URL format: https://www.linkedin.com/in/username or https://linkedin.com/in/username
    const match = linkedinProfileUrl.match(/linkedin\.com\/in\/([^/?]+)/);
    if (match && match[1]) {
      // LinkedIn profile pictures are typically available at:
      // https://media.licdn.com/dms/image/[imageId]/profile-displayphoto-shrink_[size]_[size]/0/[timestamp]
      // However, we can't construct this without the actual image ID from LinkedIn API
      // For now, we'll return null and let the system show initials
      // In a real implementation, you'd need to store the LinkedIn profile picture URL separately
      // or fetch it from LinkedIn API when the user authenticates
      return null;
    }
  } catch (error) {
    console.error('Error parsing LinkedIn profile URL:', error);
  }
  return null;
}

/**
 * Get user initials for fallback display
 */
export function getUserInitials(data: ProfilePictureData): string {
  if (data.name) {
    return data.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (data.firstName && data.lastName) {
    return `${data.firstName[0]}${data.lastName[0]}`.toUpperCase();
  }
  
  if (data.firstName) {
    return data.firstName.slice(0, 2).toUpperCase();
  }
  
  return 'U';
}

/**
 * Check if a user has any profile picture available (uploaded or LinkedIn)
 */
export function hasProfilePicture(data: ProfilePictureData): boolean {
  return getProfilePictureUrl(data) !== null;
}