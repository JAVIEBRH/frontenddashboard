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
import DraggableCard from './DraggableCard';

const RentabilidadCard = () => {
  const theme = useTheme();
  const [rentabilidadData, setRentabilidadData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para las posiciones de las secciones internas
  const [sectionPositions, setSectionPositions] = useState({
    crecimiento: { x: 0, y: 0 },
    estacionalidad: { x: 320, y: 0 },
    puntoEquilibrio: { x: 640, y: 0 },
    roi: { x: 960, y: 0 },
    proyecciones: { x: 0, y: 220 },
    escenarios: { x: 420, y: 220 },
    insights: { x: 0, y: 480 },
    recomendaciones: { x: 420, y: 480 }
  });

  // Estados para los tamaños de las secciones
  const [sectionSizes, setSectionSizes] = useState({
    crecimiento: { width: 280, height: 220 },
    estacionalidad: { width: 280, height: 220 },
    puntoEquilibrio: { width: 280, height: 220 },
    roi: { width: 280, height: 220 },
    proyecciones: { width: 380, height: 260 },
    escenarios: { width: 600, height: 240 },
    insights: { width: 380, height: 240 },
    recomendaciones: { width: 380, height: 240 }
  });

  const fetchRentabilidadData = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/rentabilidad/avanzado`);
      if (response.ok) {
        const data = await response.json();
        setRentabilidadData(data);
      } else {
        console.error('Error fetching rentabilidad data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentabilidadData();
  }, []);

  const getColorByValue = (value, threshold = 0) => {
    if (value > threshold) return theme.palette.custom.success;
    if (value < threshold) return theme.palette.custom.critical;
    return theme.palette.custom.neutral;
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
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          📊 Análisis Financiero Avanzado
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Arrastra y reorganiza las secciones según tus preferencias
        </Typography>
      </Box>

      {/* Contenedor principal con posicionamiento absoluto */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        height: '1200px', // Altura fija para el contenedor
        overflow: 'hidden'
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <TrendingUp sx={{ color: '#059669', fontSize: 20 }} />
                    Crecimiento
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Mensual</Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0) + '20',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0),
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Trimestral</Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0) + '20',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0),
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Ventas Trimestre</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    ${(rentabilidadData?.analisis_avanzado?.crecimiento?.ventas_trimestre || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Crecimiento */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(5, 150, 105, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                    💡 Insight:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', display: 'block', mt: 0.5 }}>
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <Assessment sx={{ color: '#f59e0b', fontSize: 20 }} />
                    Estacionalidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Factor</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {rentabilidadData?.analisis_avanzado?.estacionalidad?.factor_estacional || 0}x
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Verano</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_verano || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Invierno</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_invierno || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight de Estacionalidad */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600 }}>
                    💡 Insight:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', display: 'block', mt: 0.5 }}>
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <Assessment sx={{ color: '#f59e0b', fontSize: 20 }} />
                    Punto de Equilibrio
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                    {rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                    Bidones por mes
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Valor Monetario</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    ${((rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0) * (rentabilidadData?.datos_reales?.precio_venta_bidon || 0)).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Punto Equilibrio */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                    💡 Insight:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', display: 'block', mt: 0.5 }}>
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <Assessment sx={{ color: '#f59e0b', fontSize: 20 }} />
                    ROI
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                   <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Actual</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                     {rentabilidadData?.analisis_avanzado?.roi?.actual || 0}%
                   </Typography>
                 </Box>
                 
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                   <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Proyectado</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                     {rentabilidadData?.analisis_avanzado?.roi?.proyectado || 0}%
                   </Typography>
                 </Box>
                 
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                   <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Ventas Trimestre</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                     ${(rentabilidadData?.analisis_avanzado?.roi?.ventas_trimestre || 0).toLocaleString()}
                   </Typography>
                 </Box>

                 {/* Insight de ROI */}
                 <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 1 }}>
                   <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                     💡 Insight:
                   </Typography>
                   <Typography variant="body2" sx={{ fontSize: '0.8rem', display: 'block', mt: 0.5 }}>
                     {(rentabilidadData?.analisis_avanzado?.roi?.actual || 0) > (rentabilidadData?.analisis_avanzado?.roi?.proyectado || 0)
                       ? 'ROI actual superior al proyectado - estrategia efectiva'
                       : 'ROI proyectado más alto - optimizar operaciones'}
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <TrendingUp sx={{ color: '#059669', fontSize: 20 }} />
                    Proyección 3 Meses
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(5, 150, 105, 0.05)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Mes 1</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_1 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(5, 150, 105, 0.05)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Mes 2</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_2 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(5, 150, 105, 0.05)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Mes 3</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_3 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>Tendencia</Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0) + '20',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0),
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  />
                </Box>

                {/* Insight de Proyecciones */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(5, 150, 105, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                    💡 Insight:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', display: 'block', mt: 0.5 }}>
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <Assessment sx={{ color: '#9370db', fontSize: 20 }} />
                    Escenarios de Rentabilidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(5, 150, 105, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                        Optimista
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(107, 114, 128, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#6b7280', fontSize: '0.95rem' }}>
                        Actual
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#6b7280' }}>
                        {rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(220, 38, 38, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626', fontSize: '0.95rem' }}>
                        Pesimista
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#dc2626' }}>
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.pesimista?.margen || 0}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Insight de Escenarios */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(147, 112, 219, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#9370db', fontWeight: 600 }}>
                    💡 Insight:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', display: 'block', mt: 0.5 }}>
                    {(() => {
                      const optimista = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0;
                      const actual = rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0;
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Insights Clave
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {rentabilidadData?.insights && rentabilidadData.insights.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {rentabilidadData.insights.slice(0, 3).map((insight, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {insight.tipo === 'positivo' ? (
                            <CheckCircle sx={{ color: '#059669', fontSize: 16 }} />
                          ) : (
                            <Warning sx={{ color: '#dc2626', fontSize: 16 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={insight.titulo}
                          secondary={insight.descripcion}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600, fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" sx={{ py: 0.5 }}>
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
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Recomendaciones
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {rentabilidadData?.recomendaciones && rentabilidadData.recomendaciones.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {rentabilidadData.recomendaciones.slice(0, 3).map((rec, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <TrendingUp sx={{ 
                            color: rec.prioridad === 'alta' ? theme.palette.custom.critical : 
                                   rec.prioridad === 'media' ? theme.palette.custom.warning : theme.palette.custom.success,
                            fontSize: 16
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={rec.accion}
                          secondary={rec.descripcion}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600, fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success" sx={{ py: 0.5 }}>
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