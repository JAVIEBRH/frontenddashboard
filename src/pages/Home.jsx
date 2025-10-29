import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import KpiCard from '../components/KpiCard';
import FinancialKpiCard from '../components/FinancialKpiCard';
import ChartCard from '../components/ChartCard';
import CapacidadCard from '../components/CapacidadCard';
import LitrosCard from '../components/LitrosCard';
import KpiMetaCard from '../components/KpiMetaCard';
import VentasCard from '../components/VentasCard';
import VentasMensualesCard from '../components/VentasMensualesCard';
import PedidosPorBloqueDonut from '../components/PedidosPorBloqueDonut';
import VentasSemanalesCard from '../components/VentasSemanalesCard';
import VentasDiariasCard from '../components/VentasDiariasCard';
import BidonesCard from '../components/BidonesCard';
import IvaCard from '../components/IvaCard';
import CostosCard from '../components/CostosCard';
import UtilidadesCard from '../components/UtilidadesCard';
import RentabilidadCard from '../components/RentabilidadCard';
import { getKpis, getPedidos, getVentasHistoricas, getVentasTotalesHistoricas } from '../services/api';
import './Home.css';

export default function Home() {
  const theme = useTheme();
  
  const [data, setData] = useState({
    ventas: 0,
    ventasTotalesHistoricas: 0,
    pedidos: 0,
    clientes: 0,
    eficiencia: 0,
    capacidad: 0,
    litros: 0,
    ventasMensuales: 0,
    ventasSemanales: 0,
    ventasDiarias: 0,
    bidones: 0,
    iva: 0,
    costos: 0,
    utilidades: 0,
    meta: 0,
    ticketPromedio: 0,
    clientesActivos: 0,
    pedidosMes: 0,
    clientesInactivos: 0,
    ventasMesPasado: 0,
    pedidosMesPasado: 0,
    capacidadUtilizada: 0,
    litrosVendidos: 0,
    capacidadTotal: 30000,
    ventasHistoricas: [],
    costosMesPasado: 0,
    bidonesMesPasado: 0,
    ivaMesPasado: 0,
    utilidadesMesPasado: 0,
    ticketPromedioMesPasado: 0,
    clientesActivosMesPasado: 0,
    clientesInactivosMesPasado: 0,
    porcentajeCambioProyectado: 0,
    esPositivoProyectado: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para calcular porcentajes de cambio
  const calcularPorcentajeCambio = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  // Función para calcular porcentaje de cambio proyectado al mismo día
  const calcularPorcentajeCambioProyectado = (actual, anterior, diasActuales, diasAnterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    
    // Proyectar el mes anterior al mismo número de días
    const anteriorProyectado = (anterior / diasAnterior) * diasActuales;
    
    return ((actual - anteriorProyectado) / anteriorProyectado) * 100;
  };

  // Función para calcular ticket promedio
  const calcularTicketPromedio = (ventas, pedidos) => {
    if (pedidos === 0) return 0;
    return Math.round(ventas / pedidos);
  };

  // Función para calcular ventas semanales (aproximación)
  const calcularVentasSemanales = (ventasMensuales) => {
    return Math.round(ventasMensuales / 4); // Aproximación semanal
  };

  // Función para calcular ventas diarias (aproximación)
  const calcularVentasDiarias = (ventasMensuales) => {
    return Math.round(ventasMensuales / 30); // Aproximación diaria
  };

  // Función para calcular meta (basada en ventas del mes anterior + 10%)
  const calcularMeta = (ventasMesPasado) => {
    return Math.round(ventasMesPasado * 1.1);
  };

  // Función para calcular progreso de meta
  const calcularProgresoMeta = (ventasActuales, meta) => {
    if (meta === 0) return 0;
    return Math.min(100, Math.round((ventasActuales / meta) * 100));
  };

  // Función para calcular porcentaje de capacidad utilizada
  const calcularPorcentajeCapacidad = (utilizada, total) => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((utilizada / total) * 100));
  };

  const fetchData = async () => {
    try {
      console.log('🔄 Iniciando fetchData en Home...');
      setLoading(true);
      setError(null);

      // Obtener datos de KPIs
      console.log('📊 Obteniendo KPIs...');
      const kpisData = await getKpis();
      console.log('✅ KPIs obtenidos:', kpisData);

      // Obtener pedidos para cálculos adicionales
      console.log('📋 Obteniendo pedidos...');
      const pedidosData = await getPedidos();
      console.log('✅ Pedidos obtenidos:', pedidosData.length, 'registros');

      // Obtener ventas históricas para el gráfico
      console.log('📈 Obteniendo ventas históricas...');
      const ventasHistoricas = await getVentasHistoricas();
      console.log('✅ Ventas históricas obtenidas:', ventasHistoricas.length, 'registros');

      // Obtener ventas totales históricas
      console.log('💰 Obteniendo ventas totales históricas...');
      const ventasTotalesHistoricas = await getVentasTotalesHistoricas();
      console.log('✅ Ventas totales históricas obtenidas:', ventasTotalesHistoricas);

      // CALCULAR VENTAS DE HOY - VERSIÓN SIMPLIFICADA
      const fechaActual = new Date();
      const dia = fechaActual.getDate().toString().padStart(2, '0');
      const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaActual.getFullYear();
      const fechaHoy = `${dia}-${mes}-${anio}`;
      
      let ventasHoy = 0;
      
      // Buscar pedidos de hoy
      pedidosData.forEach(pedido => {
        if (pedido.fecha === fechaHoy && pedido.nombrelocal === 'Aguas Ancud') {
          ventasHoy += parseInt(pedido.precio) || 0;
        }
      });
      
      // Si no encuentra pedidos de hoy, usar aproximación
      if (ventasHoy === 0) {
        ventasHoy = Math.round(kpisData.ventas_mes / 30);
      }
      
      console.log('Ventas hoy:', ventasHoy);
      
      // Calcular datos derivados
      const ventasSemanales = calcularVentasSemanales(kpisData.ventas_mes);
      const ventasDiarias = ventasHoy; // Usar ventas reales de hoy
      const meta = calcularMeta(kpisData.ventas_mes_pasado);
      const progresoMeta = calcularProgresoMeta(kpisData.ventas_mes, meta);
      const ticketPromedio = calcularTicketPromedio(kpisData.ventas_mes, kpisData.total_pedidos_mes);
      
      // Calcular costos del mes pasado (aproximación basada en bidones vendidos)
      const bidonesMesPasado = Math.round((kpisData.litros_vendidos_mes_pasado || 0) / 20);
      const costosMesPasado = 260000 + (bidonesMesPasado * 60.69); // Cuota camión + costos variables
      
      // Calcular clientes inactivos (aproximación)
      const clientesInactivos = Math.max(0, Math.round(kpisData.clientes_activos * 0.2));

      // Calcular porcentaje de capacidad utilizada basado en litros vendidos
      const litrosVendidos = kpisData.litros_vendidos || 0;
      const capacidadTotal = 30000; // Capacidad fija de 30,000 litros mensuales
      const porcentajeCapacidad = calcularPorcentajeCapacidad(litrosVendidos, capacidadTotal);
      
      // Calcular bidones vendidos (cada bidón = 20 litros)
      const bidonesVendidos = Math.round(litrosVendidos / 20);

      // Calcular días transcurridos en el mes actual
      const hoy = new Date();
      const diasActuales = hoy.getDate();
      const diasAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate(); // Días del mes anterior
      
      // Calcular proyección para pedidos del mes
      const pedidosMesPasadoProyectado = (kpisData.total_pedidos_mes_pasado || 0) / diasAnterior * diasActuales;
      const porcentajeCambioProyectado = calcularPorcentajeCambioProyectado(
        kpisData.total_pedidos_mes || 0, 
        kpisData.total_pedidos_mes_pasado || 0, 
        diasActuales, 
        diasAnterior
      );
      
      // Debug para pedidos del mes
      console.log('=== DEBUG PEDIDOS DEL MES ===');
      console.log('pedidosMes:', kpisData.total_pedidos_mes);
      console.log('pedidosMesPasado:', kpisData.total_pedidos_mes_pasado);
      console.log('diasActuales:', diasActuales);
      console.log('diasAnterior:', diasAnterior);
      console.log('pedidosMesPasadoProyectado:', pedidosMesPasadoProyectado);
      console.log('Porcentaje de cambio proyectado:', porcentajeCambioProyectado);
      console.log('Es positivo:', (kpisData.total_pedidos_mes || 0) >= pedidosMesPasadoProyectado);
      console.log('=== FIN DEBUG PEDIDOS ===');

      console.log('🔄 Actualizando estado con datos procesados...');
      // Actualizar estado con datos reales
      setData({
        ventas: kpisData.ventas_mes || 0,
        ventasTotalesHistoricas: ventasTotalesHistoricas.ventas_totales || 0,
        pedidos: kpisData.total_pedidos_mes || 0,
        clientes: kpisData.clientes_activos || 0,
        eficiencia: 94.2, // Mantener valor fijo por ahora
        capacidad: kpisData.capacidad_utilizada || 0,
        litros: kpisData.litros_vendidos || 0,
        ventasMensuales: kpisData.ventas_mes || 0,
        ventasSemanales: ventasSemanales,
        ventasDiarias: ventasDiarias,
        ventasDiariasMesPasado: Math.round(kpisData.ventas_mes_pasado / 30),
        bidones: Math.round((kpisData.total_litros_mes || 0) / 20), // 20 litros por bidón
        iva: kpisData.iva || 0,
        costos: kpisData.costos_reales || 0,
        costosMesPasado: costosMesPasado,
        utilidades: kpisData.utilidad || 0,
        meta: progresoMeta,
        ticketPromedio: ticketPromedio,
        clientesActivos: kpisData.clientes_activos || 0,
        pedidosMes: kpisData.total_pedidos_mes || 0,
        clientesInactivos: clientesInactivos,
        ventasMesPasado: kpisData.ventas_mes_pasado || 0,
        pedidosMesPasado: kpisData.total_pedidos_mes_pasado || 0,
        capacidadUtilizada: porcentajeCapacidad,
        litrosVendidos: litrosVendidos,
        capacidadTotal: capacidadTotal,
        ventasHistoricas: ventasHistoricas,
        bidonesMesPasado: bidonesMesPasado,
        ivaMesPasado: kpisData.iva_mes_pasado || 0,
        utilidadesMesPasado: kpisData.utilidad_mes_pasado || 0,
        ticketPromedioMesPasado: kpisData.ticket_promedio_mes_pasado || 0,
        clientesActivosMesPasado: kpisData.clientes_activos_mes_pasado || 0,
        clientesInactivosMesPasado: kpisData.clientes_inactivos_mes_pasado || 0,
        porcentajeCambioProyectado: porcentajeCambioProyectado,
        esPositivoProyectado: (kpisData.total_pedidos_mes || 0) >= pedidosMesPasadoProyectado
      });

      // Log de depuración para costos
      console.log('=== DEBUG COSTOS ===');
      console.log('kpisData.costos_reales:', kpisData.costos_reales);
      console.log('kpisData.litros_vendidos_mes_pasado:', kpisData.litros_vendidos_mes_pasado);
      console.log('costosMesPasado calculado:', costosMesPasado);
      console.log('Porcentaje de cambio calculado:', calcularPorcentajeCambio(data.costos, costosMesPasado));
      console.log('Es positivo:', data.costos <= costosMesPasado);
      console.log('=== FIN DEBUG COSTOS ===');
      console.log('✅ fetchData completado exitosamente');

    } catch (err) {
      console.error('❌ Error obteniendo datos:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      console.log('🏁 fetchData finalizado');
    }
  };

  // Función para actualización manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    console.log('🚀 useEffect ejecutándose en Home...');
    fetchData();
    
    // Actualización automática cada 1 minuto (para pruebas)
    const interval = setInterval(() => {
      console.log('⏰ Actualización automática de datos...');
      fetchData();
    }, 1 * 60 * 1000); // 1 minuto (cambiado de 10 minutos para pruebas)

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('🌍 Actualización global detectada en Home...');
      fetchData();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      console.log('🧹 Limpiando useEffect en Home...');
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, []);

  // Monitorear cambios en el estado
  useEffect(() => {
    console.log('📊 Estado actualizado en Home:', {
      ventas: data.ventas,
      pedidos: data.pedidos,
      clientes: data.clientes,
      ventasMensuales: data.ventasMensuales,
      ventasSemanales: data.ventasSemanales,
      ventasDiarias: data.ventasDiarias
    });
  }, [data]);



  const initialPositions = {
    ventasTotales: { x: 20, y: 100 },
    ventasMensuales: { x: 360, y: 100 },
    ventasSemanales: { x: 700, y: 100 },
    ventasDiarias: { x: 1040, y: 100 },
    bidones: { x: 20, y: 340 },
    iva: { x: 360, y: 340 },
    costos: { x: 700, y: 340 },
    utilidades: { x: 1040, y: 340 },
    kpiMeta: { x: 20, y: 580 },
    capacidad: { x: 360, y: 580 },
    compactCards: { x: 700, y: 580 }
  };

  const initialSizes = {
    ventasTotales: { width: 320, height: 220 },
    ventasMensuales: { width: 320, height: 220 },
    ventasSemanales: { width: 320, height: 220 },
    ventasDiarias: { width: 320, height: 220 },
    bidones: { width: 320, height: 220 },
    iva: { width: 320, height: 220 },
    costos: { width: 320, height: 220 },
    utilidades: { width: 320, height: 220 },
    kpiMeta: { width: 320, height: 320 },
    capacidad: { width: 320, height: 320 },
    compactCards: { width: 640, height: 320 }
  };

  const [cardPositions, setCardPositions] = useState(initialPositions);
  const [cardSizes, setCardSizes] = useState(initialSizes);

  // Las funciones de drag y resize se han eliminado para mejorar la calidad visual
  // Las posiciones y tamaños se mantienen fijos en sus valores actuales

  const resetLayout = () => {
    setCardPositions(initialPositions);
    setCardSizes(initialSizes);
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
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Typography variant="h6" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
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
              Dashboard Aguas Ancud
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'text.secondary',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.5
            }}>
              Panel de control y métricas en tiempo real
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={resetLayout}
            sx={{ 
              mt: { xs: 1, md: 0 },
              color: 'primary.main',
              borderColor: 'primary.main',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            Resetear Layout
          </Button>
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
          {/* Cards principales */}
          {/* Ventas Totales Históricas */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.ventasTotales.x,
              top: cardPositions.ventasTotales.y,
              width: cardSizes.ventasTotales.width,
              height: cardSizes.ventasTotales.height,
              zIndex: 1
            }}
          >
            <VentasCard 
              title="Ventas Totales Históricas"
              value={data.ventasTotalesHistoricas}
              subtitle="Acumulado desde el inicio"
              percentageChange={calcularPorcentajeCambio(data.ventas, data.ventasMesPasado)}
              isPositive={data.ventas >= data.ventasMesPasado}
            />
          </Box>

          {/* Ventas Mensuales */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.ventasMensuales.x,
              top: cardPositions.ventasMensuales.y,
              width: cardSizes.ventasMensuales.width,
              height: cardSizes.ventasMensuales.height,
              zIndex: 1
            }}
          >
            <VentasMensualesCard 
              value={data.ventasMensuales}
              percentageChange={calcularPorcentajeCambio(data.ventasMensuales, data.ventasMesPasado)}
              isPositive={data.ventasMensuales >= data.ventasMesPasado}
            />
          </Box>

          {/* Ventas Semanales */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.ventasSemanales.x,
              top: cardPositions.ventasSemanales.y,
              width: cardSizes.ventasSemanales.width,
              height: cardSizes.ventasSemanales.height,
              zIndex: 1
            }}
          >
            <VentasSemanalesCard 
              value={data.ventasSemanales}
              percentageChange={calcularPorcentajeCambio(data.ventasSemanales, data.ventasMesPasado / 4)}
              isPositive={data.ventasSemanales >= data.ventasMesPasado / 4}
            />
          </Box>

          {/* Ventas Diarias */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.ventasDiarias.x,
              top: cardPositions.ventasDiarias.y,
              width: cardSizes.ventasDiarias.width,
              height: cardSizes.ventasDiarias.height,
              zIndex: 1
            }}
          >
            <VentasDiariasCard 
              value={data.ventasDiarias}
              percentageChange={calcularPorcentajeCambio(data.ventasDiarias, data.ventasMesPasado / 30)}
              isPositive={data.ventasDiarias >= data.ventasMesPasado / 30}
            />
          </Box>

          {/* Bidones */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.bidones.x,
              top: cardPositions.bidones.y,
              width: cardSizes.bidones.width,
              height: cardSizes.bidones.height,
              zIndex: 1
            }}
          >
            <BidonesCard 
              value={data.bidones}
              percentageChange={calcularPorcentajeCambio(data.bidones, data.bidonesMesPasado || 0)}
              isPositive={data.bidones >= (data.bidonesMesPasado || 0)}
            />
          </Box>

          {/* IVA */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.iva.x,
              top: cardPositions.iva.y,
              width: cardSizes.iva.width,
              height: cardSizes.iva.height,
              zIndex: 1
            }}
          >
            <IvaCard 
              value={data.iva}
              percentageChange={calcularPorcentajeCambio(data.iva, data.ivaMesPasado || 0)}
              isPositive={data.iva >= (data.ivaMesPasado || 0)}
            />
          </Box>

          {/* Costos */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.costos.x,
              top: cardPositions.costos.y,
              width: cardSizes.costos.width,
              height: cardSizes.costos.height,
              zIndex: 1
            }}
          >
            <CostosCard 
              value={data.costos}
              percentageChange={calcularPorcentajeCambio(data.costos, data.costosMesPasado || 0)}
              isPositive={data.costos <= (data.costosMesPasado || 0)}
            />
          </Box>

          {/* Utilidades */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.utilidades.x,
              top: cardPositions.utilidades.y,
              width: cardSizes.utilidades.width,
              height: cardSizes.utilidades.height,
              zIndex: 1
            }}
          >
            <UtilidadesCard 
              value={data.utilidades}
              percentageChange={calcularPorcentajeCambio(data.utilidades, data.utilidadesMesPasado || 0)}
              isPositive={data.utilidades >= (data.utilidadesMesPasado || 0)}
            />
          </Box>

          {/* KPI Meta */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.kpiMeta.x,
              top: cardPositions.kpiMeta.y,
              width: cardSizes.kpiMeta.width,
              height: cardSizes.kpiMeta.height,
              zIndex: 1
            }}
          >
            <KpiMetaCard 
              currentValue={data.ventasMensuales}
              targetValue={calcularMeta(data.ventasMesPasado)}
              percentage={data.meta}
              title="Meta de Ventas"
              subtitle="Objetivo Mensual"
              description="Progreso respecto a la meta establecida para este mes."
            />
          </Box>

          {/* Capacidad */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.capacidad.x,
              top: cardPositions.capacidad.y,
              width: cardSizes.capacidad.width,
              height: cardSizes.capacidad.height,
              zIndex: 1
            }}
          >
            <CapacidadCard 
              value={data.capacidadUtilizada}
              maxValue={100}
              unit="%"
              title="Capacidad de Producción"
              subtitle="Litros vendidos este mes"
              litrosVendidos={data.litrosVendidos}
              capacidadTotal={data.capacidadTotal}
            />
          </Box>

          {/* Cards compactos - FIJOS */}
          <Box
            sx={{ 
              position: 'absolute',
              left: cardPositions.compactCards.x,
              top: cardPositions.compactCards.y,
              width: cardSizes.compactCards.width,
              height: cardSizes.compactCards.height,
              zIndex: 10
            }}
          >
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 1.5,
              height: '100%',
              padding: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: theme.shadows[1],
              border: `1px solid ${theme.palette.divider}`
            }}>
              <FinancialKpiCard 
                title="Ticket Promedio"
                value={data.ticketPromedio}
                subtitle="Por pedido"
                icon="💰"
                trend={`${calcularPorcentajeCambio(data.ticketPromedio, data.ticketPromedioMesPasado || 0).toFixed(1)}%`}
                isPositive={data.ticketPromedio >= (data.ticketPromedioMesPasado || 0)}
              />
              <FinancialKpiCard 
                title="Clientes Activos"
                value={data.clientesActivos}
                subtitle="Este mes"
                icon="👥"
                trend={`${calcularPorcentajeCambio(data.clientesActivos, data.clientesActivosMesPasado || 0).toFixed(1)}%`}
                isPositive={data.clientesActivos >= (data.clientesActivosMesPasado || 0)}
              />
              <FinancialKpiCard 
                title="Pedidos del Mes"
                value={data.pedidosMes}
                subtitle="Total"
                icon="📦"
                trend={`${data.porcentajeCambioProyectado.toFixed(1)}%`}
                isPositive={data.esPositivoProyectado}
              />
              <FinancialKpiCard 
                title="Clientes Inactivos"
                value={data.clientesInactivos}
                subtitle="Este mes"
                icon="⏸️"
                trend={`${calcularPorcentajeCambio(data.clientesInactivos, data.clientesInactivosMesPasado || 0).toFixed(1)}%`}
                isPositive={data.clientesInactivos <= (data.clientesInactivosMesPasado || 0)}
              />
            </Box>
          </Box>

          {/* GRÁFICOS SIEMPRE AL FINAL - FUERA DEL FLUJO NORMAL */}
          <Box sx={{ 
            position: 'absolute',
            top: '1000px', // Reducir espacio - posición más cercana a los cards
            left: 0,
            right: 0,
            display: 'flex', 
            gap: 3, 
            justifyContent: 'flex-start',
            zIndex: 1 // Asegurar que estén por encima del fondo
          }}>
            <Box sx={{ flex: 2 }}>
              <ChartCard 
                title="Ventas Históricas"
                data={data.ventasHistoricas}
                type="bar"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <PedidosPorBloqueDonut 
                title="Pedidos por Horario"
              />
            </Box>
          </Box>

          {/* ANÁLISIS DE RENTABILIDAD - ABAJO DE LOS GRÁFICOS */}
          <Box sx={{ 
            position: 'absolute',
            top: '1400px', // Posición ABAJO de los gráficos
            left: 0,
            right: 0,
            zIndex: 1
          }}>
            <RentabilidadCard />
          </Box>
        </Box>
      </Box>
    </>
  );
}