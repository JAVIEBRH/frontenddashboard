import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Alert, List, ListItem, ListItemIcon, ListItemText, Collapse, IconButton } from '@mui/material';
import { 
  Inventory, 
  Warning, 
  Error, 
  CheckCircle, 
  ExpandMore, 
  ExpandLess,
  LocalShipping,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import { getEstadoInventario, getPrediccionInventario } from '../services/api';

const InventarioCard = () => {
  const theme = useTheme();
  const [inventarioData, setInventarioData] = useState(null);
  const [prediccionData, setPrediccionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const fetchInventarioData = async () => {
    try {
      setLoading(true);
      const [estado, prediccion] = await Promise.all([
        getEstadoInventario(),
        getPrediccionInventario(7)
      ]);
      setInventarioData(estado);
      setPrediccionData(prediccion);
    } catch (error) {
      console.error('Error obteniendo datos de inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventarioData();
    
    // Actualizar cada 30 minutos
    const interval = setInterval(fetchInventarioData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'critico': return theme.palette.custom.critical;
      case 'bajo': return theme.palette.custom.warning;
      case 'normal': return theme.palette.custom.success;
      case 'alto': return theme.palette.custom.info;
      default: return theme.palette.custom.neutral;
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'critico': return <Error />;
      case 'bajo': return <Warning />;
      case 'normal': return <CheckCircle />;
      case 'alto': return <Inventory />;
      default: return <Inventory />;
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return theme.palette.custom.critical;
      case 'media': return theme.palette.custom.warning;
      case 'baja': return theme.palette.custom.success;
      default: return theme.palette.custom.neutral;
    }
  };

  if (!inventarioData) {
    return (
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        color: theme.palette.text.primary
      }}>
        <Typography>Cargando inventario...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 16,
      padding: 24,
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(147, 112, 219, 0.2)' 
        : 'rgba(147, 112, 219, 0.1)'}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onClick={fetchInventarioData}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Inventory sx={{ 
            fontSize: 28, 
            color: getEstadoColor(inventarioData.estado) 
          }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Gestión de Inventario
            {loading && <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: '#9370db' }}>🔄</Typography>}
          </Typography>
        </Box>
        <Chip 
          label={inventarioData.estado.toUpperCase()} 
          sx={{ 
            bgcolor: getEstadoColor(inventarioData.estado),
            color: 'white',
            fontWeight: 600
          }}
          icon={getEstadoIcon(inventarioData.estado)}
        />
      </Box>

      {/* Stock Principal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: getEstadoColor(inventarioData.estado) }}>
            {inventarioData.stock_actual}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Bidones disponibles
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {inventarioData.dias_restantes || '∞'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Días restantes
          </Typography>
        </Box>
      </Box>

      {/* Progreso de Stock */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Stock actual
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {inventarioData.stock_actual} / {inventarioData.stock_maximo}
          </Typography>
        </Box>
        <Box sx={{ 
          width: '100%', 
          height: 8, 
          bgcolor: theme.palette.mode === 'dark' ? '#374151' : '#e2e8f0',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <Box sx={{
            width: `${(inventarioData.stock_actual / inventarioData.stock_maximo) * 100}%`,
            height: '100%',
            bgcolor: getEstadoColor(inventarioData.estado),
            transition: 'width 0.3s ease'
          }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#dc2626' }}>
            Mín: {inventarioData.stock_minimo}
          </Typography>
          <Typography variant="caption" sx={{ color: '#3b82f6' }}>
            Máx: {inventarioData.stock_maximo}
          </Typography>
        </Box>
      </Box>

      {/* Métricas */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 20, color: '#059669', mb: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {inventarioData.demanda_diaria_promedio}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Demanda/día
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 20, color: '#f59e0b', mb: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {inventarioData.ultima_actualizacion ? 
              new Date(inventarioData.ultima_actualizacion).toLocaleTimeString('es-CL', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'N/A'
            }
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Última actualización
          </Typography>
        </Box>
      </Box>

      {/* Alertas */}
      {inventarioData.alertas.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Alertas Activas
          </Typography>
          {inventarioData.alertas.map((alerta, index) => (
            <Alert 
              key={index}
              severity={alerta.tipo === 'critico' ? 'error' : alerta.tipo === 'advertencia' ? 'warning' : 'info'}
              sx={{ mb: 1 }}
            >
              {alerta.mensaje}
            </Alert>
          ))}
        </Box>
      )}

      {/* Recomendaciones */}
      {inventarioData.recomendaciones.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Recomendaciones
            </Typography>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expanded}>
            <List dense>
              {inventarioData.recomendaciones.map((rec, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LocalShipping sx={{ 
                      fontSize: 16, 
                      color: getPrioridadColor(rec.prioridad) 
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={rec.descripcion}
                    secondary={`Prioridad: ${rec.prioridad}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}

      {/* Predicción */}
      {prediccionData && !prediccionData.error && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Predicción 7 días
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Demanda total:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {prediccionData.resumen?.demanda_total_predicha || 0} bidones
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Stock necesario:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {prediccionData.resumen?.stock_total_necesario || 0} bidones
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InventarioCard; 