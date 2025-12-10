import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add authentication token
api.interceptors.request.use(
  (config) => {
    let token = null;

    // Try to get token from localStorage
    try {
      token = localStorage.getItem("token");
    } catch (e) {
      console.error("[API] Error accessing localStorage:", e);
    }

    // Try sessionStorage as fallback
    if (!token) {
      try {
        token = sessionStorage.getItem("token");
      } catch (e) {
        console.error("[API] Error accessing sessionStorage:", e);
      }
    }

    // Add Authorization header if token exists
    if (token) {
      const formattedToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
      console.log(
        `[API] Request to ${config.url} - Token: ${
          token ? "✅ Added" : "❌ Missing"
        }`
      );
    } else {
      console.log(`[API] Request to ${config.url} - No token (public request)`);
    }

    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] Response from ${response.config.url} - Status: ${response.status} ✅`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API] Error ${error.response.status} from ${error.config?.url}:`,
        error.response.data
      );

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn(
          "[API] 401 Unauthorized - Token may be invalid or expired"
        );

        // Clear any stored auth data
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          console.log("[API] Auth data cleared");
        } catch (e) {
          console.error("[API] Error clearing auth data:", e);
        }

        // Only show toast if not on auth/public pages
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/apply") &&
          !window.location.pathname.includes("/jobs")
        ) {
          toast.error("Session expired. Please log in to the Admin Portal.");
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.warn("[API] 403 Forbidden - Access denied");
        toast.error("You don't have permission to perform this action.");
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.warn("[API] 404 Not Found");
      }

      // Handle 409 Conflict (e.g., already applied)
      if (error.response.status === 409) {
        console.warn("[API] 409 Conflict - Resource conflict");
        if (error.response.data?.error) {
          toast.error(error.response.data.error);
        }
      }
    } else {
      console.error("[API] Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
