import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  Store,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Schedule,
  LocationOn,
  Phone,
  Email,
  Info
} from '@mui/icons-material';
// Importar los mismos componentes del dashboard principal
import VentasCard from '../components/VentasCard';
import VentasMensualesCard from '../components/VentasMensualesCard';
import VentasMensualesLocalCard from '../components/VentasMensualesLocalCard';
import VentasSemanalesCard from '../components/VentasSemanalesCard';
import VentasSemanalesLocalCard from '../components/VentasSemanalesLocalCard';
import VentasDiariasCard from '../components/VentasDiariasCard';
import VentasDiariasLocalCard from '../components/VentasDiariasLocalCard';
import VentasTotalesLocalCard from '../components/VentasTotalesLocalCard';
import TicketPromedioCard from '../components/TicketPromedioCard';
import KpiMetaCard from '../components/KpiMetaCard';
import MetodosPagoLocalCard from '../components/MetodosPagoLocalCard';
import './Local.css';
import { getVentasLocales } from '../services/api';

// Función para procesar datos del endpoint de ventas locales
const procesarDatosVentasLocales = (datos) => {
  console.log('🔄 Iniciando procesamiento de datos locales...');
  console.log('📊 Datos recibidos:', datos);
  console.log('📊 Número de registros:', datos?.length || 0);
  
  if (!datos || !Array.isArray(datos)) {
    console.log('❌ Datos inválidos o vacíos');
    return {
      ventasTotales: 0,
      ventasSemanales: 0,
      ventasDiarias: 0,
      ventasMes: 0,
      bidonesVendidos: 0,
      costos: 0,
      datosProcesados: [],
      metodosPago: {},
      ventasDiariasArray: [],
      ventasMesAnterior: 0,
      bidonesMesAnterior: 0,
      transaccionesMesAnterior: 0,
      ticketPromedio: 0,
      ticketPromedioMesPasado: 0
    };
  }

  // Encontrar la fecha más reciente en los datos para usar como referencia
  let fechaMasReciente = new Date(0);
  datos.forEach(venta => {
    try {
      const partes = venta.fecha.split('-');
      if (partes.length === 3) {
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const año = parseInt(partes[2]);
        const fechaVenta = new Date(año, mes, dia);
        if (fechaVenta > fechaMasReciente) {
          fechaMasReciente = fechaVenta;
        }
      }
    } catch (error) {
      console.error('Error procesando fecha para referencia:', venta.fecha, error);
    }
  });
  
  // Usar la fecha actual real para el apartado LOCAL
  const fechaActual = new Date();
  
  console.log('📅 Fecha de referencia para LOCAL:', fechaActual.toISOString());
  
  // Calcular períodos
  const inicioSemana = new Date(fechaActual);
  inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  
  const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const inicioDia = new Date(fechaActual);
  inicioDia.setHours(0, 0, 0, 0);
  
  // Calcular mes anterior para comparaciones
  const mesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
  const finMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);

  let ventasTotales = 0;
  let ventasSemanales = 0;
  let ventasDiarias = 0;
  let ventasMes = 0;
  let bidonesVendidos = 0;
  let metodosPago = {};
  let datosProcesados = [];
  let ventasMesAnterior = 0;
  let bidonesMesAnterior = 0;
  let transaccionesMesAnterior = 0;

  datos.forEach(venta => {
    const precio = parseInt(venta.precio);
    
    // Procesar fecha con formato DD-MM-YYYY
    let fechaVenta;
    try {
      const partes = venta.fecha.split('-');
      if (partes.length === 3) {
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const año = parseInt(partes[2]);
        fechaVenta = new Date(año, mes, dia);
      } else {
        fechaVenta = new Date(venta.fecha.split('-').reverse().join('-'));
      }
    } catch (error) {
      console.error('Error procesando fecha:', venta.fecha, error);
      fechaVenta = new Date();
    }
    
    fechaVenta.setHours(0, 0, 0, 0);

    // Calcular bidones basado en la promoción acumulable (3 bidones por $5,000)
    const bidones = Math.floor(precio / 5000) * 3;

    // Procesar método de pago
    const metodo = venta.metodopago || 'desconocido';
    if (!metodosPago[metodo]) {
      metodosPago[metodo] = { cantidad: 0, monto: 0 };
    }
    metodosPago[metodo].cantidad++;
    metodosPago[metodo].monto += precio;

    const ventaProcesada = {
      ...venta,
      precio: precio,
      bidones: bidones,
      fecha: fechaVenta
    };

    datosProcesados.push(ventaProcesada);

    // Ventas totales (todo el historial)
    ventasTotales += precio;

    // Ventas del mes actual
    if (fechaVenta >= inicioMes) {
      ventasMes += precio;
      bidonesVendidos += bidones;
    }

    // Ventas de la semana actual
    if (fechaVenta >= inicioSemana) {
      ventasSemanales += precio;
    }

    // Ventas del día actual
    if (fechaVenta >= inicioDia) {
      ventasDiarias += precio;
    }

    // Ventas del mes anterior
    if (fechaVenta >= mesAnterior && fechaVenta <= finMesAnterior) {
      ventasMesAnterior += precio;
      bidonesMesAnterior += bidones;
      transaccionesMesAnterior++;
    }
  });

  // Generar datos de ventas diarias para la semana actual (Lunes a Domingo)
  const ventasDiariasArray = [];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Calcular el lunes de esta semana
  const lunesSemana = new Date(fechaActual);
  const diaSemana = fechaActual.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  lunesSemana.setDate(fechaActual.getDate() - diasDesdeLunes);
  lunesSemana.setHours(0, 0, 0, 0);
  
  // Generar datos para cada día de la semana
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(lunesSemana);
    fecha.setDate(lunesSemana.getDate() + i);
    fecha.setHours(0, 0, 0, 0);
    
    const ventasDelDia = datosProcesados
      .filter(venta => {
        const ventaFecha = new Date(venta.fecha);
        ventaFecha.setHours(0, 0, 0, 0);
        return ventaFecha.getTime() === fecha.getTime();
      })
      .reduce((total, venta) => total + venta.precio, 0);
    
    const clientesDelDia = datosProcesados
      .filter(venta => {
        const ventaFecha = new Date(venta.fecha);
        ventaFecha.setHours(0, 0, 0, 0);
        return ventaFecha.getTime() === fecha.getTime();
      }).length;
    
    const bidonesDelDia = datosProcesados
      .filter(venta => {
        const ventaFecha = new Date(venta.fecha);
        ventaFecha.setHours(0, 0, 0, 0);
        return ventaFecha.getTime() === fecha.getTime();
      })
      .reduce((total, venta) => total + venta.bidones, 0);
    
    const diaData = {
      dia: diasSemana[fecha.getDay()],
      ventas: ventasDelDia,
      clientes: clientesDelDia,
      bidones: bidonesDelDia,
      promedio: clientesDelDia > 0 ? Math.round(ventasDelDia / clientesDelDia) : 0
    };
    
    ventasDiariasArray.push(diaData);
  }

  // Calcular ticket promedio
  const transaccionesMes = datosProcesados.filter(d => {
    const fecha = new Date(d.fecha);
    return fecha >= inicioMes;
  }).length;
  
  const ticketPromedio = transaccionesMes > 0 ? Math.round(ventasMes / transaccionesMes) : 0;
  const ticketPromedioMesPasado = transaccionesMesAnterior > 0 ? Math.round(ventasMesAnterior / transaccionesMesAnterior) : 0;

  console.log('📊 RESUMEN FINAL:');
  console.log(`  Ventas del día: $${ventasDiarias}`);
  console.log(`  Ventas de la semana: $${ventasSemanales}`);
  console.log(`  Ventas del mes: $${ventasMes}`);
  console.log(`  Bidones vendidos: ${bidonesVendidos}`);
  console.log(`  Ticket promedio: $${ticketPromedio}`);
  console.log(`  Métodos de pago:`, metodosPago);
  
  return {
    ventasTotales,
    ventasSemanales,
    ventasDiarias,
    ventasMes,
    ventasDiariasArray,
    bidonesVendidos,
    datosProcesados,
    metodosPago,
    ventasMesAnterior,
    bidonesMesAnterior,
    transaccionesMesAnterior,
    ticketPromedio,
    ticketPromedioMesPasado
  };
};

  // Función para obtener datos del endpoint
  const obtenerDatosVentasLocales = async () => {
    try {
      console.log('🔍 Iniciando fetch del endpoint local...');
      const data = await getVentasLocales();
      
      console.log('📊 Respuesta del endpoint local:', data);
      console.log('📊 Ventas totales:', data.ventas_totales);
      console.log('📊 Ventas del mes:', data.ventas_mes);
      console.log('📊 Ventas de la semana:', data.ventas_semana);
      console.log('📊 Ventas de hoy:', data.ventas_hoy);
      
      if (data && data.ventas_totales !== undefined) {
        console.log('✅ Datos válidos, procesando...');
        return data;
      } else {
        console.error('❌ Error en la respuesta del endpoint:', data);
        return {
          ventas_totales: 0,
          ventas_mes: 0,
          ventas_semana: 0,
          ventas_hoy: 0,
          bidones_totales: 0,
          bidones_mes: 0,
          bidones_semana: 0,
          bidones_hoy: 0,
          ticket_promedio: 0,
          metodos_pago: {},
          ventas_diarias: [],
          ventas_semanales: [],
          ventas_mensuales: [],
          total_transacciones: 0,
          clientes_unicos: 0
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos de ventas locales:', error);
      return {
        ventas_totales: 0,
        ventas_mes: 0,
        ventas_semana: 0,
        ventas_hoy: 0,
        bidones_totales: 0,
        bidones_mes: 0,
        bidones_semana: 0,
        bidones_hoy: 0,
        ticket_promedio: 0,
        metodos_pago: {},
        ventas_diarias: [],
        ventas_semanales: [],
        ventas_mensuales: [],
        total_transacciones: 0,
        clientes_unicos: 0
      };
    }
  };

export default function Local() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [localData, setLocalData] = useState({
    // Información del local
    nombre: "Aguas Ancud - Local Principal",
    direccion: "Av. Libertad 123, Ancud",
    telefono: "+56 9 1234 5678",
    email: "ventas@aguasancud.cl",
    horario: "Lunes a Sábado: 8:00 - 20:00",
    
    // Datos de venta del local (se actualizarán con datos reales)
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    ventasAnio: 0,
    
    // Datos de comparación del mes anterior
    ventasHoyMesPasado: 0,
    ventasSemanaMesPasado: 0,
    ventasMesPasado: 0,
    ventasAnioPasado: 0,
    
    // Métricas de clientes
    clientesHoy: 0,
    clientesSemana: 0,
    clientesMes: 0,
    clientesAnio: 0,
    clientesMesPasado: 0,
    
    // Métricas de productos
    bidonesVendidosHoy: 0,
    bidonesVendidosSemana: 0,
    bidonesVendidosMes: 0,
    bidonesVendidosAnio: 0,
    bidonesVendidosMesPasado: 0,
    
    // Métricas de eficiencia
    ticketPromedio: 0,
    ticketPromedioMesPasado: 0,
    eficienciaVentas: 0,
    satisfaccionClientes: 0,
    tiempoAtencion: 0,
    
    // Historial de ventas por día (últimos 7 días)
    ventasDiarias: [
      { dia: 'Lunes', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Martes', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Miércoles', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Jueves', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Viernes', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Sábado', ventas: 0, clientes: 0, bidones: 0 },
      { dia: 'Domingo', ventas: 0, clientes: 0, bidones: 0 }
    ],
    
    // Productos más vendidos
    productosTop: [],
    
    // Métodos de pago utilizados
    metodosPago: [],
    
    // Personal del local
    personal: []
  });

  useEffect(() => {
    const cargarDatosLocales = async () => {
      try {
        setLoading(true);
        const datosProcesados = await obtenerDatosVentasLocales();
        
        // Debug: Ver qué datos están llegando
        console.log('Datos procesados:', datosProcesados);
        console.log('Ventas del mes actual:', datosProcesados.ventas_mes);
        console.log('Bidones vendidos este mes:', datosProcesados.bidones_mes);
        console.log('Ventas diarias array:', datosProcesados.ventas_diarias);
        console.log('Longitud del array de ventas diarias:', datosProcesados.ventas_diarias?.length);
        console.log('Datos procesados completos:', datosProcesados);
        console.log('Número total de transacciones:', datosProcesados.total_transacciones);
        
        // Actualizar el estado con los datos reales del LOCAL
        setLocalData(prevData => ({
          ...prevData,
          // Ventas del LOCAL (solo datos del endpoint local)
          ventasHoy: datosProcesados.ventas_hoy,
          ventasSemana: datosProcesados.ventas_semana,
          ventasMes: datosProcesados.ventas_mes,
          ventasAnio: datosProcesados.ventas_totales,
          
          // Bidones vendidos en el LOCAL
          bidonesVendidosHoy: datosProcesados.bidones_hoy,
          bidonesVendidosSemana: datosProcesados.bidones_semana,
          bidonesVendidosMes: datosProcesados.bidones_mes,
          bidonesVendidosAnio: datosProcesados.bidones_totales,
          
          // Ticket promedio del LOCAL
          ticketPromedio: datosProcesados.ticket_promedio,
          
          // Número de transacciones del LOCAL
          clientesMes: datosProcesados.total_transacciones,
          clientesHoy: datosProcesados.ventas_hoy > 0 ? 1 : 0, // Estimación simple
          
          // Datos de comparación del LOCAL (mes anterior) - usar datos por defecto
          ventasMesPasado: 0, // No hay datos del mes anterior en el endpoint actual
          ventasHoyMesPasado: 0,
          ventasSemanaMesPasado: 0,
          ventasAnioPasado: 0,
          clientesMesPasado: 0,
          bidonesVendidosMesPasado: 0,
          ticketPromedioMesPasado: 0,
          
          // Datos de ventas diarias para el gráfico
          ventasDiarias: datosProcesados.ventas_diarias || [],
          
          // Métodos de pago
          metodosPago: Object.entries(datosProcesados.metodos_pago || {}).map(([metodo, cantidad]) => ({
            metodo,
            cantidad,
            porcentaje: (cantidad / datosProcesados.total_transacciones * 100).toFixed(1)
          })),
        }));
      } catch (error) {
        console.error('Error cargando datos locales:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosLocales();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(cargarDatosLocales, 10 * 60 * 1000);

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en Local...');
      cargarDatosLocales();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, []);

  // Función para calcular porcentaje de cambio
  const calcularPorcentajeCambio = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Cargando datos del local...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Header fijo mejorado */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: '240px' },
        right: 0,
        zIndex: 1000,
        bgcolor: 'background.default',
        padding: { xs: 2, md: 4 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(20px)',
        height: 'auto',
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              color: 'text.primary',
              marginBottom: 0.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}>
              Dashboard Local Aguas Ancud
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'text.secondary',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.5
            }}>
              Panel de control y métricas del local en tiempo real
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Contenedor principal mejorado */}
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        padding: { xs: 2, md: 4 },
        paddingTop: '220px', // Espacio para el header fijo mejorado
        position: 'relative',
        overflow: 'auto',
        height: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
          : 'linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.005) 100%)'
      }}>
        {/* Contenido principal */}
        <Box sx={{ 
          position: 'relative',
          minHeight: 'calc(100vh - 220px)',
          width: '100%',
          paddingBottom: '200px',
          maxWidth: '100%',
          margin: '0 auto'
        }}>

      {/* Header del Local */}
      <Card sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        mb: 4,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Store sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }}>
                {localData.nombre}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Gestión y administración del local físico
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {localData.direccion}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {localData.telefono}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {localData.email}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {localData.horario}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dashboard Local - Mismo estilo que Home */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Primera fila - Ventas principales del LOCAL */}
        <Grid item xs={12} sm={6} md={3}>
          <VentasDiariasLocalCard 
            title="VENTAS DIARIAS"
            subtitle="Hoy vs Mismo día mes anterior"
            ventasDiarias={localData.ventasHoy}
            ventasDiaAnterior={localData.ventasHoyMesPasado}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VentasSemanalesLocalCard 
            title="VENTAS SEMANALES"
            subtitle="Esta semana"
            ventasSemanales={localData.ventasSemana}
            ventasSemanaAnterior={localData.ventasSemanaMesPasado}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VentasMensualesLocalCard 
            title="VENTAS MENSUALES"
            subtitle="Este mes"
            ventasMensuales={localData.ventasMes}
            ventasMesAnterior={localData.ventasMesPasado}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VentasTotalesLocalCard 
            title="VENTAS TOTALES LOCALES"
            subtitle="Acumulado del local"
            ventasTotales={localData.ventasAnio}
            ventasAnioPasado={localData.ventasAnioPasado}
          />
        </Grid>

        {/* Segunda fila - Métricas de productos y clientes */}
        <Grid item xs={12} sm={6} md={3}>
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
                  BIDONES VENDIDOS
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
                  {localData.bidonesVendidosMes}
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
                  Este mes
                </Typography>
              </Box>
              <Tooltip 
                title={`Bidones vendidos este mes: ${localData.bidonesVendidosMes}`}
                placement="top"
                arrow
              >
                <Chip
                  label={`${calcularPorcentajeCambio(localData.bidonesVendidosMes, localData.bidonesVendidosMesPasado) >= 0 ? '+' : ''}${calcularPorcentajeCambio(localData.bidonesVendidosMes, localData.bidonesVendidosMesPasado).toFixed(1)}%`}
                  sx={{
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(147, 112, 219, 0.2)' 
                      : 'rgba(147, 112, 219, 0.1)',
                    color: calcularPorcentajeCambio(localData.bidonesVendidosMes, localData.bidonesVendidosMesPasado) >= 0 ? '#059669' : '#dc2626',
                    fontWeight: 600,
                    border: `1px solid ${calcularPorcentajeCambio(localData.bidonesVendidosMes, localData.bidonesVendidosMesPasado) >= 0 ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
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
              </Tooltip>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TicketPromedioCard 
            title="TICKET PROMEDIO"
            value={localData.ticketPromedio}
            subtitle="Por pedido"
            percentageChange={calcularPorcentajeCambio(localData.ticketPromedio, localData.ticketPromedioMesPasado)}
            isPositive={calcularPorcentajeCambio(localData.ticketPromedio, localData.ticketPromedioMesPasado) >= 0}
          />
        </Grid>


        <Grid item xs={12} sm={6} md={3}>
          <MetodosPagoLocalCard 
            title="MÉTODOS DE PAGO"
            subtitle="Distribución de pagos por método en el local"
            metodosPago={localData.metodosPago || {}}
            totalVentas={localData.ventasMes}
          />
        </Grid>

        {/* Tercera fila - Meta de Ventas Local */}
        <Grid item xs={12} sm={6} md={6}>
          <KpiMetaCard 
            title="META DE VENTAS LOCAL"
            currentValue={localData.ventasMes}
            targetValue={500000} // Meta fija de $500,000
            percentage={Math.round((localData.ventasMes / 500000) * 100)}
            subtitle="Objetivo Mensual"
          />
        </Grid>
      </Grid>

      {/* Gráfico de Barras - Ventas Diarias */}
      <Card sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        mb: 4,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            mb: 3,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            📊 Ventas Diarias - Últimos 7 Días
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            height: 400,
            position: 'relative',
            mt: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {localData.ventasDiarias && localData.ventasDiarias.length > 0 ? (
              <>
                {console.log('Datos del gráfico:', localData.ventasDiarias)}
                {console.log('Número de días:', localData.ventasDiarias.length)}
                {console.log('Ventas por día:', localData.ventasDiarias.map(d => `${d.dia}: $${d.ventas}`))}
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 900 500" 
                  style={{ overflow: 'visible' }}
                  preserveAspectRatio="xMidYMid meet"
                >
              {/* Definir gradiente para las barras */}
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9370db" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Ejes */}
              <line 
                x1="120" y1="420" x2="820" y2="420" 
                stroke={theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db'} 
                strokeWidth="3"
              />
              <line 
                x1="120" y1="60" x2="120" y2="420" 
                stroke={theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db'} 
                strokeWidth="3"
              />
              
              {/* Barras del gráfico */}
              {localData.ventasDiarias.map((dia, index) => {
                // Escala fija de 5,000 a 40,000 para las barras
                const maxHeight = 320; // Altura máxima en píxeles (mucho más grande)
                const barHeight = Math.max(((dia.ventas - 5000) / 35000) * maxHeight, 12); // Mínimo 12px de altura
                const barWidth = 100; // Ancho de barra (más ancho)
                const availableWidth = 700; // Ancho disponible (820 - 120)
                const totalBars = localData.ventasDiarias.length;
                const barSpacing = (availableWidth - (totalBars * barWidth)) / (totalBars + 1);
                const barX = 120 + barSpacing + (index * (barWidth + barSpacing));
                const barY = 420 - barHeight;
                
                return (
                  <g key={index}>
                    {/* Barra con glow effect */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#barGradient)"
                      filter="url(#glow)"
                      rx="4"
                      ry="4"
                      opacity="0.9"
                    />
                    
                    {/* Valor de ventas sobre la barra */}
                    <text
                      x={barX + barWidth / 2}
                      y={barY - 25}
                      textAnchor="middle"
                      fill={theme.palette.text.primary}
                      fontSize="20"
                      fontWeight="600"
                      fontFamily='"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    >
                      {dia.ventas > 0 ? `$${dia.ventas.toLocaleString()}` : '$0'}
                    </text>
                    
                    {/* Día de la semana */}
                    <text
                      x={barX + barWidth / 2}
                      y="460"
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="22"
                      fontWeight="500"
                      fontFamily='"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    >
                      {dia.dia}
                    </text>
                    
                    {/* Tooltip interactivo */}
                    <rect
                      x={barX - 15}
                      y={barY - 15}
                      width={barWidth + 30}
                      height={barHeight + 30}
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '0';
                      }}
                    />
                  </g>
                );
              })}
              
              {/* Líneas de referencia horizontales con montos */}
              {(() => {
                const montos = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000];
                
                return montos.map((monto, index) => {
                  const maxHeight = 320; // Altura máxima en píxeles (mucho más grande)
                  const y = 420 - ((monto - 5000) / 35000) * maxHeight; // Escala de 5,000 a 40,000
                  return (
                    <g key={index}>
                      <line 
                        x1="115" y1={y} x2="825" y2={y} 
                        stroke={theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'} 
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <text
                        x="110"
                        y={y + 6}
                        textAnchor="end"
                        fill={theme.palette.text.secondary}
                        fontSize="16"
                        fontFamily='"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                      >
                        ${monto.toLocaleString()}
                      </text>
                    </g>
                  );
                });
              })()}
                           </svg>
               </>
             ) : (
               <Box sx={{ 
                 display: 'flex', 
                 justifyContent: 'center', 
                 alignItems: 'center', 
                 height: '100%',
                 color: theme.palette.text.secondary
               }}>
                 <Typography variant="body1">
                   Cargando datos de ventas diarias...
                 </Typography>
               </Box>
             )}
           </Box>
          
          {/* Leyenda */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 2,
            gap: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                background: 'url(#barGradient)', 
                borderRadius: 2 
              }} />
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
              }}>
                Ventas Diarias
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

        </Box>
      </Box>
    </>
  );
} 