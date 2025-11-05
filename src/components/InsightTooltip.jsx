import React from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const InsightTooltip = ({ title, children, placement = 'top' }) => {
  const theme = useTheme();

  const CustomTooltipContent = (
    <Box
      sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        padding: 2.5,
        border: `1px solid ${theme.palette.mode === 'dark'
          ? 'rgba(147, 112, 219, 0.3)'
          : 'rgba(147, 112, 219, 0.2)'}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 40px rgba(147, 112, 219, 0.15)'
          : '0 8px 32px rgba(147, 112, 219, 0.3), 0 0 40px rgba(147, 112, 219, 0.1)',
        maxWidth: 320,
        position: 'relative',
        animation: 'glow-pulse 2s ease-in-out infinite',
        '@keyframes glow-pulse': {
          '0%, 100%': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 40px rgba(147, 112, 219, 0.15)'
              : '0 8px 32px rgba(147, 112, 219, 0.3), 0 0 40px rgba(147, 112, 219, 0.1)',
          },
          '50%': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(147, 112, 219, 0.6), 0 0 50px rgba(147, 112, 219, 0.25)'
              : '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 50px rgba(147, 112, 219, 0.15)',
          },
        },
      }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: theme.palette.text.primary,
          fontWeight: 500,
          whiteSpace: 'pre-line',
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={CustomTooltipContent}
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
            padding: 0,
            boxShadow: 'none',
            maxWidth: 'none',
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(4px) scale(0.95)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              },
            },
          },
        },
        arrow: {
          sx: {
            color: theme.palette.mode === 'dark'
              ? 'rgba(26, 26, 46, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
            '&::before': {
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(147, 112, 219, 0.3)'
                : 'rgba(147, 112, 219, 0.2)'}`,
            },
          },
        },
      }}
      enterDelay={200}
      leaveDelay={100}
      TransitionProps={{
        timeout: { enter: 200, exit: 150 },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default InsightTooltip;

