import React, { useEffect } from 'react'; // Add React here
import { useNavigate, useSearchParams } from 'react-router-dom';

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            // Updated to process.env.REACT_APP_...
            fetch(`${process.env.REACT_APP_IAA_URL}/auth/token`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code, 
                    clientId: process.env.REACT_APP_IAA_CLIENT_ID 
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    navigate('/dashboard');
                }
            })
            .catch(err => console.error("Login failed", err));
        }
    }, [searchParams, navigate]);

    return <div>Completing login...</div>;
};

export default Callback;