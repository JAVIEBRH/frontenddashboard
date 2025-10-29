import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Avatar,
  Stack,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  CalendarMonth, 
  BarChart,
  PieChart,
  ExpandMore,
  ExpandLess,
  History,
  CheckCircle,
  Warning,
  Info,
  Delete,
  Psychology,
  Analytics,
  Timeline,
  Speed,
  PrecisionManufacturing,
  AutoGraph,
  Insights,
  TrendingDown,
  ErrorOutline,
  VerifiedUser,
  Schedule,
  Assessment,
  DataUsage,
  ShowChart,
  BubbleChart,
  ScatterPlot,
  TimelineOutlined,
  AnalyticsOutlined,
  PsychologyAlt,
  AutoAwesome,
  Lightbulb,
  TrendingFlat,
  TrendingDownOutlined,
  TrendingUpOutlined,
  Home,
  Business,
  Visibility,
  VisibilityOff,
  Inventory
} from '@mui/icons-material';
import { getFactoresPrediccion, getPredictorInteligente, getTrackingMetricas, getTrackingReporte, registrarPedidosReales, getUltimasPredicciones } from '../services/api';
import PrediccionCumplimientoCard from '../components/PrediccionCumplimientoCard';
import './Predictor.css';

export default function Predictor() {
  const theme = useTheme();
  const [prediccion, setPrediccion] = useState({
    fecha: '',
    tipoCliente: 'residencial'
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [factoresReales, setFactoresReales] = useState(null);
  const [datosHistoricos, setDatosHistoricos] = useState([]);
  const [cumplimiento, setCumplimiento] = useState({
    prediccionEsperada: 0,
    pedidosReales: 0,
    fecha: '',
    tipoCliente: ''
  });
  const [historialPredicciones, setHistorialPredicciones] = useState([]);
  const [expandedHistorial, setExpandedHistorial] = useState({});
  const [prediccionInteligente, setPrediccionInteligente] = useState(null);
  const [modoPrediccion, setModoPrediccion] = useState('inteligente'); // 'inteligente' o 'clasico'
  const [trackingMetricas, setTrackingMetricas] = useState(null);
  const [trackingReporte, setTrackingReporte] = useState(null);
  const [ultimasPredicciones, setUltimasPredicciones] = useState([]);
  const [mostrarTracking, setMostrarTracking] = useState(false);
  const [pedidosRealesInput, setPedidosRealesInput] = useState('');
  const [fechaPedidosReales, setFechaPedidosReales] = useState('');

  // Cargar factores reales al montar el componente
  useEffect(() => {
    cargarFactoresReales();
    cargarDatosHistoricos();
    cargarHistorialLocal();
    cargarTrackingData();
    
    // Actualización automática cada 10 minutos
    const interval = setInterval(() => {
      console.log('Actualización automática del predictor...');
      cargarFactoresReales();
      cargarDatosHistoricos();
      cargarTrackingData();
    }, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(interval);
  }, []);

  const cargarTrackingData = async () => {
    try {
      const [metricas, reporte, predicciones] = await Promise.all([
        getTrackingMetricas(),
        getTrackingReporte(),
        getUltimasPredicciones(7)
      ]);
      
      setTrackingMetricas(metricas);
      setTrackingReporte(reporte);
      setUltimasPredicciones(predicciones);
    } catch (error) {
      console.error('Error cargando datos de tracking:', error);
    }
  };

  const registrarPedidosRealesHandler = async () => {
    if (!fechaPedidosReales || !pedidosRealesInput) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      await registrarPedidosReales(fechaPedidosReales, parseInt(pedidosRealesInput), prediccion.tipoCliente);
      setPedidosRealesInput('');
      setFechaPedidosReales('');
      await cargarTrackingData(); // Recargar datos
      alert('Pedidos reales registrados exitosamente');
    } catch (error) {
      console.error('Error registrando pedidos reales:', error);
      alert('Error registrando pedidos reales');
    }
  };

  const cargarFactoresReales = async () => {
    try {
      const factores = await getFactoresPrediccion();
      setFactoresReales(factores);
      console.log('Factores reales cargados:', factores);
    } catch (error) {
      console.error('Error cargando factores reales:', error);
    }
  };

  const cargarDatosHistoricos = async () => {
    try {
      // Simulación de datos históricos reales de Aguas Ancud
      const historico = [
        { fecha: '2024-01-15', pedidos: 45, zona: 'centro', tipo: 'recurrente', temperatura: 28 },
        { fecha: '2024-01-16', pedidos: 52, zona: 'norte', tipo: 'empresa', temperatura: 30 },
        { fecha: '2024-01-17', pedidos: 38, zona: 'sur', tipo: 'residencial', temperatura: 25 },
        { fecha: '2024-01-18', pedidos: 61, zona: 'centro', tipo: 'recurrente', temperatura: 32 },
        { fecha: '2024-01-19', pedidos: 48, zona: 'este', tipo: 'nuevo', temperatura: 29 },
        { fecha: '2024-01-20', pedidos: 55, zona: 'oeste', tipo: 'empresa', temperatura: 31 },
        { fecha: '2024-01-21', pedidos: 42, zona: 'centro', tipo: 'residencial', temperatura: 27 },
        { fecha: '2024-01-22', pedidos: 58, zona: 'norte', tipo: 'recurrente', temperatura: 33 },
        { fecha: '2024-01-23', pedidos: 49, zona: 'sur', tipo: 'empresa', temperatura: 26 },
        { fecha: '2024-01-24', pedidos: 63, zona: 'centro', tipo: 'nuevo', temperatura: 34 },
        { fecha: '2024-01-25', pedidos: 51, zona: 'este', tipo: 'recurrente', temperatura: 28 },
        { fecha: '2024-01-26', pedidos: 56, zona: 'oeste', tipo: 'residencial', temperatura: 30 },
        { fecha: '2024-01-27', pedidos: 44, zona: 'norte', tipo: 'empresa', temperatura: 25 },
        { fecha: '2024-01-28', pedidos: 59, zona: 'centro', tipo: 'recurrente', temperatura: 32 },
        { fecha: '2024-01-29', pedidos: 47, zona: 'sur', tipo: 'nuevo', temperatura: 27 },
        { fecha: '2024-01-30', pedidos: 62, zona: 'este', tipo: 'empresa', temperatura: 33 },
        { fecha: '2024-01-31', pedidos: 53, zona: 'oeste', tipo: 'residencial', temperatura: 29 },
        { fecha: '2024-02-01', pedidos: 48, zona: 'centro', tipo: 'recurrente', temperatura: 26 },
        { fecha: '2024-02-02', pedidos: 55, zona: 'norte', tipo: 'empresa', temperatura: 31 },
        { fecha: '2024-02-03', pedidos: 41, zona: 'sur', tipo: 'nuevo', temperatura: 24 },
        { fecha: '2024-02-04', pedidos: 57, zona: 'este', tipo: 'residencial', temperatura: 30 },
        { fecha: '2024-02-05', pedidos: 50, zona: 'oeste', tipo: 'recurrente', temperatura: 28 },
        { fecha: '2024-02-06', pedidos: 64, zona: 'centro', tipo: 'empresa', temperatura: 34 },
        { fecha: '2024-02-07', pedidos: 46, zona: 'norte', tipo: 'nuevo', temperatura: 25 },
        { fecha: '2024-02-08', pedidos: 58, zona: 'sur', tipo: 'residencial', temperatura: 32 },
        { fecha: '2024-02-09', pedidos: 52, zona: 'este', tipo: 'recurrente', temperatura: 29 },
        { fecha: '2024-02-10', pedidos: 61, zona: 'oeste', tipo: 'empresa', temperatura: 33 },
        { fecha: '2024-02-11', pedidos: 43, zona: 'centro', tipo: 'nuevo', temperatura: 26 },
        { fecha: '2024-02-12', pedidos: 56, zona: 'norte', tipo: 'residencial', temperatura: 31 },
        { fecha: '2024-02-13', pedidos: 49, zona: 'sur', tipo: 'recurrente', temperatura: 27 },
        { fecha: '2024-02-14', pedidos: 63, zona: 'este', tipo: 'empresa', temperatura: 34 }
      ];
      setDatosHistoricos(historico);
    } catch (error) {
      console.error('Error cargando datos históricos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrediccion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleHistorial = (index) => {
    setExpandedHistorial(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const eliminarPrediccion = (index) => {
    const nuevoHistorial = historialPredicciones.filter((_, i) => i !== index);
    setHistorialPredicciones(nuevoHistorial);
    guardarHistorialLocal(nuevoHistorial);
    
    setExpandedHistorial(prev => {
      const nuevoExpanded = { ...prev };
      delete nuevoExpanded[index];
      const reindexed = {};
      Object.keys(nuevoExpanded).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = nuevoExpanded[oldIndex];
        } else {
          reindexed[oldIndex] = nuevoExpanded[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const generarPrediccionInteligente = async () => {
    if (!prediccion.fecha || !prediccion.tipoCliente) {
      return;
    }

    setLoading(true);
    
    try {
      const resultado = await getPredictorInteligente(prediccion.fecha, prediccion.tipoCliente);
      setPrediccionInteligente(resultado);
      
      // Generar análisis automático
      const analisis = generarAnalisisInteligente(resultado, prediccion);
      
      // Agregar al historial
      const nuevoHistorial = [analisis, ...historialPredicciones.slice(0, 9)];
      setHistorialPredicciones(nuevoHistorial);
      guardarHistorialLocal(nuevoHistorial);
      
      // Actualizar cumplimiento con datos reales (se actualizará cuando se registren pedidos reales)
      setCumplimiento({
        prediccionEsperada: resultado.prediccion,
        pedidosReales: 0, // Se actualizará con datos reales cuando estén disponibles
        fecha: prediccion.fecha,
        tipoCliente: prediccion.tipoCliente
      });
      
    } catch (error) {
      console.error('Error generando predicción inteligente:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarAnalisisInteligente = (resultado, prediccion) => {
    const fecha = new Date(prediccion.fecha + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    let analisis = {
      titulo: `Predicción Inteligente - ${fecha.toLocaleDateString('es-ES')} - ${prediccion.tipoCliente}`,
      fecha: prediccion.fecha,
      tipoCliente: prediccion.tipoCliente,
      timestamp: new Date().toISOString(),
      resumen: '',
      detalles: [],
      nivelConfianza: resultado.nivel_confianza,
      prediccion: resultado.prediccion,
      rangoConfianza: resultado.rango_confianza,
      esAnomalia: resultado.es_anomalia,
      anomaliasDetectadas: resultado.anomalias_detectadas
    };

    // Generar resumen principal
    analisis.resumen = `Se esperan ${resultado.prediccion} pedidos (rango: ${resultado.rango_confianza[0]}-${resultado.rango_confianza[1]}) para el ${diasSemana[diaSemana]} ${fecha.toLocaleDateString('es-ES')} con ${resultado.nivel_confianza}% de confianza.`;

    // Análisis detallado
    const detalles = [];

    // Análisis por nivel de confianza
    if (resultado.nivel_confianza >= 80) {
      detalles.push({
        tipo: 'success',
        mensaje: `Alta confianza (${resultado.nivel_confianza}%): Predicción muy confiable`,
        icono: 'check'
      });
    } else if (resultado.nivel_confianza >= 70) {
      detalles.push({
        tipo: 'info',
        mensaje: `Confianza moderada (${resultado.nivel_confianza}%): Predicción confiable`,
        icono: 'info'
      });
    } else {
      detalles.push({
        tipo: 'warning',
        mensaje: `Baja confianza (${resultado.nivel_confianza}%): Considerar factores adicionales`,
        icono: 'warning'
      });
    }

    // Análisis por rango de confianza
    const amplitudRango = resultado.rango_confianza[1] - resultado.rango_confianza[0];
    if (amplitudRango <= 2) {
      detalles.push({
        tipo: 'success',
        mensaje: `Rango estrecho (${amplitudRango} pedidos): Alta precisión esperada`,
        icono: 'check'
      });
    } else if (amplitudRango <= 4) {
      detalles.push({
        tipo: 'info',
        mensaje: `Rango moderado (${amplitudRango} pedidos): Precisión aceptable`,
        icono: 'info'
      });
    } else {
      detalles.push({
        tipo: 'warning',
        mensaje: `Rango amplio (${amplitudRango} pedidos): Mayor incertidumbre`,
        icono: 'warning'
      });
    }

    // Análisis por tipo de cliente
    if (prediccion.tipoCliente === 'recurrente') {
      detalles.push({
        tipo: 'success',
        mensaje: 'Clientes recurrentes: Patrón estable y predecible',
        icono: 'check'
      });
    } else if (prediccion.tipoCliente === 'nuevo') {
      detalles.push({
        tipo: 'warning',
        mensaje: 'Clientes nuevos: Mayor variabilidad en la demanda',
        icono: 'warning'
      });
    } else if (prediccion.tipoCliente === 'empresa') {
      detalles.push({
        tipo: 'info',
        mensaje: 'Clientes empresariales: Pedidos de mayor volumen',
        icono: 'info'
      });
    }

    // Análisis de anomalías
    if (resultado.es_anomalia) {
      detalles.push({
        tipo: 'error',
        mensaje: '⚠️ Día detectado como anómalo: Considerar factores especiales',
        icono: 'error'
      });
    }

    if (resultado.anomalias_detectadas > 0) {
      detalles.push({
        tipo: 'info',
        mensaje: `${resultado.anomalias_detectadas} anomalías detectadas en datos históricos`,
        icono: 'info'
      });
    }

    analisis.detalles = detalles;
    return analisis;
  };

  const generarPrediccion = async () => {
    if (modoPrediccion === 'inteligente') {
      await generarPrediccionInteligente();
    } else {
      // Lógica del predictor clásico (mantener para compatibilidad)
      setLoading(true);
      setTimeout(() => {
        const resultadoCalculado = calcularForecastCompleto();
        if (resultadoCalculado) {
          setResultado(resultadoCalculado);
          const analisis = generarAnalisisAutomatico(resultadoCalculado, prediccion);
          const nuevoHistorial = [analisis, ...historialPredicciones.slice(0, 9)];
          setHistorialPredicciones(nuevoHistorial);
          guardarHistorialLocal(nuevoHistorial);
        }
        setLoading(false);
      }, 2000);
    }
  };

  // Mantener funciones del predictor clásico para compatibilidad
  const calcularForecastCompleto = () => {
    if (!prediccion.fecha || !prediccion.tipoCliente || !factoresReales) {
      return null;
    }

    // Corregir el formato de fecha para evitar problemas de zona horaria
    const fechaObjetivo = new Date(prediccion.fecha + 'T00:00:00');
    const diaSemana = fechaObjetivo.getDay(); // 0 = domingo, 1 = lunes, etc.
    const mes = fechaObjetivo.getMonth(); // 0 = enero, 1 = febrero, etc.

    // Usar factores reales del backend
    const {
      factores_temporada,
      factores_zona,
      factores_tipo_cliente,
      factores_dia_semana,
      crecimiento_mensual,
      promedio_pedidos_mensual
    } = factoresReales;

    // 1. FACTOR BASE: Usar solo datos reales del backend
    const promedioBase = promedio_pedidos_mensual / 30;

    // 2. FACTOR ESTACIONAL: Patrones reales por día de la semana
    const factorDia = factores_dia_semana[diaSemana] || 1.0;

    // 3. FACTOR TEMPORADA: Patrones reales por mes
    const factorTemporada = factores_temporada[mes] || 1.0;

    // 4. FACTOR TIPO CLIENTE: Patrones reales por tipo
    const factorTipo = factores_tipo_cliente[prediccion.tipoCliente] || 1.0;

    // 5. FACTOR TENDENCIA: Crecimiento real mensual (ajustado para ser más conservador)
    const tendencia = Math.min(crecimiento_mensual, 1.15); // Máximo 15% de crecimiento

    // 6. FACTOR ALEATORIO: Variabilidad natural (reducido)
    const factorAleatorio = 0.95 + Math.random() * 0.1; // ±5% en lugar de ±10%

    // LOGS DETALLADOS PARA DEBUG
    console.log('=== CÁLCULO DETALLADO DE PREDICCIÓN COMPLETA ===');
    console.log('Fecha ingresada:', prediccion.fecha);
    console.log('Fecha procesada:', fechaObjetivo.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    console.log('Día semana:', diaSemana, '(0=domingo, 1=lunes...)');
    console.log('Mes:', mes, '(0=enero, 1=febrero...)');
    console.log('Tipo cliente:', prediccion.tipoCliente);

    // Calcular predicción para cada zona
    const zonas = ['centro', 'norte', 'sur', 'este', 'oeste'];
    const prediccionesPorZona = {};

    zonas.forEach(zona => {
      const factorZona = factores_zona[zona] || 1.0;
      
      const prediccionCalculada = Math.round(
        promedioBase * 
        factorDia * 
        factorTemporada * 
        factorZona * 
        factorTipo * 
        tendencia * 
        factorAleatorio
      );

      prediccionesPorZona[zona] = {
        pedidos: prediccionCalculada,
        factorZona: factorZona,
        porcentaje: 0 // Se calculará después
      };
    });

    // Calcular total y porcentajes
    const totalPedidos = Object.values(prediccionesPorZona).reduce((sum, zona) => sum + zona.pedidos, 0);
    
    zonas.forEach(zona => {
      prediccionesPorZona[zona].porcentaje = totalPedidos > 0 ? 
        Math.round((prediccionesPorZona[zona].pedidos / totalPedidos) * 100) : 0;
    });

    console.log('PREDICCIONES POR ZONA:', prediccionesPorZona);
    console.log('TOTAL PEDIDOS:', totalPedidos);
    console.log('=====================================');

    // Calcular confianza basada en la cantidad de datos históricos
    const confianza = Math.min(95, 70 + (factoresReales.total_pedidos_analizados / 20));

    // Generar factores considerados basados en datos reales
    const factores = [];
    if (factorDia > 1.1) factores.push('Día de alta demanda');
    if (factorTemporada > 1.2) factores.push('Temporada alta');
    if (factorTipo > 1.2) factores.push('Tipo de cliente premium');
    if (factorTemporada < 0.8) factores.push('Temporada baja');
    if (factorDia < 0.8) factores.push('Día de baja demanda');

    // Generar recomendaciones basadas en datos reales
    const recomendaciones = [];
    if (totalPedidos > promedio_pedidos_mensual / 30 * 1.5) {
      recomendaciones.push('Aumentar stock en un 20%');
      recomendaciones.push('Preparar equipo adicional');
    }
    if (factorTemporada > 1.3) {
      recomendaciones.push('Contactar clientes frecuentes');
    }
    if (totalPedidos < promedio_pedidos_mensual / 30 * 0.7) {
      recomendaciones.push('Reducir personal temporalmente');
    }

    return {
      prediccionesPorZona,
      totalPedidos,
      confianza,
      factores: factores.length > 0 ? factores : ['Patrón normal de demanda'],
      recomendaciones: recomendaciones.length > 0 ? recomendaciones : ['Mantener operación normal'],
      detalles: {
        promedioBase: Math.round(promedioBase),
        factorDia: factorDia,
        factorTemporada: factorTemporada,
        factorTipo: factorTipo,
        datosHistoricos: factoresReales.total_pedidos_analizados,
        crecimientoMensual: tendencia,
        promedioMensual: promedio_pedidos_mensual
      }
    };
  };

  const generarAnalisisAutomatico = (resultado, prediccion) => {
    // Corregir el formato de fecha para evitar problemas de zona horaria
    const fecha = new Date(prediccion.fecha + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    let analisis = {
      titulo: `Predicción del ${fecha.toLocaleDateString('es-ES')} - ${prediccion.tipoCliente}`,
      fecha: prediccion.fecha,
      tipoCliente: prediccion.tipoCliente,
      timestamp: new Date().toISOString(),
      resumen: '',
      detalles: [],
      nivelConfianza: resultado.confianza,
      totalPedidos: resultado.totalPedidos,
      zonasActivas: Object.entries(resultado.prediccionesPorZona)
        .filter(([_, datos]) => datos.pedidos > 0)
        .map(([zona, _]) => zona),
      zonasInactivas: Object.entries(resultado.prediccionesPorZona)
        .filter(([_, datos]) => datos.pedidos === 0)
        .map(([zona, _]) => zona)
    };

    // Generar resumen principal con fecha corregida
    analisis.resumen = `Se esperan ${resultado.totalPedidos} pedidos para el ${diasSemana[diaSemana]} ${fecha.toLocaleDateString('es-ES')} con ${resultado.confianza}% de confianza.`;
    
    // Log para verificar la fecha procesada
    console.log('=== ANÁLISIS AUTOMÁTICO ===');
    console.log('Fecha ingresada:', prediccion.fecha);
    console.log('Fecha procesada:', fecha.toLocaleDateString('es-ES'));
    console.log('Día de la semana:', diasSemana[diaSemana], `(${diaSemana})`);
    console.log('Resumen generado:', analisis.resumen);
    console.log('=============================');

    // Análisis detallado
    const detalles = [];

    // Análisis por día de la semana
    if (diaSemana === 0 || diaSemana === 6) {
      detalles.push({
        tipo: 'info',
        mensaje: `Día ${diasSemana[diaSemana]}: Demanda típicamente menor en fines de semana`,
        icono: 'info'
      });
    } else if (diaSemana >= 1 && diaSemana <= 5) {
      detalles.push({
        tipo: 'success',
        mensaje: `Día ${diasSemana[diaSemana]}: Alta actividad comercial esperada`,
        icono: 'check'
      });
    }

    // Análisis por tipo de cliente
    if (prediccion.tipoCliente === 'recurrente') {
      detalles.push({
        tipo: 'success',
        mensaje: 'Clientes recurrentes: Demanda estable y predecible',
        icono: 'check'
      });
    } else if (prediccion.tipoCliente === 'nuevo') {
      detalles.push({
        tipo: 'warning',
        mensaje: 'Clientes nuevos: Mayor variabilidad en la demanda',
        icono: 'warning'
      });
    } else if (prediccion.tipoCliente === 'empresa') {
      detalles.push({
        tipo: 'info',
        mensaje: 'Clientes empresariales: Pedidos de mayor volumen',
        icono: 'info'
      });
    }

    // Análisis por volumen total
    if (resultado.totalPedidos > 50) {
      detalles.push({
        tipo: 'success',
        mensaje: `Alto volumen (${resultado.totalPedidos} pedidos): Considerar refuerzo de personal`,
        icono: 'check'
      });
    } else if (resultado.totalPedidos < 20) {
      detalles.push({
        tipo: 'warning',
        mensaje: `Bajo volumen (${resultado.totalPedidos} pedidos): Evaluar optimización de rutas`,
        icono: 'warning'
        });
      } else {
      detalles.push({
        tipo: 'info',
        mensaje: `Volumen moderado (${resultado.totalPedidos} pedidos): Operación estándar`,
        icono: 'info'
      });
    }

    // Análisis por distribución de zonas
    if (analisis.zonasActivas.length >= 4) {
      detalles.push({
        tipo: 'success',
        mensaje: `Buena distribución: Actividad en ${analisis.zonasActivas.length} zonas`,
        icono: 'check'
      });
    } else if (analisis.zonasActivas.length <= 2) {
      detalles.push({
        tipo: 'warning',
        mensaje: `Concentración alta: Solo ${analisis.zonasActivas.length} zonas activas`,
        icono: 'warning'
      });
    }

    // Análisis de confianza
    if (resultado.confianza >= 90) {
      detalles.push({
        tipo: 'success',
        mensaje: `Alta confianza (${resultado.confianza}%): Predicción muy confiable`,
        icono: 'check'
      });
    } else if (resultado.confianza >= 75) {
      detalles.push({
        tipo: 'info',
        mensaje: `Confianza moderada (${resultado.confianza}%): Considerar factores adicionales`,
        icono: 'info'
      });
    } else {
      detalles.push({
        tipo: 'warning',
        mensaje: `Baja confianza (${resultado.confianza}%): Revisar datos históricos`,
        icono: 'warning'
      });
    }

    // Análisis de factores considerados
    if (resultado.factores.length > 0) {
      detalles.push({
        tipo: 'info',
        mensaje: `Factores clave: ${resultado.factores.join(', ')}`,
        icono: 'info'
      });
    }

    // Análisis de recomendaciones
    if (resultado.recomendaciones.length > 0) {
      detalles.push({
        tipo: 'success',
        mensaje: `Recomendaciones: ${resultado.recomendaciones.join(', ')}`,
        icono: 'check'
      });
    }

    analisis.detalles = detalles;
    return analisis;
  };

  const getIconoAnalisis = (tipo) => {
    switch (tipo) {
      case 'success': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'warning': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'info': return <Info sx={{ color: '#3b82f6' }} />;
      case 'error': return <ErrorOutline sx={{ color: '#ef4444' }} />;
      default: return <Info sx={{ color: '#6b7280' }} />;
    }
  };

  const guardarHistorialLocal = (historial) => {
    try {
      localStorage.setItem('historialPredicciones', JSON.stringify(historial));
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  };

  const cargarHistorialLocal = () => {
    try {
      const historial = localStorage.getItem('historialPredicciones');
      if (historial) {
        setHistorialPredicciones(JSON.parse(historial));
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const getColorConfianza = (nivel) => {
    if (nivel >= 80) return '#10b981';
    if (nivel >= 70) return '#3b82f6';
    if (nivel >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getIconoModo = () => {
    switch (modoPrediccion) {
      case 'inteligente': return <AutoAwesome />;
      case 'clasico': return <Analytics />;
      default: return <AutoAwesome />;
    }
  };

  const getTituloModo = () => {
    switch (modoPrediccion) {
      case 'inteligente': return 'Predictor Inteligente';
      case 'clasico': return 'Predictor Clásico';
      default: return 'Predictor';
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      minHeight: '100vh',
      overflow: 'auto',
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
            <AutoAwesome sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
        <Typography variant="h4" component="h1" sx={{ 
          color: 'text.primary', 
          fontWeight: 700, 
          display: 'flex',
          alignItems: 'center',
              gap: 1
            }}>
              Predictor Inteligente de Pedidos
              <Chip 
                label="AI Powered" 
                size="small" 
                sx={{ 
                  bgcolor: '#10b981', 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }} 
              />
        </Typography>
        <Typography variant="body1" sx={{ 
              color: 'text.secondary',
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PsychologyAlt sx={{ fontSize: 16 }} />
              Análisis predictivo avanzado con calibración dinámica e intervalos de confianza
        </Typography>
          </Box>
        </Box>

        {/* Selector de Modo Simplificado */}
        <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={modoPrediccion === 'inteligente' ? 'contained' : 'outlined'}
                startIcon={<AutoAwesome />}
                onClick={() => setModoPrediccion('inteligente')}
                sx={{
                  bgcolor: modoPrediccion === 'inteligente' ? '#8b5cf6' : 'transparent',
                  color: modoPrediccion === 'inteligente' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: modoPrediccion === 'inteligente' ? '#7c3aed' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
                  }
                }}
              >
                Predictor Inteligente
              </Button>
              <Button
                variant={modoPrediccion === 'clasico' ? 'contained' : 'outlined'}
                startIcon={<Analytics />}
                onClick={() => setModoPrediccion('clasico')}
                sx={{
                  bgcolor: modoPrediccion === 'clasico' ? '#3b82f6' : 'transparent',
                  color: modoPrediccion === 'clasico' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: modoPrediccion === 'clasico' ? '#2563eb' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
                  }
                }}
              >
                Predictor Clásico
              </Button>
            </Box>
          </CardContent>
        </Card>

        {modoPrediccion === 'inteligente' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome />
              Predictor Inteligente: Incluye análisis VIP, variables exógenas, calibración dinámica y efectividad estimada
            </Box>
          </Alert>
        )}

        {factoresReales && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataUsage />
            Análisis basado en {factoresReales.total_pedidos_analizados} pedidos reales de Aguas Ancud
            ({factoresReales.periodo_analisis.fecha_inicio} a {factoresReales.periodo_analisis.fecha_fin})
            </Box>
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Formulario de Predicción Moderno */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: 'fit-content', 
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {getIconoModo()}
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Parámetros de Predicción
              </Typography>
              </Box>
              
              <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Fecha objetivo"
                    type="date"
                    name="fecha"
                    value={prediccion.fecha}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { borderColor: theme.palette.divider },
                      '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
                
                  <FormControl fullWidth>
                    <InputLabel>Tipo de cliente</InputLabel>
                    <Select
                      name="tipoCliente"
                      value={prediccion.tipoCliente}
                      onChange={handleInputChange}
                      label="Tipo de cliente"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
                    }}
                  >
                    <MenuItem value="recurrente">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
                        Cliente recurrente
                      </Box>
                    </MenuItem>
                    <MenuItem value="residencial">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home sx={{ fontSize: 16, color: '#3b82f6' }} />
                        Residencial
                      </Box>
                    </MenuItem>
                    <MenuItem value="nuevo">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: '#f59e0b' }} />
                        Cliente nuevo
                      </Box>
                    </MenuItem>
                    <MenuItem value="empresa">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 16, color: '#8b5cf6' }} />
                        Empresa
                      </Box>
                    </MenuItem>
                    <MenuItem value="vip">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUser sx={{ fontSize: 16, color: '#f59e0b' }} />
                        Cliente VIP
                      </Box>
                    </MenuItem>
                    </Select>
                  </FormControl>
                
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={generarPrediccion}
                  disabled={loading || !prediccion.fecha || !prediccion.tipoCliente}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{ 
                    py: 1.5,
                    bgcolor: modoPrediccion === 'inteligente' ? '#8b5cf6' : '#3b82f6',
                    '&:hover': { 
                      bgcolor: modoPrediccion === 'inteligente' ? '#7c3aed' : '#2563eb' 
                    },
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Generando predicción...' : `Generar ${getTituloModo()}`}
                  </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados de Predicción Inteligente */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.divider}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Insights sx={{ color: '#3b82f6' }} />
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Resultados de Predicción Inteligente
              </Typography>
              </Box>
              
              {loading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Analizando patrones históricos con IA...
                  </Typography>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                </Box>
              )}
              
              {prediccionInteligente ? (
                <Box>
                  {/* Resumen Principal */}
                  <Card sx={{ 
                    mb: 3, 
                    bgcolor: '#f0f9ff', 
                    border: '1px solid #0ea5e9',
                    borderRadius: 2
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#0ea5e9', width: 48, height: 48 }}>
                          <TrendingUp sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ color: '#0ea5e9', fontWeight: 700 }}>
                            {prediccionInteligente.prediccion} pedidos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                            Rango de confianza: {prediccionInteligente.rango_confianza[0]} - {prediccionInteligente.rango_confianza[1]}
                    </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <Chip 
                            label={`${prediccionInteligente.nivel_confianza}% confianza`}
                            sx={{ 
                              bgcolor: getColorConfianza(prediccionInteligente.nivel_confianza),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                  </Box>

                      <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
                        {prediccion.fecha} - {prediccion.tipoCliente}
                  </Typography>
                    </CardContent>
                  </Card>

                  {/* Métricas Detalladas */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                            {prediccionInteligente.prediccion}
                  </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Predicción Base
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #22c55e' }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: '#166534', fontWeight: 600 }}>
                            {prediccionInteligente.rango_confianza[0]}-{prediccionInteligente.rango_confianza[1]}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#166534' }}>
                            Rango Confianza
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        bgcolor: prediccionInteligente.es_anomalia ? '#fef2f2' : '#f0f9ff',
                        border: `1px solid ${prediccionInteligente.es_anomalia ? '#ef4444' : '#0ea5e9'}`
                      }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: prediccionInteligente.es_anomalia ? '#dc2626' : '#0ea5e9', 
                            fontWeight: 600 
                          }}>
                            {prediccionInteligente.es_anomalia ? 'Sí' : 'No'}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                            color: prediccionInteligente.es_anomalia ? '#dc2626' : '#0ea5e9'
                          }}>
                            Día Anómalo
                            </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    {prediccionInteligente.efectividad_estimada && (
                      <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#92400e', fontWeight: 600 }}>
                              {prediccionInteligente.efectividad_estimada}%
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#92400e' }}>
                              Efectividad
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>

                  {/* Predicción de Bidones (Análisis Híbrido) */}
                  {prediccionInteligente.prediccion_bidones && (
                    <Card sx={{ mb: 3, bgcolor: '#f0fdf4', border: '1px solid #22c55e' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Inventory sx={{ color: '#22c55e' }} />
                          <Typography variant="h6" sx={{ color: '#166534', fontWeight: 600 }}>
                            Predicción de Bidones
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#166534', fontWeight: 700 }}>
                                {prediccionInteligente.prediccion_bidones.valor_medio}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#166534' }}>
                                Bidones Estimados
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700 }}>
                                {prediccionInteligente.prediccion_bidones.rango_estimado[0]}-{prediccionInteligente.prediccion_bidones.rango_estimado[1]}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#10b981' }}>
                                Rango Estimado
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                                {prediccionInteligente.prediccion_bidones.promedio_por_pedido}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                                Promedio/Pedido
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                                {prediccionInteligente.prediccion_bidones.factor_conversion}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#f59e0b' }}>
                                Factor Conversión
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #22c55e' }}>
                          <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>
                            📊 <strong>Análisis Híbrido:</strong> Basado en {prediccionInteligente.prediccion} pedidos esperados × {prediccionInteligente.prediccion_bidones.promedio_por_pedido} bidones promedio por pedido
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Análisis VIP */}
                  {prediccionInteligente.analisis_vip && prediccionInteligente.analisis_vip.total_vip > 0 && (
                    <Card sx={{ mb: 3, bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <VerifiedUser sx={{ color: '#f59e0b' }} />
                          <Typography variant="h6" sx={{ color: '#92400e', fontWeight: 600 }}>
                            Análisis de Clientes VIP
                          </Typography>
                            </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#92400e', fontWeight: 700 }}>
                                {prediccionInteligente.analisis_vip.total_vip}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#92400e' }}>
                                Total VIP
                            </Typography>
                          </Box>
                        </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700 }}>
                                {prediccionInteligente.analisis_vip.probabilidad_alta}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#10b981' }}>
                                Alta Probabilidad
                              </Typography>
                            </Box>
                    </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                                {prediccionInteligente.analisis_vip.probabilidad_media}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                                Media Probabilidad
                              </Typography>
                  </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 700 }}>
                                {prediccionInteligente.analisis_vip.probabilidad_baja}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Baja Probabilidad
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {prediccionInteligente.analisis_vip.clientes_destacados.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#92400e' }}>
                              Clientes VIP Destacados:
                  </Typography>
                            <Stack spacing={1}>
                              {prediccionInteligente.analisis_vip.clientes_destacados.map((cliente, idx) => (
                                <Box key={idx} sx={{ 
                                  p: 1, 
                                  bgcolor: 'white', 
                                  borderRadius: 1, 
                                  border: '1px solid #fbbf24' 
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {cliente.usuario} - {Math.round(cliente.probabilidad_pedido * 100)}% probabilidad
                      </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {cliente.direccion}
                                  </Typography>
                                </Box>
                    ))}
                            </Stack>
                  </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Recomendaciones */}
                  {prediccionInteligente.recomendaciones && prediccionInteligente.recomendaciones.length > 0 && (
                    <Card sx={{ mb: 3, bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Lightbulb sx={{ color: '#0ea5e9' }} />
                          <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                            Recomendaciones
                  </Typography>
                        </Box>
                        
                        <Stack spacing={1}>
                          {prediccionInteligente.recomendaciones.map((rec, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
                              <Typography variant="body2" sx={{ color: '#0ea5e9' }}>
                                {rec}
                      </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* Análisis Detallado */}
                  <Accordion sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Psychology sx={{ color: '#3b82f6' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Análisis Detallado
                        </Typography>
                  </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Factores Considerados:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Chip label={`Base: ${prediccionInteligente.factores.base}`} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip label={`Factor tipo: ${prediccionInteligente.factores.factor_tipo}`} size="small" />
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Estadísticas Base:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Typography variant="body2">
                                Media: {prediccionInteligente.estadisticas_base.media.toFixed(1)}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2">
                                Mediana: {prediccionInteligente.estadisticas_base.mediana.toFixed(1)}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2">
                                Desv: {prediccionInteligente.estadisticas_base.desviacion.toFixed(1)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 6,
                  color: 'text.secondary'
                }}>
                  <AutoAwesome sx={{ fontSize: 64, mb: 2, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }} />
                  <Typography variant="h6" sx={{ mb: 1, textAlign: 'center', color: 'text.primary' }}>
                    Predictor Inteligente
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    textAlign: 'center',
                    maxWidth: 400,
                    color: 'text.secondary'
                  }}>
                    Completa los parámetros y genera una predicción inteligente con intervalos de confianza y detección de anomalías
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dashboard de Tracking */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#3b82f6' }} />
            Dashboard de Tracking
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setMostrarTracking(!mostrarTracking)}
            startIcon={mostrarTracking ? <VisibilityOff /> : <Visibility />}
            sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
          >
            {mostrarTracking ? 'Ocultar' : 'Mostrar'} Tracking
          </Button>
        </Box>

        {mostrarTracking && (
          <Grid container spacing={3}>
            {/* Métricas Principales */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                    📊 Métricas de Efectividad
                  </Typography>
                  
                  {trackingMetricas ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                            {trackingMetricas.error_promedio}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Error Promedio
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                            {trackingMetricas.efectividad_promedio}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Efectividad
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                            {trackingMetricas.predicciones_verificadas}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Verificadas
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ color: '#64748b', fontWeight: 'bold' }}>
                            {trackingMetricas.total_predicciones}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Total
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                      Cargando métricas...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Registrar Pedidos Reales */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                    📝 Registrar Pedidos Reales
                  </Typography>
                  
                  <Stack spacing={2}>
                    <TextField
                      label="Fecha"
                      type="date"
                      value={fechaPedidosReales}
                      onChange={(e) => setFechaPedidosReales(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Número de Pedidos Reales"
                      type="number"
                      value={pedidosRealesInput}
                      onChange={(e) => setPedidosRealesInput(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={registrarPedidosRealesHandler}
                      disabled={!fechaPedidosReales || !pedidosRealesInput}
                      sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                    >
                      Registrar Pedidos Reales
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
          </Grid>

            {/* Últimas Predicciones */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                    📈 Últimas Predicciones
                  </Typography>
                  
                  {ultimasPredicciones.length > 0 ? (
                    <Grid container spacing={2}>
                      {ultimasPredicciones.slice(0, 6).map((pred, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ 
                            p: 2, 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 2,
                            bgcolor: pred.verificada ? '#f0fdf4' : '#fef3c7'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {pred.fecha}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                              {pred.tipo_cliente}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                                {pred.prediccion}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                pedidos
                              </Typography>
                            </Box>
                            <Chip 
                              label={pred.verificada ? '✅ Verificada' : '⏳ Pendiente'}
                              size="small"
                              sx={{ 
                                bgcolor: pred.verificada ? '#10b981' : '#f59e0b',
                                color: 'white'
                              }}
                            />
                            {pred.verificada && pred.error_porcentual && (
                              <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                                Error: {pred.error_porcentual}%
                              </Typography>
                            )}
                          </Box>
        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                      No hay predicciones registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recomendaciones */}
            {trackingReporte && trackingReporte.recomendaciones && trackingReporte.recomendaciones.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#0ea5e9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb sx={{ color: '#0ea5e9' }} />
                      Recomendaciones del Sistema
                    </Typography>
                    <Stack spacing={1}>
                      {trackingReporte.recomendaciones.map((rec, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: '#0ea5e9' }} />
                          <Typography variant="body2" sx={{ color: '#0ea5e9' }}>
                            {rec}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {/* Historial de Predicciones */}
      {historialPredicciones.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <History sx={{ color: '#3b82f6' }} />
            Historial de Predicciones
          </Typography>
          
          <Grid container spacing={2}>
          {historialPredicciones.map((analisis, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ 
                  bgcolor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {analisis.fecha}
                    </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => eliminarPrediccion(index)}
                        sx={{ color: '#ef4444' }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                  </Box>
                    
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                      {analisis.tipoCliente}
                    </Typography>
                    
                    {analisis.prediccion && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                          {analisis.prediccion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          pedidos
                        </Typography>
                      </Box>
                    )}
                    
                    {analisis.rangoConfianza && (
                    <Chip 
                        label={`Rango: ${analisis.rangoConfianza[0]}-${analisis.rangoConfianza[1]}`}
                      size="small"
                        sx={{ bgcolor: '#f0f9ff', color: '#0ea5e9', mb: 1 }}
                      />
                    )}
                    
                    {analisis.nivelConfianza && (
                      <Chip 
                        label={`${analisis.nivelConfianza}% confianza`}
                      size="small"
                      sx={{ 
                          bgcolor: getColorConfianza(analisis.nivelConfianza),
                          color: 'white',
                          mb: 1
                        }}
                      />
                    )}
                    
                    <Button
                      size="small"
                      onClick={() => toggleHistorial(index)}
                      endIcon={expandedHistorial[index] ? <ExpandLess /> : <ExpandMore />}
                      sx={{ color: '#3b82f6' }}
                    >
                      {expandedHistorial[index] ? 'Ocultar' : 'Ver detalles'}
                    </Button>
                    
                    <Collapse in={expandedHistorial[index]}>
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                  {analisis.resumen}
                </Typography>

                        {analisis.detalles && analisis.detalles.length > 0 && (
                          <Stack spacing={1}>
                            {analisis.detalles.map((detalle, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getIconoAnalisis(detalle.tipo)}
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {detalle.mensaje}
                        </Typography>
                      </Box>
                    ))}
                          </Stack>
                        )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
              </Grid>
          ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
} 