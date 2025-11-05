import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
import { formatCurrency } from '../utils/formatters';
import InsightTooltip from './InsightTooltip';

const VentasCard = ({ 
  title = 'Ventas Totales Históricas', 
  value = 0, 
  subtitle = 'Acumulado desde el inicio',
  percentageChange = 0,
  isPositive = true,
  fechaInicio = null,
  fechaFin = null,
  totalPedidos = 0
}) => {
  const theme = useTheme();
  const [ventasData, setVentasData] = useState({
    ventas_totales: value,
    total_pedidos: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    tendencia_mensual: [],
    fecha_analisis: ''
  });
  // NO hacer cálculo interno - usar SOLO el prop value que viene de Home.jsx
  // El cálculo de ventas totales históricas se hace en Home.jsx
  // Este componente solo debe mostrar el valor recibido

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setVentasData(prev => ({
      ...prev,
      ventas_totales: value,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive
    }));
  }, [value, percentageChange, isPositive]);
  
  const formatValue = (val) => {
    return formatCurrency(val);
  };

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (!ventasData.tendencia_mensual || ventasData.tendencia_mensual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    
    const puntos = ventasData.tendencia_mensual.map((mes, index) => {
      const x = (index / (ventasData.tendencia_mensual.length - 1)) * 200;
      const maxVentas = Math.max(...ventasData.tendencia_mensual.map(m => m.ventas));
      const y = maxVentas > 0 ? 40 - (mes.ventas / maxVentas) * 30 : 30;
      return `${x} ${y}`;
    });
    
    return `M${puntos.join(' L')}`;
  };

  // Formatear fechas para el tooltip
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const tooltipContent = `💰 VENTAS TOTALES HISTÓRICAS

💵 Total acumulado: ${formatValue(ventasData.ventas_totales)}

${ventasData.es_positivo ? '📈' : '📉'} Crecimiento: ${ventasData.es_positivo ? '+' : ''}${ventasData.porcentaje_cambio.toFixed(1)}%

📅 Rango de datos:
   Desde: ${formatearFecha(fechaInicio)}
   Hasta: ${formatearFecha(fechaFin)}
   
📊 Total de pedidos: ${totalPedidos > 0 ? totalPedidos.toLocaleString('es-CL') : 'N/A'}

💡 Cálculo: Suma de TODAS las ventas históricas
   desde el inicio del negocio (sin restricciones)
   
   Incluye TODOS los pedidos históricos disponibles
   Objetivo: Vista completa del flujo monetario histórico
   Filtrado: Solo pedidos de "Aguas Ancud"`;

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
              fontSize: '1rem', // Estandarizado a 1rem
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
              fontSize: '2.5rem', // Estandarizado a 2.5rem
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: 'swap'
            }}
          >
            {formatValue(ventasData.ventas_totales)}
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
        <InsightTooltip 
          title={tooltipContent}
          placement="top"
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
        </InsightTooltip>
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
        {ventasData.tendencia_mensual && ventasData.tendencia_mensual.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 0.5,
            px: 1
          }}>
            {ventasData.tendencia_mensual.slice(-6).map((mes, index) => (
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

export default memo(VentasCard); 