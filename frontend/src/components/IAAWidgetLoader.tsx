import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    iaa?: { engine: any };
    initIAAWidget?: () => void;
    IAAAuthWidget?: any;
  }
}

const IAAWidgetLoader: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const STYLE_ID = 'iaa-widget-blocker';
    const SCRIPT_ID = 'iaa-widget-script';

    /**
     * Function to control visibility based on login source
     */
    const syncWidgetVisibility = () => {
      const loginType = localStorage.getItem('login_type');
      let styleTag = document.getElementById(STYLE_ID);

      // If logged in via ATS, inject CSS to kill the widget UI
      if (loginType === 'ats') {
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = STYLE_ID;
          styleTag.innerHTML = `
            #iaa-widget-container, .iaa-widget-container { 
              display: none !important; 
              visibility: hidden !important; 
              pointer-events: none !important; 
            }
          `;
          document.head.appendChild(styleTag);
          console.log("[IAA Loader] ATS Session: Widget Ghosted.");
        }
      } else {
        // If logged out or IAA user, remove the blocker
        if (styleTag) {
          styleTag.remove();
          console.log("[IAA Loader] No ATS Session: Widget Visible.");
        }
      }

      // 2. Handle Script Loading (if not ATS user)
      if (loginType !== 'ats' && !document.getElementById(SCRIPT_ID)) {
        (window as any).initIAAWidget = () => {
          if ((window as any).IAAAuthWidget) {
            if (!window.iaa) window.iaa = { engine: null };
            window.iaa.engine = new (window as any).IAAAuthWidget({
              clientId: process.env.REACT_APP_IAA_CLIENT_ID,
              redirectUri: `${window.location.origin}/callback`,
              iaaFrontendUrl: process.env.REACT_APP_IAA_FRONTEND_URL,
            });
          }
        };

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `${process.env.REACT_APP_IAA_URL}/widgets/iaa-widget.js`;
        script.async = true;
        document.body.appendChild(script);
      }
    };

    /**
     * Listen for messages from the IAA Popup window
     */
    const handleAuthMessage = (event: MessageEvent) => {
      const frontendUrl = process.env.REACT_APP_IAA_FRONTEND_URL;
      if (!frontendUrl || event.origin !== new URL(frontendUrl).origin) return;

      const { type, code, state } = event.data;
      if (type === 'iaa-auth-callback') {
        const storedState = sessionStorage.getItem('oauth_state_iaa');
        if (state === storedState) {
          sessionStorage.removeItem('oauth_state_iaa');
          window.location.href = `/callback?code=${code}`;
        }
      }
    };

    // Run visibility check
    syncWidgetVisibility();

    // Listen for events
    window.addEventListener('message', handleAuthMessage);
    window.addEventListener('storage', syncWidgetVisibility); // Cross-tab sync

    return () => {
      window.removeEventListener('message', handleAuthMessage);
      window.removeEventListener('storage', syncWidgetVisibility);
    };
  }, [location.pathname]); // Re-run on every navigation

  return null;
};

export default IAAWidgetLoader;