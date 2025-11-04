import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Popover,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  Add, 
  MoreVert as MoreVertIcon, 
  LocationOn as LocationOnIcon, 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  Warning, 
  Error, 
  Info, 
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Schedule,
  LocalShipping,
  AttachMoney,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { getClientes, getPedidos } from '../services/api';
import './Clientes.css';

// Los datos de clientes ahora se obtienen del backend

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

  // Función para parsear fechas DD-MM-YYYY a Date con validación mejorada
  function parseFecha(fechaStr) {
  if (!fechaStr || fechaStr.trim() === '') return null;
  
  try {
    // Si ya es ISO o YYYY-MM-DD, validar y crear Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const fecha = new Date(fechaStr);
      // Verificar que la fecha es válida
      if (isNaN(fecha.getTime())) return null;
      return fecha;
    }
    
    // Si es DD-MM-YYYY
    const match = fechaStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [_, d, m, y] = match;
      const fecha = new Date(`${y}-${m}-${d}`);
      // Verificar que la fecha es válida
      if (isNaN(fecha.getTime())) return null;
      return fecha;
    }
    
    return null;
  } catch (error) {
    console.warn('Error parseando fecha:', fechaStr, error);
    return null;
  }
}

export default function Clientes({ refreshTrigger = 0 }) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showRiesgoTable, setShowRiesgoTable] = useState(false);
  const [showVipTable, setShowVipTable] = useState(false);
  
  // Estados para datos reales
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las listas apiladas
  const [searchTermVIP, setSearchTermVIP] = useState('');
  const [searchTermFrecuencia, setSearchTermFrecuencia] = useState('');
  const [clientesVIP, setClientesVIP] = useState([]);
  const [clientesFrecuencia, setClientesFrecuencia] = useState([]);
  const [clientesEnRiesgoData, setClientesEnRiesgoData] = useState([]);
  const [clientesVipData, setClientesVipData] = useState([]);

  // Estados para notificaciones
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  // Función unificada para calcular estado activo/inactivo
  const calcularEstadoCliente = (fechaUltimo) => {
    if (!fechaUltimo || fechaUltimo.trim() === '') return 'Inactivo';
    
    // Normalizar fecha: acepta DD-MM-YYYY o YYYY-MM-DD
    const fecha = parseFecha(fechaUltimo);
    if (!fecha) {
      console.warn('Fecha inválida para cálculo de estado:', fechaUltimo);
      return 'Inactivo';
    }
    
    // Verificar que la fecha no sea futura (más de 1 día en el futuro)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar hora para comparación
    const fechaNormalizada = new Date(fecha);
    fechaNormalizada.setHours(0, 0, 0, 0);
    
    const diffMs = hoy - fechaNormalizada;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    
    // Si la fecha es futura o muy antigua (más de 10 años), considerar inactivo
    if (diffDias < -1 || diffDias > 3650) {
      console.warn('Fecha fuera de rango razonable:', fechaUltimo, 'diferencia en días:', diffDias);
      return 'Inactivo';
    }
    
    return diffDias <= 75 ? 'Activo' : 'Inactivo';
  };

  // Función para generar datos de clientes en riesgo (recibe datos como parámetros)
  const generarClientesEnRiesgoData = (clientesData, pedidosData) => {
    if (!clientesData || clientesData.length === 0 || !pedidosData || pedidosData.length === 0) {
      return [];
    }

    const hoy = new Date();
    
    // Calcular estado para cada cliente
    const clientesConEstadoTemp = clientesData.map(cliente => ({
      ...cliente,
      estado: calcularEstadoCliente(cliente.ultimo_pedido)
    }));
    
    // Obtener clientes que están en riesgo (60-75 días sin comprar)
    const clientesEnRiesgoReales = clientesConEstadoTemp.filter(c => {
      const fechaUltimo = parseFecha(c.ultimo_pedido || '');
      if (!fechaUltimo) return false;
      const diff = (hoy - fechaUltimo) / (1000 * 60 * 60 * 24);
      return diff > 60 && diff <= 75;
    });

    // Calcular ticket promedio para cada cliente
    const clientesConTicketPromedio = clientesEnRiesgoReales.map(cliente => {
      // Buscar todos los pedidos de este cliente (por dirección y email)
      const pedidosCliente = pedidosData.filter(p => {
        const emailPedido = (p.usuario || '').trim().toLowerCase();
        const emailCliente = (cliente.email || '').trim().toLowerCase();
        const matchEmail = emailCliente && emailPedido && emailCliente === emailPedido;
        
        const dirPedido = (p.dire || p.direccion || '').trim().toLowerCase();
        const dirCliente = (cliente.direccion || '').trim().toLowerCase();
        const matchDireccion = dirCliente && dirPedido && dirCliente === dirPedido && dirPedido !== '';
        
        return matchEmail || matchDireccion;
      });

      // Calcular ticket promedio
      const totalComprado = pedidosCliente.reduce((sum, p) => sum + Number(p.precio || 0), 0);
      const ticketPromedio = pedidosCliente.length > 0 ? totalComprado / pedidosCliente.length : 0;

      // Calcular días sin comprar
      const fechaUltimo = parseFecha(cliente.ultimo_pedido || '');
      const diasSinComprar = fechaUltimo ? Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)) : 0;

      // Formatear fecha de última compra
      const ultimaCompra = fechaUltimo ? 
        fechaUltimo.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).replace(/\//g, '-') : '';

      return {
        id: cliente.id || Math.random().toString(36).substr(2, 9),
        nombre: cliente.nombre || cliente.direccion || 'Cliente',
        direccion: cliente.direccion || 'Sin dirección',
        email: cliente.email || '',
        ultimaCompra: ultimaCompra,
        ticketPromedio: Math.round(ticketPromedio),
        diasSinComprar: diasSinComprar,
        estado: diasSinComprar > 65 ? 'critico' : 'moderado'
      };
    });

    // Ordenar por días sin comprar (descendente) y mostrar todos
    return clientesConTicketPromedio
      .sort((a, b) => b.diasSinComprar - a.diasSinComprar);
  };

  // Función para generar datos de clientes VIP (recibe datos como parámetros)
  const generarClientesVipData = (clientesVIPyFrecuenciaData, pedidosData) => {
    if (!clientesVIPyFrecuenciaData || clientesVIPyFrecuenciaData.length === 0 || !pedidosData || pedidosData.length === 0) {
      return [];
    }

    const hoy = new Date();
    
    // Obtener clientes VIP (los que están tanto en VIP como en Frecuencia)
    const clientesVipReales = clientesVIPyFrecuenciaData.map(cliente => {
      // Buscar todos los pedidos de este cliente (por dirección y email)
      const pedidosCliente = pedidosData.filter(p => {
        const emailPedido = (p.usuario || '').trim().toLowerCase();
        const emailCliente = (cliente.email || '').trim().toLowerCase();
        const matchEmail = emailCliente && emailPedido && emailCliente === emailPedido;
        
        const dirPedido = (p.dire || p.direccion || '').trim().toLowerCase();
        const dirCliente = (cliente.direccion || '').trim().toLowerCase();
        const matchDireccion = dirCliente && dirPedido && dirCliente === dirPedido && dirPedido !== '';
        
        return matchEmail || matchDireccion;
      });

      // Calcular ticket promedio
      const totalComprado = pedidosCliente.reduce((sum, p) => sum + Number(p.precio || 0), 0);
      const ticketPromedio = pedidosCliente.length > 0 ? totalComprado / pedidosCliente.length : 0;

      // Calcular días desde última compra
      const fechaUltimo = parseFecha(cliente.ultimo_pedido || '');
      const diasDesdeUltimaCompra = fechaUltimo ? Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)) : 0;

      // Formatear fecha de última compra
      const ultimaCompra = fechaUltimo ? 
        fechaUltimo.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).replace(/\//g, '-') : '';

      // Determinar estado basado en días desde última compra
      const estado = diasDesdeUltimaCompra <= 75 ? 'activo' : 'inactivo';

      return {
        id: cliente.id || Math.random().toString(36).substr(2, 9),
        nombre: cliente.nombre || cliente.direccion || 'Cliente',
        direccion: cliente.direccion || 'Sin dirección',
        email: cliente.email || '',
        totalComprado: Math.round(totalComprado),
        pedidos: cliente.pedidos || pedidosCliente.length,
        ticketPromedio: Math.round(ticketPromedio),
        ultimaCompra: ultimaCompra,
        estado: estado
      };
    });

    // Ordenar por total comprado (descendente) y mostrar todos
    return clientesVipReales
      .sort((a, b) => b.totalComprado - a.totalComprado);
  };

  // Calcular clientes con estado (usar useMemo para evitar recálculos innecesarios)
  const clientesConEstado = React.useMemo(() => {
    return clientes.map(cliente => {
      const estado = calcularEstadoCliente(cliente.ultimo_pedido);
      return { ...cliente, estado };
    });
  }, [clientes]);

  const clientesActivos = React.useMemo(() => 
    clientesConEstado.filter(c => c.estado === 'Activo'), 
    [clientesConEstado]
  );
  
  const clientesInactivos = React.useMemo(() => 
    clientesConEstado.filter(c => c.estado === 'Inactivo'), 
    [clientesConEstado]
  );



  // Filtros de clientes (usar clientesConEstado) - Incluye búsqueda por dirección
  const filteredClientes = React.useMemo(() => {
    return clientesConEstado.filter(cliente => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (cliente.nombre || '').toLowerCase().includes(searchLower) ||
        (cliente.email || '').toLowerCase().includes(searchLower) ||
        (cliente.direccion || '').toLowerCase().includes(searchLower);
      const matchesEstado = filterEstado === 'Todos' || cliente.estado === filterEstado;
      const matchesTipo = filterTipo === 'Todos' || cliente.tipo === filterTipo;
      return matchesSearch && matchesEstado && matchesTipo;
    })
    // Ordenar: primero activos, luego inactivos
    .sort((a, b) => {
      if (a.estado === b.estado) return 0;
      if (a.estado === 'Activo') return -1;
      return 1;
    });
  }, [clientesConEstado, searchTerm, filterEstado, filterTipo]);

  // Estado para paginación (debe ir después de filteredClientes)
  const [pagina, setPagina] = useState(1);
  const clientesPorPagina = 10;
  const totalPaginas = Math.ceil(filteredClientes.length / clientesPorPagina);
  const clientesPagina = filteredClientes.slice((pagina - 1) * clientesPorPagina, pagina * clientesPorPagina);

  // Resetear página si cambia el filtro
  useEffect(() => { setPagina(1); }, [searchTerm, filterEstado, filterTipo]);

  // Función para cargar datos
    const cargarDatos = async () => {
      try {
      setLoading(true);
      const [clientesDataRaw, pedidosDataRaw] = await Promise.all([
          getClientes(),
          getPedidos()
        ]);

      // Adaptar pedidos primero para poder calcular estadísticas
      const pedidosData = pedidosDataRaw.map((p, idx) => ({
        id: idx + 1,
        usuario: p.usuario || '',
        empresa: p.nombrelocal || '',
        precio: p.precio ? Number(p.precio) : 0,
        fecha: p.fecha || '',
        status: p.status || '',
        dire: p.dire || p.direccion || '',
        ordenpedido: p.ordenpedido || '', // Cantidad de bidones por pedido
      }));

      // Adaptar clientes y calcular pedidos/total desde pedidosData
      const clientesData = clientesDataRaw.map((c, idx) => {
        // El backend devuelve: nombre, correo, dire (no usuario)
        // Los pedidos tienen: usuario (email), dire
        // Buscar todos los pedidos de este cliente (por email/correo o dirección)
        const emailCliente = (c.correo || c.usuario || '').trim().toLowerCase();
        const dirCliente = (c.dire || c.direccion || '').trim().toLowerCase();
        
        const pedidosCliente = pedidosData.filter(p => {
          // Comparar usuario (email) del pedido con correo del cliente
          const emailPedido = (p.usuario || '').trim().toLowerCase();
          const matchEmail = emailCliente && emailPedido && emailCliente === emailPedido;
          
          // Comparar dirección del pedido con dirección del cliente
          const dirPedido = (p.dire || p.direccion || '').trim().toLowerCase();
          const matchDireccion = dirCliente && dirPedido && dirCliente === dirPedido && dirPedido !== '';
          
          return matchEmail || matchDireccion;
        });

        // Calcular total de pedidos y monto total
        const totalPedidos = pedidosCliente.length;
        const totalComprado = pedidosCliente.reduce((sum, p) => sum + (p.precio || 0), 0);

        // Encontrar fecha del último pedido
        const fechasPedidos = pedidosCliente
          .map(p => parseFecha(p.fecha))
          .filter(f => f !== null)
          .sort((a, b) => b - a);
        const ultimaFechaPedido = fechasPedidos.length > 0 ? fechasPedidos[0] : parseFecha(c.fecha);

        // Obtener dirección del cliente (prioridad: 1. Dirección del cliente, 2. Pedidos por email, 3. Pedidos asociados)
        let direccionCliente = (c.dire || c.direccion || '').trim();
        
        // PRIORIDAD 1: Si no tiene dirección propia, buscar en TODOS los pedidos que coincidan con el email (más confiable)
        if (!direccionCliente && emailCliente) {
          const pedidosPorEmail = pedidosData.filter(p => {
            const emailPedido = (p.usuario || '').trim().toLowerCase();
            return emailPedido && emailPedido === emailCliente;
          });
          if (pedidosPorEmail.length > 0) {
            const direccionesEmail = pedidosPorEmail
              .map(p => (p.dire || p.direccion || '').trim())
              .filter(d => d !== '');
            if (direccionesEmail.length > 0) {
              // Usar la dirección más frecuente (o la primera si todas son iguales)
              direccionCliente = direccionesEmail[0];
            }
          }
        }
        
        // PRIORIDAD 2: Si aún no tiene dirección, buscar en los pedidos asociados por dirección
        if (!direccionCliente && pedidosCliente.length > 0) {
          const direccionesPedidos = pedidosCliente
            .map(p => (p.dire || p.direccion || '').trim())
            .filter(d => d !== '');
          if (direccionesPedidos.length > 0) {
            direccionCliente = direccionesPedidos[0];
          }
        }

        // Determinar nombre a mostrar (evitar "Cliente X" si hay nombre real)
        const nombreMostrar = c.nombre && c.nombre.trim() !== '' && !c.nombre.includes('Cliente') 
          ? c.nombre.trim() 
          : (c.correo || c.usuario || `Cliente ${idx + 1}`);

        return {
          id: idx + 1,
          nombre: nombreMostrar,
          email: c.correo || '', // El backend devuelve 'correo'
          telefono: c.telefonou || c.telefono || '',
          direccion: direccionCliente, // Usar dirección del cliente o de sus pedidos
          estado: calcularEstadoCliente(ultimaFechaPedido ? ultimaFechaPedido.toISOString().split('T')[0] : c.fecha),
          tipo: 'Regular', // Puedes mejorar esto si tienes lógica para VIP
          pedidos: totalPedidos,
          total_comprado: totalComprado || c.monto_ultimo_pedido || 0,
          ultimo_pedido: ultimaFechaPedido ? ultimaFechaPedido.toISOString().split('T')[0] : (c.fecha || ''),
          // Guardar campos originales para debugging
          correo_original: c.correo,
          dire_original: c.dire
        };
      });
        
        setClientes(clientesData);
        setPedidos(pedidosData);
        calcularListas(clientesData, pedidosData);
        
      // Log para verificar estados y fechas problemáticas
      const activos = clientesData.filter(c => c.estado === 'Activo').length;
      const inactivos = clientesData.filter(c => c.estado === 'Inactivo').length;
      
      // Verificar fechas problemáticas
      const fechasInvalidas = clientesData.filter(c => {
        const fecha = parseFecha(c.ultimo_pedido);
        return !fecha && c.ultimo_pedido && c.ultimo_pedido.trim() !== '';
      });
      
      console.log('Datos actualizados:', new Date().toLocaleTimeString());
      console.log(`Total clientes cargados: ${clientesData.length}`);
      console.log(`Total pedidos cargados: ${pedidosData.length}`);
      console.log(`Estados calculados: ${activos} activos, ${inactivos} inactivos`);
      console.log('Ejemplo de cliente procesado:', clientesData[0]);
      console.log('Ejemplo de cliente RAW del backend:', clientesDataRaw[0]);
      console.log('Ejemplo de pedido:', pedidosData[0]);
      console.log('Ejemplo de pedido RAW del backend:', pedidosDataRaw[0]);
      // Verificar si ordenpedido está presente
      const pedidosConOrdenPedido = pedidosData.filter(p => p.ordenpedido && p.ordenpedido.trim() !== '');
      console.log(`Pedidos con ordenpedido: ${pedidosConOrdenPedido.length} de ${pedidosData.length}`);
      if (pedidosConOrdenPedido.length > 0) {
        console.log('Ejemplo de pedido CON ordenpedido:', pedidosConOrdenPedido[0]);
      } else {
        console.warn('⚠️ NINGÚN PEDIDO TIENE ordenpedido - Todos los pedidos tienen ordenpedido vacío');
      }
      
      // Verificar direcciones en pedidos
      const pedidosConDireccion = pedidosData.filter(p => p.dire && p.dire.trim() !== '');
      console.log(`Pedidos con dirección: ${pedidosConDireccion.length} de ${pedidosData.length}`);
      if (pedidosConDireccion.length > 0) {
        console.log('Ejemplo de pedido CON dirección:', pedidosConDireccion[0]);
      } else {
        console.warn('⚠️ NINGÚN PEDIDO TIENE DIRECCIÓN - Todos los pedidos tienen dire vacío');
      }
      // Verificar coincidencias y direcciones
      const clienteConPedidos = clientesData.find(c => c.pedidos > 0);
      const clienteConDireccion = clientesData.find(c => c.direccion && c.direccion.trim() !== '');
      const clientesSinDireccion = clientesData.filter(c => !c.direccion || c.direccion.trim() === '');
      
      if (clienteConPedidos) {
        console.log('Cliente con pedidos encontrado:', clienteConPedidos);
      } else {
        console.warn('⚠️ NINGÚN CLIENTE TIENE PEDIDOS ASOCIADOS - Revisar lógica de mapeo');
      }
      
      if (clienteConDireccion) {
        console.log('✅ Cliente con dirección encontrado:', clienteConDireccion);
      } else {
        console.warn(`⚠️ NINGÚN CLIENTE TIENE DIRECCIÓN - ${clientesSinDireccion.length} clientes sin dirección`);
        if (clientesSinDireccion.length > 0) {
          const ejemploSinDireccion = clientesSinDireccion[0];
          console.log('Ejemplo de cliente sin dirección:', ejemploSinDireccion);
          // Buscar pedidos de este cliente específico para debugging
          const pedidosEjemplo = pedidosData.filter(p => {
            const emailEjemplo = (ejemploSinDireccion.email || '').trim().toLowerCase();
            const emailPedido = (p.usuario || '').trim().toLowerCase();
            return emailEjemplo && emailPedido && emailEjemplo === emailPedido;
          });
          console.log(`Pedidos encontrados para "${ejemploSinDireccion.nombre}" (${ejemploSinDireccion.email}):`, pedidosEjemplo.length);
          if (pedidosEjemplo.length > 0) {
            console.log('Primer pedido del cliente sin dirección:', pedidosEjemplo[0]);
          } else {
            console.warn(`⚠️ "${ejemploSinDireccion.nombre}" NO tiene pedidos con email "${ejemploSinDireccion.email}"`);
          }
        }
      }
      
      // Contar clientes con y sin dirección
      const clientesConDireccionTotal = clientesData.filter(c => c.direccion && c.direccion.trim() !== '').length;
      console.log(`📊 Resumen: ${clientesConDireccionTotal} de ${clientesData.length} clientes tienen dirección (${Math.round(clientesConDireccionTotal/clientesData.length*100)}%)`);
      
      // Log de KPIs calculados
      const totalActivos = clientesData.filter(c => c.estado === 'Activo').length;
      const totalInactivos = clientesData.filter(c => c.estado === 'Inactivo').length;
      console.log('📈 KPIs calculados:', {
        totalClientes: clientesData.length,
        totalClientesActivos: totalActivos,
        totalClientesInactivos: totalInactivos,
        totalPedidos: pedidosData.length
      });
      
      // Verificar algunos ejemplos de estados
      const ejemplosActivos = clientesData.filter(c => c.estado === 'Activo').slice(0, 2);
      const ejemplosInactivos = clientesData.filter(c => c.estado === 'Inactivo').slice(0, 2);
      if (ejemplosActivos.length > 0) {
        console.log('📊 Ejemplos de clientes ACTIVOS:', ejemplosActivos.map(c => ({
          nombre: c.nombre,
          ultimo_pedido: c.ultimo_pedido,
          estado: c.estado
        })));
      }
      if (ejemplosInactivos.length > 0) {
        console.log('📊 Ejemplos de clientes INACTIVOS:', ejemplosInactivos.map(c => ({
          nombre: c.nombre,
          ultimo_pedido: c.ultimo_pedido,
          estado: c.estado
        })));
      }
      
      if (fechasInvalidas.length > 0) {
        console.warn('Fechas inválidas encontradas:', fechasInvalidas.map(c => ({
          cliente: c.nombre,
          fecha: c.ultimo_pedido
        })));
      }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(`Error al cargar datos: ${error.message || 'Error desconocido'}`);
        setClientes([]);
        setPedidos([]);
        setClientesVIP([]);
        setClientesFrecuencia([]);
        setClientesEnRiesgoData([]);
        setClientesVipData([]);
      } finally {
        setLoading(false);
      }
    };
    
  // Cargar datos iniciales y cuando se solicita actualización manual
  useEffect(() => {
    cargarDatos();
  }, [refreshTrigger]);

  // Actualización automática con debounce para evitar múltiples llamadas
  useEffect(() => {
    let timeoutId = null;
    let lastRefresh = 0;
    const DEBOUNCE_DELAY = 30000; // 30 segundos mínimo entre actualizaciones
    const INTERVAL_TIME = 60000; // 1 minuto
    
    const debouncedCargarDatos = () => {
      const now = Date.now();
      if (now - lastRefresh < DEBOUNCE_DELAY) {
        console.log('Actualización debounceada (muy reciente)');
        return;
      }
      lastRefresh = now;
      console.log('Actualización automática (Clientes):', new Date().toLocaleTimeString());
      cargarDatos();
    };

    const interval = setInterval(debouncedCargarDatos, INTERVAL_TIME);

    // Escuchar evento de actualización global (con debounce)
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en Clientes...');
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(debouncedCargarDatos, 1000);
    };

    // Refrescar al volver el foco a la pestaña (con debounce)
    const handleFocus = () => {
      console.log('Foco en ventana: refrescando Clientes');
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(debouncedCargarDatos, 1000);
    };
    
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('Pestaña visible: refrescando Clientes');
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(debouncedCargarDatos, 1000);
      }
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Función para normalizar dirección
  function normalizarDireccion(dir) {
    return (dir || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // Función para obtener clave de agrupación
  function claveAgrupacion(dir) {
    const norm = normalizarDireccion(dir);
    if (norm.includes('avenida la florida 10269')) {
      // Buscar número de departamento (tres dígitos)
      const match = norm.match(/avenida la florida 10269.*?(\d{3})/);
      if (match) {
        return `avenida la florida 10269 depto ${match[1]}`;
      }
      // Si no hay número, agrupa solo por la dirección base
      return 'avenida la florida 10269';
    }
    return norm;
  }

  // Función para calcular las listas VIP y frecuencia
  const calcularListas = (clientesData, pedidosData) => {
    // Mapear compras por clave de agrupación
    const comprasPorClave = {};
    pedidosData.forEach(pedido => {
      const clave = claveAgrupacion(pedido.dire || pedido.direccion);
      if (!clave) return;
      if (!comprasPorClave[clave]) {
        comprasPorClave[clave] = { total: 0, frecuencia: 0, ultimo: null, totalBidones: 0 };
      }
      comprasPorClave[clave].total += pedido.precio;
      comprasPorClave[clave].frecuencia += 1;
      // Calcular bidones del pedido: usar ordenpedido si existe, sino calcular desde precio
      let bidonesPedido = 0;
      if (pedido.ordenpedido && pedido.ordenpedido.trim() !== '') {
        bidonesPedido = parseInt(pedido.ordenpedido) || 0;
      }
      // Si no hay ordenpedido, calcular desde precio (2000 por bidón)
      if (bidonesPedido === 0 && pedido.precio > 0) {
        bidonesPedido = Math.max(1, Math.round(pedido.precio / 2000));
      }
      comprasPorClave[clave].totalBidones += bidonesPedido;
      if (!comprasPorClave[clave].ultimo || new Date(pedido.fecha) > new Date(comprasPorClave[clave].ultimo)) {
        comprasPorClave[clave].ultimo = pedido.fecha;
      }
    });

    // Agrupar clientes por clave de agrupación
    const clientesPorClave = {};
    clientesData.forEach(cliente => {
      const clave = claveAgrupacion(cliente.direccion);
      if (!clave) return;
      if (!clientesPorClave[clave]) {
        clientesPorClave[clave] = { ...cliente };
      } else {
        clientesPorClave[clave].total_comprado += cliente.total_comprado || 0;
        clientesPorClave[clave].pedidos += cliente.pedidos || 0;
        const fechaExistente = clientesPorClave[clave].ultimo_pedido;
        const fechaNueva = cliente.ultimo_pedido;
        if (fechaNueva && (!fechaExistente || new Date(fechaNueva) > new Date(fechaExistente))) {
          clientesPorClave[clave].ultimo_pedido = fechaNueva;
        }
      }
    });

    // Enriquecer clientes agrupados con compras
    const clientesEnriquecidos = Object.values(clientesPorClave).map(cliente => {
      const clave = claveAgrupacion(cliente.direccion);
      const compras = comprasPorClave[clave] || { total: 0, frecuencia: 0, ultimo: null, totalBidones: 0 };
      // Calcular bidones por pedido usando el total de bidones calculado de los pedidos reales
      const bidonesPorPedido = compras.frecuencia > 0 && compras.totalBidones > 0 
        ? (compras.totalBidones / compras.frecuencia) 
        : 0;
      
      // Usar la fecha más reciente entre compras.ultimo y cliente.ultimo_pedido
      const fechaCompras = compras.ultimo || '';
      const fechaCliente = cliente.ultimo_pedido || '';
      const fechaFinal = fechaCompras && fechaCliente ? 
        (new Date(fechaCompras) > new Date(fechaCliente) ? fechaCompras : fechaCliente) :
        (fechaCompras || fechaCliente);
      
      // Calcular estado funcional usando función unificada
      const estado = calcularEstadoCliente(fechaFinal);
      
      // Debug para Walker Martinez
      if (cliente.nombre && cliente.nombre.toLowerCase().includes('walker')) {
        console.log('Walker en lista VIP:', {
          nombre: cliente.nombre,
          fechaCompras: fechaCompras,
          fechaCliente: fechaCliente,
          fechaFinal: fechaFinal,
          estado: estado
        });
      }
      
      return {
        ...cliente,
        total_comprado: compras.total,
        pedidos: compras.frecuencia,
        ultimo_pedido: fechaFinal,
        bidonesPorPedido: bidonesPorPedido,
        estado: estado
      };
    });

    // Top 15 VIP (más dinero aportado)
    const topVIP = [...clientesEnriquecidos]
      .sort((a, b) => b.total_comprado - a.total_comprado)
      .slice(0, 15);

    // Top 15 Frecuencia (más compras)
    const topFrecuencia = [...clientesEnriquecidos]
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 15);

    // Log para verificar cálculo de bidones
    console.log('📦 Cálculo de bidones por pedido:');
    if (topVIP.length > 0) {
      console.log('Ejemplo de cliente VIP con bidones:', {
        direccion: topVIP[0].direccion,
        pedidos: topVIP[0].pedidos,
        bidonesPorPedido: topVIP[0].bidonesPorPedido,
        total_comprado: topVIP[0].total_comprado
      });
    }
    // Verificar si hay clientes con bidones > 0
    const clientesConBidones = topVIP.filter(c => c.bidonesPorPedido && c.bidonesPorPedido > 0);
    console.log(`Clientes VIP con bidones > 0: ${clientesConBidones.length} de ${topVIP.length}`);

    setClientesVIP(topVIP);
    setClientesFrecuencia(topFrecuencia);
    
    // Calcular clientes VIP y Frecuencia para generar datos de clientes en riesgo y VIP
    const direccionesVIPTemp = new Set(topVIP.map(c => (c.direccion || '').toLowerCase()));
    const direccionesFrecuenciaTemp = new Set(topFrecuencia.map(c => (c.direccion || '').toLowerCase()));
    const clientesVIPyFrecuenciaTemp = topVIP.filter(c => direccionesFrecuenciaTemp.has((c.direccion || '').toLowerCase()));
    
    // Generar datos de clientes en riesgo y VIP después de calcular las listas
    const riesgoData = generarClientesEnRiesgoData(clientesData, pedidosData);
    const vipData = generarClientesVipData(clientesVIPyFrecuenciaTemp, pedidosData);
    
    setClientesEnRiesgoData(riesgoData);
    setClientesVipData(vipData);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Filtros de estado para listas VIP y Frecuencia
  const [filtroEstadoVIP, setFiltroEstadoVIP] = useState('Todos');
  const [filtroEstadoFrecuencia, setFiltroEstadoFrecuencia] = useState('Todos');
  
  // Estado para controlar el período de análisis de crecimiento
  const [periodoCrecimiento, setPeriodoCrecimiento] = useState('12meses'); // '12meses' o '6meses'

  // Filtrar VIP y Frecuencia según el filtro de estado (incluye búsqueda por dirección)
  const filteredVIP = React.useMemo(() => {
    const searchLower = searchTermVIP.toLowerCase();
    return clientesVIP.filter(cliente => 
      (filtroEstadoVIP === 'Todos' || cliente.estado === filtroEstadoVIP) &&
      ((cliente.nombre || '').toLowerCase().includes(searchLower) ||
       (cliente.email || '').toLowerCase().includes(searchLower) ||
       (cliente.direccion || '').toLowerCase().includes(searchLower))
    );
  }, [clientesVIP, filtroEstadoVIP, searchTermVIP]);
  
  // Log para verificar datos de la tabla VIP
  if (filteredVIP.length > 0) {
    console.log('🔍 Datos de filteredVIP para tabla:', {
      total: filteredVIP.length,
      primerCliente: {
        direccion: filteredVIP[0].direccion,
        pedidos: filteredVIP[0].pedidos,
        bidonesPorPedido: filteredVIP[0].bidonesPorPedido,
        total_comprado: filteredVIP[0].total_comprado,
        tieneBidones: !!filteredVIP[0].bidonesPorPedido,
        valorBidones: filteredVIP[0].bidonesPorPedido
      },
      todosLosCampos: Object.keys(filteredVIP[0])
    });
    
    // Verificar todos los clientes VIP
    const clientesSinBidones = filteredVIP.filter(c => !c.bidonesPorPedido || c.bidonesPorPedido === 0);
    if (clientesSinBidones.length > 0) {
      console.warn(`⚠️ ${clientesSinBidones.length} clientes VIP NO tienen bidonesPorPedido`);
      console.log('Ejemplo de cliente sin bidones:', clientesSinBidones[0]);
    }
  }

  const filteredFrecuencia = React.useMemo(() => {
    const searchLower = searchTermFrecuencia.toLowerCase();
    return clientesFrecuencia.filter(cliente => 
      (filtroEstadoFrecuencia === 'Todos' || cliente.estado === filtroEstadoFrecuencia) &&
      ((cliente.nombre || '').toLowerCase().includes(searchLower) ||
       (cliente.email || '').toLowerCase().includes(searchLower) ||
       (cliente.direccion || '').toLowerCase().includes(searchLower))
    );
  }, [clientesFrecuencia, filtroEstadoFrecuencia, searchTermFrecuencia]);

  // Calcular clientes que están en ambas listas (VIP y Frecuencia)
  const direccionesVIP = new Set(clientesVIP.map(c => (c.direccion || '').toLowerCase()));
  const direccionesFrecuencia = new Set(clientesFrecuencia.map(c => (c.direccion || '').toLowerCase()));
  const clientesVIPyFrecuencia = clientesVIP.filter(c => direccionesFrecuencia.has((c.direccion || '').toLowerCase()));
  const cantidadVIPyFrecuencia = clientesVIPyFrecuencia.length;
  const tooltipVIPyFrecuencia = clientesVIPyFrecuencia.map(c => c.direccion || 'Sin dirección').join('\n');

  // Calcular clientes reactivados (mejorado: verifica que haya pedido después del gap > 75 días)
  const clientesReactivados = React.useMemo(() => {
    if (!pedidos || pedidos.length === 0) return 0;
    
    // Agrupar pedidos por dirección normalizada
    const pedidosPorDireccion = {};
    pedidos.forEach(pedido => {
      const dirNorm = (pedido.dire || pedido.direccion || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!dirNorm) return;
      if (!pedidosPorDireccion[dirNorm]) pedidosPorDireccion[dirNorm] = [];
      pedidosPorDireccion[dirNorm].push(pedido);
    });
    
    let count = 0;
    Object.values(pedidosPorDireccion).forEach(listaPedidos => {
      if (listaPedidos.length < 2) return;
      
      // Ordenar por fecha ascendente
      listaPedidos.sort((a, b) => {
        const fa = parseFecha(a.fecha);
        const fb = parseFecha(b.fecha);
        if (!fa || !fb) return 0;
        return fa.getTime() - fb.getTime();
      });
      
      // Verificar que haya al menos un gap > 75 días Y un pedido posterior
      for (let i = 1; i < listaPedidos.length; i++) {
        const fechaPrev = parseFecha(listaPedidos[i - 1].fecha);
        const fechaActual = parseFecha(listaPedidos[i].fecha);
        if (fechaPrev && fechaActual) {
          const diff = (fechaActual.getTime() - fechaPrev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff > 75) {
            // Verificar que hay al menos un pedido después del gap (es decir, este pedido)
            // Si llegamos aquí, hay un gap > 75 días y un pedido después
            count++;
            break; // Solo contar una vez por cliente
          }
        }
      }
    });
    return count;
  }, [pedidos]);

  // Componente reutilizable para tabla de clientes
  const TablaClientes = ({ clientes, searchTerm, onSearchChange, titulo, mostrarDireccionSolo = false }) => (
    <Card sx={{ 
      bgcolor: 'background.paper',
      boxShadow: theme.shadows[1],
      borderRadius: 3,
      border: `1px solid ${theme.palette.divider}`,
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {titulo}
          </Typography>
          <TextField
            placeholder="Buscar en esta lista..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Estado</TableCell>
                {mostrarDireccionSolo ? (
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Bidones por Pedido</TableCell>
                ) : (
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tipo</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Pedidos</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Total Comprado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Último Pedido</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente, idx) => (
                <TableRow key={cliente.id} sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#3b82f6' }}>
                        {(cliente.direccion || cliente.nombre || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {cliente.direccion && cliente.direccion.trim() !== '' 
                            ? cliente.direccion 
                            : (cliente.nombre && cliente.nombre.trim() !== '' && !cliente.nombre.startsWith('Cliente ') 
                                ? cliente.nombre 
                                : (cliente.email || `Cliente ${cliente.id}`))}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary', 
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility'
                        }}>
                          {cliente.direccion && cliente.direccion.trim() !== '' 
                            ? (cliente.nombre || cliente.email || `ID: ${cliente.id}`)
                            : (cliente.email || `ID: ${cliente.id}`)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                        <Typography variant="body2" sx={{ 
                          color: 'text.primary', 
                          fontWeight: 600,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility'
                        }}>
                          {cliente.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                        <Typography variant="body2" sx={{ 
                          color: 'text.primary', 
                          fontWeight: 600,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility'
                        }}>
                          {cliente.telefono}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={cliente.estado} 
                      size="small" 
                      sx={{ 
                        bgcolor: cliente.estado === 'Activo' ? 
                          (theme.palette.mode === 'dark' ? '#065f46' : '#22c55e') : 
                          (theme.palette.mode === 'dark' ? '#7f1d1d' : '#ef4444'),
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        '& .MuiChip-label': {
                          padding: '0 8px'
                        }
                      }}
                    />
                  </TableCell>
                  {mostrarDireccionSolo ? (
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {(() => {
                          const valor = cliente.bidonesPorPedido;
                          // Log solo para el primer cliente para debugging
                          if (idx === 0) {
                            console.log('🔬 Renderizando bidonesPorPedido:', {
                              valor: valor,
                              tipo: typeof valor,
                              esNumero: typeof valor === 'number',
                              mayorACero: valor > 0,
                              cliente: cliente.direccion
                            });
                          }
                          if (valor && valor > 0) {
                            return valor % 1 === 0 
                              ? Math.round(valor) 
                              : valor.toFixed(1);
                          }
                          return '0';
                        })()}
                      </Typography>
                    </TableCell>
                  ) : (
                  <TableCell>
                    <Chip 
                      label={cliente.tipo} 
                      size="small" 
                      sx={{ 
                        bgcolor: cliente.tipo === 'VIP' ? 
                          (theme.palette.mode === 'dark' ? '#92400e' : '#fef3c7') : 
                          (theme.palette.mode === 'dark' ? '#1e3a8a' : '#dbeafe'),
                        color: cliente.tipo === 'VIP' ? 
                          (theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e') : 
                          (theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af'),
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {cliente.pedidos || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      ${(cliente.total_comprado || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: 'text.primary', 
                      fontWeight: 600,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>
                      {(() => {
                        const fecha = parseFecha(cliente.ultimo_pedido);
                        return fecha && !isNaN(fecha) ? fecha.toLocaleDateString('es-ES') : 'N/A';
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={handleMenuClick}>
                      <MoreVertIcon sx={{ color: 'text.primary' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  // Estadísticas rápidas
  const totalClientes = clientes.length;
  const totalClientesActivos = clientesConEstado.filter(c => c.estado === 'Activo').length;
  const totalClientesVIP = clientes.filter(c => c.total_comprado > 0).length;
  const totalVentas = clientes.reduce((sum, c) => sum + (c.total_comprado || 0), 0);
  // Calcular churn (clientes inactivos)
  const churnAbs = clientesConEstado.filter(c => c.estado === 'Inactivo').length;
  const churnPct = totalClientes > 0 ? Math.round((churnAbs / totalClientes) * 100) : 0;

  // Card: Clientes Nuevos (últimos 75 días) - corregido usando la primera compra
  const clientesNuevos = (() => {
    const hoy = new Date();
    // Agrupar pedidos por dirección normalizada
    const pedidosPorDireccion = {};
    pedidos.forEach(pedido => {
      const dirNorm = (pedido.dire || pedido.direccion || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!dirNorm) return;
      if (!pedidosPorDireccion[dirNorm]) pedidosPorDireccion[dirNorm] = [];
      pedidosPorDireccion[dirNorm].push(pedido);
    });
    let count = 0;
    Object.values(pedidosPorDireccion).forEach(listaPedidos => {
      if (!listaPedidos.length) return;
      // Buscar la fecha más antigua
      const fechas = listaPedidos.map(p => parseFecha(p.fecha)).filter(Boolean);
      if (!fechas.length) return;
      const fechaPrimera = fechas.reduce((a, b) => a < b ? a : b);
      const diff = (hoy - fechaPrimera) / (1000 * 60 * 60 * 24);
      if (diff <= 75) count++;
    });
    return count;
  })();

  // Clientes nuevos del período anterior (75 días previos)
  const clientesNuevosAnterior = (() => {
    const hoy = new Date();
    const hace150Dias = new Date(hoy.getTime() - 150 * 24 * 60 * 60 * 1000);
    const hace75Dias = new Date(hoy.getTime() - 75 * 24 * 60 * 60 * 1000);
    
    // Agrupar pedidos por dirección normalizada
    const pedidosPorDireccion = {};
    pedidos.forEach(pedido => {
      const dirNorm = (pedido.dire || pedido.direccion || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!dirNorm) return;
      if (!pedidosPorDireccion[dirNorm]) pedidosPorDireccion[dirNorm] = [];
      pedidosPorDireccion[dirNorm].push(pedido);
    });
    
    let count = 0;
    Object.values(pedidosPorDireccion).forEach(listaPedidos => {
      if (!listaPedidos.length) return;
      // Buscar la fecha más antigua
      const fechas = listaPedidos.map(p => parseFecha(p.fecha)).filter(Boolean);
      if (!fechas.length) return;
      const fechaPrimera = fechas.reduce((a, b) => a < b ? a : b);
      
      // Verificar si la primera compra fue entre hace 150 y 75 días
      if (fechaPrimera >= hace150Dias && fechaPrimera <= hace75Dias) {
        count++;
      }
    });
    return count;
  })();

  // Determinar si el crecimiento de clientes nuevos es positivo
  const clientesNuevosCrecimiento = clientesNuevos - clientesNuevosAnterior;

  // Card: Clientes en Riesgo (60-75 días sin comprar)
  const clientesEnRiesgo = clientesConEstado.filter(c => {
    const fechaUltimo = parseFecha(c.ultimo_pedido || '');
    if (!fechaUltimo) return false;
    const hoy = new Date();
    const diff = (hoy - fechaUltimo) / (1000 * 60 * 60 * 24);
    return diff > 60 && diff <= 75;
  }).length;

  // Lista: Top 15 Ticket Promedio
  const topTicketPromedio = [...clientesVIP, ...clientesFrecuencia]
    .filter(c => c.pedidos > 0)
    .reduce((acc, c) => {
      // Evitar duplicados por dirección
      if (!acc.some(x => (x.direccion || '').toLowerCase() === (c.direccion || '').toLowerCase())) acc.push(c);
      return acc;
    }, [])
    .map(c => ({ ...c, ticketPromedio: c.total_comprado / c.pedidos }))
    .sort((a, b) => b.ticketPromedio - a.ticketPromedio)
    .slice(0, 15);

  // Lista: Top 15 Crecimiento (dinámico según período seleccionado)
  const topCrecimiento = (() => {
    // Agrupar pedidos por dirección
    const pedidosPorDireccion = {};
    pedidos.forEach(p => {
      const dirNorm = (p.dire || p.direccion || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!dirNorm) return;
      if (!pedidosPorDireccion[dirNorm]) pedidosPorDireccion[dirNorm] = [];
      pedidosPorDireccion[dirNorm].push(p);
    });
    
    const hoy = new Date();
    
    // Definir períodos según la selección
    let periodoActual, periodoAnterior, nombrePeriodoActual, nombrePeriodoAnterior;
    
    if (periodoCrecimiento === '12meses') {
      // 12 meses: últimos 6 meses vs 6 meses previos
      periodoActual = new Date(hoy.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      periodoAnterior = new Date(hoy.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
      nombrePeriodoActual = 'Últimos 6 meses';
      nombrePeriodoAnterior = '6 meses previos';
    } else {
      // 6 meses: últimos 3 meses vs 3 meses previos
      periodoActual = new Date(hoy.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
      periodoAnterior = new Date(hoy.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      nombrePeriodoActual = 'Últimos 3 meses';
      nombrePeriodoAnterior = '3 meses previos';
    }
    
    const crecimientoPorDireccion = Object.entries(pedidosPorDireccion).map(([dir, lista]) => {
      let montoPeriodoActual = 0, montoPeriodoAnterior = 0;
      let pedidosPeriodoActual = 0, pedidosPeriodoAnterior = 0;
      
      lista.forEach(p => {
        const f = parseFecha(p.fecha);
        if (!f) return;
        
        if (f >= periodoActual) {
          montoPeriodoActual += Number(p.precio || 0);
          pedidosPeriodoActual++;
        } else if (f >= periodoAnterior && f < periodoActual) {
          montoPeriodoAnterior += Number(p.precio || 0);
          pedidosPeriodoAnterior++;
        }
      });
      
      // Calcular crecimiento y porcentaje
      const crecimiento = montoPeriodoAnterior === 0 ? montoPeriodoActual : montoPeriodoActual - montoPeriodoAnterior;
      const porcentajeCrecimiento = montoPeriodoAnterior === 0 ? 
        (montoPeriodoActual > 0 ? 100 : 0) : 
        ((montoPeriodoActual - montoPeriodoAnterior) / montoPeriodoAnterior) * 100;
      
      return {
        direccion: dir,
        crecimiento,
        porcentajeCrecimiento,
        montoPeriodoActual,
        montoPeriodoAnterior,
        pedidosPeriodoActual,
        pedidosPeriodoAnterior,
        promedioPeriodoActual: pedidosPeriodoActual > 0 ? montoPeriodoActual / pedidosPeriodoActual : 0,
        promedioPeriodoAnterior: pedidosPeriodoAnterior > 0 ? montoPeriodoAnterior / pedidosPeriodoAnterior : 0,
        nombrePeriodoActual,
        nombrePeriodoAnterior
      };
    });
    
    return crecimientoPorDireccion
      .filter(c => c.montoPeriodoActual > 0) // Solo clientes con actividad reciente
      .sort((a, b) => b.porcentajeCrecimiento - a.porcentajeCrecimiento) // Ordenar por porcentaje de crecimiento
      .slice(0, 15);
  })();

  // Función para generar notificaciones
  const generarNotificaciones = () => {
    const notificaciones = [];
    
    // Clientes en riesgo (60-75 días sin comprar)
    const clientesEnRiesgo = clientesConEstado.filter(c => {
      const fechaUltimo = parseFecha(c.ultimo_pedido || '');
      if (!fechaUltimo) return false;
      const hoy = new Date();
      const diff = (hoy - fechaUltimo) / (1000 * 60 * 60 * 24);
      return diff > 60 && diff <= 75;
    });
    
    clientesEnRiesgo.forEach(cliente => {
      notificaciones.push({
        id: `riesgo-${cliente.id}`,
        tipo: 'warning',
        titulo: 'Cliente en Riesgo',
        mensaje: `${cliente.nombre || cliente.direccion} no ha comprado en ${Math.floor((new Date() - parseFecha(cliente.ultimo_pedido)) / (1000 * 60 * 60 * 24))} días`,
        cliente: cliente,
        timestamp: new Date()
      });
    });

    // Clientes inactivos (más de 75 días) - Solo los que tienen fecha de último pedido válida
    const clientesInactivos = clientesConEstado.filter(c => {
      // Solo incluir clientes inactivos que tienen una fecha de último pedido válida
      if (c.estado !== 'Inactivo') return false;
      if (!c.ultimo_pedido || c.ultimo_pedido.trim() === '') return false;
      const fechaUltimo = parseFecha(c.ultimo_pedido);
      return fechaUltimo !== null; // Solo incluir si la fecha es válida
    });
    
    clientesInactivos.slice(0, 10).forEach(cliente => {
      const fechaUltimo = parseFecha(cliente.ultimo_pedido);
      const diasSinComprar = fechaUltimo ? Math.floor((new Date() - fechaUltimo) / (1000 * 60 * 60 * 24)) : 0;
      const fechaFormateada = fechaUltimo ? fechaUltimo.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : 'N/A';
      
      notificaciones.push({
        id: `inactivo-${cliente.id}`,
        tipo: 'error',
        titulo: 'Cliente Inactivo',
        mensaje: `${cliente.nombre || cliente.direccion || 'Cliente sin nombre'} - Último pedido: ${fechaFormateada} (${diasSinComprar} días)`,
        cliente: cliente,
        timestamp: new Date()
      });
    });

    // Resumen de clientes inactivos si hay muchos
    if (clientesInactivos.length > 10) {
      notificaciones.push({
        id: 'inactivos-resumen',
        tipo: 'error',
        titulo: 'Resumen de Clientes Inactivos',
        mensaje: `${clientesInactivos.length} clientes inactivos en total`,
        count: clientesInactivos.length,
        timestamp: new Date()
      });
    }

    // Alertas de rendimiento
    const tasaActividad = clientesConEstado.filter(c => c.estado === 'Activo').length / clientesConEstado.length * 100;
    if (tasaActividad < 50) {
      notificaciones.push({
        id: 'tasa-actividad-baja',
        tipo: 'error',
        titulo: 'Tasa de Actividad Baja',
        mensaje: `Solo ${tasaActividad.toFixed(1)}% de clientes activos`,
        porcentaje: tasaActividad,
        timestamp: new Date()
      });
    }

    // Clientes VIP que no han comprado recientemente
    const clientesVIPInactivos = clientesVIP.filter(c => c.estado === 'Inactivo');
    if (clientesVIPInactivos.length > 0) {
      notificaciones.push({
        id: 'vip-inactivos',
        tipo: 'warning',
        titulo: 'VIP Inactivos',
        mensaje: `${clientesVIPInactivos.length} clientes VIP inactivos`,
        count: clientesVIPInactivos.length,
        timestamp: new Date()
      });
    }

    // Alertas de alta tasa de inactividad
    if (clientesInactivos.length > clientesConEstado.filter(c => c.estado === 'Activo').length * 0.3) {
      notificaciones.push({
        id: 'alta-tasa-inactividad',
        tipo: 'error',
        titulo: 'Alta Tasa de Inactividad',
        mensaje: 'Considerar campaña de reactivación urgente',
        timestamp: new Date()
      });
    }

    // Oportunidades de crecimiento
    if (clientesInactivos.length > 0) {
      notificaciones.push({
        id: 'oportunidad-crecimiento',
        tipo: 'info',
        titulo: 'Oportunidad de Crecimiento',
        mensaje: `${clientesInactivos.length} clientes potenciales para reactivar`,
        count: clientesInactivos.length,
        timestamp: new Date()
      });
    }

    // Alertas de desarrollo de programa VIP
    if (clientesVIP.length < 10) {
      notificaciones.push({
        id: 'desarrollo-vip',
        tipo: 'info',
        titulo: 'Desarrollar Programa VIP',
        mensaje: 'Menos de 10 clientes VIP detectados',
        count: clientesVIP.length,
        timestamp: new Date()
      });
    }

    // Clientes nuevos (últimos 30 días)
    const clientesNuevos = (() => {
      const hoy = new Date();
      const pedidosPorDireccion = {};
      pedidos.forEach(pedido => {
        const dirNorm = (pedido.dire || pedido.direccion || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!dirNorm) return;
        if (!pedidosPorDireccion[dirNorm]) pedidosPorDireccion[dirNorm] = [];
        pedidosPorDireccion[dirNorm].push(pedido);
      });
      let count = 0;
      Object.values(pedidosPorDireccion).forEach(listaPedidos => {
        if (!listaPedidos.length) return;
        const fechas = listaPedidos.map(p => parseFecha(p.fecha)).filter(Boolean);
        if (!fechas.length) return;
        const fechaPrimera = fechas.reduce((a, b) => a < b ? a : b);
        const diff = (hoy - fechaPrimera) / (1000 * 60 * 60 * 24);
        if (diff <= 30) count++;
      });
      return count;
    })();

    if (clientesNuevos > 0) {
      notificaciones.push({
        id: 'clientes-nuevos',
        tipo: 'info',
        titulo: 'Clientes Nuevos',
        mensaje: `${clientesNuevos} nuevos clientes en los últimos 30 días`,
        count: clientesNuevos,
        timestamp: new Date()
      });
    }

    // Clientes reactivados
    if (clientesReactivados > 0) {
      notificaciones.push({
        id: 'clientes-reactivados',
        tipo: 'info',
        titulo: 'Clientes Reactivados',
        mensaje: `${clientesReactivados} clientes reactivados exitosamente`,
        count: clientesReactivados,
        timestamp: new Date()
      });
    }

    // Alertas de crecimiento
    if (topCrecimiento.length > 0) {
      const clientesConCrecimiento = topCrecimiento.filter(c => c.porcentajeCrecimiento > 50).length;
      if (clientesConCrecimiento > 0) {
        notificaciones.push({
          id: 'crecimiento-positivo',
          tipo: 'info',
          titulo: 'Crecimiento Positivo',
          mensaje: `${clientesConCrecimiento} clientes con crecimiento superior al 50%`,
          count: clientesConCrecimiento,
          timestamp: new Date()
        });
      }
    }

    // Alertas de churn alto
    const churnPct = totalClientes > 0 ? Math.round((clientesInactivos.length / totalClientes) * 100) : 0;
    if (churnPct > 40) {
      notificaciones.push({
        id: 'churn-alto',
        tipo: 'error',
        titulo: 'Churn Alto',
        mensaje: `Tasa de churn del ${churnPct}% - Requiere atención inmediata`,
        porcentaje: churnPct,
        timestamp: new Date()
      });
    }

    // Alertas de clientes de alto valor
    if (cantidadVIPyFrecuencia > 0) {
      notificaciones.push({
        id: 'clientes-alto-valor',
        tipo: 'info',
        titulo: 'Clientes de Alto Valor',
        mensaje: `${cantidadVIPyFrecuencia} clientes VIP y frecuentes identificados`,
        count: cantidadVIPyFrecuencia,
        timestamp: new Date()
      });
    }

    return notificaciones;
  };

  const notificaciones = generarNotificaciones();
  const notificacionesNoLeidas = notificaciones.length;

  // Componente de tabla desplegable para clientes en riesgo
  const TablaClientesEnRiesgo = () => {
    if (!showRiesgoTable) return null;
    
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Clientes en Riesgo - Detalle
              </Typography>
            </Box>
            
            <TableContainer sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, width: '40px', fontSize: '1rem' }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Dirección / Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Días Sin Comprar
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Ticket Promedio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesEnRiesgoData
                    .sort((a, b) => b.diasSinComprar - a.diasSinComprar)
                    .map((cliente) => (
                    <TableRow key={cliente.id} sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                      },
                      transition: 'background-color 0.2s ease'
                    }}>
                      <TableCell>
                        <Tooltip title={cliente.estado === 'critico' ? 'Cliente en riesgo crítico' : 'Cliente en riesgo moderado'} arrow>
                          <Box sx={{ 
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#ef4444',
                            border: '2px solid #dc2626',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                          }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`${cliente.direccion} - ${cliente.email}`} arrow>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
                              {cliente.direccion}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }}>
                              {cliente.email}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Última compra: ${cliente.ultimaCompra}`} arrow>
                          <Typography variant="body2" sx={{ 
                            color: cliente.diasSinComprar > 65 ? '#ef4444' : '#f59e0b',
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace'
                          }}>
                            {cliente.diasSinComprar} días
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

  const TablaClientesVip = () => {
    if (!showVipTable) return null;
    
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Clientes VIP - Detalle
              </Typography>
            </Box>
            
            <TableContainer sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, width: '40px', fontSize: '1rem' }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1rem' }}>
                      Dirección / Email
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
                  {clientesVipData
                    .sort((a, b) => b.totalComprado - a.totalComprado)
                    .map((cliente) => (
                    <TableRow key={cliente.id} sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                      },
                      transition: 'background-color 0.2s ease'
                    }}>
                      <TableCell>
                        <Tooltip title={cliente.estado === 'activo' ? 'Cliente VIP activo' : 'Cliente VIP inactivo'} arrow>
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
                        <Tooltip title={`${cliente.direccion} - ${cliente.email}`} arrow>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
                              {cliente.direccion}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }}>
                              {cliente.email}
                            </Typography>
                          </Box>
                        </Tooltip>
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

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: 'background.default',
      overflow: 'auto'
    }}>
      
      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Mensaje de error si hay algún problema */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Por favor, intenta recargar la página o contacta al administrador si el problema persiste.
              </Typography>
            </Alert>
          )}
          
          {/* Header con buscador y filtros */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 3,
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: '2rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"kern" 1',
              fontKerning: 'normal'
            }}>
              Clientes
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterEstado}
                  label="Estado"
                  onChange={(e) => setFilterEstado(e.target.value)}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filterTipo}
                  label="Tipo"
                  onChange={(e) => setFilterTipo(e.target.value)}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="Regular">Regular</MenuItem>
                </Select>
              </FormControl>

              {/* 🔔 CAMPANA DE NOTIFICACIONES */}
              <Tooltip title="Notificaciones y Alertas" placement="bottom">
                <IconButton
                  onClick={handleNotificationsClick}
                  sx={{
                    bgcolor: notificacionesNoLeidas > 0 ? '#fef3c7' : 'transparent',
                    '&:hover': {
                      bgcolor: notificacionesNoLeidas > 0 ? '#fde68a' : '#f1f5f9'
                    },
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Badge 
                    badgeContent={notificacionesNoLeidas} 
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: notificacionesNoLeidas > 0 ? theme.palette.warning.dark : theme.palette.text.secondary,
                        color: theme.palette.background.paper,
                        fontWeight: 600
                      }
                    }}
                  >
                    {notificacionesNoLeidas > 0 ? (
                      <NotificationsActiveIcon sx={{ color: theme.palette.warning.dark, fontSize: 24 }} />
                    ) : (
                      <NotificationsIcon sx={{ color: theme.palette.text.secondary, fontSize: 24 }} />
                    )}
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* POPOVER DE NOTIFICACIONES */}
              <Popover
                open={Boolean(notificationsAnchorEl)}
                anchorEl={notificationsAnchorEl}
                onClose={handleNotificationsClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 3,
                    boxShadow: theme.shadows[4],
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    minWidth: 450,
                    maxWidth: 550,
                    maxHeight: 700
                  }
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility'
                      }}
                    >
                      Alertas y Notificaciones
                    </Typography>
                    <Chip 
                      label={notificacionesNoLeidas} 
                      size="small" 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: notificacionesNoLeidas > 0 
                          ? (theme.palette.mode === 'dark' ? '#92400e' : '#fef3c7')
                          : 'background.paper',
                        color: notificacionesNoLeidas > 0 
                          ? (theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e')
                          : 'text.secondary',
                        border: `1px solid ${notificacionesNoLeidas > 0 ? theme.palette.warning.main : theme.palette.divider}`
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />
                  
                  {notificaciones.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CheckCircle sx={{ 
                        color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                        fontSize: 48, 
                        mb: 2 
                      }} />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'text.primary', 
                          fontWeight: 600,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility',
                          mb: 1
                        }}
                      >
                        ¡Todo en orden!
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility'
                        }}
                      >
                        No hay alertas pendientes
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {/* Agrupar notificaciones por tipo */}
                      {(() => {
                        const errores = notificaciones.filter(n => n.tipo === 'error');
                        const warnings = notificaciones.filter(n => n.tipo === 'warning');
                        const info = notificaciones.filter(n => n.tipo === 'info');
                        
                        return (
                          <>
                            {/* Errores - Clientes en Riesgo */}
                            {errores.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.mode === 'dark' ? '#fca5a5' : '#dc2626',
                                    mb: 1,
                                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                    WebkitFontSmoothing: 'antialiased',
                                    MozOsxFontSmoothing: 'grayscale',
                                    textRendering: 'optimizeLegibility'
                                  }}
                                >
                                  ⚠️ Clientes en Riesgo ({errores.length})
                                </Typography>
                                {errores.map((notif, index) => (
                                  <Alert
                                    key={notif.id}
                                    severity="warning"
                                    sx={{ 
                                      mb: 1,
                                      borderRadius: 2,
                                      bgcolor: theme.palette.mode === 'dark' ? '#7f1d1d' : '#fee2e2',
                                      border: `1px solid ${theme.palette.mode === 'dark' ? '#991b1b' : '#fca5a5'}`,
                                      '& .MuiAlert-icon': { 
                                        color: theme.palette.mode === 'dark' ? '#fca5a5' : '#dc2626' 
                                      },
                                      '& .MuiAlert-message': { width: '100%' }
                                    }}
                                  >
                                    <Box>
                                      <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          mb: 0.5,
                                          color: 'text.primary',
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.titulo}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: 'text.secondary', 
                                          mb: 1,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.mensaje}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          opacity: 0.7,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.timestamp.toLocaleTimeString('es-ES', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </Typography>
                                    </Box>
                                  </Alert>
                                ))}
                              </Box>
                            )}

                            {/* Warnings - Información */}
                            {warnings.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.mode === 'dark' ? '#93c5fd' : '#3b82f6',
                                    mb: 1,
                                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                    WebkitFontSmoothing: 'antialiased',
                                    MozOsxFontSmoothing: 'grayscale',
                                    textRendering: 'optimizeLegibility'
                                  }}
                                >
                                  ℹ️ Información ({warnings.length})
                                </Typography>
                                {warnings.map((notif, index) => (
                                  <Alert
                                    key={notif.id}
                                    severity="info"
                                    sx={{ 
                                      mb: 1,
                                      borderRadius: 2,
                                      bgcolor: theme.palette.mode === 'dark' ? '#1e3a8a' : '#dbeafe',
                                      border: `1px solid ${theme.palette.mode === 'dark' ? '#3b82f6' : '#93c5fd'}`,
                                      '& .MuiAlert-icon': { 
                                        color: theme.palette.mode === 'dark' ? '#93c5fd' : '#3b82f6' 
                                      },
                                      '& .MuiAlert-message': { width: '100%' }
                                    }}
                                  >
                                    <Box>
                                      <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          mb: 0.5,
                                          color: 'text.primary',
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.titulo}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: 'text.secondary', 
                                          mb: 1,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.mensaje}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          opacity: 0.7,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.timestamp.toLocaleTimeString('es-ES', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </Typography>
                                    </Box>
                                  </Alert>
                                ))}
                              </Box>
                            )}

                            {/* Info - Información Adicional */}
                            {info.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb',
                                    mb: 1,
                                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                    WebkitFontSmoothing: 'antialiased',
                                    MozOsxFontSmoothing: 'grayscale',
                                    textRendering: 'optimizeLegibility'
                                  }}
                                >
                                  🔵 Información ({info.length})
                                </Typography>
                                {info.map((notif, index) => (
                                  <Alert
                                    key={notif.id}
                                    severity="info"
                                    sx={{ 
                                      mb: 1,
                                      borderRadius: 2,
                                      bgcolor: theme.palette.mode === 'dark' ? '#1e40af' : '#eff6ff',
                                      border: `1px solid ${theme.palette.mode === 'dark' ? '#3b82f6' : '#60a5fa'}`,
                                      '& .MuiAlert-icon': { 
                                        color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb' 
                                      },
                                      '& .MuiAlert-message': { width: '100%' }
                                    }}
                                  >
                                    <Box>
                                      <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          mb: 0.5,
                                          color: 'text.primary',
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.titulo}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: 'text.secondary', 
                                          mb: 1,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.mensaje}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          opacity: 0.7,
                                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                          WebkitFontSmoothing: 'antialiased',
                                          MozOsxFontSmoothing: 'grayscale',
                                          textRendering: 'optimizeLegibility'
                                        }}
                                      >
                                        {notif.timestamp.toLocaleTimeString('es-ES', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </Typography>
                                    </Box>
                                  </Alert>
                                ))}
                              </Box>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  )}
                  
                  {notificaciones.length > 0 && (
                    <>
                      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            console.log('Marcar todas como leídas');
                            handleNotificationsClose();
                          }}
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                            }
                          }}
                        >
                          Marcar todas como leídas
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            console.log('Ver todas las notificaciones');
                            handleNotificationsClose();
                          }}
                          sx={{
                            borderColor: theme.palette.divider,
                            color: 'text.primary',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                            }
                          }}
                        >
                          Ver todas
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Popover>
            </Box>
          </Box>

          {/* Estadísticas rápidas */}
          <Grid container columns={12} spacing={3} sx={{ mb: 4 }}>
            <Grid span={3}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Tooltip title="Cantidad total de clientes únicos registrados en el sistema." placement="top" arrow>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: 'text.primary', 
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility',
                      fontFeatureSettings: '"kern" 1',
                      fontKerning: 'normal'
                    }}>{totalClientes}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Total Clientes</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid span={3}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.6), transparent, rgba(34, 197, 94, 0.6), transparent)',
                  animation: 'glowWave 5s ease-in-out infinite',
                  zIndex: 0
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 3,
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.6)',
                  animation: 'glowPulse 4s ease-in-out infinite',
                  zIndex: 1
                },
                '@keyframes glowWave': {
                  '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(0deg)' },
                  '50%': { transform: 'translateX(100%) translateY(100%) rotate(180deg)' },
                  '100%': { transform: 'translateX(-100%) translateY(-100%) rotate(360deg)' }
                },
                '@keyframes glowPulse': {
                  '0%, 100%': { opacity: 0.7 },
                  '50%': { opacity: 1 }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                  <Tooltip title="Clientes que han realizado al menos un pedido en los últimos 75 días." placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{totalClientesActivos}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Clientes Activos</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid span={3}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Tooltip title="Clientes que volvieron a comprar después de más de 75 días sin hacerlo." placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{clientesReactivados}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Clientes Reactivados</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid span={3}>
              <Box sx={{ position: 'relative' }}>
                <Card sx={{ 
                  bgcolor: showVipTable ? theme.palette.primary.main : 'background.paper',
                  boxShadow: showVipTable ? theme.shadows[4] : theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${showVipTable ? theme.palette.primary.main : theme.palette.divider}`,
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[3],
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => setShowVipTable(!showVipTable)}
                >
                  <CardContent sx={{ p: 3, position: 'relative' }}>
                    <Tooltip title="Clientes que están tanto en el top 15 de mayor dinero aportado como en el top 15 de mayor frecuencia de compra. Click para ver detalles." placement="top" arrow>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: showVipTable ? 'white' : 'text.primary', 
                        cursor: 'pointer',
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility'
                      }}>{cantidadVIPyFrecuencia}</Typography>
                    </Tooltip>
                    <Typography variant="body1" sx={{ 
                      color: showVipTable ? 'white' : 'text.primary', 
                      fontWeight: 600,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>Clientes VIP</Typography>
                    
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
                      bgcolor: showVipTable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        bgcolor: showVipTable ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}>
                      <Add sx={{
                        color: showVipTable ? '#ef4444' : 'text.secondary',
                        fontSize: 20,
                        transform: showVipTable ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        cursor: 'pointer'
                      }} />
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Tabla desplegable que emerge del card */}
                <TablaClientesVip />
              </Box>
            </Grid>

            <Grid span={3}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(239, 68, 68, 0.6), transparent, rgba(239, 68, 68, 0.6), transparent)',
                  animation: 'glowWaveRed 5s ease-in-out infinite',
                  zIndex: 0
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 3,
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.6)',
                  animation: 'glowPulseRed 4s ease-in-out infinite',
                  zIndex: 1
                },
                '@keyframes glowWaveRed': {
                  '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(0deg)' },
                  '50%': { transform: 'translateX(100%) translateY(100%) rotate(180deg)' },
                  '100%': { transform: 'translateX(-100%) translateY(-100%) rotate(360deg)' }
                },
                '@keyframes glowPulseRed': {
                  '0%, 100%': { opacity: 0.7 },
                  '50%': { opacity: 1 }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                  <Tooltip title="Clientes que llevan más de 75 días sin comprar (churn absoluto y porcentaje)." placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{churnAbs} ({churnPct}%)</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Churn</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid span={3}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: clientesNuevosCrecimiento >= 0 ? 
                    'linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.6), transparent, rgba(34, 197, 94, 0.6), transparent)' :
                    'linear-gradient(45deg, transparent, rgba(239, 68, 68, 0.6), transparent, rgba(239, 68, 68, 0.6), transparent)',
                  animation: 'glowWaveNew 5s ease-in-out infinite',
                  zIndex: 0
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 3,
                  boxShadow: clientesNuevosCrecimiento >= 0 ? 
                    '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.6)' :
                    '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.6)',
                  animation: 'glowPulseNew 4s ease-in-out infinite',
                  zIndex: 1
                },
                '@keyframes glowWaveNew': {
                  '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(0deg)' },
                  '50%': { transform: 'translateX(100%) translateY(100%) rotate(180deg)' },
                  '100%': { transform: 'translateX(-100%) translateY(-100%) rotate(360deg)' }
                },
                '@keyframes glowPulseNew': {
                  '0%, 100%': { opacity: 0.7 },
                  '50%': { opacity: 1 }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                  <Tooltip title="Clientes cuya primera compra fue en los últimos 75 días." placement="top" arrow>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>{clientesNuevos}</Typography>
                  </Tooltip>
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Clientes Nuevos (75 días)</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid span={3}>
              <Box sx={{ position: 'relative' }}>
                <Card sx={{ 
                  bgcolor: showRiesgoTable ? theme.palette.primary.main : 'background.paper',
                  boxShadow: showRiesgoTable ? theme.shadows[4] : theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${showRiesgoTable ? theme.palette.primary.main : theme.palette.divider}`,
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[3],
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => setShowRiesgoTable(!showRiesgoTable)}
                >
                  <CardContent sx={{ p: 3, position: 'relative' }}>
                    <Tooltip title="Clientes que llevan entre 60 y 75 días sin comprar (cerca de volverse inactivos). Click para ver detalles." placement="top" arrow>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: showRiesgoTable ? 'white' : 'text.primary', 
                        cursor: 'pointer',
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility'
                      }}>{clientesEnRiesgo}</Typography>
                    </Tooltip>
                    <Typography variant="body1" sx={{ 
                      color: showRiesgoTable ? 'white' : 'text.primary', 
                      fontWeight: 600,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>Clientes en Riesgo</Typography>
                    
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
                      bgcolor: showRiesgoTable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        bgcolor: showRiesgoTable ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}>
                      <Add sx={{
                        color: showRiesgoTable ? '#ef4444' : 'text.secondary',
                        fontSize: 20,
                        transform: showRiesgoTable ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        cursor: 'pointer'
                      }} />
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Tabla desplegable que emerge del card */}
                <TablaClientesEnRiesgo />
              </Box>
            </Grid>
          </Grid>

          {/* Tabla de Clientes Principal */}
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[1],
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            mb: 4
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Pedidos</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Total Comprado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Último Pedido</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesPagina.map((cliente) => (
                    <TableRow key={cliente.id} sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#3b82f6' }}>
                            {cliente.nombre.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {cliente.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary', 
                              fontWeight: 600,
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility'
                            }}>
                              ID: {cliente.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                            <Typography variant="body2" sx={{ 
                              color: 'text.primary', 
                              fontWeight: 600,
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility'
                            }}>
                              {cliente.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                            <Typography variant="body2" sx={{ 
                              color: 'text.primary', 
                              fontWeight: 600,
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility'
                            }}>
                              {cliente.telefono}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={cliente.estado} 
                          size="small" 
                          sx={{ 
                            bgcolor: cliente.estado === 'Activo' ? 
                              (theme.palette.mode === 'dark' ? '#065f46' : '#dcfce7') : 
                              (theme.palette.mode === 'dark' ? '#7f1d1d' : '#fee2e2'),
                            color: cliente.estado === 'Activo' ? 
                              (theme.palette.mode === 'dark' ? '#6ee7b7' : '#166534') : 
                              (theme.palette.mode === 'dark' ? '#fca5a5' : '#dc2626'),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={cliente.tipo} 
                          size="small" 
                          sx={{ 
                            bgcolor: cliente.tipo === 'VIP' ? 
                              (theme.palette.mode === 'dark' ? '#92400e' : '#fef3c7') : 
                              (theme.palette.mode === 'dark' ? '#1e3a8a' : '#dbeafe'),
                            color: cliente.tipo === 'VIP' ? 
                              (theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e') : 
                              (theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af'),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {cliente.pedidos || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          ${(cliente.total_comprado || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {cliente.ultimo_pedido ? 
                            (() => {
                              const fecha = parseFecha(cliente.ultimo_pedido);
                              if (fecha) {
                                return fecha.toLocaleDateString('es-ES');
                              } else {
                                return (
                                  <Box>
                                    <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '0.75rem' }}>
                                      Fecha inválida
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                      {cliente.ultimo_pedido}
                                    </Typography>
                                  </Box>
                                );
                              }
                            })() : 'N/A'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={handleMenuClick}>
                          <MoreVertIcon sx={{ color: 'text.primary' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Paginación */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, gap: 0.5, flexWrap: 'wrap' }}>
              <Button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} size="small" sx={{ minWidth: 'auto', px: 1.5 }}>
                Anterior
              </Button>
              {(() => {
                const maxButtons = 7;
                const halfButtons = Math.floor(maxButtons / 2);
                let startPage = Math.max(1, pagina - halfButtons);
                let endPage = Math.min(totalPaginas, startPage + maxButtons - 1);
                
                if (endPage - startPage < maxButtons - 1) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }
                
                const pages = [];
                if (startPage > 1) {
                  pages.push(
                    <Button key={1} onClick={() => setPagina(1)} variant={pagina === 1 ? 'contained' : 'outlined'} size="small" sx={{ minWidth: 32, px: 1 }}>
                      1
                    </Button>
                  );
                  if (startPage > 2) {
                    pages.push(<Typography key="ellipsis1" sx={{ px: 0.5 }}>...</Typography>);
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      onClick={() => setPagina(i)}
                      variant={pagina === i ? 'contained' : 'outlined'}
                      size="small"
                      sx={{ minWidth: 32, px: 1 }}
                    >
                      {i}
                    </Button>
                  );
                }
                
                if (endPage < totalPaginas) {
                  if (endPage < totalPaginas - 1) {
                    pages.push(<Typography key="ellipsis2" sx={{ px: 0.5 }}>...</Typography>);
                  }
                  pages.push(
                    <Button key={totalPaginas} onClick={() => setPagina(totalPaginas)} variant={pagina === totalPaginas ? 'contained' : 'outlined'} size="small" sx={{ minWidth: 32, px: 1 }}>
                      {totalPaginas}
                    </Button>
                  );
                }
                
                return pages;
              })()}
              <Button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} size="small" sx={{ minWidth: 'auto', px: 1.5 }}>
                Siguiente
              </Button>
            </Box>
          </Card>

          {/* Lista VIP - Top 15 por monto */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstadoVIP}
                label="Estado"
                onChange={e => setFiltroEstadoVIP(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Activo">Solo Activos</MenuItem>
                <MenuItem value="Inactivo">Solo Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TablaClientes 
            clientes={filteredVIP}
            searchTerm={searchTermVIP}
            onSearchChange={setSearchTermVIP}
            titulo="Top 15 Clientes VIP (Mayor Monto)"
            mostrarDireccionSolo={true}
          />

          {/* Lista Frecuencia - Top 15 por frecuencia */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstadoFrecuencia}
                label="Estado"
                onChange={e => setFiltroEstadoFrecuencia(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Activo">Solo Activos</MenuItem>
                <MenuItem value="Inactivo">Solo Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TablaClientes 
            clientes={filteredFrecuencia}
            searchTerm={searchTermFrecuencia}
            onSearchChange={setSearchTermFrecuencia}
            titulo="Top 15 Clientes por Frecuencia de Compra"
            mostrarDireccionSolo={true}
          />

          {/* Top 15 Ticket Promedio */}
          <TablaClientes 
            clientes={topTicketPromedio}
            searchTerm={''}
            onSearchChange={() => {}}
            titulo="Top 15 Ticket Promedio"
            mostrarDireccionSolo={true}
          />

          {/* Top 15 Clientes con Mayor Crecimiento (con pestañas de período) */}
          <Card sx={{ 
            bgcolor: theme.palette.background.paper, 
            boxShadow: theme.shadows[3], 
            borderRadius: 3, 
            border: `1px solid ${theme.palette.divider}`, 
            mb: 4 
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Top 15 Clientes con Mayor % de Crecimiento
                </Typography>
                
                {/* Pestañas de período */}
                <Box sx={{ display: 'flex', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9', borderRadius: 2, p: 0.5 }}>
                  <Button
                    onClick={() => setPeriodoCrecimiento('12meses')}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: periodoCrecimiento === '12meses' ? theme.palette.primary.main : 'transparent',
                      color: periodoCrecimiento === '12meses' ? '#fff' : theme.palette.text.secondary,
                      fontWeight: periodoCrecimiento === '12meses' ? 600 : 400,
                      '&:hover': {
                        bgcolor: periodoCrecimiento === '12meses' ? theme.palette.primary.dark : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'
                      }
                    }}
                  >
                    12 meses (6+6)
                  </Button>
                  <Button
                    onClick={() => setPeriodoCrecimiento('6meses')}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: periodoCrecimiento === '6meses' ? theme.palette.primary.main : 'transparent',
                      color: periodoCrecimiento === '6meses' ? '#fff' : theme.palette.text.secondary,
                      fontWeight: periodoCrecimiento === '6meses' ? 600 : 400,
                      '&:hover': {
                        bgcolor: periodoCrecimiento === '6meses' ? theme.palette.primary.dark : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'
                      }
                    }}
                  >
                    6 meses (3+3)
                  </Button>
                </Box>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Dirección</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Crecimiento ($)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>% Crecimiento</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {topCrecimiento.length > 0 ? topCrecimiento[0].nombrePeriodoActual : 'Período Actual'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {topCrecimiento.length > 0 ? topCrecimiento[0].nombrePeriodoAnterior : 'Período Anterior'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Promedio actual</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Promedio anterior</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCrecimiento.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.text.primary,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            {c.direccion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: c.crecimiento >= 0 ? '#059669' : '#dc2626',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            ${c.crecimiento.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${c.porcentajeCrecimiento >= 0 ? '+' : ''}${c.porcentajeCrecimiento.toFixed(1)}%`}
                            size="small"
                            sx={{ 
                              bgcolor: c.porcentajeCrecimiento >= 0 ? '#dcfce7' : '#fee2e2',
                              color: c.porcentajeCrecimiento >= 0 ? '#166534' : '#dc2626',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.text.primary,
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              ${c.montoPeriodoActual.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.text.secondary,
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              ({c.pedidosPeriodoActual} pedidos)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.text.primary,
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              ${c.montoPeriodoAnterior.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.text.secondary,
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                              textRendering: 'optimizeLegibility',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              ({c.pedidosPeriodoAnterior} pedidos)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            ${c.promedioPeriodoActual.toFixed(0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            ${c.promedioPeriodoAnterior.toFixed(0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Sección eliminada - Las alertas ahora están en la campana de notificaciones */}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>Ver Detalles</MenuItem>
        <MenuItem onClick={handleMenuClose}>Editar Cliente</MenuItem>
        <MenuItem onClick={handleMenuClose}>Ver Pedidos</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: '#dc2626' }}>Eliminar</MenuItem>
      </Menu>
    </Box>
  );
} 