import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';

const KpiCard = ({ 
  title = 'Clientes Activos', 
  value = 450, 
  subtitle = 'Este mes',
  icon = '👥',
  trend = '+3.1%',
  isPositive = true 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
        borderRadius: 4,
        padding: 3,
        color: theme.palette.text.primary,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.08)' 
          : 'rgba(0,0,0,0.08)'}`,
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          borderColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.15)' 
            : 'rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary, 
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '1rem',
              lineHeight: 1.3,
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: 'swap'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              color: theme.palette.text.primary,
              lineHeight: 1.1,
              fontSize: '2.5rem',
              letterSpacing: '-0.02em',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: 'swap'
            }}
          >
            {value.toLocaleString('es-CL')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.9rem',
              lineHeight: 1.4,
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: 'swap'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Chip
          label={trend}
          sx={{
            background: isPositive 
              ? theme.palette.mode === 'dark' 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(34, 197, 94, 0.1)'
              : theme.palette.mode === 'dark' 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(239, 68, 68, 0.1)',
            color: isPositive ? '#22c55e' : '#ef4444',
            fontWeight: 700,
            border: `1px solid ${isPositive 
              ? theme.palette.mode === 'dark' 
                ? 'rgba(34, 197, 94, 0.3)' 
                : 'rgba(34, 197, 94, 0.2)'
              : theme.palette.mode === 'dark' 
                ? 'rgba(239, 68, 68, 0.3)' 
                : 'rgba(239, 68, 68, 0.2)'}`,
            fontSize: '0.875rem',
            height: 'auto',
            borderRadius: 2,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontDisplay: 'swap',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            },
            '& .MuiChip-label': {
              padding: '8px 12px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }
          }}
        />
      </Box>
      
      {/* Gráfico de tendencia mejorado */}
      <Box sx={{ 
        width: '100%', 
        height: 32, 
        mt: 2,
        position: 'relative',
        opacity: 0.8
      }}>
        <svg width="100%" height="32" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`gradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path
            d="M0 28 Q8 20 16 24 T32 16 T48 20 T64 12 T80 18 T96 14 T100 16"
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 28 Q8 20 16 24 T32 16 T48 20 T64 12 T80 18 T96 14 T100 16 L100 32 L0 32 Z"
            fill={`url(#gradient-${Math.random()})`}
            opacity="0.2"
          />
        </svg>
      </Box>
    </Box>
  );
};

export default KpiCard; 