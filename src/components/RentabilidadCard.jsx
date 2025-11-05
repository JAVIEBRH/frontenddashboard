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
import { getAnalisisRentabilidad } from '../services/api';
import DraggableCard from './DraggableCard';

const RentabilidadCard = ({ kpiData = null }) => {
  const theme = useTheme();
  const [rentabilidadData, setRentabilidadData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para las posiciones de las secciones internas
  const [sectionPositions, setSectionPositions] = useState({
    // Primera fila: Crecimiento, Estacionalidad, Punto Equilibrio, ROI
    // Espaciado horizontal: width del card + 20px de margen
    crecimiento: { x: 0, y: 0 },
    estacionalidad: { x: 360, y: 0 }, // 340 (ancho) + 20 (margen)
    puntoEquilibrio: { x: 720, y: 0 }, // 360 + 340 + 20
    roi: { x: 1080, y: 0 }, // 720 + 340 + 20
    // Segunda fila: Proyecciones y Escenarios
    // Altura máxima de primera fila: 360px (puntoEquilibrio), + 30px de margen vertical = 390px
    proyecciones: { x: 0, y: 390 }, // Altura más alta de fila 1 (360) + 30 de margen
    escenarios: { x: 480, y: 390 }, // 450 (ancho proyecciones) + 30 (margen)
    // Tercera fila: Insights y Recomendaciones
    // Altura de proyecciones y escenarios: 380px, + 30px de margen vertical = 770px
    insights: { x: 0, y: 770 }, // 390 + 380 + 30
    recomendaciones: { x: 510, y: 770 } // 480 (ancho insights) + 30 (margen)
  });

  // Estados para los tamaños de las secciones
  const [sectionSizes, setSectionSizes] = useState({
    crecimiento: { width: 340, height: 340 },
    estacionalidad: { width: 340, height: 340 },
    puntoEquilibrio: { width: 340, height: 360 },
    roi: { width: 340, height: 480 }, // Aumentado para mostrar más métricas
    proyecciones: { width: 450, height: 380 },
    escenarios: { width: 680, height: 380 },
    insights: { width: 480, height: 360 },
    recomendaciones: { width: 480, height: 360 }
  });

  // Calcular análisis financiero desde datos del Home
  const calcularAnalisisFinanciero = (kpiData) => {
    if (!kpiData) return null;

    const PRECIO_BIDON = 2000;
    const COSTO_CUOTA_CAMION = 260000;
    const COSTO_TAPA_UNITARIA = 60.69;

    // Métricas principales
    const ventasMes = kpiData.ventasMensuales || 0;
    const ventasMesPasado = kpiData.ventasMesPasado || 0;
    const costosMes = kpiData.costos || 0;
    const costosMesPasado = kpiData.costosMesPasado || 0;
    const utilidadesMes = kpiData.utilidades || 0;
    const utilidadesMesPasado = kpiData.utilidadesMesPasado || 0;
    const bidonesMes = kpiData.bidones || 0;
    const bidonesMesPasado = kpiData.bidonesMesPasado || 0;

    // Cálculos de márgenes
    const margenBruto = ventasMes - (costosMes - COSTO_CUOTA_CAMION); // Ventas - costos variables
    const margenNeto = utilidadesMes;
    const margenBrutoPorcentaje = ventasMes > 0 ? (margenBruto / ventasMes) * 100 : 0;
    const margenNetoPorcentaje = ventasMes > 0 ? (margenNeto / ventasMes) * 100 : 0;

    // Cálculo de crecimiento
    const crecimientoMensual = ventasMesPasado > 0 
      ? ((ventasMes - ventasMesPasado) / ventasMesPasado) * 100 
      : ventasMes > 0 ? 100 : 0;
    
    // Proyección trimestral (promedio de los últimos 3 meses si hay datos)
    const ventasTrimestre = ventasMes + (ventasMesPasado * 2); // Aproximación
    const crecimientoTrimestral = ventasMesPasado > 0 
      ? ((ventasTrimestre - (ventasMesPasado * 3)) / (ventasMesPasado * 3)) * 100 
      : 0;

    // Punto de equilibrio (bidones necesarios para cubrir costos fijos)
    const puntoEquilibrioBidones = Math.ceil(COSTO_CUOTA_CAMION / (PRECIO_BIDON - COSTO_TAPA_UNITARIA));
    const puntoEquilibrioMonetario = puntoEquilibrioBidones * PRECIO_BIDON;

    // Proyecciones para los próximos 3 meses
    const tendenciaMensual = crecimientoMensual;
    const proyeccionMes1 = ventasMes * (1 + tendenciaMensual / 100);
    const proyeccionMes2 = proyeccionMes1 * (1 + tendenciaMensual / 100);
    const proyeccionMes3 = proyeccionMes2 * (1 + tendenciaMensual / 100);

    // ============================================
    // CÁLCULO DE ROI INTELIGENTE Y COMPLETO
    // ============================================
    // 
    // 📚 DOCUMENTACIÓN DEL ROI:
    // 
    // FÓRMULA GENERAL:
    // ROI = (Ganancia Neta - Inversión Total) / Inversión Total × 100
    // 
    // En nuestro caso, simplificamos a:
    // ROI = (Utilidades / Costos Totales) × 100
    // 
    // Donde:
    // - Ganancia Neta = Utilidades = Ventas - Costos Totales
    // - Inversión Total = Costos Totales = Costos Fijos + Costos Variables
    //   · Costos Fijos = Cuota Camión (260,000 CLP/mes)
    //   · Costos Variables = Tapas Unitarias × Bidones Vendidos (60.69 CLP/bidón)
    // 
    // VARIABLES REQUERIDAS:
    // - ventasMensuales: Ingresos totales del mes (bidones × $2,000)
    // - costos: Costos totales del mes (fijos + variables)
    // - utilidades: Ganancia neta del mes (ventas - costos)
    // - ventasTotalesHistoricas: Ingresos acumulados desde el inicio
    // - bidonesTotalesHistoricos: Bidones vendidos desde el inicio
    // 
    // RANGO TEMPORAL POR DEFECTO:
    // - ROI Mensual: Calculado para el mes actual
    // - ROI Trimestral: Promedio ponderado de últimos 3 meses
    // - ROI Anualizado: Proyección del ROI mensual a 12 meses
    // - ROI Acumulado Histórico: Desde el inicio de operaciones
    // 
    // AJUSTE TEMPORAL:
    // El ROI mensual se proyecta a anual multiplicando por 12:
    // ROI Anualizado = ROI Mensual × 12
    // 
    // VALIDACIONES Y ANOMALÍAS:
    // - ROI indefinido: Si costos = 0, ROI = 0
    // - Anomalías: ROI > 1000% o ROI < -1000% (valores atípicos)
    // - Validación: Verifica que ROI sea un número finito y válido
    // 
    // ============================================
    
    // ROI Mensual Actual
    const roiMensualActual = costosMes > 0 ? (utilidadesMes / costosMes) * 100 : 0;
    
    // ROI Mensual del Mes Pasado
    const roiMensualPasado = costosMesPasado > 0 ? (utilidadesMesPasado / costosMesPasado) * 100 : 0;
    
    // Comparativa ROI Mensual
    const variacionROIMensual = roiMensualPasado !== 0 
      ? ((roiMensualActual - roiMensualPasado) / Math.abs(roiMensualPasado)) * 100 
      : roiMensualActual > 0 ? 100 : 0;
    
    // ROI Trimestral (promedio ponderado de los últimos 3 meses)
    // Aproximación: (Utilidades del mes + Utilidades mes pasado × 2) / (Costos del mes + Costos mes pasado × 2)
    const utilidadesTrimestre = utilidadesMes + (utilidadesMesPasado * 2);
    const costosTrimestre = costosMes + (costosMesPasado * 2);
    const roiTrimestral = costosTrimestre > 0 ? (utilidadesTrimestre / costosTrimestre) * 100 : 0;
    
    // ROI Acumulado Histórico (si hay datos históricos)
    const ventasTotalesHistoricas = kpiData.ventasTotalesHistoricas || 0;
    const bidonesTotalesHistoricos = kpiData.bidonesTotalesHistoricos || 0;
    const costosVariablesHistoricos = bidonesTotalesHistoricos * COSTO_TAPA_UNITARIA;
    // Estimar meses de operación basado en datos históricos
    const mesesEstimados = Math.max(1, Math.ceil(bidonesTotalesHistoricos / Math.max(bidonesMes, 1)));
    const costosFijosHistoricos = COSTO_CUOTA_CAMION * mesesEstimados;
    const costosTotalesHistoricos = costosFijosHistoricos + costosVariablesHistoricos;
    const utilidadesHistoricas = ventasTotalesHistoricas - costosTotalesHistoricos;
    const roiAcumuladoHistorico = costosTotalesHistoricos > 0 
      ? (utilidadesHistoricas / costosTotalesHistoricos) * 100 
      : 0;
    
    // ROI Anualizado (proyección del ROI mensual a 12 meses)
    const roiAnualizado = roiMensualActual * 12;
    
    // ROI Proyectado basado en proyecciones de ventas
    const bidonesProyectados = Math.ceil(proyeccionMes1 / PRECIO_BIDON);
    const costosVariablesProyectados = bidonesProyectados * COSTO_TAPA_UNITARIA;
    const costosTotalesProyectados = COSTO_CUOTA_CAMION + costosVariablesProyectados;
    const utilidadProyectada = proyeccionMes1 - costosTotalesProyectados;
    const roiProyectado = costosTotalesProyectados > 0 
      ? (utilidadProyectada / costosTotalesProyectados) * 100 
      : 0;
    
    // Validación: ROI indefinido o anomalías
    const roiEsValido = !isNaN(roiMensualActual) && isFinite(roiMensualActual);
    const roiTieneAnomalia = roiMensualActual > 1000 || roiMensualActual < -1000; // Detección de anomalías

    // Escenarios de rentabilidad
    const escenarioOptimista = {
      margen: Math.min(100, margenNetoPorcentaje * 1.2)
    };
    const escenarioActual = {
      margen: margenNetoPorcentaje
    };
    const escenarioPesimista = {
      margen: Math.max(0, margenNetoPorcentaje * 0.8)
    };

    // Estacionalidad (aproximación basada en datos disponibles)
    const factorEstacional = 1.0; // Por ahora, asumimos sin estacionalidad
    const promedioVerano = ventasMes; // Aproximación
    const promedioInvierno = ventasMesPasado; // Aproximación

    // Generar insights
    const insights = [];
    if (margenNetoPorcentaje > 50) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Margen Neto Excelente',
        descripcion: `El margen neto del ${margenNetoPorcentaje.toFixed(1)}% es superior al promedio del sector.`
      });
    } else if (margenNetoPorcentaje < 20) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Margen Neto Bajo',
        descripcion: `El margen neto del ${margenNetoPorcentaje.toFixed(1)}% está por debajo de lo recomendado.`
      });
    }

    if (crecimientoMensual > 10) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Crecimiento Acelerado',
        descripcion: `Las ventas crecieron un ${crecimientoMensual.toFixed(1)}% respecto al mes anterior.`
      });
    } else if (crecimientoMensual < -10) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Caída en Ventas',
        descripcion: `Las ventas disminuyeron un ${Math.abs(crecimientoMensual).toFixed(1)}% respecto al mes anterior.`
      });
    }

    if (bidonesMes > puntoEquilibrioBidones) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Operación Rentable',
        descripcion: `Las ventas superan el punto de equilibrio en ${bidonesMes - puntoEquilibrioBidones} bidones.`
      });
    } else {
      insights.push({
        tipo: 'negativo',
        titulo: 'Bajo Punto de Equilibrio',
        descripcion: `Las ventas están ${puntoEquilibrioBidones - bidonesMes} bidones por debajo del punto de equilibrio.`
      });
    }

    // Generar recomendaciones
    const recomendaciones = [];
    if (margenNetoPorcentaje < 30) {
      recomendaciones.push({
        prioridad: 'alta',
        accion: 'Optimizar Costos Variables',
        descripcion: 'Revisar precios de tapas o negociar mejores condiciones con proveedores.'
      });
    }

    if (crecimientoMensual < 0) {
      recomendaciones.push({
        prioridad: 'alta',
        accion: 'Aumentar Ventas',
        descripcion: 'Implementar estrategias de marketing o promociones para incrementar pedidos.'
      });
    }

    if (bidonesMes < puntoEquilibrioBidones) {
      recomendaciones.push({
        prioridad: 'alta',
        accion: 'Alcanzar Punto de Equilibrio',
        descripcion: `Necesitas vender ${puntoEquilibrioBidones - bidonesMes} bidones más para cubrir costos fijos.`
      });
    }

    if (costosMes > ventasMes * 0.7) {
      recomendaciones.push({
        prioridad: 'media',
        accion: 'Revisar Estructura de Costos',
        descripcion: 'Los costos representan más del 70% de las ventas. Evaluar eficiencia operativa.'
      });
    }

    return {
      metricas_principales: {
        ventas_mes: ventasMes,
        costos_totales: costosMes,
        margen_bruto: margenBruto,
        margen_neto: margenNeto,
        margen_bruto_porcentaje: margenBrutoPorcentaje,
        margen_neto_porcentaje: margenNetoPorcentaje
      },
      analisis_avanzado: {
        crecimiento: {
          mensual: crecimientoMensual,
          trimestral: crecimientoTrimestral,
          ventas_trimestre: ventasTrimestre
        },
        estacionalidad: {
          factor_estacional: factorEstacional,
          promedio_verano: promedioVerano,
          promedio_invierno: promedioInvierno
        },
        proyecciones: {
          mes_1: proyeccionMes1,
          mes_2: proyeccionMes2,
          mes_3: proyeccionMes3,
          tendencia_mensual: tendenciaMensual
        },
        punto_equilibrio_dinamico: {
          actual: puntoEquilibrioBidones,
          optimista: Math.ceil(puntoEquilibrioBidones * 0.9),
          pesimista: Math.ceil(puntoEquilibrioBidones * 1.1)
        },
        roi: {
          // ROI Mensual
          mensual_actual: roiMensualActual,
          mensual_pasado: roiMensualPasado,
          variacion_mensual: variacionROIMensual,
          // ROI Trimestral
          trimestral: roiTrimestral,
          // ROI Acumulado
          acumulado_historico: roiAcumuladoHistorico,
          // ROI Anualizado
          anualizado: roiAnualizado,
          // ROI Proyectado
          proyectado: roiProyectado,
          // Datos de validación
          es_valido: roiEsValido,
          tiene_anomalia: roiTieneAnomalia,
          // Datos de contexto
          ventas_trimestre: ventasTrimestre,
          utilidades_trimestre: utilidadesTrimestre,
          costos_trimestre: costosTrimestre,
          utilidades_historicas: utilidadesHistoricas,
          costos_historicos: costosTotalesHistoricos,
          meses_estimados: mesesEstimados
        },
        escenarios_rentabilidad: {
          optimista: escenarioOptimista,
          actual: escenarioActual,
          pesimista: escenarioPesimista
        }
      },
      datos_reales: {
        precio_venta_bidon: PRECIO_BIDON,
        total_bidones_mes: bidonesMes,
        punto_equilibrio_bidones: puntoEquilibrioBidones
      },
      insights: insights,
      recomendaciones: recomendaciones
    };
  };

  const fetchRentabilidadData = async () => {
    try {
      setLoading(true);
      
      // Si hay datos del Home, calcular desde ellos
      if (kpiData) {
        console.log('📊 Calculando análisis financiero desde datos del Home...');
        const analisis = calcularAnalisisFinanciero(kpiData);
        if (analisis) {
          setRentabilidadData(analisis);
          console.log('✅ Análisis financiero calculado:', analisis);
        } else {
          setRentabilidadData(null);
        }
        return;
      }
      
      // Fallback: usar endpoint del backend si no hay datos del Home
      const data = await getAnalisisRentabilidad();
      
      // Validar que no haya error en la respuesta
      if (data.error) {
        console.error('Error en respuesta de rentabilidad:', data.error);
        setRentabilidadData(null);
        return;
      }
      
      // Validar estructura mínima de datos
      if (!data.analisis_avanzado && !data.metricas_principales) {
        console.error('Respuesta de rentabilidad sin estructura esperada');
        setRentabilidadData(null);
        return;
      }
      
      // Debug: Log de datos recibidos
      console.log('📊 Datos de rentabilidad recibidos:', {
        proyecciones: data.analisis_avanzado?.proyecciones,
        escenarios: data.analisis_avanzado?.escenarios_rentabilidad,
        metricas: data.metricas_principales
      });
      
      setRentabilidadData(data);
    } catch (error) {
      console.error('Error obteniendo datos de rentabilidad:', error);
      setRentabilidadData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentabilidadData();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(() => {
      console.log('Actualización automática del análisis de rentabilidad...');
      fetchRentabilidadData();
    }, 10 * 60 * 1000); // 10 minutos

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('Actualización global detectada en RentabilidadCard...');
      fetchRentabilidadData();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, [kpiData]); // Recalcular cuando cambien los datos del Home

  const getColorByValue = (value, threshold = 0) => {
    if (value > threshold) return theme.palette.mode === 'dark' ? '#22c55e' : '#059669';
    if (value < threshold) return theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626';
    return theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af';
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
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary', 
            mb: 1,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          📊 Análisis Financiero Avanzado
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontSize: '0.95rem'
          }}
        >
          Arrastra y reorganiza las secciones según tus preferencias
        </Typography>
      </Box>

      {/* Contenedor principal con posicionamiento absoluto */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        minHeight: '1150px', // Altura ajustada: 770 (y de insights) + 360 (altura insights) + 20 (margen)
        overflow: 'visible' // Cambiar a visible para permitir ver todos los cards
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', fontSize: 22 }} />
                    Crecimiento
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem', 
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Mensual
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.mensual || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem', 
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Trimestral
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.crecimiento?.trimestral || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Ventas Trimestre
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.crecimiento?.ventas_trimestre || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Crecimiento */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    Estacionalidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Factor
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.estacionalidad?.factor_estacional || 0}x
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Verano
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_verano || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Invierno
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${(rentabilidadData?.analisis_avanzado?.estacionalidad?.promedio_invierno || 0).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight de Estacionalidad */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: '#f59e0b', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    Punto de Equilibrio
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', 
                      mb: 1,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Bidones por mes
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Valor Monetario
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ${((rentabilidadData?.analisis_avanzado?.punto_equilibrio_dinamico?.actual || 0) * (rentabilidadData?.datos_reales?.precio_venta_bidon || 0)).toLocaleString()}
                  </Typography>
                </Box>

                {/* Insight del Punto Equilibrio */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: '#f59e0b', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b', fontSize: 22 }} />
                    ROI
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* ROI Mensual Actual (Principal) */}
                <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.roi?.mensual_actual || 0, 0), 
                      mb: 1,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.mensual_actual !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.mensual_actual.toFixed(1)}%` 
                      : '0%'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    ROI Mensual Actual
                  </Typography>
                </Box>

                {/* Comparativa con Mes Pasado */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Mes Anterior
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.roi?.variacion_mensual || 0)}
                    label={rentabilidadData?.analisis_avanzado?.roi?.variacion_mensual !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.variacion_mensual >= 0 ? '+' : ''}${rentabilidadData.analisis_avanzado.roi.variacion_mensual.toFixed(1)}%`
                      : '0%'}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.roi?.variacion_mensual || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.roi?.variacion_mensual || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>

                {/* ROI Trimestral */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Trimestral
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.trimestral !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.trimestral.toFixed(1)}%` 
                      : '0%'}
                  </Typography>
                </Box>

                {/* ROI Acumulado Histórico */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Acumulado Histórico
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.acumulado_historico !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.acumulado_historico.toFixed(1)}%` 
                      : '0%'}
                  </Typography>
                </Box>

                {/* ROI Anualizado */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Anualizado
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.anualizado !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.anualizado.toFixed(1)}%` 
                      : '0%'}
                  </Typography>
                </Box>

                {/* ROI Proyectado */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Proyectado
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {rentabilidadData?.analisis_avanzado?.roi?.proyectado !== undefined 
                      ? `${rentabilidadData.analisis_avanzado.roi.proyectado.toFixed(1)}%` 
                      : '0%'}
                  </Typography>
                </Box>

                 {/* Insight de ROI */}
                 <Box sx={{ 
                   mt: 2.5, 
                   pt: 2,
                   borderTop: `1px solid ${theme.palette.divider}`
                 }}>
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       fontSize: '0.875rem', 
                       color: '#f59e0b', 
                       fontWeight: 700,
                       mb: 0.75,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 0.5,
                       fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale'
                     }}
                   >
                     💡 <span>Insight:</span>
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       fontSize: '0.875rem', 
                       display: 'block', 
                       color: 'text.secondary',
                       lineHeight: 1.6,
                       wordWrap: 'break-word',
                       overflowWrap: 'break-word',
                       maxWidth: '100%',
                       fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale'
                     }}
                   >
                     {(() => {
                       const roiMensualActual = rentabilidadData?.analisis_avanzado?.roi?.mensual_actual ?? 0;
                       const roiMensualPasado = rentabilidadData?.analisis_avanzado?.roi?.mensual_pasado ?? 0;
                       const variacionROI = rentabilidadData?.analisis_avanzado?.roi?.variacion_mensual ?? 0;
                       const roiAcumulado = rentabilidadData?.analisis_avanzado?.roi?.acumulado_historico ?? 0;
                       const roiProyectado = rentabilidadData?.analisis_avanzado?.roi?.proyectado ?? 0;
                       const tieneAnomalia = rentabilidadData?.analisis_avanzado?.roi?.tiene_anomalia ?? false;
                       
                       if (tieneAnomalia) {
                         return '⚠️ Anomalía detectada en el cálculo del ROI - Verificar datos de entrada';
                       }
                       
                       if (!rentabilidadData?.analisis_avanzado?.roi?.es_valido) {
                         return 'No hay datos suficientes para calcular ROI - Verifique los datos del mes actual';
                       }
                       
                       if (roiMensualActual < 0) {
                         return 'ROI negativo - operación no rentable, requiere atención inmediata. Revisar costos y ventas.';
                       }
                       
                       if (variacionROI > 10) {
                         return `ROI mejoró ${variacionROI.toFixed(1)}% vs mes anterior - tendencia positiva. Estrategia efectiva.`;
                       } else if (variacionROI < -10) {
                         return `ROI disminuyó ${Math.abs(variacionROI).toFixed(1)}% vs mes anterior - revisar operaciones.`;
                       }
                       
                       if (roiMensualActual > 50) {
                         return `ROI excelente del ${roiMensualActual.toFixed(1)}%. Operación altamente rentable. ROI acumulado histórico: ${roiAcumulado.toFixed(1)}%.`;
                       } else if (roiMensualActual > 20) {
                         return `ROI del ${roiMensualActual.toFixed(1)}% indica buena rentabilidad. ROI acumulado histórico: ${roiAcumulado.toFixed(1)}%.`;
                       } else if (roiMensualActual > 0) {
                         return `ROI del ${roiMensualActual.toFixed(1)}% - operación rentable pero con margen de mejora. ROI acumulado: ${roiAcumulado.toFixed(1)}%.`;
                       }
                       
                       if (roiProyectado > roiMensualActual) {
                         return `ROI proyectado (${roiProyectado.toFixed(1)}%) más alto que actual - optimizar operaciones para alcanzar proyección.`;
                       }
                       
                       return `ROI del ${roiMensualActual.toFixed(1)}% en línea con proyecciones. ROI acumulado histórico: ${roiAcumulado.toFixed(1)}%.`;
                     })()}
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', fontSize: 22 }} />
                    Proyección 3 Meses
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={1.5}>
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Mes 1
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_1 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        Mes 2
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_2 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)', 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        Mes 3
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        ${(rentabilidadData?.analisis_avanzado?.proyecciones?.mes_3 || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2.5, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}` 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Tendencia
                  </Typography>
                  <Chip 
                    icon={getIconByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0)}
                    label={`${rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0) + '15',
                      color: getColorByValue(rentabilidadData?.analisis_avanzado?.proyecciones?.tendencia_mensual || 0),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      height: 28,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </Box>

                {/* Insight de Proyecciones */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
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
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`, 
                height: '100%',
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9370db', fontSize: 22 }} />
                    Escenarios de Rentabilidad
                  </Typography>
                  <Tooltip title="Arrastra para mover">
                    <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                      <DragIndicator />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(5, 150, 105, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(5, 150, 105, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Optimista
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#22c55e' : '#059669',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Actual
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.actual?.margen || rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.1)', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
                      boxShadow: theme.shadows[1]
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626', 
                          fontSize: '1rem',
                          mb: 1,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Pesimista
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626',
                          mb: 0.5,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          textRendering: 'optimizeLegibility',
                          fontSize: '1.75rem'
                        }}
                      >
                        {rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.pesimista?.margen || 0}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        Margen Neto
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Insight de Escenarios */}
                <Box sx={{ 
                  mt: 2.5, 
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9370db', 
                      fontWeight: 700,
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    💡 <span>Insight:</span>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      display: 'block', 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {(() => {
                      const optimista = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.optimista?.margen || 0;
                      const actual = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.actual?.margen || rentabilidadData?.metricas_principales?.margen_neto_porcentaje || 0;
                      const pesimista = rentabilidadData?.analisis_avanzado?.escenarios_rentabilidad?.pesimista?.margen || 0;
                      
                      if (optimista - actual > 5) return 'Potencial de mejora significativo - optimizar operaciones';
                      if (actual - pesimista > 5) return 'Posición estable - margen de seguridad alto';
                      return 'Escenarios equilibrados - monitorear tendencias';
                    })()}
                  </Typography>
                </Box>
              </Box>
            </DraggableCard>

          </>
        )}
      </Box>
    </Box>
  );
};

export default RentabilidadCard; 