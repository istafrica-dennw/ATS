import React, { useEffect } from 'react';

// Define the global types for TypeScript. Best practice is to move this
// to a separate `globals.d.ts` file to avoid re-declaring it.
declare global {
  interface Window {
    iaa?: {
      engine: any;
      initiateLogin?: () => void;
      logout?: () => void;
    };
    initIAAWidget?: () => void;
    IAAAuthWidget?: any;
  }
}

const IAAWidgetLoader: React.FC = () => {
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // This part is already correct.
      const authOrigin = new URL(process.env.REACT_APP_IAA_FRONTEND_URL!).origin;
      if (event.origin !== authOrigin) return;

      const { type, code, state } = event.data;
      if (type === 'iaa-auth-callback') {
        const storedState = sessionStorage.getItem('oauth_state_iaa');
        sessionStorage.removeItem('oauth_state_iaa');
        
        if (!state || state !== storedState) {
            console.error("State mismatch!");
            return;
        }
       
        const backendCallbackUrl = `/api/auth/iaa/callback?code=${code}`;
        window.location.href = backendCallbackUrl;
      }
    };

    window.addEventListener('message', handleAuthMessage);

    if (document.getElementById('iaa-widget-script')) return;

    (window as any).initIAAWidget = () => {
      if ((window as any).IAAAuthWidget) {
        // --- THIS IS THE FIX ---
        // We ensure the `iaa` object exists before assigning to its `engine` property.
        if (!window.iaa) {
          window.iaa = { engine: null };
        }
        
        // Use `process.env` which is the correct way for Create React App.
        window.iaa.engine = new (window as any).IAAAuthWidget({
          clientId: process.env.REACT_APP_IAA_CLIENT_ID,
          redirectUri: "http://localhost:3001/callback",
          iaaFrontendUrl: process.env.REACT_APP_IAA_FRONTEND_URL,
        });
        console.log('[IAA Loader] IAA Engine initialized.');
      } else {
        console.error('IAAAuthWidget class not found after init.');
      }
    };

    const script = document.createElement('script');
    script.id = 'iaa-widget-script';
    // --- ALSO FIX THE URL HERE ---
    // Use `process.env` for this URL as well.
    script.src = `${process.env.REACT_APP_IAA_URL}/widgets/iaa-widget.js`; // Corrected path
    script.async = true;
    script.onerror = () => console.error('Failed to load the IAA widget script.');
    document.body.appendChild(script);

    return () => {
      window.removeEventListener('message', handleAuthMessage);
      const existingScript = document.getElementById('iaa-widget-script');
      if (existingScript) document.body.removeChild(existingScript);
      delete (window as any).initIAAWidget;
    };
  }, []);

  return null;
};

export default IAAWidgetLoader;