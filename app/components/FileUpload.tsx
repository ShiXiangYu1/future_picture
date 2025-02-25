'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}

export default function FileUpload({ onFilesSelected, accept, maxFiles = 1 }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`文件 ${file.name} 超过最大大小限制 (10MB)`);
        return false;
      }
      if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
        alert(`文件 ${file.name} 不是支持的图片格式`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    onFilesSelected(validFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'grey.100' : 'background.paper',
          '&:hover': {
            bgcolor: 'grey.50'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box component={CloudUploadIcon} sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isDragActive ? '拖放文件到这里 ...' : '拖放文件到这里, 或者点击选择文件'}
        </Typography>
      </Box>
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">已选择的文件:</Typography>
          <List>
            {files.map(file => (
              <ListItem key={file.name}>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}