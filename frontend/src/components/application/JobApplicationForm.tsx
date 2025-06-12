import React, { useState, useEffect } from 'react';
import { 
  Alert,
  AlertTitle,
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUploader from './FileUploader';
import CustomQuestionForm, { CustomQuestion, QuestionAnswer } from './CustomQuestionForm';
import { applicationService, ApplicationDTO } from '../../services/applicationService';
import axiosInstance from '../../utils/axios';
import axios from 'axios';

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
  department: string;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, jobTitle, department }) => {
  const navigate = useNavigate();
  
  // Form state
  const [activeStep, setActiveStep] = useState<number>(0);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [coverLetterUrl, setCoverLetterUrl] = useState<string>('');
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  
  // Questions state
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  
  // Check if user has already applied
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);
  const [checkingApplication, setCheckingApplication] = useState<boolean>(true);

  // Fetch job custom questions and check if user already applied
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if already applied
        try {
          const applicationStatus = await applicationService.checkApplicationStatus(jobId);
          if (applicationStatus.hasApplied) {
            setAlreadyApplied(true);
          }
        } catch (error) {
          // If the error is not 404 (not found), set general error
          if (axios.isAxiosError(error) && error.response?.status !== 404) {
            setError('Failed to check application status');
          }
        }
        
        // TODO: Replace with actual API endpoint when available
        try {
          // Attempt to fetch custom questions
          const response = await axiosInstance.get(`/jobs/${jobId}/custom-questions`);
          setQuestions(response.data);
        } catch (error) {
          console.log('Custom questions API not implemented yet - using empty questions array');
          // For now, continue with empty questions array
          setQuestions([]);
        }
        
      } catch (err) {
        setError('Failed to load job application details');
        console.error('Error loading job application details:', err);
      } finally {
        setLoading(false);
        setCheckingApplication(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId]);
  
  // Handle file uploads
  const handleResumeUploaded = (fileUrl: string) => {
    console.log('Resume uploaded, URL:', fileUrl);
    setResumeUrl(fileUrl);
    // Clear any error related to resume
    if (error === 'Resume is required') {
      setError('');
    }
  };
  
  const handleCoverLetterUploaded = (fileUrl: string) => {
    console.log('Cover letter uploaded, URL:', fileUrl);
    setCoverLetterUrl(fileUrl);
  };
  
  // Handle answers to custom questions
  const handleAnswersChange = (updatedAnswers: QuestionAnswer[]) => {
    setAnswers(updatedAnswers);
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    if (activeStep === 0) {
      // Resume is required
      if (!resumeUrl) {
        setError('Resume is required');
        return false;
      }
      return true;
    } else if (activeStep === 1) {
      // Validate required questions are answered
      const newValidationErrors: Record<number, string> = {};
      let isValid = true;
      
      questions.forEach(question => {
        if (question.required) {
          const answer = answers.find(a => a.questionId === question.id);
          if (!answer || !answer.answer.trim()) {
            newValidationErrors[question.id] = 'This question is required';
            isValid = false;
          }
        }
      });
      
      setValidationErrors(newValidationErrors);
      
      if (!isValid) {
        setError('Please answer all required questions');
      }
      
      return isValid;
    }
    
    return true;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      setError('');
      setActiveStep((prev) => prev + 1);
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };
  
  // Submit the application
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError('');
      
      // Create application object
      const application: ApplicationDTO = {
        jobId: jobId,
        resumeUrl,
        coverLetterUrl,
        answers: answers
      };
      
      // Submit application
      await applicationService.submitApplication(application);
      
      setSubmitSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Steps configuration
  const steps = ['Upload Documents', 'Answer Questions', 'Review & Submit'];
  
  if (checkingApplication) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (alreadyApplied) {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>Already Applied</AlertTitle>
        You have already applied for this position. You can check your application status in your dashboard.
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Alert>
    );
  }
  
  if (submitSuccess) {
    return (
      <Alert severity="success" sx={{ mt: 4 }}>
        <AlertTitle>Application Submitted!</AlertTitle>
        Your application for <strong>{jobTitle}</strong> at <strong>{department}</strong> has been submitted successfully. 
        You will be redirected to your dashboard.
      </Alert>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Apply for {jobTitle} at {department}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ py: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Divider sx={{ my: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Documents
              </Typography>
              
              {resumeUrl ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Resume uploaded successfully! URL: {resumeUrl.substring(0, 40)}...
                </Alert>
              ) : null}
              
              <FileUploader
                fileType="resume"
                label="Resume"
                onFileUploaded={handleResumeUploaded}
                required={true}
              />
              
              <FileUploader
                fileType="coverLetter"
                label="Cover Letter (Optional)"
                onFileUploaded={handleCoverLetterUploaded}
              />
            </Box>
          )}
          
          {activeStep === 1 && (
            <CustomQuestionForm
              questions={questions}
              answers={answers}
              onChange={handleAnswersChange}
              errors={validationErrors}
            />
          )}
          
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Application
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Documents
                </Typography>
                <Typography variant="body2">
                  Resume: {resumeUrl ? '✓ Uploaded' : '✗ Missing'}
                </Typography>
                <Typography variant="body2">
                  Cover Letter: {coverLetterUrl ? '✓ Uploaded' : '✗ Not provided (optional)'}
                </Typography>
              </Box>
              
              {questions.length > 0 && (
                <Box sx={{ my: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Questions
                  </Typography>
                  
                  {questions.map((question) => {
                    const answer = answers.find(a => a.questionId === question.id);
                    
                    return (
                      <Box key={question.id} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {question.questionText}
                        </Typography>
                        <Typography variant="body2">
                          {answer?.answer || 'No answer provided'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
              disabled={submitLoading}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Submit Application'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default JobApplicationForm;
