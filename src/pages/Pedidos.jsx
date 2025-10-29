import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, Chip, Button, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getPedidos, getPedidosV2 } from '../services/api';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Pedidos({ refreshTrigger = 0 }) {
  const theme = useTheme();
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-09-01'); // Fecha con datos por defecto
  const [pagina, setPagina] = useState(1);
  const pedidosPorPagina = 10;
  


  const cargarPedidos = async () => {
    try {
      // Usar el endpoint principal que ahora apunta al nuevo endpoint MongoDB
      const data = await getPedidos();
      console.log('Usando endpoint principal con datos MongoDB');
      
      // Ordenar del más reciente al más antiguo
      const pedidosOrdenados = [...data].sort((a, b) => {
        const fa = parseFecha(a.fecha || a.createdAt);
        const fb = parseFecha(b.fecha || b.createdAt);
        if (!fa || !fb) return 0;
        return fb.getTime() - fa.getTime(); // Más reciente primero
      });
      setPedidos(pedidosOrdenados);
      console.log('Pedidos actualizados:', new Date().toLocaleTimeString());
      
    } catch (error) {
      setPedidos([]);
    }
  };

  useEffect(() => {
    cargarPedidos();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(() => {
      console.log('Actualización automática de pedidos...');
      cargarPedidos();
    }, 10 * 60 * 1000); // 10 minutos

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en Pedidos...');
      cargarPedidos();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, [refreshTrigger]);

  // Definir fecha seleccionada al principio
  const fechaSeleccionada = selectedDate; // Formato YYYY-MM-DD

  // Filtro de búsqueda SIN filtro de fecha temporalmente
  const filteredPedidos = pedidos.filter(p => {
    // Solo aplicar filtro de búsqueda (compatible con ambos esquemas)
    const texto = `${p.fecha || p.createdAt || ''} ${p.dire || p.customer?.address || ''} ${p.usuario || p.customer?.name || ''} ${p.precio || p.price || ''} ${p.status || ''}`.toLowerCase();
    return texto.includes(searchTerm.toLowerCase());
  });



  // Paginación
  const totalPaginas = Math.ceil(filteredPedidos.length / pedidosPorPagina);
  const pedidosPagina = filteredPedidos.slice((pagina - 1) * pedidosPorPagina, pagina * pedidosPorPagina);
  useEffect(() => { setPagina(1); }, [searchTerm]);

  // Función para parsear fechas DD-MM-YYYY a Date o ISO string
  function parseFecha(fechaStr) {
    if (!fechaStr) return null;
    
    // Si es formato ISO (nuevo esquema)
    if (/\d{4}-\d{2}-\d{2}T/.test(fechaStr)) {
      return new Date(fechaStr);
    }
    
    // Si es formato YYYY-MM-DD
    if (/\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
      return new Date(fechaStr);
    }
    
    // Si es formato DD-MM-YYYY (esquema legacy)
    const match = fechaStr.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (match) {
      const [_, d, m, y] = match;
      return new Date(`${y}-${m}-${d}`);
    }
    
    return null;
  }



  // Función para determinar el estilo del estado del pedido
  const getEstadoStyle = (status) => {
    const statusLower = (status || '').toLowerCase().trim();
    
    if (statusLower.includes('entregado') || statusLower.includes('completado') || statusLower.includes('finalizado')) {
      return {
        bgcolor: theme.palette.mode === 'dark' ? '#065f46' : '#dcfce7',
        color: theme.palette.mode === 'dark' ? '#6ee7b7' : '#166534',
        label: 'Entregado'
      };
    } else if (statusLower.includes('preparando') || statusLower.includes('en proceso') || statusLower.includes('procesando')) {
      return {
        bgcolor: theme.palette.mode === 'dark' ? '#92400e' : '#fef3c7',
        color: theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
        label: 'Preparando'
      };
    } else if (statusLower.includes('cancelado') || statusLower.includes('cancelada') || statusLower.includes('anulado')) {
      return {
        bgcolor: theme.palette.mode === 'dark' ? '#7f1d1d' : '#fee2e2',
        color: theme.palette.mode === 'dark' ? '#fca5a5' : '#dc2626',
        label: 'Cancelado'
      };
    } else {
      // Estado por defecto para estados no reconocidos
      return {
        bgcolor: theme.palette.mode === 'dark' ? '#374151' : '#f1f5f9',
        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#64748b',
        label: status || 'Pendiente'
      };
    }
  };

  // Filtrar pedidos por fecha seleccionada
  const pedidosFechaSeleccionadaCompletos = pedidos.filter(p => {
    const fechaPedido = parseFecha(p.fecha);
    if (!fechaPedido) return false;
    const fechaPedidoStr = fechaPedido.toISOString().split('T')[0];
    return fechaPedidoStr === fechaSeleccionada;
  });

  // Cards de resumen sobre los pedidos de la fecha seleccionada
  const ventasTotales = pedidosFechaSeleccionadaCompletos.reduce((sum, p) => sum + (Number(p.precio) || 0), 0);
  const countEfectivo = pedidosFechaSeleccionadaCompletos.filter(p => (p.metodopago || '').toLowerCase().includes('efectivo')).length;
  const countTransferencia = pedidosFechaSeleccionadaCompletos.filter(p => (p.metodopago || '').toLowerCase().includes('transfer')).length;
  const countTarjeta = pedidosFechaSeleccionadaCompletos.filter(p => (p.metodopago || '').toLowerCase().includes('tarjeta')).length;
  
  // Nuevos cálculos para pedidos del día seleccionado y bidones vendidos
  
  // Calcular pedidos y bidones de la FECHA SELECCIONADA usando TODOS los pedidos (no filtrados)
  const pedidosFechaSeleccionada = pedidos.filter(p => {
    const fechaPedido = parseFecha(p.fecha || p.createdAt);
    if (!fechaPedido) return false;
    const fechaPedidoStr = fechaPedido.toISOString().split('T')[0];
    return fechaPedidoStr === fechaSeleccionada;
  }).length;
  
  // Calcular bidones vendidos en la fecha seleccionada usando TODOS los pedidos
  const pedidosFechaSeleccionadaData = pedidos.filter(p => {
    const fechaPedido = parseFecha(p.fecha || p.createdAt);
    if (!fechaPedido) return false;
    const fechaPedidoStr = fechaPedido.toISOString().split('T')[0];
    return fechaPedidoStr === fechaSeleccionada;
  });
  
  const bidonesFechaSeleccionada = pedidosFechaSeleccionadaData.reduce((sum, p) => {
    let cantidad = 1;
    
    // Nuevo esquema: usar products array
    if (p.products && Array.isArray(p.products)) {
      cantidad = p.products.reduce((total, product) => total + (product.quantity || 1), 0);
    } else {
      // Esquema legacy: intentar obtener cantidad de campos específicos
      if (p.cantidad) cantidad = Number(p.cantidad);
      else if (p.cant) cantidad = Number(p.cant);
      else if (p.qty) cantidad = Number(p.qty);
      else if (p.quantity) cantidad = Number(p.quantity);
      else if (p.bidones) cantidad = Number(p.bidones);
      else if (p.unidades) cantidad = Number(p.unidades);
      else cantidad = NaN; // Si no hay ningún campo, forzar NaN
      
      // Si no hay campo de cantidad específica, calcular basándose en el precio
      if (isNaN(cantidad) || cantidad <= 0) {
        const precio = Number(p.precio || p.price) || 0;
        // Calcular bidones basándose en el precio real ($2,000 por bidón)
        if (precio > 0) {
          cantidad = Math.ceil(precio / 2000); // $2,000 por bidón
        }
      }
    }
    
    return sum + cantidad;
  }, 0);
  

  

  
  // Calcular bidones vendidos
  const bidonesVendidos = filteredPedidos.reduce((sum, p) => {
    // Intentar obtener cantidad de diferentes campos posibles
    let cantidad = 1; // Por defecto 1 bidón por pedido
    
    // Buscar en diferentes campos posibles
    if (p.cantidad) cantidad = Number(p.cantidad);
    else if (p.cant) cantidad = Number(p.cant);
    else if (p.qty) cantidad = Number(p.qty);
    else if (p.quantity) cantidad = Number(p.quantity);
    else if (p.bidones) cantidad = Number(p.bidones);
    else if (p.unidades) cantidad = Number(p.unidades);
    
    // Si no se pudo convertir a número, calcular basándose en el precio
    if (isNaN(cantidad) || cantidad <= 0) {
      const precio = Number(p.precio) || 0;
      if (precio > 0) {
        cantidad = Math.ceil(precio / 2000); // $2,000 por bidón
      }
    }
    
    return sum + cantidad; // Removido Math.max(1, cantidad) para usar el cálculo real
  }, 0);

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
      overflow: 'auto',
      height: '100vh'
    }}>
      <Card sx={{ 
        bgcolor: 'background.paper', 
        boxShadow: theme.shadows[1], 
        borderRadius: 3, 
        border: `1px solid ${theme.palette.divider}`, 
        mb: 4 
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Historial de Pedidos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="small"
                sx={{ width: 200 }}
                InputProps={{
                  sx: { 
                    fontWeight: 600,
                    color: 'text.primary'
                  }
                }}
              />
            <TextField
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.primary' }} />
                  </InputAdornment>
                ),
              }}
            />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Card sx={{ 
              minWidth: 220, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Tooltip title={`Suma total de ventas del ${new Date(selectedDate).toLocaleDateString('es-ES')}`} placement="top" arrow>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>${ventasTotales.toLocaleString()}</Typography>
                </Tooltip>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Ventas Totales</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              minWidth: 180, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Tooltip title={`Pedidos pagados en efectivo el ${new Date(selectedDate).toLocaleDateString('es-ES')}`} placement="top" arrow>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{countEfectivo}</Typography>
                </Tooltip>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Efectivo</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              minWidth: 180, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Tooltip title={`Pedidos pagados por transferencia el ${new Date(selectedDate).toLocaleDateString('es-ES')}`} placement="top" arrow>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{countTransferencia}</Typography>
                </Tooltip>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Transferencia</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              minWidth: 180, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Tooltip title={`Pedidos pagados con tarjeta el ${new Date(selectedDate).toLocaleDateString('es-ES')}`} placement="top" arrow>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{countTarjeta}</Typography>
                </Tooltip>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Tarjeta</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              minWidth: 180, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocalShippingIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Tooltip title={`${pedidosFechaSeleccionada} pedidos realizados el ${new Date(selectedDate).toLocaleDateString('es-ES')}`} placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', cursor: 'pointer' }}>{pedidosFechaSeleccionada}</Typography>
                  </Tooltip>
                </Box>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Pedidos {selectedDate === new Date().toISOString().split('T')[0] ? 'Hoy' : 'del Día'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              minWidth: 180, 
              bgcolor: 'background.paper', 
              boxShadow: theme.shadows[1], 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InventoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Tooltip title={`${bidonesFechaSeleccionada} bidones vendidos el ${new Date(selectedDate).toLocaleDateString('es-ES')} | Total histórico: ${bidonesVendidos} bidones`} placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', cursor: 'pointer' }}>{bidonesFechaSeleccionada}</Typography>
                  </Tooltip>
                </Box>
                <Typography variant="body1" sx={{ 
                  color: 'text.primary', 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>Bidones {selectedDate === new Date().toISOString().split('T')[0] ? 'Hoy' : 'del Día'}</Typography>
              </CardContent>
            </Card>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Dirección</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Monto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Método de Pago</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Estado</TableCell>


                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosPagina.map((p, i) => (
                  <TableRow key={i} sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#3b82f6' }}>{(p.usuario || p.customer?.name || '?').charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}>{p.usuario || p.customer?.name || '-'}</Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary', 
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}>ID: {p.id || p._id || i + 1}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{p.dire || p.customer?.address || '-'}</TableCell>
                    <TableCell sx={{ 
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{p.fecha || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CL') : '-')}</TableCell>
                    <TableCell sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>${(p.precio || p.price || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ 
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{p.metodopago || p.paymentMethod || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getEstadoStyle(p.status).label}
                        size="small"
                        sx={{ 
                          bgcolor: getEstadoStyle(p.status).bgcolor,
                          color: getEstadoStyle(p.status).color,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>


                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Paginación rápida mejorada */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, flexWrap: 'wrap' }}>
            <Button 
              onClick={() => setPagina(p => Math.max(1, p - 1))} 
              disabled={pagina === 1} 
              sx={{ minWidth: 36, mr: 1 }}
              variant="outlined"
              size="small"
            >
              Anterior
            </Button>
          {/* Mostrar máximo 5 botones a la vez, con ... si hay muchas páginas */}
          {(() => {
            const botones = [];
            let start = Math.max(1, pagina - 2);
            let end = Math.min(totalPaginas, pagina + 2);
            if (pagina <= 3) {
              end = Math.min(5, totalPaginas);
            } else if (pagina >= totalPaginas - 2) {
              start = Math.max(1, totalPaginas - 4);
            }
            if (start > 1) {
              botones.push(
                <Button 
                  key={1} 
                  onClick={() => setPagina(1)} 
                  variant={pagina === 1 ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 36, mx: 0.5 }}
                >
                  1
                </Button>
              );
              if (start > 2) {
                botones.push(
                  <Typography key="start-ellipsis" sx={{ 
                    mx: 0.5, 
                    color: 'text.primary',
                    fontWeight: 600
                  }}>
                    ...
                  </Typography>
                );
              }
            }
            for (let i = start; i <= end; i++) {
              botones.push(
                <Button
                  key={i}
                  onClick={() => setPagina(i)}
                  variant={pagina === i ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 36, mx: 0.5 }}
                >
                  {i}
                </Button>
              );
            }
            if (end < totalPaginas) {
              if (end < totalPaginas - 1) {
                botones.push(
                  <Typography key="end-ellipsis" sx={{ 
                    mx: 0.5, 
                    color: 'text.primary',
                    fontWeight: 600
                  }}>
                    ...
                  </Typography>
                );
              }
              botones.push(
                <Button 
                  key={totalPaginas} 
                  onClick={() => setPagina(totalPaginas)} 
                  variant={pagina === totalPaginas ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 36, mx: 0.5 }}
                >
                  {totalPaginas}
                </Button>
              );
            }
            return botones;
          })()}
            <Button 
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} 
              disabled={pagina === totalPaginas} 
              sx={{ minWidth: 36, ml: 1 }}
              variant="outlined"
              size="small"
            >
              Siguiente
            </Button>
          </Box>
        </CardContent>
      </Card>


    </Box>
  );
} 