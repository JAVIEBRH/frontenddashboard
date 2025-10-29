import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { getVentasHistoricas } from '../services/api';

const VentasSemanalesCard = ({ 
  title = 'Ventas Semanales', 
  value = 0, 
  subtitle = 'Esta semana',
  percentageChange = 0,
  isPositive = true 
}) => {
  const theme = useTheme();
  const [ventasData, setVentasData] = useState({
    ventas_semana_actual: value,
    ventas_semana_pasada: 0,
    pedidos_semana_actual: 0,
    pedidos_semana_pasada: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive
  });
  const [loading, setLoading] = useState(false);
  
  const fetchVentasSemanales = async () => {
    try {
      setLoading(true);
      const data = await getVentasHistoricas();
      
      // Calcular ventas de la semana actual basándose en el mes actual
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const anioActual = hoy.getFullYear();
      
      // Mapear nombres de meses a números
      const mesesMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      // Encontrar ventas del mes actual
      const ventasMesActual = data.find(item => {
        const mesNumero = mesesMap[item.name];
        return mesNumero === mesActual && item.ventas > 0;
      });
      
      // Encontrar ventas del mes anterior
      const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
      const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual;
      const ventasMesAnterior = data.find(item => {
        const mesNumero = mesesMap[item.name];
        return mesNumero === mesAnterior && item.ventas > 0;
      });
      
      const ventasActual = ventasMesActual?.ventas || 0;
      const ventasAnterior = ventasMesAnterior?.ventas || 0;
      
      // Calcular ventas semanales (aproximadamente 1/4 del mes)
      const ventasSemanaActual = Math.floor(ventasActual / 4);
      const ventasSemanaPasada = Math.floor(ventasAnterior / 4);
      
      const porcentajeCambio = ventasSemanaPasada > 0 
        ? ((ventasSemanaActual - ventasSemanaPasada) / ventasSemanaPasada) * 100 
        : 0;
      
      setVentasData({
        ventas_semana_actual: ventasSemanaActual,
        ventas_semana_pasada: ventasSemanaPasada,
        pedidos_semana_actual: Math.floor(ventasSemanaActual / 4000), // Estimación de pedidos
        pedidos_semana_pasada: Math.floor(ventasSemanaPasada / 4000),
        porcentaje_cambio: porcentajeCambio,
        es_positivo: porcentajeCambio >= 0
      });
    } catch (error) {
      console.error('Error obteniendo ventas semanales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setVentasData(prev => ({
      ...prev,
      ventas_semana_actual: value,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive
    }));
  }, [value, percentageChange, isPositive]);
  
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
    // Simular tendencia basada en los datos de ventas
    const ventasActual = ventasData.ventas_semana_actual;
    const ventasPasada = ventasData.ventas_semana_pasada;
    
    if (ventasActual === 0 && ventasPasada === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    
    // Crear puntos que reflejen la tendencia
    const puntos = [];
    const maxVentas = Math.max(ventasActual, ventasPasada);
    
    for (let i = 0; i < 7; i++) {
      const x = (i / 6) * 200;
      // Simular variación diaria
      const variacion = Math.sin(i * 0.5) * 0.3 + 0.7;
      const y = 40 - (variacion * 30);
      puntos.push(`${x} ${y}`);
    }
    
    return `M${puntos.join(' L')}`;
  };

  const tooltipText = `Ventas semanales:
Semana actual: ${formatValue(ventasData.ventas_semana_actual)}
Semana pasada: ${formatValue(ventasData.ventas_semana_pasada)}
Pedidos actual: ${ventasData.pedidos_semana_actual}
Pedidos pasada: ${ventasData.pedidos_semana_pasada}
Cambio: ${ventasData.es_positivo ? '+' : ''}${ventasData.porcentaje_cambio}%`;

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
      onClick={fetchVentasSemanales}
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
              fontSize: '1rem', // Estandarizado a 1rem
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: 'swap'
            }}
          >
            {title}
            {loading && <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: '#9370db' }}>🔄</Typography>}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              color: theme.palette.text.primary,
              lineHeight: 1.1,
              fontSize: '2.5rem', // Estandarizado a 2.5rem
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: 'swap'
            }}
          >
            {formatValue(ventasData.ventas_semana_actual)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.9rem', // Estandarizado a 0.9rem
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
             label={`${ventasData.es_positivo ? '+' : ''}${ventasData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(147, 112, 219, 0.2)' 
                : 'rgba(147, 112, 219, 0.1)',
              color: ventasData.es_positivo ? '#059669' : '#dc2626',
              fontWeight: 600,
              border: `1px solid ${ventasData.es_positivo ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
              fontSize: '0.9rem', // Estandarizado a 0.9rem
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
        
        {/* Etiquetas de días de la semana */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 0.5,
          px: 1
        }}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => (
            <Typography 
              key={index}
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem', // Estandarizado a 0.75rem
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                fontWeight: 500,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontFeatureSettings: '"liga" 1, "kern" 1',
                fontDisplay: 'swap'
              }}
            >
              {dia}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VentasSemanalesCard; 