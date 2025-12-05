import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, keyframes } from '@mui/material';

// Animaciones futuristas
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.4));
  }
  50% { 
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
  }
`;

const progressPulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const CircularProgressBar = ({ value, size = 100, stroke = 10, theme, isHovered }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  
  // Color según el porcentaje
  const getProgressColor = (percent) => {
    if (percent < 60) return '#10b981'; // Verde
    if (percent < 80) return '#f59e0b'; // Amarillo
    if (percent < 95) return '#f97316'; // Naranja
    return '#dc2626'; // Rojo
  };
  
  const progressColor = getProgressColor(value);
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg 
        width={size} 
        height={size}
        style={{
          filter: isHovered ? `drop-shadow(0 0 15px ${progressColor}80)` : 'none',
          transition: 'filter 0.3s ease'
        }}
      >
        {/* Fondo del círculo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.15)' : 'rgba(0, 191, 255, 0.1)'}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
        />
        {/* Efecto de brillo en el borde */}
        {isHovered && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`${progressColor}40`}
            strokeWidth={stroke + 4}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              filter: 'blur(4px)'
            }}
          />
        )}
        {/* Texto del porcentaje */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.32}
          fill={theme.palette.text.primary}
          fontWeight="800"
          fontFamily='"Inter", "Roboto", sans-serif'
        >
          {`${value}%`}
        </text>
      </svg>
      
      {/* Anillo exterior animado */}
      {isHovered && (
        <Box
          sx={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: size + 10,
            height: size + 10,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(168, 85, 247, 0.5)',
            animation: `${rotate} 2s linear infinite`,
            pointerEvents: 'none'
          }}
        />
      )}
    </Box>
  );
};

const CapacidadLocalCard = ({ 
  title = 'CAPACIDAD DE PRODUCCIÓN', 
  value = 0, 
  litrosVendidos = 0,
  capacidadTotal = 30000
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min(100, Math.round((litrosVendidos / capacidadTotal) * 100)) || value;
  
  // Color según el porcentaje
  const getProgressColor = (percent) => {
    if (percent < 60) return '#10b981';
    if (percent < 80) return '#f59e0b';
    if (percent < 95) return '#f97316';
    return '#dc2626';
  };
  
  const progressColor = getProgressColor(percentage);
  
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
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.3)' : 'rgba(0, 191, 255, 0.15)'}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: theme.palette.mode === 'dark' 
            ? `0 12px 40px rgba(0, 191, 255, 0.3), 0 0 60px rgba(0, 191, 255, 0.1), 0 0 30px ${progressColor}30`
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
      {/* Efecto de esquina brillante */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(0, 191, 255, 0.15) 0%, transparent 70%)',
          animation: `${pulse} 2s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
      
      {/* Título */}
      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.9)' : '#7c3aed',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontSize: '0.9rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          mb: 1
        }}
      >
        ⚡ {title}
      </Typography>
      
      {/* Círculo de progreso */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, my: 2 }}>
        <CircularProgressBar 
          value={percentage} 
          size={160} 
          stroke={14} 
          theme={theme}
          isHovered={isHovered}
        />
      </Box>
      
      {/* Barra de progreso inferior */}
      <Box sx={{ width: '100%', mt: 2, position: 'relative', zIndex: 1, px: 1 }}>
        <Box sx={{
          width: '100%',
          height: 12,
          background: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.15)' : 'rgba(0, 191, 255, 0.1)',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <Box sx={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${progressColor}90 0%, ${progressColor} 100%)`,
            borderRadius: 6,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isHovered ? `${progressPulse} 1.5s ease-in-out infinite` : 'none',
            boxShadow: isHovered ? `0 0 15px ${progressColor}80` : 'none',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              borderRadius: '6px 6px 0 0'
            }
          }} />
        </Box>
        
        {/* Info de litros */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" sx={{ 
            fontSize: '0.9rem', 
            color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.9)' : theme.palette.text.secondary,
            fontWeight: 700
          }}>
            {litrosVendidos.toLocaleString('es-CL')}L
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: '0.9rem', 
            color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.9)' : theme.palette.text.secondary,
            fontWeight: 700
          }}>
            {capacidadTotal.toLocaleString('es-CL')}L
          </Typography>
        </Box>
      </Box>
      
      {/* Línea decorativa inferior */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(90deg, transparent, ${progressColor}60, transparent)`,
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

export default CapacidadLocalCard;

