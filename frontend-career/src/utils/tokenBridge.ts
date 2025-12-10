/**
 * Token Bridge - Syncs authentication tokens between Admin Portal and Career Portal
 * Uses postMessage API for cross-origin communication
 */

const ADMIN_PORTAL_URL =
  process.env.REACT_APP_ADMIN_URL || "http://localhost:3001";

export const tokenBridge = {
  /**
   * Initialize token bridge for Career Portal
   * Requests token from Admin Portal on startup
   */
  initCareerBridge: () => {
    // Listen for token updates from Admin Portal
    window.addEventListener("message", (event) => {
      // Verify origin for security
      if (event.origin !== ADMIN_PORTAL_URL) {
        return;
      }

      // Handle token response
      if (
        event.data.type === "TOKEN_RESPONSE" ||
        event.data.type === "TOKEN_UPDATE"
      ) {
        const { token, user } = event.data;

        console.log(
          "[TokenBridge] Received token from Admin Portal:",
          token ? "✅" : "❌"
        );

        if (token) {
          localStorage.setItem("token", token);
          console.log("[TokenBridge] Token stored in Career Portal");
        }

        if (user) {
          localStorage.setItem("user", user);
          console.log("[TokenBridge] User data stored in Career Portal");
        }
      }

      // Handle logout notification
      if (event.data.type === "LOGOUT") {
        console.log(
          "[TokenBridge] Received logout notification from Admin Portal"
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("[TokenBridge] Cleared auth data in Career Portal");
      }
    });

    // Request token from Admin Portal
    tokenBridge.requestTokenFromAdmin();

    console.log("[TokenBridge] Career bridge initialized");
  },

  /**
   * Request token from Admin Portal
   * Opens Admin Portal in hidden iframe and requests token
   */
  requestTokenFromAdmin: () => {
    try {
      // Create hidden iframe pointing to Admin Portal
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = ADMIN_PORTAL_URL;

      iframe.onload = () => {
        // Request token from Admin Portal
        iframe.contentWindow?.postMessage(
          {
            type: "REQUEST_TOKEN",
          },
          ADMIN_PORTAL_URL
        );

        console.log("[TokenBridge] Sent token request to Admin Portal");

        // Remove iframe after receiving response
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("[TokenBridge] Error requesting token:", error);
    }
  },

  /**
   * Check if token exists in localStorage
   */
  hasToken: (): boolean => {
    return !!localStorage.getItem("token");
  },

  /**
   * Notify Admin Portal of logout
   */
  notifyLogout: () => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = ADMIN_PORTAL_URL;

      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          {
            type: "LOGOUT",
          },
          ADMIN_PORTAL_URL
        );

        console.log("[TokenBridge] Notified Admin Portal of logout");

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("[TokenBridge] Error notifying logout:", error);
    }
  },
};

