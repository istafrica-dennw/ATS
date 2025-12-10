/**
 * Cookie-based authentication storage
 * Works for both localhost and subdomain production setup
 */

// Type definition for js-cookie (install with: npm install js-cookie @types/js-cookie)
declare const Cookies: any;

export const cookieAuth = {
  /**
   * Get the appropriate domain for cookie sharing
   * - localhost: undefined (cookies don't work across ports)
   * - production: .yourcompany.com (works across subdomains)
   */
  getDomain: (): string | undefined => {
    const hostname = window.location.hostname;

    // For localhost, don't set domain (won't work across ports anyway)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return undefined;
    }

    // For production, extract root domain
    // careers.yourcompany.com -> .yourcompany.com
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`; // Leading dot shares with subdomains
    }

    return hostname;
  },

  /**
   * Check if we're in production (subdomain) environment
   */
  isProduction: (): boolean => {
    const hostname = window.location.hostname;
    return hostname !== "localhost" && hostname !== "127.0.0.1";
  },

  /**
   * Store authentication token
   * Uses cookies in production, localStorage as fallback for localhost
   */
  setToken: (token: string, user?: any): void => {
    const domain = cookieAuth.getDomain();
    const isHttps = window.location.protocol === "https:";

    // Method 1: Cookie (works in production with subdomains)
    if (typeof Cookies !== "undefined") {
      try {
        Cookies.set("auth_token", token, {
          domain,
          secure: isHttps, // Only over HTTPS in production
          sameSite: "lax", // CSRF protection
          expires: 7, // 7 days
        });

        if (user) {
          Cookies.set("auth_user", JSON.stringify(user), {
            domain,
            secure: isHttps,
            sameSite: "lax",
            expires: 7,
          });
        }

        console.log(
          `[CookieAuth] Token stored in cookie (domain: ${
            domain || "same-origin"
          })`
        );
      } catch (error) {
        console.error("[CookieAuth] Error setting cookie:", error);
      }
    }

    // Method 2: localStorage (fallback for localhost)
    try {
      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      console.log("[CookieAuth] Token stored in localStorage (fallback)");
    } catch (error) {
      console.error("[CookieAuth] Error setting localStorage:", error);
    }
  },

  /**
   * Get authentication token
   * Tries cookie first (for production), falls back to localStorage
   */
  getToken: (): string | null => {
    // Try cookie first (works in production)
    if (typeof Cookies !== "undefined") {
      try {
        const cookieToken = Cookies.get("auth_token");
        if (cookieToken) {
          console.log("[CookieAuth] Token retrieved from cookie");
          return cookieToken;
        }
      } catch (error) {
        console.error("[CookieAuth] Error reading cookie:", error);
      }
    }

    // Fallback to localStorage (works everywhere)
    try {
      const localToken = localStorage.getItem("token");
      if (localToken) {
        console.log("[CookieAuth] Token retrieved from localStorage");
        return localToken;
      }
    } catch (error) {
      console.error("[CookieAuth] Error reading localStorage:", error);
    }

    return null;
  },

  /**
   * Get user data
   */
  getUser: (): any | null => {
    // Try cookie first
    if (typeof Cookies !== "undefined") {
      try {
        const cookieUser = Cookies.get("auth_user");
        if (cookieUser) {
          return JSON.parse(cookieUser);
        }
      } catch (error) {
        console.error("[CookieAuth] Error reading user cookie:", error);
      }
    }

    // Fallback to localStorage
    try {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        return JSON.parse(localUser);
      }
    } catch (error) {
      console.error("[CookieAuth] Error reading user localStorage:", error);
    }

    return null;
  },

  /**
   * Remove authentication token (logout)
   */
  removeToken: (): void => {
    const domain = cookieAuth.getDomain();

    // Clear cookie
    if (typeof Cookies !== "undefined") {
      try {
        Cookies.remove("auth_token", { domain });
        Cookies.remove("auth_user", { domain });
        console.log("[CookieAuth] Cookies cleared");
      } catch (error) {
        console.error("[CookieAuth] Error removing cookies:", error);
      }
    }

    // Clear localStorage
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      console.log("[CookieAuth] localStorage cleared");
    } catch (error) {
      console.error("[CookieAuth] Error clearing localStorage:", error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!cookieAuth.getToken();
  },
};

// For TypeScript compatibility
export default cookieAuth;
