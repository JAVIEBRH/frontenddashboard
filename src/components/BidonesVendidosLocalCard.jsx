import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const BidonesVendidosLocalCard = ({ 
  title = 'Bidones Vendidos', 
  subtitle = 'Total de bidones vendidos en lo que va del mes en venta local'
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bidonesVendidos: 0,
    bidonesMesAnterior: 0,
    porcentajeCambio: 0,
    esPositivo: true,
    tendenciaMensual: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://fluvi.cl/apilian/api_eventalocal.php');
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          const fechaActual = new Date();
          const mesActual = fechaActual.getMonth();
          const anioActual = fechaActual.getFullYear();
          
          let bidonesVendidos = 0;
          let bidonesMesAnterior = 0;

          result.data.forEach(venta => {
            const precio = parseInt(venta.precio);
            const fechaVenta = new Date(venta.fecha.split('-').reverse().join('-'));
            
            // Calcular bidones basado en la promoción acumulable (3 bidones por $5,000)
            const bidones = Math.floor(precio / 5000) * 3; // Cada $5,000 = 3 bidones
            
            // Bidones del mes actual
            if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual) {
              bidonesVendidos += bidones;
            }
            
            // Bidones del mes anterior
            if (fechaVenta.getMonth() === (mesActual - 1) && fechaVenta.getFullYear() === anioActual) {
              bidonesMesAnterior += bidones;
            }
          });

          const porcentajeCambio = bidonesMesAnterior > 0 
            ? ((bidonesVendidos - bidonesMesAnterior) / bidonesMesAnterior) * 100 
            : 0;

          // Generar tendencia mensual simulada
          const tendenciaMensual = [
            { mes: 'Ene', bidones: bidonesVendidos * 0.8 },
            { mes: 'Feb', bidones: bidonesVendidos * 0.85 },
            { mes: 'Mar', bidones: bidonesVendidos * 0.9 },
            { mes: 'Abr', bidones: bidonesVendidos * 0.92 },
            { mes: 'May', bidones: bidonesVendidos * 0.95 },
            { mes: 'Jun', bidones: bidonesVendidos * 0.98 },
            { mes: 'Jul', bidones: bidonesVendidos }
          ];

          setData({
            bidonesVendidos,
            bidonesMesAnterior,
            porcentajeCambio,
            esPositivo: porcentajeCambio >= 0,
            tendenciaMensual
          });
        }
      } catch (error) {
        console.error('Error obteniendo datos de bidones vendidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatValue = (val) => {
    return val.toLocaleString('es-CL');
  };

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (!data.tendenciaMensual || data.tendenciaMensual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    
    const puntos = data.tendenciaMensual.map((mes, index) => {
      const x = (index / (data.tendenciaMensual.length - 1)) * 200;
      const maxBidones = Math.max(...data.tendenciaMensual.map(m => m.bidones));
      const y = maxBidones > 0 ? 40 - (mes.bidones / maxBidones) * 30 : 30;
      return `${x} ${y}`;
    });
    
    return `M${puntos.join(' L')}`;
  };

  const tooltipText = `Bidones vendidos locales:
Este mes: ${formatValue(data.bidonesVendidos)} bidones
Mes anterior: ${formatValue(data.bidonesMesAnterior)} bidones
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
          Cargando bidones vendidos...
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
            {formatValue(data.bidonesVendidos)}
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

export default BidonesVendidosLocalCard;
