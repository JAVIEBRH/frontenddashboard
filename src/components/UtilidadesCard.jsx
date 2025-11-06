import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
// Los datos históricos vienen como prop desde Home.jsx
import InsightTooltip from './InsightTooltip';

const UtilidadesCard = ({ 
  title = 'Utilidades', 
  value = 12500000, 
  subtitle = 'Este mes',
  percentageChange = 12.5,
  isPositive = true 
}) => {
  const theme = useTheme();
  const [utilidadesData, setUtilidadesData] = useState({
    utilidades_mes_actual: value,
    utilidades_mes_anterior: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    tendencia_mensual: [],
    fecha_analisis: ''
  });
  const [loading, setLoading] = useState(false);
  
  const fetchUtilidadesMensuales = async () => {
    try {
      setLoading(true);
      const data = await getVentasHistoricas();
      
      // Obtener el mes actual y anterior
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
      
      // Calcular utilidades: ventas - costos (costos = 60% de ventas) SOLO para tendencia/mes anterior
      const ventasActual = ventasMesActual?.ventas || 0;
      const ventasAnterior = ventasMesAnterior?.ventas || 0;
      
      const costosActual = ventasActual * 0.6;
      const costosAnterior = ventasAnterior * 0.6;
      
      const utilidadesActual = ventasActual - costosActual;
      const utilidadesAnterior = ventasAnterior - costosAnterior;
      
      const porcentajeCambio = utilidadesAnterior > 0 
        ? ((utilidadesActual - utilidadesAnterior) / utilidadesAnterior) * 100 
        : 0;
      
      // Generar tendencia mensual basada en datos históricos
      const tendenciaMensual = [];
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      // Obtener los últimos 6 meses de datos
      for (let i = 5; i >= 0; i--) {
        const mesIndex = (mesActual - i + 12) % 12;
        const anio = mesActual - i < 0 ? anioActual - 1 : anioActual;
        
        const ventasMes = data.find(item => {
          const mesNumero = mesesMap[item.name];
          return mesNumero === mesIndex && item.ventas > 0;
        });
        
        const ventasMesValor = ventasMes?.ventas || 0;
        const costosMes = ventasMesValor * 0.6;
        const utilidadesMes = ventasMesValor - costosMes;
        
        tendenciaMensual.push({
          mes: mesesNombres[mesIndex],
          utilidades: utilidadesMes
        });
      }
      
      setUtilidadesData({
        // Mantener el valor real entregado por KPIs (prop "value")
        utilidades_mes_actual: value,
        utilidades_mes_anterior: utilidadesAnterior,
        // Usar el porcentaje proveniente de KPIs para coherencia global
        porcentaje_cambio: percentageChange,
        es_positivo: isPositive,
        tendencia_mensual: tendenciaMensual,
        fecha_analisis: hoy.toISOString()
      });
    } catch (error) {
      console.error('Error obteniendo utilidades mensuales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUtilidadesMensuales();
  }, []);

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setUtilidadesData(prev => ({
      ...prev,
      utilidades_mes_actual: value,
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

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (!utilidadesData.tendencia_mensual || utilidadesData.tendencia_mensual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }
    
    const puntos = utilidadesData.tendencia_mensual.map((mes, index) => {
      const x = (index / (utilidadesData.tendencia_mensual.length - 1)) * 200;
      const maxUtilidades = Math.max(...utilidadesData.tendencia_mensual.map(m => m.utilidades));
      const y = maxUtilidades > 0 ? 40 - (mes.utilidades / maxUtilidades) * 30 : 30;
      return `${x} ${y}`;
    });
    
    return `M${puntos.join(' L')}`;
  };

  const tooltipContent = `💰 UTILIDADES MENSUALES

💵 Mes actual: ${formatValue(utilidadesData.utilidades_mes_actual)}
📅 Mes anterior: ${formatValue(utilidadesData.utilidades_mes_anterior)}

${utilidadesData.es_positivo ? '📈' : '📉'} Variación: ${utilidadesData.es_positivo ? '+' : ''}${utilidadesData.porcentaje_cambio.toFixed(1)}%

💡 Cálculo: Utilidades = Ventas - Costos
   
   Ventas = Bidones × $2,000
   Costos = $260,000 + (Bidones × $60.69)`;

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
      onClick={fetchUtilidadesMensuales}
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
            {loading && <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: '#9370db' }}>🔄</Typography>}
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
            {formatValue(utilidadesData.utilidades_mes_actual)}
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
        <InsightTooltip 
          title={tooltipContent}
          placement="top"
        >
          <Chip
            label={`${utilidadesData.es_positivo ? '+' : ''}${utilidadesData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(147, 112, 219, 0.2)' 
                : 'rgba(147, 112, 219, 0.1)',
              color: utilidadesData.es_positivo ? '#059669' : '#dc2626',
              fontWeight: 600,
              border: `1px solid ${utilidadesData.es_positivo ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
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
        {utilidadesData.tendencia_mensual && utilidadesData.tendencia_mensual.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 0.5,
            px: 1
          }}>
            {utilidadesData.tendencia_mensual.map((mes, index) => (
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

export default UtilidadesCard; 