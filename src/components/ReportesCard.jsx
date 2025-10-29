import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Alert, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { 
  Assessment, 
  Email, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ExpandMore, 
  ExpandLess
} from '@mui/icons-material';
import { getReporteEjecutivo, generarReporteEmail } from '../services/api';

const ReportesCard = () => {
  const theme = useTheme();
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  const fetchReporteData = async () => {
    try {
      setLoading(true);
      const data = await getReporteEjecutivo();
      setReporteData(data);
    } catch (error) {
      console.error('Error obteniendo reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporteData();
    
    // Actualizar cada hora
    const interval = setInterval(fetchReporteData, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async () => {
    if (!email) return;
    
    try {
      setEmailLoading(true);
      const result = await generarReporteEmail(email);
      
      if (result.error) {
        alert('Error: ' + result.error);
      } else {
        setEmailSuccess(true);
        setEmailDialog(false);
        setEmail('');
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch (error) {
      alert('Error enviando reporte: ' + error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const getCrecimientoColor = (crecimiento) => {
    if (crecimiento > 0) return '#059669';
    if (crecimiento < 0) return '#dc2626';
    return '#6b7280';
  };

  const getCrecimientoIcon = (crecimiento) => {
    if (crecimiento > 0) return <TrendingUp />;
    if (crecimiento < 0) return <TrendingDown />;
    return <Info />;
  };

  if (!reporteData || reporteData.error) {
    return (
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 16,
        padding: 20,
        textAlign: 'center',
        color: theme.palette.text.primary,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography>
          {loading ? 'Generando reporte...' : 'Error cargando reporte'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(147, 112, 219, 0.2)' 
          : 'rgba(147, 112, 219, 0.1)'}`,
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Compacto */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ fontSize: 24, color: '#3b82f6' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              Reporte Ejecutivo
              {loading && <Typography component="span" sx={{ ml: 0.5, fontSize: '0.7rem', color: '#9370db' }}>🔄</Typography>}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Email />}
              onClick={() => setEmailDialog(true)}
              sx={{ borderRadius: 1, fontSize: '0.7rem', px: 1 }}
            >
              Enviar
            </Button>
            <IconButton 
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Período */}
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          {reporteData.periodo?.semana} | {reporteData.periodo?.mes}
        </Typography>

        {/* Métricas Principales Compactas */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.1rem' }}>
                ${reporteData.metricas?.ventas_semana?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Ventas Semana
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(5, 150, 105, 0.1)', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                {reporteData.metricas?.pedidos_semana || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Pedidos Semana
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Crecimiento Compacto */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Crecimiento vs Mes Anterior
            </Typography>
            <Chip 
              icon={getCrecimientoIcon(reporteData.metricas?.crecimiento_ventas)}
              label={`${reporteData.metricas?.crecimiento_ventas || 0}%`}
              size="small"
              sx={{ 
                bgcolor: getCrecimientoColor(reporteData.metricas?.crecimiento_ventas) + '20',
                color: getCrecimientoColor(reporteData.metricas?.crecimiento_ventas),
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>

        {/* Insights y Recomendaciones Compactos */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            
            {/* Insights Compactos */}
            {reporteData.insights && reporteData.insights.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Insights Clave
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {reporteData.insights.map((insight, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Info sx={{ 
                          fontSize: 14, 
                          color: insight.tipo === 'positivo' ? '#059669' : 
                                 insight.tipo === 'negativo' ? '#dc2626' : '#3b82f6' 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight.titulo}
                        secondary={insight.descripcion}
                        primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Recomendaciones Compactas */}
            {reporteData.recomendaciones && reporteData.recomendaciones.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Recomendaciones
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {reporteData.recomendaciones.map((rec, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <TrendingUp sx={{ 
                          fontSize: 14, 
                          color: rec.prioridad === 'alta' ? '#dc2626' : 
                                 rec.prioridad === 'media' ? '#f59e0b' : '#059669' 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rec.accion}
                        secondary={rec.descripcion}
                        primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Alertas de éxito */}
        {emailSuccess && (
          <Alert severity="success" sx={{ mt: 1, py: 0 }}>
            <Typography variant="caption">Reporte enviado exitosamente</Typography>
          </Alert>
        )}
      </Box>

      {/* Dialog para email */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email sx={{ color: '#3b82f6' }} />
            Enviar Reporte por Email
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            Ingresa el email donde quieres recibir el reporte ejecutivo semanal.
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@aguasancud.cl"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEmailSubmit}
            disabled={!email || emailLoading}
            variant="contained"
            startIcon={emailLoading ? null : <Email />}
          >
            {emailLoading ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportesCard; 