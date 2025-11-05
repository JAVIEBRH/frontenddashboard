import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, Chip, Button, useTheme, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Add } from '@mui/icons-material';
import { getPedidos, getPedidosV2 } from '../services/api';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Pedidos({ refreshTrigger = 0 }) {
  const theme = useTheme();
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  });
  const [pagina, setPagina] = useState(1);
  const pedidosPorPagina = 10;
  
  // Estados para controlar los modales de métodos de pago
  const [showEfectivoTable, setShowEfectivoTable] = useState(false);
  const [showTransferenciaTable, setShowTransferenciaTable] = useState(false);
  const [showTarjetaTable, setShowTarjetaTable] = useState(false);
  


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
    
    // Actualización automática cada 5 minutos para mantener datos actualizados
    const interval = setInterval(() => {
      console.log('⏰ Actualización automática de pedidos...', new Date().toLocaleTimeString());
      cargarPedidos();
    }, 5 * 60 * 1000); // 5 minutos (estandarizado con Home)

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

  // Función para formatear ticket promedio
  const formatTicketPromedio = (ticket) => {
    if (ticket >= 1000000) {
      return `$${(ticket / 1000000).toFixed(1)}M`;
    } else if (ticket >= 1000) {
      return `$${(ticket / 1000).toFixed(1)}K`;
    } else {
      return `$${ticket.toLocaleString('es-CL')}`;
    }
  };

  // Función para agrupar clientes por método de pago
  const agruparClientesPorMetodoPago = (metodoPago) => {
    const pedidosFiltrados = pedidosFechaSeleccionadaCompletos.filter(p => {
      const metodo = (p.metodopago || p.paymentMethod || '').toLowerCase();
      return metodo.includes(metodoPago.toLowerCase());
    });

    // Agrupar por cliente (usando email o dirección como identificador)
    const clientesMap = new Map();
    
    pedidosFiltrados.forEach(pedido => {
      const clienteId = pedido.email || pedido.customer?.email || pedido.dire || pedido.customer?.address || pedido.usuario || pedido.customer?.name || 'Sin identificar';
      const nombreCliente = pedido.usuario || pedido.customer?.name || 'Sin nombre';
      const direccion = pedido.dire || pedido.customer?.address || 'Sin dirección';
      const email = pedido.email || pedido.customer?.email || 'Sin email';
      const precio = Number(pedido.precio || pedido.price || 0);

      if (clientesMap.has(clienteId)) {
        const cliente = clientesMap.get(clienteId);
        cliente.totalComprado += precio;
        cliente.pedidos += 1;
      } else {
        clientesMap.set(clienteId, {
          id: clienteId,
          nombre: nombreCliente,
          direccion: direccion,
          email: email,
          totalComprado: precio,
          pedidos: 1
        });
      }
    });

    // Convertir a array y calcular ticket promedio
    return Array.from(clientesMap.values()).map(cliente => ({
      ...cliente,
      ticketPromedio: cliente.totalComprado / cliente.pedidos
    }));
  };

  // Componente de modal para clientes por método de pago
  const TablaClientesPorMetodoPago = ({ show, metodoPago, titulo }) => {
    if (!show) return null;
    
    const clientesData = agruparClientesPorMetodoPago(metodoPago);
    
    return (
      <Box sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: 1,
        pointerEvents: 'auto',
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
      }}>
        <Card sx={{ 
          bgcolor: theme.palette.background.paper, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)', 
          borderRadius: 3, 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          maxHeight: '60vh',
          width: '100%',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
            zIndex: -1
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {titulo} - Detalle
              </Typography>
              <Tooltip title="Cerrar" arrow>
                <IconButton
                  onClick={() => {
                    if (metodoPago.toLowerCase().includes('efectivo')) setShowEfectivoTable(false);
                    else if (metodoPago.toLowerCase().includes('transfer')) setShowTransferenciaTable(false);
                    else if (metodoPago.toLowerCase().includes('tarjeta')) setShowTarjetaTable(false);
                  }}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.05)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                  }}
                >
                  <Add sx={{
                    color: theme.palette.text.secondary,
                    fontSize: 20,
                    transform: 'rotate(45deg)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'pointer'
                  }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <TableContainer sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, width: '40px', fontSize: '1rem' }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Cliente / Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Dirección
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Total Comprado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Pedidos
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Ticket Promedio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesData
                    .sort((a, b) => b.totalComprado - a.totalComprado)
                    .map((cliente) => (
                    <TableRow key={cliente.id} sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                      },
                      transition: 'background-color 0.2s ease'
                    }}>
                      <TableCell>
                        <Tooltip title="Cliente activo" arrow>
                          <Box sx={{ 
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#22c55e',
                            border: '2px solid #16a34a',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'
                          }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`${cliente.nombre} - ${cliente.email}`} arrow>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
                              {cliente.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }}>
                              {cliente.email}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '1rem' }}>
                          {cliente.direccion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Total comprado: ${formatTicketPromedio(cliente.totalComprado)}`} arrow>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary, 
                            fontWeight: 800, 
                            fontSize: '1.2rem',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace'
                          }}>
                            {formatTicketPromedio(cliente.totalComprado)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Número de pedidos: ${cliente.pedidos}`} arrow>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary, 
                            fontWeight: 800, 
                            fontSize: '1.2rem',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace'
                          }}>
                            {cliente.pedidos}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Ticket promedio: ${formatTicketPromedio(cliente.ticketPromedio)}`} arrow>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary, 
                            fontWeight: 800, 
                            fontSize: '1.2rem',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace'
                          }}>
                            {formatTicketPromedio(cliente.ticketPromedio)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

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
            <Box sx={{ position: 'relative' }}>
              <Card sx={{ 
                minWidth: 180, 
                bgcolor: showEfectivoTable ? theme.palette.primary.main : 'background.paper',
                boxShadow: showEfectivoTable ? theme.shadows[4] : theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${showEfectivoTable ? theme.palette.primary.main : theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3],
                  borderColor: theme.palette.primary.main
                }
              }}
              onClick={() => setShowEfectivoTable(!showEfectivoTable)}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Tooltip title={`Pedidos pagados en efectivo el ${new Date(selectedDate).toLocaleDateString('es-ES')}. Click para ver detalles.`} placement="top" arrow>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: showEfectivoTable ? 'white' : 'text.primary', 
                      cursor: 'pointer',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{countEfectivo}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: showEfectivoTable ? 'white' : 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Efectivo</Typography>
                  
                  {/* Icono de expansión que rota */}
                  <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: showEfectivoTable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      bgcolor: showEfectivoTable ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}>
                    <Add sx={{
                      color: showEfectivoTable ? '#ef4444' : 'text.secondary',
                      fontSize: 20,
                      transform: showEfectivoTable ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer'
                    }} />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Tabla desplegable que emerge del card */}
              <TablaClientesPorMetodoPago show={showEfectivoTable} metodoPago="efectivo" titulo="Efectivo" />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Card sx={{ 
                minWidth: 180, 
                bgcolor: showTransferenciaTable ? theme.palette.primary.main : 'background.paper',
                boxShadow: showTransferenciaTable ? theme.shadows[4] : theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${showTransferenciaTable ? theme.palette.primary.main : theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3],
                  borderColor: theme.palette.primary.main
                }
              }}
              onClick={() => setShowTransferenciaTable(!showTransferenciaTable)}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Tooltip title={`Pedidos pagados por transferencia el ${new Date(selectedDate).toLocaleDateString('es-ES')}. Click para ver detalles.`} placement="top" arrow>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: showTransferenciaTable ? 'white' : 'text.primary', 
                      cursor: 'pointer',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{countTransferencia}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: showTransferenciaTable ? 'white' : 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Transferencia</Typography>
                  
                  {/* Icono de expansión que rota */}
                  <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: showTransferenciaTable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      bgcolor: showTransferenciaTable ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}>
                    <Add sx={{
                      color: showTransferenciaTable ? '#ef4444' : 'text.secondary',
                      fontSize: 20,
                      transform: showTransferenciaTable ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer'
                    }} />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Tabla desplegable que emerge del card */}
              <TablaClientesPorMetodoPago show={showTransferenciaTable} metodoPago="transferencia" titulo="Transferencia" />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Card sx={{ 
                minWidth: 180, 
                bgcolor: showTarjetaTable ? theme.palette.primary.main : 'background.paper',
                boxShadow: showTarjetaTable ? theme.shadows[4] : theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${showTarjetaTable ? theme.palette.primary.main : theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3],
                  borderColor: theme.palette.primary.main
                }
              }}
              onClick={() => setShowTarjetaTable(!showTarjetaTable)}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Tooltip title={`Pedidos pagados con tarjeta el ${new Date(selectedDate).toLocaleDateString('es-ES')}. Click para ver detalles.`} placement="top" arrow>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: showTarjetaTable ? 'white' : 'text.primary', 
                      cursor: 'pointer',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>{countTarjeta}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: showTarjetaTable ? 'white' : 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Tarjeta</Typography>
                  
                  {/* Icono de expansión que rota */}
                  <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: showTarjetaTable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      bgcolor: showTarjetaTable ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}>
                    <Add sx={{
                      color: showTarjetaTable ? '#ef4444' : 'text.secondary',
                      fontSize: 20,
                      transform: showTarjetaTable ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer'
                    }} />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Tabla desplegable que emerge del card */}
              <TablaClientesPorMetodoPago show={showTarjetaTable} metodoPago="tarjeta" titulo="Tarjeta" />
            </Box>
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