'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, CircularProgress, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import ImageGenerator from '../components/ImageGenerator';
import AIToolLayout from '../components/AIToolLayout';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  originalPrompt: string;
  imageUrl: string;
  createdAt: number;
}

const AIImageGeneratorPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 从localStorage加载历史记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('imageHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (err) {
      console.error("Error loading history: ", err);
      setError("加载历史记录时出错");
    }
    setLoading(false);
  }, []);

  const addToHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    try {
      const newItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: Date.now()
      };
      const updatedHistory = [newItem, ...history].slice(0, 10); // 只保留最新的10条记录
      setHistory(updatedHistory);
      localStorage.setItem('imageHistory', JSON.stringify(updatedHistory));
      return newItem.id;
    } catch (error) {
      console.error('Error adding to history: ', error);
      setError("添加到历史记录时出错");
      return undefined;
    }
  }, [history]);

  const truncatePrompt = (prompt: string) => {
    const words = prompt.split(/\s+/);
    if (words.length <= 5) {
      return prompt.length <= 10 ? prompt : prompt.slice(0, 10) + '...';
    } else {
      return words.slice(0, 5).join(' ') + '...';
    }
  };

  const renderHistoryItem = useCallback((item: HistoryItem) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
        <Link href={`/ai-image-generator/${item.id}`} passHref>
          <Box sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '4px', 
            padding: '8px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-4px)',
            },
            width: '100%',
            maxWidth: '256px',
            margin: '0 auto',
          }}>
            <Box sx={{ 
              width: '100%', 
              paddingTop: '100%',
              position: 'relative', 
              overflow: 'hidden',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}>
              <img 
                src={item.imageUrl} 
                alt={item.originalPrompt}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                loading="lazy"
              />
            </Box>
            <Typography 
              variant="body2" 
              sx={{
                width: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                maxHeight: '3em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                color: '#333',
              }}
              title={item.originalPrompt}
            >
              {truncatePrompt(item.originalPrompt)}
            </Typography>
          </Box>
        </Link>
      </Grid>
    );
  }, []);

  const memoizedHistory = useMemo(() => history.map(renderHistoryItem), [history, renderHistoryItem]);

  return (
    <AIToolLayout
      title="免费 AI 文生图工具"
      description={
        <div>
          <p>使用 AI 文生图器，只需输入描述性的提示词，我们就能为您自动优化提示词内容，再自动完成图片生成。</p>
          <p>
            最佳文生图工具
            <a 
              href="https://nf.video/7zwro3/?gid=26" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#1976d2',
                textDecoration: 'underline',
                marginLeft: '4px'
              }}
            >
              Midjourney
            </a>
          </p>
        </div>
      }
      metaDescription="使用 AI 文生图器，只需输入描述性的提示词，我们就能为您自动优化提示词内容，再自动完成图片生成。"
      iconSrc="/images/ai-image-generator.svg"
    >
      <Paper elevation={3} sx={{ 
        p: 3, 
        width: '100%', 
        boxSizing: 'border-box',
        mb: 4,
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        borderRadius: '12px',
      }}>
        <ImageGenerator onGenerate={addToHistory} />
      </Paper>
      <Box sx={{ 
        width: '100%', 
        overflowX: 'hidden',
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
        ) : (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                borderBottom: '2px solid #e0e0e0',
                pb: 1,
                mb: 3,
                color: '#2c3e50',
              }}
            >
              生成历史
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {memoizedHistory}
            </Grid>
          </Box>
        )}
      </Box>
    </AIToolLayout>
  );
};

export default AIImageGeneratorPage;
