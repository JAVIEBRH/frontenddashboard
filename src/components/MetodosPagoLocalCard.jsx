import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip } from '@mui/material';

const MetodosPagoLocalCard = ({ 
  title = 'Métodos de Pago', 
  subtitle = 'Distribución de pagos por método en el local',
  metodosPago = {},
  totalVentas = 0
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metodosPago: [],
    totalVentas: 0,
    tendenciaMensual: []
  });

  useEffect(() => {
    // Usar los datos pasados como props
    if (Object.keys(metodosPago).length > 0) {
      // Convertir a array y calcular porcentajes
      const metodosArray = Object.entries(metodosPago).map(([metodo, datos]) => ({
        metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1),
        cantidad: datos.cantidad,
        monto: datos.monto,
        porcentaje: totalVentas > 0 ? (datos.monto / totalVentas) * 100 : 0
      })).sort((a, b) => b.monto - a.monto);

      // Generar tendencia mensual simulada
      const tendenciaMensual = [
        { mes: 'Ene', ventas: totalVentas * 0.8 },
        { mes: 'Feb', ventas: totalVentas * 0.85 },
        { mes: 'Mar', ventas: totalVentas * 0.9 },
        { mes: 'Abr', ventas: totalVentas * 0.92 },
        { mes: 'May', ventas: totalVentas * 0.95 },
        { mes: 'Jun', ventas: totalVentas * 0.98 },
        { mes: 'Jul', ventas: totalVentas }
      ];

      setData({
        metodosPago: metodosArray,
        totalVentas,
        tendenciaMensual
      });
    }
    setLoading(false);
  }, [metodosPago, totalVentas]);

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    } else {
      return `$${val.toLocaleString('es-CL')}`;
    }
  };

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (!data.tendenciaMensual || data.tendenciaMensual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    
    const puntos = data.tendenciaMensual.map((mes, index) => {
      const x = (index / (data.tendenciaMensual.length - 1)) * 200;
      const maxVentas = Math.max(...data.tendenciaMensual.map(m => m.ventas));
      const y = maxVentas > 0 ? 40 - (mes.ventas / maxVentas) * 30 : 30;
      return `${x} ${y}`;
    });
    
    return `M${puntos.join(' L')}`;
  };

  const tooltipText = `Métodos de pago locales:
Total ventas: ${formatValue(data.totalVentas)}
${data.metodosPago.map(m => `${m.metodo}: ${m.porcentaje.toFixed(1)}%`).join('\n')}`;

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
          Cargando métodos de pago...
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
            {data.metodosPago.length}
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
            label={`${formatValue(data.totalVentas)}`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(147, 112, 219, 0.2)' 
                : 'rgba(147, 112, 219, 0.1)',
              color: '#9370db',
              fontWeight: 600,
              border: `1px solid rgba(147, 112, 219, 0.2)`,
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
      
      {/* Gráfico de barras de métodos de pago */}
      <Box sx={{ mb: 2 }}>
        {data.metodosPago.slice(0, 3).map((metodo, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  fontWeight: 500
                }}
              >
                {metodo.metodo}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  fontWeight: 600
                }}
              >
                {metodo.porcentaje.toFixed(1)}%
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 6,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: `${metodo.porcentaje}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, #9370db 0%, #a855f7 100%)`,
                  borderRadius: 3,
                  boxShadow: '0 0 10px rgba(147, 112, 219, 0.5), 0 0 20px rgba(147, 112, 219, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(147, 112, 219, 0.7), 0 0 30px rgba(147, 112, 219, 0.4)'
                  }
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      
      {/* Gráfico de tendencia mensual */}
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
        
        {/* Etiquetas de meses */}
        {data.tendenciaMensual && data.tendenciaMensual.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 0.5,
            px: 1
          }}>
            {data.tendenciaMensual.slice(-6).map((mes, index) => (
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
                {mes.mes}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MetodosPagoLocalCard;
