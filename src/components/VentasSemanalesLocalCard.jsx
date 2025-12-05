import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip, keyframes } from '@mui/material';

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

const VentasSemanalesLocalCard = ({ 
  title = 'Ventas Semanales', 
  subtitle = 'Monto total vendido en lo que va de la semana de ventas locales',
  ventasSemanales = 0,
  ventasSemanaAnterior = 0
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState({
    ventasSemanales: 0,
    ventasSemanaAnterior: 0,
    porcentajeCambio: 0,
    esPositivo: true,
    tendenciaSemanal: []
  });

  useEffect(() => {
    const porcentajeCambio = ventasSemanaAnterior > 0 
      ? ((ventasSemanales - ventasSemanaAnterior) / ventasSemanaAnterior) * 100 
      : 0;

    const tendenciaSemanal = [
      { dia: 'Lun', ventas: ventasSemanales * 0.15 },
      { dia: 'Mar', ventas: ventasSemanales * 0.12 },
      { dia: 'Mié', ventas: ventasSemanales * 0.18 },
      { dia: 'Jue', ventas: ventasSemanales * 0.20 },
      { dia: 'Vie', ventas: ventasSemanales * 0.15 },
      { dia: 'Sáb', ventas: ventasSemanales * 0.12 },
      { dia: 'Dom', ventas: ventasSemanales * 0.08 }
    ];

    setData({ ventasSemanales, ventasSemanaAnterior, porcentajeCambio, esPositivo: porcentajeCambio >= 0, tendenciaSemanal });
  }, [ventasSemanales, ventasSemanaAnterior]);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString('es-CL')}`;
  };

  const generarPuntosGrafico = () => {
    if (!data.tendenciaSemanal || data.tendenciaSemanal.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    const puntos = data.tendenciaSemanal.map((dia, index) => {
      const x = (index / (data.tendenciaSemanal.length - 1)) * 200;
      const maxVentas = Math.max(...data.tendenciaSemanal.map(d => d.ventas));
      const y = maxVentas > 0 ? 40 - (dia.ventas / maxVentas) * 30 : 30;
      return `${x} ${y}`;
    });
    return `M${puntos.join(' L')}`;
  };

  const tooltipText = `Ventas semanales locales:\nEsta semana: ${formatValue(data.ventasSemanales)}\nSemana anterior: ${formatValue(data.ventasSemanaAnterior)}\nCambio: ${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        padding: 3,
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        minHeight: 180,
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ 
            fontWeight: 700, 
            color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.9)' : '#7c3aed',
            mb: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.75rem'
          }}>
            📆 {title}
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            mb: 1,
            color: theme.palette.text.primary,
            lineHeight: 1.1,
            fontSize: '2.2rem',
            textShadow: theme.palette.mode === 'dark' ? '0 0 20px rgba(0, 191, 255, 0.3)' : 'none',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)'
          }}>
            {formatValue(data.ventasSemanales)}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: '0.85rem'
          }}>
            {subtitle}
          </Typography>
        </Box>
        <Tooltip title={tooltipText} placement="top" arrow>
          <Chip
            label={`${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.2)' : 'rgba(0, 191, 255, 0.1)',
              color: data.esPositivo ? '#10b981' : '#ef4444',
              fontWeight: 700,
              border: `1px solid ${data.esPositivo ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.85rem',
              height: 'auto',
              cursor: 'help',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              '& .MuiChip-label': { padding: '6px 10px' },
              '&:hover': { transform: 'scale(1.05)', boxShadow: `0 0 15px ${data.esPositivo ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}` }
            }}
          />
        </Tooltip>
      </Box>
      
      <Box sx={{ width: '100%', height: 40, mt: 2, position: 'relative', zIndex: 1 }}>
        <svg width="100%" height="40" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="gradientSemanal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9370db" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#9370db" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path d={`${generarPuntosGrafico()} L200 40 L0 40 Z`} fill="url(#gradientSemanal)" opacity="0.4" />
          <path d={generarPuntosGrafico()} stroke="#9370db" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{ filter: isHovered ? 'drop-shadow(0 0 6px rgba(0, 191, 255, 0.8))' : 'none', transition: 'filter 0.3s ease' }}
          />
        </svg>
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

export default VentasSemanalesLocalCard;
