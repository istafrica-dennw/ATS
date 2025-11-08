import React, { useRef, useState } from 'react';
import { Box, Button, Typography, IconButton, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Clear as ClearIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

interface StyledFileUploaderProps {
  onFileSelect: (file: File | null) => void;
  label: string;
  required?: boolean;
  maxSize?: number; // in bytes
  maxSizeDisplay?: string; // e.g., "2MB", "100KB"
}

const StyledFileUploader: React.FC<StyledFileUploaderProps> = ({ 
  onFileSelect, 
  label, 
  required,
  maxSize = 500 * 1024, // Default 500KB
  maxSizeDisplay = "500KB"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = (file: File | null) => {
    setFileError('');
    if (file) {
      // Validate file size
      if (file.size > maxSize) {
        // Format file size appropriately (KB for small files, MB for larger)
        const fileSizeDisplay = file.size < 1024 * 1024 
          ? `${(file.size / 1024).toFixed(2)}KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)}MB`;
        setFileError(`${label} file is too large. Maximum size is ${maxSizeDisplay}, but your file is ${fileSizeDisplay}. Please compress or reduce the file size and try again.`);
        setSelectedFile(null);
        onFileSelect(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
        handleFileChange(file);
    }
  };

  return (
    <Paper 
        variant="outlined"
        sx={{
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: isDragOver ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: isDragOver ? 'action.hover' : 'transparent',
            transition: 'border-color 0.3s, background-color 0.3s',
            mb: 3,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt"
      />
      
      {!selectedFile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag & drop a file here, or click the button below
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Maximum file size: {maxSizeDisplay} (PDF, DOC, DOCX, TXT)
          </Typography>
          <Button variant="contained" onClick={handleButtonClick}>
            Select File
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>{selectedFile.name}</Typography>
            <Box>
                <Button variant="outlined" size="small" onClick={handleButtonClick} sx={{ mr: 1 }}>
                    Change
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={handleClear}>
                    Remove
                </Button>
            </Box>
        </Box>
      )}
      
      {fileError && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="body2" color="error.dark">
            {fileError}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StyledFileUploader; 