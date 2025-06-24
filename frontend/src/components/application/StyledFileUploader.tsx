import React, { useRef, useState } from 'react';
import { Box, Button, Typography, IconButton, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Clear as ClearIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

interface StyledFileUploaderProps {
  onFileSelect: (file: File | null) => void;
  label: string;
  required?: boolean;
}

const StyledFileUploader: React.FC<StyledFileUploaderProps> = ({ onFileSelect, label, required }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (file: File | null) => {
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
    </Paper>
  );
};

export default StyledFileUploader; 