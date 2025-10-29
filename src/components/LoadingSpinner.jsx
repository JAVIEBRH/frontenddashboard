import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

export default function LoadingSpinner({ message = "Cargando...", size = "medium" }) {
  const theme = useTheme();
  
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        minHeight: '200px'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={sizeMap[size]}
          sx={{
            color: theme.palette.primary.main,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <CircularProgress
          size={sizeMap[size]}
          sx={{
            color: theme.palette.primary.light,
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.3,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                opacity: 0.3,
                transform: 'scale(1)',
              },
              '50%': {
                opacity: 0.6,
                transform: 'scale(1.05)',
              },
              '100%': {
                opacity: 0.3,
                transform: 'scale(1)',
              },
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: 'center',
          animation: 'fadeInOut 2s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 },
          },
        }}
      >
        {message}
      </Typography>
    </Box>
  );
} 