import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Chip, keyframes } from '@mui/material';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const lineGlow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const numberPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const PorcentajePromosCard = ({
  porcentajePromos = 0,
  totalVentas = 0,
  ventasPromos = 0
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        padding: 2,
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.3)' : 'rgba(0, 191, 255, 0.15)'}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 12px 40px rgba(0, 191, 255, 0.3), 0 0 60px rgba(0, 191, 255, 0.1)'
            : '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderColor: 'rgba(0, 191, 255, 0.5)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '200%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent)',
          animation: `${shimmer} 3s infinite`,
          pointerEvents: 'none'
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        background: 'radial-gradient(circle, rgba(0, 191, 255, 0.15) 0%, transparent 70%)',
        animation: `${pulse} 2s ease-in-out infinite`,
        pointerEvents: 'none'
      }} />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 1, 
        position: 'relative', 
        zIndex: 1 
      }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" sx={{ 
            fontWeight: 700, 
            color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.9)' : '#7c3aed',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.7rem'
          }}>
            📊 % VENTAS PROMOS
          </Typography>
        </Box>
      </Box>

      {/* Número principal */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Typography variant="h2" sx={{ 
          fontWeight: 800, 
          color: theme.palette.text.primary,
          lineHeight: 1,
          fontSize: '3rem',
          textShadow: theme.palette.mode === 'dark' ? '0 0 30px rgba(0, 191, 255, 0.5)' : 'none',
          transition: 'all 0.3s ease',
          animation: isHovered ? `${numberPulse} 1.5s ease-in-out infinite` : 'none',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #9370db 0%, #ba55d3 50%, #9370db 100%)'
            : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {porcentajePromos.toFixed(1)}%
        </Typography>
      </Box>

      {/* Información adicional */}
      <Box sx={{ 
        width: '100%', 
        mt: 'auto', 
        position: 'relative', 
        zIndex: 1,
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ 
          fontSize: '0.7rem', 
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
          fontWeight: 500
        }}>
          {ventasPromos.toLocaleString('es-CL')} de {totalVentas.toLocaleString('es-CL')} ventas
        </Typography>
      </Box>

      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent)',
        borderRadius: 1,
        animation: `${lineGlow} 2s ease-in-out infinite`
      }} />
    </Box>
  );
};

export default PorcentajePromosCard;

