import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip, keyframes } from '@mui/material';

// Animaciones futuristas
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const lineGlow = keyframes`
  0%, 100% { opacity: 0.5; box-shadow: 0 0 5px rgba(0, 191, 255, 0.4); }
  50% { opacity: 1; box-shadow: 0 0 15px rgba(0, 191, 255, 0.7); }
`;

const VentasTotalesLocalCard = ({ 
  title = 'Ventas Totales', 
  subtitle = 'Monto total vendido por cada mes de ventas locales',
  ventasTotales = 0,
  ventasAnioPasado = 0
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState({
    ventasTotales: 0,
    ventasAnioPasado: 0,
    porcentajeCambio: 0,
    esPositivo: true,
    tendenciaAnual: []
  });

  useEffect(() => {
    const porcentajeCambio = ventasAnioPasado > 0 
      ? ((ventasTotales - ventasAnioPasado) / ventasAnioPasado) * 100 
      : 0;

    const tendenciaAnual = [
      { mes: 'Ene', ventas: ventasTotales * 0.7 },
      { mes: 'Feb', ventas: ventasTotales * 0.75 },
      { mes: 'Mar', ventas: ventasTotales * 0.8 },
      { mes: 'Abr', ventas: ventasTotales * 0.82 },
      { mes: 'May', ventas: ventasTotales * 0.85 },
      { mes: 'Jun', ventas: ventasTotales * 0.88 },
      { mes: 'Jul', ventas: ventasTotales * 0.9 },
      { mes: 'Ago', ventas: ventasTotales * 0.92 },
      { mes: 'Sep', ventas: ventasTotales * 0.94 },
      { mes: 'Oct', ventas: ventasTotales * 0.96 },
      { mes: 'Nov', ventas: ventasTotales * 0.98 },
      { mes: 'Dic', ventas: ventasTotales }
    ];

    setData({
      ventasTotales,
      ventasAnioPasado,
      porcentajeCambio,
      esPositivo: porcentajeCambio >= 0,
      tendenciaAnual
    });
  }, [ventasTotales, ventasAnioPasado]);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString('es-CL')}`;
  };

  const generarPuntosGrafico = () => {
    if (!data.tendenciaAnual || data.tendenciaAnual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    const puntos = data.tendenciaAnual.map((mes, index) => {
      const x = (index / (data.tendenciaAnual.length - 1)) * 200;
      const maxVentas = Math.max(...data.tendenciaAnual.map(m => m.ventas));
      const y = maxVentas > 0 ? 40 - (mes.ventas / maxVentas) * 30 : 30;
      return `${x} ${y}`;
    });
    return `M${puntos.join(' L')}`;
  };

  const tooltipText = `Ventas totales locales:\nTotal acumulado: ${formatValue(data.ventasTotales)}\nAño anterior: ${formatValue(data.ventasAnioPasado)}\nCambio: ${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`;

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
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(0, 191, 255, 0.4)' 
          : 'rgba(0, 191, 255, 0.25)'}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)'
            : '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderColor: 'rgba(0, 191, 255, 0.6)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '200%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent)',
          animation: `${shimmer} 3s infinite`,
          pointerEvents: 'none'
        }
      }}
    >
      {/* Efecto de esquina brillante */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        background: 'radial-gradient(circle, rgba(0, 191, 255, 0.25) 0%, transparent 70%)',
        animation: `${pulse} 2s ease-in-out infinite`,
        pointerEvents: 'none'
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 1)' : '#7c3aed',
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.75rem'
            }}
          >
            💰 {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              color: theme.palette.text.primary,
              lineHeight: 1.1,
              fontSize: '2.2rem',
              textShadow: theme.palette.mode === 'dark' ? '0 0 20px rgba(0, 191, 255, 0.4)' : 'none',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            {formatValue(data.ventasTotales)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Tooltip title={tooltipText} placement="top" arrow>
          <Chip
            label={`${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(0, 191, 255, 0.3)' 
                : 'rgba(0, 191, 255, 0.2)',
              color: data.esPositivo ? '#10b981' : '#ef4444',
              fontWeight: 700,
              border: `1px solid ${data.esPositivo ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.85rem',
              height: 'auto',
              cursor: 'help',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              '& .MuiChip-label': { padding: '6px 10px' },
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 15px ${data.esPositivo ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }
            }}
          />
        </Tooltip>
      </Box>
      
      {/* Gráfico de tendencia */}
      <Box sx={{ width: '100%', height: 40, mt: 2, position: 'relative', zIndex: 1 }}>
        <svg width="100%" height="40" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="gradientTotales" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9370db" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#9370db" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path
            d={`${generarPuntosGrafico()} L200 40 L0 40 Z`}
            fill="url(#gradientTotales)"
            opacity="0.4"
          />
          <path
            d={generarPuntosGrafico()}
            stroke="url(#gradientTotales)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            style={{
              filter: isHovered ? 'drop-shadow(0 0 6px rgba(0, 191, 255, 0.9))' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
        </svg>
      </Box>

      {/* Línea decorativa inferior */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.6), transparent)',
        borderRadius: 1,
        animation: `${lineGlow} 2s ease-in-out infinite`
      }} />
    </Box>
  );
};

export default VentasTotalesLocalCard;
