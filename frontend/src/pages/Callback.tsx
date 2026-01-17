import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Callback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Exchanging code for tokens...");

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const clientId = process.env.REACT_APP_IAA_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_IAA_CLIENT_SECRET;
      const iaaUrl = process.env.REACT_APP_IAA_URL;

      // The endpoint from your Next.js reference
      const tokenEndpoint = `${iaaUrl}/api/auth/tokens?code=${encodeURIComponent(code)}`;

      fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setStatus("Syncing security state...");

          // 1. SAVE FOR ATS BACKEND (String)
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('ats_token', data.access_token);

          // 2. SAVE FOR IAA WIDGET (Strict JSON format)
          // The Widget watchdog WILL log you out if this is missing!
          localStorage.setItem('auth_tokens', JSON.stringify({
            accessToken: data.access_token,
            refreshToken: data.refresh_token
          }));
          
          // 3. SET AUTH FLAGS
          localStorage.setItem('iaa_authenticated', 'true');
          sessionStorage.setItem('iaa_sync_flag', 'true');

          // 4. DISPATCH EVENT (Tells the Widget immediately so it doesn't wait 1s)
          window.dispatchEvent(new Event('storage'));

          console.log("[IAA Callback] Security state synced successfully.");

          // 5. NAVIGATE TO DASHBOARD (will route based on user role)
          // Small timeout ensures storage is written before the next page loads
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        } else {
          throw new Error("No tokens received");
        }
      })
      .catch(err => {
        console.error("IAA Error:", err);
        navigate('/login?error=auth_failed');
      });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h2>{status}</h2>
      <div className="spinner"></div> 
    </div>
  );
};

export default Callback;