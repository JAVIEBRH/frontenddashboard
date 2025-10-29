import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip } from '@mui/material';

const VentasSemanalesLocalCard = ({ 
  title = 'Ventas Semanales', 
  subtitle = 'Monto total vendido en lo que va de la semana de ventas locales',
  ventasSemanales = 0,
  ventasSemanaAnterior = 0
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ventasSemanales: 0,
    ventasSemanaAnterior: 0,
    porcentajeCambio: 0,
    esPositivo: true,
    tendenciaSemanal: []
  });

  useEffect(() => {
    // Usar los datos pasados como props
    const porcentajeCambio = ventasSemanaAnterior > 0 
      ? ((ventasSemanales - ventasSemanaAnterior) / ventasSemanaAnterior) * 100 
      : 0;

    // Generar tendencia semanal simulada (últimos 7 días)
    const tendenciaSemanal = [
      { dia: 'Lun', ventas: ventasSemanales * 0.15 },
      { dia: 'Mar', ventas: ventasSemanales * 0.12 },
      { dia: 'Mié', ventas: ventasSemanales * 0.18 },
      { dia: 'Jue', ventas: ventasSemanales * 0.20 },
      { dia: 'Vie', ventas: ventasSemanales * 0.15 },
      { dia: 'Sáb', ventas: ventasSemanales * 0.12 },
      { dia: 'Dom', ventas: ventasSemanales * 0.08 }
    ];

    setData({
      ventasSemanales,
      ventasSemanaAnterior,
      porcentajeCambio,
      esPositivo: porcentajeCambio >= 0,
      tendenciaSemanal
    });
    setLoading(false);
  }, [ventasSemanales, ventasSemanaAnterior]);

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    } else {
      return `$${val.toLocaleString('es-CL')}`;
    }
  };

  // Generar puntos del gráfico de tendencia semanal
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

  const tooltipText = `Ventas semanales locales:
Esta semana: ${formatValue(data.ventasSemanales)}
Semana anterior: ${formatValue(data.ventasSemanaAnterior)}
Cambio: ${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`;

  if (loading) {
    return (
      <Box
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
          borderRadius: 3,
          padding: 3,
          color: theme.palette.text.primary,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          minHeight: 180,
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(147, 112, 219, 0.2)' 
            : 'rgba(147, 112, 219, 0.1)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="body2" sx={{ color: '#9370db' }}>
          Cargando ventas semanales...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        padding: 3,
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minHeight: 180,
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(147, 112, 219, 0.2)' 
          : 'rgba(147, 112, 219, 0.1)'}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary, 
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '1rem',
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
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: 'swap'
            }}
          >
            {formatValue(data.ventasSemanales)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.9rem',
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
        <Tooltip 
          title={tooltipText}
          placement="top"
          arrow
        >
          <Chip
            label={`${data.esPositivo ? '+' : ''}${data.porcentajeCambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(147, 112, 219, 0.2)' 
                : 'rgba(147, 112, 219, 0.1)',
              color: data.esPositivo ? '#059669' : '#dc2626',
              fontWeight: 600,
              border: `1px solid ${data.esPositivo ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
              fontSize: '0.9rem',
              height: 'auto',
              cursor: 'help',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: 'swap',
              '& .MuiChip-label': {
                padding: '8px 12px',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }
            }}
          />
        </Tooltip>
      </Box>
      
      {/* Gráfico de tendencia semanal */}
      <Box sx={{ 
        width: '100%', 
        height: 40, 
        mt: 2,
        position: 'relative'
      }}>
        <svg width="100%" height="40" style={{ overflow: 'visible' }}>
          <path
            d={generarPuntosGrafico()}
            stroke="#9370db"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`${generarPuntosGrafico()} L200 40 L0 40 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9370db" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#9370db" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Etiquetas de días */}
        {data.tendenciaSemanal && data.tendenciaSemanal.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 0.5,
            px: 1
          }}>
            {data.tendenciaSemanal.map((dia, index) => (
              <Typography 
                key={index}
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  fontWeight: 500,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontFeatureSettings: '"liga" 1, "kern" 1'
                }}
              >
                {dia.dia}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VentasSemanalesLocalCard;
