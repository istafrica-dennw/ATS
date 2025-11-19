import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  DocumentTextIcon, 
  PaperClipIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import CustomQuestionForm, { CustomQuestion, QuestionAnswer } from './CustomQuestionForm';
import { applicationService, ApplicationDTO } from '../../services/applicationService';
import axiosInstance from '../../utils/axios';
import StyledFileUploader from './StyledFileUploader';
import { useAuth } from '../../contexts/AuthContext';

interface JobApplicationFormProps {
  jobId: string | number;
  jobTitle: string;
  department: string;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, jobTitle, department }) => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  // Form state
  const [activeStep, setActiveStep] = useState<number>(0);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
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
  
  // Phone number validation
  const hasPhoneNumber = user?.phoneNumber && user.phoneNumber.trim() !== '';
  
  // Profile picture validation
  const hasProfilePicture = user?.profilePictureUrl && user.profilePictureUrl.trim() !== '';
  
  // Privacy Policy acceptance validation
  // Check if privacyPolicyAccepted is explicitly true (not null, undefined, or false)
  const hasAcceptedPrivacyPolicy = user?.privacyPolicyAccepted === true;
  
  // Debug logging
  useEffect(() => {
    console.log('JobApplicationForm - User data:', {
      hasPhoneNumber,
      hasProfilePicture,
      privacyPolicyAccepted: user?.privacyPolicyAccepted,
      hasAcceptedPrivacyPolicy
    });
  }, [user, hasPhoneNumber, hasProfilePicture, hasAcceptedPrivacyPolicy]);

  // Refresh user data to ensure we have the latest privacyPolicyAccepted field
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        const updatedUser = response.data;
        // Update the user in AuthContext
        if (updatedUser) {
          setUser(updatedUser);
          console.log('JobApplicationForm - Refreshed user data with privacyPolicyAccepted:', updatedUser.privacyPolicyAccepted);
        }
      } catch (error) {
        console.error('JobApplicationForm - Error refreshing user data:', error);
      }
    };
    
    // Only refresh if user exists but privacyPolicyAccepted is undefined
    if (user && user.privacyPolicyAccepted === undefined) {
      refreshUserData();
    }
  }, [user, setUser]);

  // Fetch job custom questions and check if user already applied
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const numericJobId = parseInt(String(jobId), 10);

        // Check if already applied
        try {
          const response: any = await applicationService.checkApplicationStatus(numericJobId);
          if (response && response.hasApplied) {
            setAlreadyApplied(true);
          }
        } catch (error: any) {
          // If the error is not 404 (not found), set general error
          if (error.response?.status !== 404) {
            setError('Failed to check application status');
          }
        }
        
        // TODO: Replace with actual API endpoint when available
        try {
          // Attempt to fetch custom questions
          const response = await axiosInstance.get<CustomQuestion[]>(`/jobs/${numericJobId}/custom-questions`);
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
  
  const handleResumeSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const newName = `resume_${selectedFile.name}`;
      const renamedFile = new File([selectedFile], newName, { type: selectedFile.type });
      setResumeFile(renamedFile);
      if (error === 'Resume is required') {
        setError('');
      }
    } else {
      setResumeFile(null);
    }
  };

  const handleCoverLetterSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const newName = `cover-letter_${selectedFile.name}`;
      const renamedFile = new File([selectedFile], newName, { type: selectedFile.type });
      setCoverLetterFile(renamedFile);
    } else {
      setCoverLetterFile(null);
    }
  };
  
  // Handle answers to custom questions
  const handleAnswersChange = (updatedAnswers: QuestionAnswer[]) => {
    setAnswers(updatedAnswers);
    
    if (Object.keys(validationErrors).length > 0) {
      const newValidationErrors = { ...validationErrors };
      
      updatedAnswers.forEach((answer) => {
        if (answer.answer.trim() && newValidationErrors[answer.questionId]) {
          delete newValidationErrors[answer.questionId];
        }
      });
      
      setValidationErrors(newValidationErrors);
      
      if (Object.keys(newValidationErrors).length === 0) {
        setError('');
      }
    }
  };
  
  const getCompletedRequiredQuestionsCount = (): number => {
    return questions.filter(q => q.required).filter(question => {
      const answer = answers.find(a => a.questionId === question.id);
      return answer && answer.answer.trim() !== '';
    }).length;
  };
  
  const getTotalRequiredQuestionsCount = (): number => {
    return questions.filter(q => q.required).length;
  };
  
  const areAllRequiredQuestionsAnswered = (): boolean => {
    if (activeStep === 0) {
      return !!resumeFile;
    } else if (activeStep === 1) {
      const totalRequired = getTotalRequiredQuestionsCount();
      if (totalRequired === 0) return true;
      
      return getCompletedRequiredQuestionsCount() === totalRequired;
    }
    return true;
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    if (activeStep === 0) {
      // Resume is required
      if (!resumeFile) {
        setError('Resume is required');
        return false;
      }
      return true;
    } else if (activeStep === 1) {
      // Validate required questions are answered
      const newValidationErrors: Record<number, string> = {};
      let isValid = true;
      
      questions.forEach((question: CustomQuestion) => {
        if (question.required) {
          const answer = answers.find((a: QuestionAnswer) => a.questionId === question.id);
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
      setActiveStep((prevStep: number) => prevStep + 1);
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep((prevStep: number) => prevStep - 1);
    setError('');
  };
  
  // Submit the application
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError('');
      
      const numericJobId = parseInt(String(jobId), 10);

      // Create application object
      const application: ApplicationDTO = {
        jobId: numericJobId,
        answers: answers
      };

      // Create FormData
      const formData = new FormData();
      formData.append('applicationDTO', new Blob([JSON.stringify(application)], { type: 'application/json' }));
      
      // Append files with correct names
      if (resumeFile) {
        formData.append('files', resumeFile);
      }
      if (coverLetterFile) {
        formData.append('files', coverLetterFile);
      }
      
      // Submit application with files
      await applicationService.submitApplication(formData);
      
      setSubmitSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting application:', err);
      
      // Handle 413 Payload Too Large error
      if (err.response?.status === 413) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error;
        if (errorMessage) {
          setError(errorMessage);
        } else {
          // Generic 413 error message
          setError('File size too large. Please ensure your resume is under 500KB and cover letter is under 100KB. Compress or reduce the file size and try again.');
        }
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to submit application';
        setError(errorMessage);
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Steps configuration
  const steps = ['Upload Documents', 'Answer Questions', 'Review & Submit'];
  
  if (checkingApplication) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  if (alreadyApplied) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Already Applied
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
        You have already applied for this position. You can check your application status in your dashboard.
            </p>
            <button
            onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
          >
            Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required profile information
  if (!hasPhoneNumber || !hasProfilePicture || !hasAcceptedPrivacyPolicy) {
    const missingItems = [];
    if (!hasPhoneNumber) missingItems.push('phone number');
    if (!hasProfilePicture) missingItems.push('profile picture');
    if (!hasAcceptedPrivacyPolicy) missingItems.push('Privacy Policy acceptance');
    
    // Debug logging
    console.log('JobApplicationForm - Missing items check:', {
      missingItems,
      hasPhoneNumber,
      hasProfilePicture,
      hasAcceptedPrivacyPolicy,
      userPrivacyPolicyAccepted: user?.privacyPolicyAccepted
    });
    
    const missingItemsText = missingItems.length === 1 
      ? missingItems[0] 
      : missingItems.length === 2 
        ? `${missingItems[0]} and ${missingItems[1]}`
        : missingItems.length === 3
          ? `${missingItems[0]}, ${missingItems[1]}, and ${missingItems[2]}`
          : missingItems.join(', ');

    // Determine heading based on what's missing
    const isOnlyPrivacyPolicy = missingItems.length === 1 && missingItems[0] === 'Privacy Policy acceptance';
    const heading = isOnlyPrivacyPolicy 
      ? 'Privacy Policy Acceptance Required' 
      : 'Profile Information Required';
    
    console.log('JobApplicationForm - Heading determination:', {
      isOnlyPrivacyPolicy,
      heading,
      missingItemsLength: missingItems.length,
      firstMissingItem: missingItems[0]
    });

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 sm:p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              {heading}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              {isOnlyPrivacyPolicy 
                ? 'You must accept the Privacy Policy before you can apply for jobs. Please accept the Privacy Policy in your profile to continue.'
                : `You need to complete the following before you can apply for jobs: ${missingItemsText}. Please update your profile to continue.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center px-4 py-2 border border-yellow-300 dark:border-yellow-600 text-sm font-medium rounded-lg text-yellow-700 dark:text-yellow-300 bg-white dark:bg-yellow-900/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors duration-200"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Complete Profile
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (submitSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Application Submitted!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
        Your application for <strong>{jobTitle}</strong> at <strong>{department}</strong> has been submitted successfully. 
        You will be redirected to your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 px-4 py-4 sm:px-6 sm:py-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
        Apply for {jobTitle} at {department}
        </h2>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6 bg-gray-50/50 dark:bg-gray-700/30">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200
                  ${index <= activeStep 
                    ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {index < activeStep ? (
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`
                  text-xs sm:text-sm text-center font-medium max-w-[80px] sm:max-w-none leading-tight
                  ${index <= activeStep 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-200
                  ${index < activeStep 
                    ? 'bg-indigo-600 dark:bg-indigo-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 sm:mx-6 sm:mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 py-6 sm:px-6 sm:py-8">
      {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : (
          <div>
          {activeStep === 0 && (
              <div className="space-y-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start mb-2">
                    <PaperClipIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                Upload Documents
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please upload your resume and cover letter to complete your application.
                  </p>
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Progress: {resumeFile ? 1 : 0} of 1 required document uploaded
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {resumeFile ? '100%' : '0%'}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                      <div 
                        className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: resumeFile ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                    {resumeFile && (
                      <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Resume uploaded successfully
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <StyledFileUploader
                  label="Resume"
                  onFileSelect={handleResumeSelect}
                  required
                  maxSize={500 * 1024} // 500KB
                  maxSizeDisplay="500KB"
                />

                <StyledFileUploader
                  label="Cover Letter (Optional)"
                  onFileSelect={handleCoverLetterSelect}
                  maxSize={100 * 1024} // 100KB
                  maxSizeDisplay="100KB"
                />
                </div>
              </div>
          )}
          
          {activeStep === 1 && (
              <div className="space-y-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start mb-2">
                    <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Answer Questions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please answer the following questions to help us understand your qualifications.
                  </p>
                  {questions.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      {getTotalRequiredQuestionsCount() > 0 ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              Progress: {getCompletedRequiredQuestionsCount()} of {getTotalRequiredQuestionsCount()} required questions completed
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {Math.round((getCompletedRequiredQuestionsCount() / getTotalRequiredQuestionsCount()) * 100)}%
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.round((getCompletedRequiredQuestionsCount() / getTotalRequiredQuestionsCount()) * 100)}%`
                              }}
                            ></div>
                          </div>
                          {getCompletedRequiredQuestionsCount() === getTotalRequiredQuestionsCount() && (
                            <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              All required questions completed!
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          No required questions for this position. You can proceed to the next step.
                        </div>
                      )}
                    </div>
                  )}
                </div>
            <CustomQuestionForm
              questions={questions}
              answers={answers}
              onChange={handleAnswersChange}
              errors={validationErrors}
            />
              </div>
          )}
          
          {activeStep === 2 && (
              <div className="space-y-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start mb-2">
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                Review Your Application
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please review all the information before submitting your application.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <PaperClipIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Documents
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-3 ${
                        resumeFile 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {resumeFile ? '✓' : '✗'}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Resume: {resumeFile ? `Selected (${resumeFile.name})` : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-3 ${
                        coverLetterFile 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {coverLetterFile ? '✓' : '○'}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Cover Letter: {coverLetterFile ? `Selected (${coverLetterFile.name})` : 'Not provided (optional)'}
                      </span>
                    </div>
                  </div>
                </div>
                
              {questions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                    Questions
                    </h4>
                    <div className="space-y-4">
                  {questions.map((question) => {
                    const answer = answers.find(a => a.questionId === question.id);
                    
                    return (
                          <div key={question.id} className="border-l-4 border-indigo-200 dark:border-indigo-800 pl-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {question.questionText}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                          {answer?.answer || 'No answer provided'}
                            </p>
                          </div>
                    );
                  })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-4 sm:px-6 sm:py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <button
              onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
              disabled={submitLoading}
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {activeStep === 0 ? 'Cancel' : 'Back'}
          </button>
            
            {activeStep === steps.length - 1 ? (
            <button
                onClick={handleSubmit}
                disabled={submitLoading}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 sm:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
                ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Submit Application
                </>
                )}
            </button>
            ) : (
                        <div className="flex flex-col items-end">
              <button
                onClick={handleNext}
                disabled={!areAllRequiredQuestionsAnswered()}
                className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 sm:py-3 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 shadow-lg ${
                  areAllRequiredQuestionsAnswered()
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transform hover:scale-105 hover:shadow-xl cursor-pointer'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60'
                }`}
                title={!areAllRequiredQuestionsAnswered() 
                  ? (activeStep === 0 ? 'Please upload your resume to continue' : 'Please answer all required questions to continue')
                  : 'Continue to next step'
                }
              >
                Next
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
              {!areAllRequiredQuestionsAnswered() && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {activeStep === 0 
                    ? 'Upload your resume to continue' 
                    : 'Complete all required questions to continue'
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
