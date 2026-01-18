/**
 * Get the main frontend (ATS dashboard) URL
 * In development, this points to localhost:3001
 * In production, this should be configured via environment variable
 */
export const getMainFrontendUrl = (): string => {
  // Check for environment variable first
  if (process.env.REACT_APP_MAIN_FRONTEND_URL) {
    return process.env.REACT_APP_MAIN_FRONTEND_URL;
  }

  // In development on localhost, use port 3001
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3001";
  }

  // In production, assume same domain (the main frontend handles routing)
  return "";
};

/**
 * Get the apply URL for a job, redirecting to the main frontend
 */
export const getApplyUrl = (jobId: number | string): string => {
  const mainFrontendUrl = getMainFrontendUrl();
  const returnUrl = encodeURIComponent(`/apply/${jobId}`);
  return `${mainFrontendUrl}/apply/${jobId}?returnUrl=${returnUrl}`;
};
