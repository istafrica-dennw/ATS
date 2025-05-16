/**
 * Utility functions for handling image URLs
 */

/**
 * Ensures a profile picture URL is properly formatted
 * @param {string} url - The profile picture URL
 * @returns {string} - A properly formatted URL
 */
export const getFullProfilePictureUrl = (url) => {
  if (!url) return '';
  
  // If it's already an absolute URL (external source like LinkedIn), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Extract just the filename in case the URL includes the full path
  let filename = url;
  
  // Remove the API prefix if it exists
  if (filename.includes('/api/files/profile-pictures/')) {
    filename = filename.substring(filename.lastIndexOf('/api/files/profile-pictures/') + '/api/files/profile-pictures/'.length);
  }
  // Remove any path components if present
  else if (filename.includes('/')) {
    filename = filename.substring(filename.lastIndexOf('/') + 1);
  }
  
  // When running in Docker, use the same origin where the app is hosted
  // This allows the frontend to access the backend through whatever proxy is set up
  return `/api/files/profile-pictures/${filename}`;
}; 