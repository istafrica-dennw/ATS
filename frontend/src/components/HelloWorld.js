import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const HelloWorld = () => {
    const [message, setMessage] = useState('');
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        fetchMessage();
    }, []);

    const fetchMessage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/test/hello`);
            setMessage(response.data.data.message);
        } catch (error) {
            console.error('Error fetching message:', error);
        }
    };

    const updateMessage = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/test/hello`, { message: inputMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setMessage(response.data.data.message);
            setInputMessage('');
            await fetchMessage(); // Refresh the message after update
        } catch (error) {
            console.error('Error updating message:', error);
            console.error('Error details:', error.response?.data);
        }
    };

    return (
        <div className="hello-world">
            <h2>Current Message: {message}</h2>
            <form onSubmit={updateMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Enter new message"
                />
                <button type="submit">Update Message</button>
            </form>
        </div>
    );
};

export default HelloWorld; 