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

const barSlideIn = keyframes`
  0% { 
    width: 0%;
    opacity: 0;
    transform: translateX(-20px);
  }
  100% { 
    width: var(--bar-width);
    opacity: 1;
    transform: translateX(0);
  }
`;

const barGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 2px 8px var(--bar-color)40;
  }
  50% { 
    box-shadow: 0 4px 20px var(--bar-color)80;
  }
`;

const MetodosPagoLocalCard = ({ 
  title = 'Métodos de Pago', 
  subtitle = 'Distribución de pagos por método en el local',
  metodosPago = {},
  totalVentas = 0
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState({
    metodosPago: [],
    totalVentas: 0
  });

  useEffect(() => {
    if (Object.keys(metodosPago).length > 0) {
      const metodosArray = Object.entries(metodosPago).map(([metodo, datos]) => ({
        metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1),
        cantidad: datos.cantidad,
        monto: datos.monto,
        porcentaje: totalVentas > 0 ? (datos.monto / totalVentas) * 100 : 0
      })).sort((a, b) => b.cantidad - a.cantidad); // Ordenar por frecuencia (cantidad de transacciones)

      setData({ metodosPago: metodosArray, totalVentas });
    }
  }, [metodosPago, totalVentas]);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString('es-CL')}`;
  };

  const metodoPrincipal = data.metodosPago[0];

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
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
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
            💳 {title}
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
            {data.metodosPago.length}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: '0.85rem'
          }}>
            {metodoPrincipal ? `${metodoPrincipal.metodo} es el principal` : subtitle}
          </Typography>
        </Box>
        <Tooltip title={`Total: ${formatValue(data.totalVentas)}`} placement="top" arrow>
          <Chip
            label={formatValue(data.totalVentas)}
            sx={{
              background: theme.palette.mode === 'dark' ? 'rgba(0, 191, 255, 0.2)' : 'rgba(0, 191, 255, 0.1)',
              color: '#9370db',
              fontWeight: 700,
              border: '1px solid rgba(0, 191, 255, 0.3)',
              fontSize: '0.85rem',
              height: 'auto',
              cursor: 'help',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              '& .MuiChip-label': { padding: '6px 10px' },
              '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 15px rgba(0, 191, 255, 0.4)' }
            }}
          />
        </Tooltip>
      </Box>

      {/* Barras de métodos de pago - Verticales (hacia abajo) */}
      {data.metodosPago.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.75, 
          mt: 'auto',
          mb: 1,
          position: 'relative', 
          zIndex: 1,
          flex: 1,
          justifyContent: 'flex-end',
          minHeight: 180
        }}>
          {data.metodosPago.slice(0, 6).map((metodo, index) => {
            const maxCantidad = Math.max(...data.metodosPago.slice(0, 6).map(m => m.cantidad));
            const alturaPorcentaje = maxCantidad > 0 ? (metodo.cantidad / maxCantidad) * 100 : 0;
            
            // Colores según método de pago
            const getColoresPorMetodo = (nombreMetodo) => {
              const nombreLower = nombreMetodo.toLowerCase();
              if (nombreLower.includes('efectivo')) {
                return ['#10b981', '#34d399']; // Verde
              } else if (nombreLower.includes('mercadopago')) {
                return ['#fbbf24', '#fcd34d']; // Amarillo
              } else if (nombreLower.includes('transferencia')) {
                return ['#3b82f6', '#60a5fa']; // Azul
              } else {
                // Colores por defecto para otros métodos
                const coloresDefault = [
                  ['#7c3aed', '#8b5cf6'],
                  ['#a855f7', '#b77aff'],
                  ['#c084fc', '#d4a5ff'],
                  ['#e879f9', '#f0abfc'],
                  ['#ec4899', '#f472b6'],
                  ['#f43f5e', '#fb7185']
                ];
                return coloresDefault[index % coloresDefault.length];
              }
            };
            
            const colores = getColoresPorMetodo(metodo.metodo) || ['#7c3aed', '#8b5cf6']; // Fallback si es undefined
            
            const barWidth = `${Math.max(alturaPorcentaje, 20)}%`;
            
            return (
              <Box
                key={index}
                sx={{
                  '--bar-width': barWidth,
                  '--bar-color': colores[0],
                  width: barWidth,
                  height: '32px',
                  minHeight: '28px',
                  background: `linear-gradient(90deg, ${colores[0]} 0%, ${colores[1]} 100%)`,
                  borderRadius: 2,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px',
                  position: 'relative',
                  boxShadow: `0 2px 8px ${colores[0]}40`,
                  animation: `${barSlideIn} 0.6s ease-out ${index * 0.1}s both, ${barGlow} 2s ease-in-out ${index * 0.1 + 0.6}s infinite`,
                  '&:hover': {
                    transform: 'scaleX(1.05) scaleY(1.1)',
                    boxShadow: `0 6px 20px ${colores[0]}90`,
                    zIndex: 2,
                    '& .bar-text': {
                      transform: 'scale(1.05)',
                    }
                  }
                }}
              >
                <Typography 
                  className="bar-text"
                  variant="caption" 
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'transform 0.3s ease',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {metodo.metodo}
                </Typography>
                <Typography 
                  className="bar-text"
                  variant="caption" 
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    minWidth: '24px',
                    textAlign: 'right',
                    marginLeft: '8px'
                  }}
                >
                  {metodo.cantidad}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

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

export default MetodosPagoLocalCard;
