'use client';

import { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ConvertButtonProps {
  files: File[];
  selectedFormat: string;
  onConversionComplete: (blob: Blob, fileName: string) => void;
}

export default function ConvertButton({ files, selectedFormat, onConversionComplete }: ConvertButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleConvert = async () => {
    if (files.length === 0) {
      alert('请先选择文件');
      return;
    }

    setIsConverting(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    formData.append('format', selectedFormat);

    try {
      console.log('Client: Sending request to server');
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('转换失败');
      }

      const contentType = response.headers.get('Content-Type');
      console.log('Client: Response Content-Type:', contentType);

      const blob = await response.blob();
      console.log('Client: Blob type:', blob.type);
      console.log('Client: Blob size:', blob.size, 'bytes');

      let fileName;
      if (contentType === 'application/zip') {
        fileName = 'converted_images.zip';
      } else if (contentType === 'application/pdf') {
        fileName = files.length === 1 ? `${files[0].name.split('.')[0]}_converted.pdf` : 'converted.pdf';
      } else {
        const fileExtension = contentType?.split('/')[1] || selectedFormat.toLowerCase();
        fileName = `${files[0].name.split('.')[0]}_converted.${fileExtension}`;
      }
      console.log('Client: Generated file name:', fileName);

      onConversionComplete(blob, fileName);
      console.log('Client: Conversion complete');
    } catch (error) {
      console.error('Client: 转换错误:', error);
      alert('转换过程中出错，请重试');
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleConvert}
        disabled={isConverting || files.length === 0}
        startIcon={<CloudUploadIcon />}
        sx={{ mt: 2 }}
      >
        {isConverting ? '转换中...' : '开始转换'}
      </Button>
      {isConverting && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
    </Box>
  );
}