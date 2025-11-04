import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Grid, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  Assessment, 
  CheckCircle, 
  Warning, 
  DragIndicator
} from '@mui/icons-material';
import { getAnalisisRentabilidad } from '../services/api';
import DraggableCard from './DraggableCard';

const RentabilidadCard = () => {
  const theme = useTheme();
  const [rentabilidadData, setRentabilidadData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para las posiciones de las secciones internas
  const [sectionPositions, setSectionPositions] = useState({
    // Primera fila: Crecimiento, Estacionalidad, Punto Equilibrio, ROI
    // Espaciado horizontal: width del card + 20px de margen
    crecimiento: { x: 0, y: 0 },
    estacionalidad: { x: 360, y: 0 }, // 340 (ancho) + 20 (margen)
    puntoEquilibrio: { x: 720, y: 0 }, // 360 + 340 + 20
    roi: { x: 1080, y: 0 }, // 720 + 340 + 20
    // Segunda fila: Proyecciones y Escenarios
    // Altura máxima de primera fila: 360px (puntoEquilibrio), + 30px de margen vertical = 390px
    proyecciones: { x: 0, y: 390 }, // Altura más alta de fila 1 (360) + 30 de margen
    escenarios: { x: 480, y: 390 }, // 450 (ancho proyecciones) + 30 (margen)
    // Tercera fila: Insights y Recomendaciones
    // Altura de proyecciones y escenarios: 380px, + 30px de margen vertical = 770px
    insights: { x: 0, y: 770 }, // 390 + 380 + 30
    recomendaciones: { x: 510, y: 770 } // 480 (ancho insights) + 30 (margen)
  });

  // Estados para los tamaños de las secciones
  const [sectionSizes, setSectionSizes] = useState({
    crecimiento: { width: 340, height: 340 },
    estacionalidad: { width: 340, height: 340 },
    puntoEquilibrio: { width: 340, height: 360 },
    roi: { width: 340, height: 340 },
    proyecciones: { width: 450, height: 380 },
    escenarios: { width: 680, height: 380 },
    insights: { width: 480, height: 360 },
    recomendaciones: { width: 480, height: 360 }
  });

  const fetchRentabilidadData = async () => {
    try {
      setLoading(true);
      const data = await getAnalisisRentabilidad();
      
      // Validar que no haya error en la respuesta
      if (data.error) {
        console.error('Error en respuesta de rentabilidad:', data.error);
        setRentabilidadData(null);
        return;
      }
      
      // Validar estructura mínima de datos
      if (!data.analisis_avanzado && !data.metricas_principales) {
        console.error('Respuesta de rentabilidad sin estructura esperada');
        setRentabilidadData(null);
        return;
      }
      
      // Debug: Log de datos recibidos
      console.log('📊 Datos de rentabilidad recibidos:', {
        proyecciones: data.analisis_avanzado?.proyecciones,
        escenarios: data.analisis_avanzado?.escenarios_rentabilidad,
        metricas: data.metricas_principales
      });
      
      setRentabilidadData(data);
    } catch (error) {
      console.error('Error obteniendo datos de rentabilidad:', error);
      setRentabilidadData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentabilidadData();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(() => {
      console.log('Actualización automática del análisis de rentabilidad...');
      fetchRentabilidadData();
    }, 10 * 60 * 1000); // 10 minutos

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en RentabilidadCard...');
      fetchRentabilidadData();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, []);

  const getColorByValue = (value, threshold = 0) => {
    if (value > threshold) return theme.palette.mode === 'dark' ? '#22c55e' : '#059669';
    if (value < threshold) return theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626';
    return theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af';
  };

  const getIconByValue = (value, threshold = 0) => {
    if (value > threshold) return <TrendingUp />;
    if (value < threshold) return <TrendingUp />;
    return <Assessment />;
  };

  // Funciones para manejar el drag and drop
  const handleSectionMove = (id, position) => {
    setSectionPositions(prev => ({
      ...prev,
      [id]: position
    }));
  };

  const handleSectionResize = (id, size) => {
    setSectionSizes(prev => ({
      ...prev,
      [id]: size
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando análisis de rentabilidad...</Typography>
      </Box>
    );
  }

  if (!rentabilidadData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Error al cargar los datos de rentabilidad</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.default',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header del análisis */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary', 
            mb: 1,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          📊 Análisis Financiero Avanzado
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontSize: '0.95rem'
          }}
        >
          Arrastra y reorganiza las secciones según tus preferencias
        </Typography>
      </Box>

      {/* Contenedor principal con posicionamiento absoluto */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        minHeight: '1150px', // Altura ajustada: 770 (y de insights) + 360 (altura insights) + 20 (margen)
        overflow: 'visible' // Cambiar a visible para permitir ver todos los cards
      }}>
        {/* Análisis Avanzado con drag and drop */}
        {rentabilidadData.analisis_avanzado && (
          <>
            {/* Crecimiento */}
            <DraggableCard
              id="crecimiento"
              position={sectionPositions.crecimiento}
              size={sectionSizes.crecimiento}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', fontSize: 22 }} />
                    Crecimiento
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem', 
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Mensual
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem', 
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Trimestral
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Ventas Trimestre
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.crecimiento?.ventas_trimestre || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Crecimiento */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0) > (rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0)
                      ? 'Crecimiento mensual supera al trimestral - tendencia positiva'
                      : 'Crecimiento trimestral más fuerte - estabilidad a largo plazo'}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

            {/* Estacionalidad */}
            <DraggableCard
              id="estacionalidad"
              position={sectionPositions.estacionalidad}
              size={sectionSizes.estacionalidad}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    Estacionalidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Factor
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.estacionalidad?.factor_estacional || 0}x
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Verano
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_verano || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Invierno
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_invierno || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight de Estacionalidad */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: '#f59e0b', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_verano || 0) > (rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_invierno || 0)
                      ? 'Mayor demanda en verano - preparar inventario'
                      : 'Demanda estable todo el año - planificación uniforme'}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

            {/* Punto Equilibrio */}
            <DraggableCard
              id="puntoEquilibrio"
              position={sectionPositions.puntoEquilibrio}
              size={sectionSizes.puntoEquilibrio}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    Punto de Equilibrio
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', 
                      mb: 1,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Bidones por mes
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Valor Monetario
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${((rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0) * (rentabilidadData?.datos_reales?.precio_venta_bidon || 0)).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Punto Equilibrio */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: '#f59e0b', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(rentabilidadData?.datos_reales?.total_bidones_mes || 0) > (rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0)
                      ? 'Ventas superan el punto de equilibrio - operación rentable'
                      : 'Ventas por debajo del punto de equilibrio - necesita más volumen'}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

            {/* ROI */}
            <DraggableCard
              id="roi"
              position={sectionPositions.roi}
              size={sectionSizes.roi}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    ROI
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Actual
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.actual !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.actual}%` 
                      : '0%'}
                  </Typography>
                </Box>
                 
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Proyectado
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.proyectado !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.proyectado}%` 
                      : '0%'}
                  </Typography>
                </Box>
                 
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Ventas Trimestre
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.ventas_trimestre !== undefined && rentabilidadData.analisis_avanzado.roi.ventas_trimestre !== null
                      ? `$${rentabilidadData.analisis_avanzado.roi.ventas_trimestre.toLocaleString()}` 
                      : '$0'}
                  </Typography>
                </Box>

                 {/* Insight de ROI */}
                 <Box sx={{ 
                   mt: 2.5, 
                   pt: 2,
                   borderTop: `1px solid ${theme.palette.divider}`
                 }}>
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       fontSize: '0.875rem', 
                       color: '#f59e0b', 
                       fontWeight: 700,
                       mb: 0.75,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 0.5,
                       fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale'
                     }}
                   >
                     💡 <span>Insight:</span>
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       fontSize: '0.875rem', 
                       display: 'block', 
                       color: 'text.secondary',
                       lineHeight: 1.6,
                       wordWrap: 'break-word',
                       overflowWrap: 'break-word',
                       maxWidth: '100%',
                       fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale'
                     }}
                   >
                     {(() => {
                       const roiActual = rentabilidadData?.analisis_avanzado?.roi?.actual ?? 0;
                       const roiProyectado = rentabilidadData?.analisis_avanzado?.roi?.proyectado ?? 0;
                       
                       if (roiActual === 0 && roiProyectado === 0) {
                         return 'No hay datos suficientes para calcular ROI - Verifique los datos del mes actual';
                       } else if (roiActual > roiProyectado && roiActual > 0) {
                         return 'ROI actual superior al proyectado - estrategia efectiva';
                       } else if (roiActual < 0) {
                         return 'ROI negativo - operación no rentable, requiere atención inmediata';
                       } else if (roiProyectado > roiActual) {
                         return 'ROI proyectado más alto - optimizar operaciones para alcanzar proyección';
                       } else {
                         return 'ROI en línea con proyecciones - mantener estrategia actual';
                       }
                     })()}
                   </Typography>
                 </Box>
              </Box>
            </DraggableCard>

            {/* Proyecciones */}
            <DraggableCard
              id="proyecciones"
              position={sectionPositions.proyecciones}
              size={sectionSizes.proyecciones}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', fontSize: 22 }} />
                    Proyección 3 Meses
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={1.5}>
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Mes 1
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_1 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        Mes 2
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_2 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        Mes 3
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_3 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2.5, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Tendencia
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>

                {/* Insight de Proyecciones */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0) > 0
                      ? 'Proyección positiva - preparar para crecimiento'
                      : 'Proyección estable - mantener estrategia actual'}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

            {/* Escenarios de Rentabilidad */}
            <DraggableCard
              id="escenarios"
              position={sectionPositions.escenarios}
              size={sectionSizes.escenarios}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9370db', fontSize: 22 }} />
                    Escenarios de Rentabilidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(5, 150, 105, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(5, 150, 105, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Optimista
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Actual
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.actual?.margen || rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Pesimista
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.pesimista?.margen || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Insight de Escenarios */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9370db', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(() => {
                      const optimista = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0;
                      const actual = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.actual?.margen || rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0;
                      const pesimista = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.pesimista?.margen || 0;
                      
                      if (optimista - actual > 5) return 'Potencial de mejora significativo - optimizar operaciones';
                      if (actual - pesimista > 5) return 'Posición estable - margen de seguridad alto';
                      return 'Escenarios equilibrados - monitorear tendencias';
                    })()}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

            {/* Insights */}
            <DraggableCard
              id="insights"
              position={sectionPositions.insights}
              size={sectionSizes.insights}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9370db', fontSize: 22 }} />
                    Insights Clave
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {rentabilidadData?.insights && rentabilidadData.insights.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {rentabilidadData.insights.slice(0, 3).map((insight, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 0, 
                          py: 1.5, 
                          mb: index < 2 ? 1.5 : 0,
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, mr: 1.5 }}>
                          {insight.tipo === 'positivo' ? (
                            <CheckCircle sx={{ 
                              color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                              fontSize: 22 
                            }} />
                          ) : (
                            <Warning sx={{ 
                              color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626', 
                              fontSize: 22 
                            }} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={insight.titulo}
                          secondary={insight.descripcion}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: {
                              fontWeight: 700, 
                              fontSize: '0.95rem',
                              color: 'text.primary',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              mb: 0.5,
                              lineHeight: 1.3,
                              wordBreak: 'break-word'
                            }
                          }}
                          secondaryTypographyProps={{ 
                            variant: 'body2',
                            sx: {
                              fontSize: '0.875rem',
                              color: 'text.secondary',
                              lineHeight: 1.6,
                              wordBreak: 'break-word',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    No hay insights disponibles.
                  </Alert>
                )}
              </Box>
            </DraggableCard>

            {/* Recomendaciones */}
            <DraggableCard
              id="recomendaciones"
              position={sectionPositions.recomendaciones}
              size={sectionSizes.recomendaciones}
              onMove={handleSectionMove}
              onResize={handleSectionResize}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', fontSize: 22 }} />
                    Recomendaciones
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {rentabilidadData?.recomendaciones && rentabilidadData.recomendaciones.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {rentabilidadData.recomendaciones.slice(0, 3).map((rec, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 0, 
                          py: 1.5, 
                          mb: index < 2 ? 1.5 : 0,
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, mr: 1.5 }}>
                          <TrendingUp sx={{ 
                            color: rec.prioridad === 'alta' ? (theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626') : 
                                   rec.prioridad === 'media' ? (theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b') : 
                                   (theme.palette.mode === 'dark' ? '#22c55e' : '#059669'),
                            fontSize: 22
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={rec.accion}
                          secondary={rec.descripcion}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: {
                              fontWeight: 700, 
                              fontSize: '0.95rem',
                              color: 'text.primary',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              mb: 0.5,
                              lineHeight: 1.3,
                              wordBreak: 'break-word'
                            }
                          }}
                          secondaryTypographyProps={{ 
                            variant: 'body2',
                            sx: {
                              fontSize: '0.875rem',
                              color: 'text.secondary',
                              lineHeight: 1.6,
                              wordBreak: 'break-word',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ¡Excelente! No hay recomendaciones críticas.
                  </Alert>
                )}
              </Box>
            </DraggableCard>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RentabilidadCard; 