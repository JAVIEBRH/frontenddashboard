import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import { getPedidosPorHorario } from '../services/api';

const PedidosPorBloqueDonut = ({ 
  pedidosManana = 0, 
  pedidosTarde = 0,
  title = 'Distribución de Pedidos por Franja Horaria'
}) => {
  const theme = useTheme();
  const [horarioData, setHorarioData] = useState({
    pedidos_manana: pedidosManana,
    pedidos_tarde: pedidosTarde,
    total: pedidosManana + pedidosTarde,
    porcentaje_manana: 0,
    porcentaje_tarde: 0
  });
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  
  const fetchPedidosPorHorario = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().toLocaleTimeString('es-CL');
      console.log(`🕐 [${timestamp}] Obteniendo pedidos por horario...`);
      const data = await getPedidosPorHorario();
      console.log(`✅ [${timestamp}] Pedidos por horario obtenidos:`, data);
      
      setHorarioData(prevData => {
        const nuevosDatos = {
          pedidos_manana: data.pedidos_manana || 0,
          pedidos_tarde: data.pedidos_tarde || 0,
          total: data.total || 0,
          porcentaje_manana: data.porcentaje_manana || 0,
          porcentaje_tarde: data.porcentaje_tarde || 0
        };
        
        // Comparar con datos anteriores
        const datosCambiaron = 
          prevData.pedidos_manana !== nuevosDatos.pedidos_manana ||
          prevData.pedidos_tarde !== nuevosDatos.pedidos_tarde ||
          prevData.total !== nuevosDatos.total;
        
        if (datosCambiaron) {
          console.log('🔄 DATOS CAMBIARON:', {
            anterior: prevData,
            nuevo: nuevosDatos
          });
        } else {
          console.log('⚠️ Datos sin cambios');
        }
        
        return nuevosDatos;
      });
      
      setUltimaActualizacion(timestamp);
    } catch (error) {
      console.error('❌ Error obteniendo pedidos por horario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos inmediatamente
    fetchPedidosPorHorario();
    
    // Actualizar cada 30 segundos para pruebas (luego cambiar a 1 minuto)
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('es-CL');
      console.log(`🔄 [${timestamp}] Actualizando pedidos por horario (intervalo automático)...`);
      fetchPedidosPorHorario();
    }, 30 * 1000); // 30 segundos para pruebas
    
    return () => clearInterval(interval);
  }, []);
  
  const total = horarioData.pedidos_manana + horarioData.pedidos_tarde;
  const porcentajeManana = total > 0 ? (horarioData.pedidos_manana / total) * 100 : 0;
  const porcentajeTarde = total > 0 ? (horarioData.pedidos_tarde / total) * 100 : 0;
  
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  
  // Calcular offsets para los segmentos
  const mananaOffset = circumference - (porcentajeManana / 100) * circumference;
  const tardeOffset = circumference - (porcentajeTarde / 100) * circumference;

  return (
    <Box
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: 3,
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(147, 112, 219, 0.2)' 
          : 'rgba(147, 112, 219, 0.1)'}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.12)'
        }
      }}
      onClick={fetchPedidosPorHorario}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary, 
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            fontSize: '1rem',
            flex: 1
          }}
        >
          {title}
        </Typography>
        {loading && <Typography component="span" sx={{ fontSize: '0.8rem', color: '#9370db' }}>🔄</Typography>}
        {ultimaActualizacion && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.7rem', 
              color: theme.palette.text.secondary,
              ml: 1
            }}
          >
            {ultimaActualizacion}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <svg width="140" height="140" style={{ position: 'relative' }}>
            {/* Fondo del donut */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            
            {/* Segmento Mañana */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={mananaOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            
            {/* Segmento Tarde */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#059669"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={tardeOffset}
              strokeLinecap="round"
              transform={`rotate(${-90 + (porcentajeManana * 360 / 100)} 70 70)`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          
          {/* Texto central */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                color: theme.palette.text.primary,
                fontSize: '1.25rem',
                lineHeight: 1.2
              }}
            >
              {total}
            </Typography>
            {loading && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.6rem', 
                  color: '#9370db',
                  mt: 0.5
                }}
              >
                Actualizando...
              </Typography>
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Total
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Leyenda mejorada */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: 1
      }}>
        {/* Mañana */}
        <Box sx={{ 
          flex: 1, 
          textAlign: 'center',
          p: 1,
          borderRadius: 2,
          bgcolor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 0.5 
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#3b82f6', 
              mr: 0.5 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: '#3b82f6',
                fontSize: '0.75rem'
              }}
            >
              Mañana ({porcentajeManana.toFixed(0)}%)
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: '#3b82f6',
              fontSize: '1.1rem'
            }}
          >
            {horarioData.pedidos_manana}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.7rem'
            }}
          >
            11-13h
          </Typography>
        </Box>
        
        {/* Tarde */}
        <Box sx={{ 
          flex: 1, 
          textAlign: 'center',
          p: 1,
          borderRadius: 2,
          bgcolor: 'rgba(5, 150, 105, 0.1)',
          border: '1px solid rgba(5, 150, 105, 0.2)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 0.5 
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#059669', 
              mr: 0.5 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: '#059669',
                fontSize: '0.75rem'
              }}
            >
              Tarde ({porcentajeTarde.toFixed(0)}%)
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: '#059669',
              fontSize: '1.1rem'
            }}
          >
            {horarioData.pedidos_tarde}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.7rem'
            }}
          >
            15-19h
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PedidosPorBloqueDonut; 