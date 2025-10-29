import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { Box, Typography, FormControl, Select, MenuItem, Card, CardContent, useTheme } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import './MapaCalor.css';

// Componente para manejar el zoom dinámicamente
function ZoomAwareCircles({ mapData }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  // Función para obtener color basado en concentración
  const getColorByConcentration = (totalSpent) => {
    const amount = parseInt(totalSpent) || 0;
    
    if (amount > 15000) return '#ff0000';      // Rojo - alta concentración
    if (amount > 10000) return '#ff6600';      // Naranja - media-alta
    if (amount > 6000) return '#ffcc00';       // Amarillo - media
    if (amount > 3000) return '#99cc00';       // Verde-amarillo - baja-media
    return '#00cc00';                          // Verde - baja concentración
  };

  // Función para obtener radio basado en concentración Y ZOOM - LÓGICA CORREGIDA
  const getRadiusByConcentrationAndZoom = (totalSpent) => {
    const amount = parseInt(totalSpent) || 0;
    
    // Radio base según concentración
    let baseRadius;
    if (amount > 15000) baseRadius = 3;   // Alta concentración
    else if (amount > 10000) baseRadius = 2.5; // Media-alta
    else if (amount > 6000) baseRadius = 2;    // Media
    else if (amount > 3000) baseRadius = 1.5;  // Baja-media
    else baseRadius = 1;                       // Baja concentración
    
    // Ajustar según el zoom - LÓGICA INVERTIDA
    // Zoom alto (acercado) = círculos más pequeños
    // Zoom bajo (alejado) = círculos más grandes
    const zoomFactor = Math.max(0.3, Math.min(2, (18 - zoom) / 6)); // Factor entre 0.3 y 2
    return baseRadius * zoomFactor;
  };

  return mapData.map((point, index) => {
    const totalSpent = parseInt(point.total_spent) || 0;
    const radius = getRadiusByConcentrationAndZoom(totalSpent);
    
    return (
      <Circle
        key={index}
        center={[point.lat, point.lng]}
        radius={radius * 50} // Convertir a metros
        pathOptions={{
          color: getColorByConcentration(totalSpent),
          fillColor: getColorByConcentration(totalSpent),
          fillOpacity: 0.7,
          weight: 0.5
        }}
      >
        <Popup>
          <div>
            <h3>Ubicación de Pedido</h3>
            <p><strong>Dirección:</strong> {point.address}</p>
            <p><strong>Cliente:</strong> {point.user}</p>
            <p><strong>Teléfono:</strong> {point.phone}</p>
            <p><strong>Total gastado:</strong> ${parseInt(point.total_spent).toLocaleString('es-CL')}</p>
            <p><strong>Ticket promedio:</strong> ${parseInt(point.ticket_promedio || 0).toLocaleString('es-CL')}</p>
            <p><strong>Último pedido:</strong> {point.fecha_ultimo_pedido || 'N/A'}</p>
            <p><strong>Concentración:</strong> {
              parseInt(point.total_spent) > 15000 ? 'Alta' :
              parseInt(point.total_spent) > 10000 ? 'Media-Alta' :
              parseInt(point.total_spent) > 6000 ? 'Media' :
              parseInt(point.total_spent) > 3000 ? 'Baja-Media' : 'Baja'
            }</p>
          </div>
        </Popup>
      </Circle>
    );
  });
}

export default function MapaCalor() {
  const theme = useTheme();
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState(6); // meses por defecto

  // Función para obtener datos del heatmap desde el backend
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      
      // Para períodos largos, no usar filtro de mes/año específico
      let url = 'http://localhost:8001/heatmap';
      
      // Solo aplicar filtro de mes/año para períodos cortos (3-6 meses)
      if (filterPeriod <= 6) {
        const currentDate = new Date();
        const targetDate = new Date();
        targetDate.setMonth(currentDate.getMonth() - filterPeriod);
        
        const mes = targetDate.getMonth() + 1; // getMonth() devuelve 0-11
        const anio = targetDate.getFullYear();
        
        url = `http://localhost:8001/heatmap?mes=${mes}&anio=${anio}`;
      }
      
      console.log('Solicitando datos con URL:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Datos del heatmap recibidos:', data);
        
        // Convertir datos a formato de mapa
        const mapPoints = data.map((point, index) => ({
          lat: point.lat,
          lng: point.lon,
          count: 1,
          address: point.address,
          user: point.user,
          phone: point.phone,
          total_spent: point.total_spent,
          ticket_promedio: point.ticket_promedio,
          fecha_ultimo_pedido: point.fecha_ultimo_pedido,
          isClient: true
        }));
        
        setMapData(mapPoints);
        setLoading(false);
      } else {
        console.error('Error al obtener datos del heatmap:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(() => {
      console.log('Actualización automática del mapa de calor...');
      fetchHeatmapData();
    }, 10 * 60 * 1000); // 10 minutos

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en MapaCalor...');
      fetchHeatmapData();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, [filterPeriod]);

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        ml: '280px',
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 1
          }}>
            Mapa de Calor - Concentración de Pedidos
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Cargando datos del mapa...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      ml: '280px',
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 1
          }}>
            Mapa de Calor - Concentración de Pedidos
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'text.secondary',
            mb: 3
          }}>
            Visualiza las zonas con mayor concentración de pedidos en el período seleccionado
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 3
          }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: 'text.primary'
            }}>
              Período de análisis:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(Number(e.target.value))}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider,
                  },
                }}
              >
                <MenuItem value={3}>Últimos 3 meses</MenuItem>
                <MenuItem value={6}>Últimos 6 meses</MenuItem>
                <MenuItem value={12}>Últimos 12 meses</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Card sx={{ 
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[1],
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <MapContainer
              center={[-33.6167, -70.5833]} // Puente Alto, Santiago
              zoom={12}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <ZoomAwareCircles mapData={mapData} />
            </MapContainer>
            
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 2
              }}>
                Leyenda - Concentración de Pedidos
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: '#00cc00',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Baja concentración (0 - $3.000)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: '#99cc00',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Baja-Media ($3.001 - $6.000)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: '#ffcc00',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Media ($6.001 - $10.000)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: '#ff6600',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Media-Alta ($10.001 - $15.000)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: '#ff0000',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Alta concentración ($15.001+)
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                pt: 2, 
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                  <strong>Total de pedidos mostrados:</strong> {mapData.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                  <strong>Período:</strong> Últimos {filterPeriod} meses
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                  <strong>Total facturado:</strong> ${mapData.reduce((sum, point) => sum + parseInt(point.total_spent || 0), 0).toLocaleString('es-CL')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Los círculos se ajustan automáticamente al nivel de zoom
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
} 