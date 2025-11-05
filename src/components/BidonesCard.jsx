import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
import InsightTooltip from './InsightTooltip';

const BidonesCard = ({ 
  title = 'Bidones Vendidos', 
  value = 0, 
  previousValue = 0,
  subtitle = 'Este mes',
  percentageChange = 0,
  isPositive = true 
}) => {
  const theme = useTheme();
  const [bidonesData, setBidonesData] = useState({
    total_bidones: value,
    bidones_mes_actual: value,
    bidones_mes_anterior: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    tendencia_diaria: [],
    fecha_analisis: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setBidonesData(prev => ({
      ...prev,
      total_bidones: value,
      bidones_mes_actual: value,
      bidones_mes_anterior: previousValue, // Usar el prop directamente
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive
    }));
  }, [value, previousValue, percentageChange, isPositive]);
  
  // NO hacer cálculo propio - usar SOLO el prop value que viene de Home.jsx
  // El cálculo ya se hace en Home.jsx desde bidones vendidos reales
  // Este componente solo debe mostrar el valor recibido

  // Generar puntos del gráfico de tendencia diaria
  const generarPuntosGrafico = () => {
    if (!bidonesData.tendencia_diaria || bidonesData.tendencia_diaria.length === 0) {
      return "M0 25 Q20 15 40 20 T80 10 T120 15 T160 5 T200 10";
    }
    
    const puntos = bidonesData.tendencia_diaria.map((dia, index) => {
      const x = (index / (bidonesData.tendencia_diaria.length - 1)) * 200;
      const maxBidones = Math.max(...bidonesData.tendencia_diaria.map(d => d.bidones));
      const y = maxBidones > 0 ? 40 - (dia.bidones / maxBidones) * 30 : 30;
      return `${x} ${y}`;
    });
    
    return `M${puntos.join(' L')}`;
  };

  const tooltipContent = `📦 BIDONES VENDIDOS

🔢 Mes actual: ${bidonesData.bidones_mes_actual.toLocaleString('es-CL')} bidones
📅 Mes anterior: ${bidonesData.bidones_mes_anterior.toLocaleString('es-CL')} bidones

${bidonesData.es_positivo ? '📈' : '📉'} Variación: ${bidonesData.es_positivo ? '+' : ''}${bidonesData.porcentaje_cambio.toFixed(1)}%

💡 Cálculo: Contado directamente desde pedidos reales
   Cada bidón = 20 litros`;

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
            {(() => {
              const valorMostrado = bidonesData.total_bidones.toLocaleString('es-CL');
              console.log('📊 BidonesCard MOSTRANDO en pantalla:', valorMostrado, '(valor numérico:', bidonesData.total_bidones, ', prop value recibido:', value, ')');
              return valorMostrado;
            })()}
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
            label={`${bidonesData.es_positivo ? '+' : ''}${bidonesData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(147, 112, 219, 0.2)' 
                : 'rgba(147, 112, 219, 0.1)',
              color: bidonesData.es_positivo ? '#059669' : '#dc2626',
              fontWeight: 600,
              border: `1px solid ${bidonesData.es_positivo ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
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
      
      {/* Gráfico de tendencia diaria */}
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
        {bidonesData.tendencia_diaria && bidonesData.tendencia_diaria.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 0.5,
            px: 1
          }}>
            {bidonesData.tendencia_diaria.slice(-6).map((dia, index) => (
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
                {dia.dia}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BidonesCard; 