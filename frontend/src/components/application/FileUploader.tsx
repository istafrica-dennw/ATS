import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fileUploadService } from '../../services/fileUploadService';

interface FileUploaderProps {
  fileType: 'resume' | 'coverLetter';
  label: string;
  onFileUploaded: (fileUrl: string) => void;
  required?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  fileType, 
  label, 
  onFileUploaded, 
  required = false 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Accepted file types
  const acceptedTypes = fileType === 'resume' 
    ? '.pdf,.doc,.docx' 
    : '.pdf,.doc,.docx,.txt';
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Reset states
      setError('');
      setUploadSuccess(false);
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90);
          return newProgress;
        });
      }, 300);
      
      // Upload file based on type
      const uploadFunction = fileType === 'resume' 
        ? fileUploadService.uploadResume 
        : fileUploadService.uploadCoverLetter;
        
      let fileUrl = await uploadFunction(file);
      
      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Notify parent component
      console.log(`${fileType} uploaded successfully:`, fileUrl);
      onFileUploaded(fileUrl);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      
      <Box sx={{ 
        border: '2px dashed #ccc', 
        p: 2, 
        borderRadius: 1,
        textAlign: 'center',
        mb: 2,
        '&:hover': { borderColor: '#2196f3' }
      }}>
        <input
          accept={acceptedTypes}
          id={`${fileType}-upload-input`}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor={`${fileType}-upload-input`}>
          <Button
            component="span"
            startIcon={<CloudUploadIcon />}
            color="primary"
            disabled={uploading}
          >
            Select {fileType === 'resume' ? 'Resume' : 'Cover Letter'}
          </Button>
        </label>
        
        {fileName && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {fileName}
          </Typography>
        )}
      </Box>
      
      {fileName && !uploadSuccess && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          Upload {fileType === 'resume' ? 'Resume' : 'Cover Letter'}
        </Button>
      )}
      
      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
      
      {uploadSuccess && (
        <Alert 
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{ mt: 1 }}
        >
          {fileType === 'resume' ? 'Resume' : 'Cover Letter'} uploaded successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUploader;
