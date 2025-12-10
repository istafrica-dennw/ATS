/**
 * Authentication utilities for cross-app token sharing
 * between Admin Portal (3001) and Career Portal (3002)
 */

export const authUtils = {
  /**
   * Check URL for token parameter and store it
   * Call this on app initialization
   */
  syncTokenFromUrl: (): void => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token) {
      try {
        // Store token in localStorage
        localStorage.setItem("token", token);
        console.log("Token synced from URL");

        // Store user data if provided
        if (user) {
          localStorage.setItem("user", decodeURIComponent(user));
          console.log("User data synced from URL");
        }

        // Clean up URL (remove token from address bar for security)
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState(
          {},
          document.title,
          url.pathname + url.search
        );
      } catch (e) {
        console.error("Error syncing token from URL:", e);
      }
    }
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    try {
      return localStorage.getItem("token") || sessionStorage.getItem("token");
    } catch (e) {
      console.error("Error getting token:", e);
      return null;
    }
  },

  /**
   * Get stored user data
   */
  getUser: (): any | null => {
    try {
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error getting user:", e);
      return null;
    }
  },

  /**
   * Store token and user data
   */
  setAuthData: (token: string, user: any): void => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.error("Error storing auth data:", e);
    }
  },

  /**
   * Clear all auth data
   */
  clearAuthData: (): void => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } catch (e) {
      console.error("Error clearing auth data:", e);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },

  /**
   * Generate URL with token for cross-app navigation
   * @param baseUrl - Target URL (e.g., 'http://localhost:3002/jobs')
   * @returns URL with token parameter
   */
  generateAuthUrl: (baseUrl: string): string => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();

    if (!token) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    url.searchParams.set("token", token);

    if (user) {
      url.searchParams.set("user", encodeURIComponent(JSON.stringify(user)));
    }

    return url.toString();
  },

  /**
   * Navigate to Admin Portal with current auth
   */
  navigateToAdmin: (path: string = ""): void => {
    const adminUrl = process.env.REACT_APP_ADMIN_URL || "http://localhost:3001";
    const fullUrl = authUtils.generateAuthUrl(`${adminUrl}${path}`);
    window.location.href = fullUrl;
  },

  /**
   * Navigate to Career Portal with current auth
   */
  navigateToCareer: (path: string = ""): void => {
    const careerUrl =
      process.env.REACT_APP_CAREER_URL || "http://localhost:3002";
    const fullUrl = authUtils.generateAuthUrl(`${careerUrl}${path}`);
    window.location.href = fullUrl;
  },
};

