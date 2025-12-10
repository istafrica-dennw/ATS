/**
 * Token Bridge - Syncs authentication tokens between Admin Portal and Career Portal
 * Uses postMessage API for cross-origin communication
 */

const CAREER_PORTAL_URL =
  process.env.REACT_APP_CAREER_URL || "http://localhost:3002";
const ADMIN_PORTAL_URL =
  process.env.REACT_APP_ADMIN_URL || "http://localhost:3001";

export const tokenBridge = {
  /**
   * Initialize token bridge for Admin Portal
   * Listens for token requests from Career Portal and sends current token
   */
  initAdminBridge: () => {
    // Listen for token requests from Career Portal
    window.addEventListener("message", (event) => {
      // Verify origin for security
      if (event.origin !== CAREER_PORTAL_URL) {
        return;
      }

      // Handle token request
      if (event.data.type === "REQUEST_TOKEN") {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        console.log("[TokenBridge] Received token request from Career Portal");

        // Send token to Career Portal
        event.source?.postMessage(
          {
            type: "TOKEN_RESPONSE",
            token: token,
            user: user,
          },
          { targetOrigin: event.origin } as any
        );

        console.log(
          "[TokenBridge] Sent token to Career Portal:",
          token ? "✅" : "❌"
        );
      }

      // Handle logout notification
      if (event.data.type === "LOGOUT") {
        console.log(
          "[TokenBridge] Received logout notification from Career Portal"
        );
        // You could trigger logout in admin portal if needed
      }
    });

    console.log("[TokenBridge] Admin bridge initialized");
  },

  /**
   * Broadcast token updates to Career Portal
   * Call this after login or token refresh
   */
  broadcastToken: (token: string, user: any) => {
    try {
      // Open a temporary iframe to Career Portal to send token
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = CAREER_PORTAL_URL;

      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          {
            type: "TOKEN_UPDATE",
            token: token,
            user: JSON.stringify(user),
          },
          CAREER_PORTAL_URL
        );

        console.log("[TokenBridge] Broadcasted token update to Career Portal");

        // Remove iframe after a short delay
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("[TokenBridge] Error broadcasting token:", error);
    }
  },

  /**
   * Notify Career Portal of logout
   */
  broadcastLogout: () => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = CAREER_PORTAL_URL;

      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          {
            type: "LOGOUT",
          },
          CAREER_PORTAL_URL
        );

        console.log("[TokenBridge] Broadcasted logout to Career Portal");

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("[TokenBridge] Error broadcasting logout:", error);
    }
  },
};

