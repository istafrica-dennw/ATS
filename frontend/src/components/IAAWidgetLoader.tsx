import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    iaa?: {
      engine: any;
    };
    initIAAWidget?: () => void;
    IAAAuthWidget?: any;
  }
}

const IAAWidgetLoader: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Hide/show IAA button based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add('iaa-authenticated');
    } else {
      document.body.classList.remove('iaa-authenticated');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      const frontendUrl = process.env.REACT_APP_IAA_FRONTEND_URL;
      if (!frontendUrl) return;

      const authOrigin = new URL(frontendUrl).origin;
      if (event.origin !== authOrigin) return;

      const { type, code, state } = event.data;
      if (type === 'iaa-auth-callback') {
        const storedState = sessionStorage.getItem('oauth_state_iaa');
        sessionStorage.removeItem('oauth_state_iaa');
        
        if (!state || state !== storedState) {
            console.error("State mismatch!");
            return;
        }
       
        // --- FIX: Redirect to Frontend Route, not Backend API ---
        window.location.href = '/callback?code=' + code;
      }
    };

    window.addEventListener('message', handleAuthMessage);

    if (document.getElementById('iaa-widget-script')) return;

    (window as any).initIAAWidget = () => {
      if ((window as any).IAAAuthWidget) {
        if (!window.iaa) window.iaa = { engine: null };

        window.iaa.engine = new (window as any).IAAAuthWidget({
          clientId: process.env.REACT_APP_IAA_CLIENT_ID,
          // Point to your React App
          redirectUri: "http://localhost:3001/callback", 
          iaaFrontendUrl: process.env.REACT_APP_IAA_FRONTEND_URL,
        });
        console.log('[IAA Loader] IAA Engine initialized.');
      }
    };

    const script = document.createElement('script');
    script.id = 'iaa-widget-script';
    script.src = `${process.env.REACT_APP_IAA_URL}/widgets/iaa-widget.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  return null;
};

export default IAAWidgetLoader;