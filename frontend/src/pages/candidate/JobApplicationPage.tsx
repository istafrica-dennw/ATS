import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import MainLayout from '../../layouts/MainLayout';
import JobApplicationForm from '../../components/application/JobApplicationForm';
import axiosInstance from '../../utils/axios';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
}

const JobApplicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Parse job ID as number
        const jobId = id ? parseInt(id, 10) : 0;
        
        if (isNaN(jobId) || jobId <= 0) {
          setError('Invalid job ID');
          setLoading(false);
          return;
        }
        
        // Fetch job details
        const response = await axiosInstance.get(`/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  if (loading) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            backgroundColor: 'background.default'
          }}
        >
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      </MainLayout>
    );
  }
  
  if (error || !job) {
    return (
      <MainLayout>
        <Box sx={{ p: 3, backgroundColor: 'background.default' }}>
          <Alert 
            severity="error"
            sx={{
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              '& .MuiAlert-icon': {
                color: 'error.main'
              }
            }}
          >
            {error || 'Job not found'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
              onClick={() => navigate('/jobs')}
            >
              Back to Jobs
            </Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Box sx={{ 
        maxWidth: 'lg', 
        mx: 'auto', 
        p: 3,
        backgroundColor: 'background.default',
        minHeight: '100vh'
      }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            mb: 2
          }}
        >
          Apply for Position
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 3,
            color: 'text.secondary',
            fontSize: '1.1rem',
            lineHeight: 1.5
          }}
        >
          Complete the application form below to apply for the {job.title} position at {job.department || 'the department'}.
        </Typography>
        
        <JobApplicationForm 
          jobId={job.id} 
          jobTitle={job.title} 
          department={job.department || 'the department'} 
        />
      </Box>
    </MainLayout>
  );
};

export default JobApplicationPage;
