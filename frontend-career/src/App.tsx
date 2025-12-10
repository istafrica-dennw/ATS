import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplyPage from './pages/ApplyPage';
import { authUtils } from './utils/authUtils';
import { tokenBridge } from './utils/tokenBridge';

function App() {
  // Initialize token syncing on app startup
  useEffect(() => {
    // Method 1: Sync token from URL (if navigated with token parameter)
    authUtils.syncTokenFromUrl();
    
    // Method 2: Auto-request token from Admin Portal via postMessage
    tokenBridge.initCareerBridge();
    console.log('🔗 Career Portal token bridge initialized - auto-syncing with Admin Portal');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/jobs/:jobId/apply" element={<ApplyPage />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;
