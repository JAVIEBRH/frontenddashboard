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
import { getFactoresPrediccion, getPredictorInteligente, getTrackingMetricas, getTrackingReporte, registrarPedidosReales, getUltimasPredicciones, getPedidos, getVentasHistoricas } from '../services/api';
import PrediccionCumplimientoCard from '../components/PrediccionCumplimientoCard';
import './Predictor.css';

export default function Predictor() {
  const theme = useTheme();
  const [prediccion, setPrediccion] = useState({
    fecha: '',
    tipoCliente: 'general' // Cambiar a 'general' por defecto
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
  const [datosHistoricosCompletos, setDatosHistoricosCompletos] = useState([]);
  const [pedidosHistoricosCompletos, setPedidosHistoricosCompletos] = useState([]); // Lista completa de pedidos individuales
  const [rangoDatos, setRangoDatos] = useState({ fechaMinima: null, fechaMaxima: null, ultimaActualizacion: null });
  const [metricasValidacion, setMetricasValidacion] = useState({ mae: null, rmse: null, mape: null });
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', tipo: 'info' });
  const [detallesCalculo, setDetallesCalculo] = useState(null); // Almacenar detalles del cálculo matemático

  // Cargar factores reales al montar el componente
  useEffect(() => {
    cargarFactoresReales();
    cargarDatosHistoricos();
    cargarHistorialLocal();
    cargarTrackingData();
    
    // Actualización automática cada 5 minutos para mantener datos actualizados
    const interval = setInterval(() => {
      console.log('⏰ Actualización automática del predictor...', new Date().toLocaleTimeString());
      cargarFactoresReales();
      cargarDatosHistoricos();
      cargarTrackingData();
    }, 5 * 60 * 1000); // 5 minutos (estandarizado con Home)

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      console.log('🌍 Actualización global detectada en Predictor...');
      cargarFactoresReales();
      cargarDatosHistoricos();
      cargarTrackingData();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
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

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ open: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion(prev => ({ ...prev, open: false }));
    }, 4000);
  };

  const registrarPedidosRealesHandler = async () => {
    if (!fechaPedidosReales || !pedidosRealesInput) {
      mostrarNotificacion('Por favor completa todos los campos', 'warning');
      return;
    }

    try {
      await registrarPedidosReales(fechaPedidosReales, parseInt(pedidosRealesInput), prediccion.tipoCliente);
      setPedidosRealesInput('');
      setFechaPedidosReales('');
      await cargarTrackingData(); // Recargar datos
      mostrarNotificacion('Pedidos reales registrados exitosamente', 'success');
    } catch (error) {
      console.error('Error registrando pedidos reales:', error);
      mostrarNotificacion('Error registrando pedidos reales. Por favor intenta nuevamente.', 'error');
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

  // Función para parsear fechas (compatible con múltiples formatos)
  const parseFechaLocal = (fechaStr) => {
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
  };

  // Función para normalizar esquemas de datos entre diferentes endpoints
  const normalizarDatos = (pedidos, ventasHistoricas) => {
    const datosNormalizados = [];
    const fechaPedidosMap = new Map();
    
    // Procesar pedidos
    if (Array.isArray(pedidos)) {
      pedidos.forEach(p => {
        const fechaStr = p.fecha || p.createdAt || p.deliveryDate || p.fecha_creacion;
        const fecha = parseFechaLocal(fechaStr);
        if (!fecha || isNaN(fecha.getTime())) return;
        
        const fechaKey = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!fechaPedidosMap.has(fechaKey)) {
          fechaPedidosMap.set(fechaKey, {
            fecha: fechaKey,
            pedidos: 0,
            total: 0,
            count: 0
          });
        }
        
        const registro = fechaPedidosMap.get(fechaKey);
        registro.pedidos += 1;
        registro.total += parseFloat(p.precio || p.price || p.total || p.monto || 0);
        registro.count += 1;
      });
    }
    
    // Procesar ventas históricas
    if (Array.isArray(ventasHistoricas)) {
      ventasHistoricas.forEach(v => {
        const fechaStr = v.fecha || v.date || v.fecha_venta;
        const fecha = parseFechaLocal(fechaStr);
        if (!fecha || isNaN(fecha.getTime())) return;
        
        const fechaKey = fecha.toISOString().split('T')[0];
        
        if (!fechaPedidosMap.has(fechaKey)) {
          fechaPedidosMap.set(fechaKey, {
            fecha: fechaKey,
            pedidos: 0,
            total: 0,
            count: 0
          });
        }
        
        const registro = fechaPedidosMap.get(fechaKey);
        registro.pedidos += parseInt(v.pedidos || v.cantidad_pedidos || 0);
        registro.total += parseFloat(v.total || v.ventas || v.monto || 0);
        registro.count += 1;
      });
    }
    
    // Convertir map a array y ordenar por fecha
    const datosArray = Array.from(fechaPedidosMap.values())
      .map(d => ({
        fecha: d.fecha,
        pedidos: d.pedidos,
        total: d.total,
        promedio: d.count > 0 ? d.total / d.count : 0
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    return datosArray;
  };

  // Función para calcular rango de datos disponibles
  const calcularRangoDatos = (datos) => {
    if (!datos || datos.length === 0) {
      return { fechaMinima: null, fechaMaxima: null, ultimaActualizacion: new Date().toISOString() };
    }
    
    const fechas = datos.map(d => new Date(d.fecha)).filter(f => !isNaN(f.getTime()));
    if (fechas.length === 0) {
      return { fechaMinima: null, fechaMaxima: null, ultimaActualizacion: new Date().toISOString() };
    }
    
    const fechaMinima = new Date(Math.min(...fechas));
    const fechaMaxima = new Date(Math.max(...fechas));
    
    return {
      fechaMinima: fechaMinima.toISOString().split('T')[0],
      fechaMaxima: fechaMaxima.toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString()
    };
  };

  const cargarDatosHistoricos = async () => {
    try {
      // Cargar datos de múltiples endpoints en paralelo
      const [pedidosData, ventasHistoricasData] = await Promise.all([
        getPedidos().catch(err => {
          console.error('Error obteniendo pedidos:', err);
          return [];
        }),
        getVentasHistoricas().catch(err => {
          console.error('Error obteniendo ventas históricas:', err);
          return [];
        })
      ]);
      
      // Guardar lista completa de pedidos individuales (sin agrupar)
      const pedidosCompletos = Array.isArray(pedidosData) ? pedidosData.map(p => ({
        ...p,
        fechaNormalizada: parseFechaLocal(p.fecha || p.createdAt || p.deliveryDate || p.fecha_creacion)
      })).filter(p => p.fechaNormalizada && !isNaN(p.fechaNormalizada.getTime())) : [];
      
      setPedidosHistoricosCompletos(pedidosCompletos);
      
      // Normalizar y combinar datos (agrupados por fecha para visualización)
      const datosNormalizados = normalizarDatos(pedidosData, ventasHistoricasData);
      
      // Calcular rango de datos
      const rango = calcularRangoDatos(datosNormalizados);
      
      // Actualizar estados
      setDatosHistoricos(datosNormalizados);
      setDatosHistoricosCompletos(datosNormalizados);
      setRangoDatos(rango);
      
      // Realizar backtesting automático si hay suficientes datos
      if (datosNormalizados.length >= 30) {
        const resultadoBacktest = realizarBacktesting(datosNormalizados, 'promedioMovil');
        setMetricasValidacion({
          mae: resultadoBacktest.mae,
          rmse: resultadoBacktest.rmse,
          mape: resultadoBacktest.mape
        });
      }
      
      console.log(`✅ ${pedidosCompletos.length} pedidos individuales cargados`);
      console.log(`✅ ${datosNormalizados.length} registros históricos agrupados por fecha (${rango.fechaMinima} a ${rango.fechaMaxima})`);
    } catch (error) {
      console.error('Error cargando datos históricos:', error);
      // Mantener datos anteriores en caso de error
    }
  };

  // Funciones para calcular métricas de validación (MAE, RMSE, MAPE)
  const calcularMAE = (predicciones, valoresReales) => {
    if (!predicciones || !valoresReales || predicciones.length !== valoresReales.length) {
      return null;
    }
    
    const errores = predicciones.map((p, i) => Math.abs(p - valoresReales[i]));
    return errores.reduce((sum, e) => sum + e, 0) / errores.length;
  };

  const calcularRMSE = (predicciones, valoresReales) => {
    if (!predicciones || !valoresReales || predicciones.length !== valoresReales.length) {
      return null;
    }
    
    const erroresCuadrados = predicciones.map((p, i) => Math.pow(p - valoresReales[i], 2));
    const promedioErroresCuadrados = erroresCuadrados.reduce((sum, e) => sum + e, 0) / erroresCuadrados.length;
    return Math.sqrt(promedioErroresCuadrados);
  };

  const calcularMAPE = (predicciones, valoresReales) => {
    if (!predicciones || !valoresReales || predicciones.length !== valoresReales.length) {
      return null;
    }
    
    const erroresPorcentuales = predicciones.map((p, i) => {
      if (valoresReales[i] === 0) return 0;
      return Math.abs((p - valoresReales[i]) / valoresReales[i]) * 100;
    });
    
    return erroresPorcentuales.reduce((sum, e) => sum + e, 0) / erroresPorcentuales.length;
  };

  // Funciones de modelos de series temporales mejorados
  const modeloPromedioMovil = (datos, ventana = 7) => {
    if (!datos || datos.length < ventana) return 0;
    const ultimosDatos = datos.slice(-ventana);
    return ultimosDatos.reduce((sum, d) => sum + d.pedidos, 0) / ultimosDatos.length;
  };

  const modeloPromedioMovilPonderado = (datos, ventana = 7) => {
    if (!datos || datos.length < ventana) return 0;
    const ultimosDatos = datos.slice(-ventana);
    let sumaPonderada = 0;
    let sumaPesos = 0;
    ultimosDatos.forEach((d, i) => {
      const peso = i + 1; // Más peso a datos más recientes
      sumaPonderada += d.pedidos * peso;
      sumaPesos += peso;
    });
    return sumaPonderada / sumaPesos;
  };

  const modeloTendenciaLineal = (datos) => {
    if (!datos || datos.length < 2) return 0;
    const ultimosDatos = datos.slice(-14); // Últimos 14 días
    const n = ultimosDatos.length;
    const promedioX = (n - 1) / 2;
    const promedioY = ultimosDatos.reduce((sum, d) => sum + d.pedidos, 0) / n;
    
    let sumaXY = 0;
    let sumaX2 = 0;
    ultimosDatos.forEach((d, i) => {
      const x = i - promedioX;
      const y = d.pedidos - promedioY;
      sumaXY += x * y;
      sumaX2 += x * x;
    });
    
    const pendiente = sumaX2 !== 0 ? sumaXY / sumaX2 : 0;
    return promedioY + pendiente * (n - promedioX);
  };

  const modeloSuavizadoExponencial = (datos, alpha = 0.3) => {
    if (!datos || datos.length === 0) return 0;
    if (datos.length === 1) return datos[0].pedidos;
    
    let prediccion = datos[0].pedidos;
    for (let i = 1; i < datos.length; i++) {
      prediccion = alpha * datos[i].pedidos + (1 - alpha) * prediccion;
    }
    return prediccion;
  };

  const modeloDiaSemana = (datos, fechaObjetivo) => {
    if (!datos || datos.length === 0) return 0;
    
    const fecha = new Date(fechaObjetivo);
    const diaSemanaObjetivo = fecha.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    // Calcular promedio de pedidos para ese día de la semana
    const datosMismoDia = datos.filter(d => {
      const fechaDato = new Date(d.fecha);
      return fechaDato.getDay() === diaSemanaObjetivo;
    });
    
    if (datosMismoDia.length === 0) return 0;
    
    return datosMismoDia.reduce((sum, d) => sum + d.pedidos, 0) / datosMismoDia.length;
  };

  // Función para realizar backtesting con validación temporal y múltiples modelos
  const realizarBacktesting = (datosHistoricos, modelo = 'promedioMovil') => {
    if (!datosHistoricos || datosHistoricos.length < 30) {
      return { mae: null, rmse: null, mape: null, predicciones: [], valoresReales: [] };
    }
    
    // Usar 80% para entrenamiento, 20% para validación
    const splitIndex = Math.floor(datosHistoricos.length * 0.8);
    const datosEntrenamiento = datosHistoricos.slice(0, splitIndex);
    const datosValidacion = datosHistoricos.slice(splitIndex);
    
    const predicciones = [];
    const valoresReales = [];
    
    // Generar predicciones usando diferentes modelos
    datosValidacion.forEach((dato, index) => {
      let prediccion = 0;
      const datosHastaAhora = datosHistoricos.slice(0, splitIndex + index);
      
      if (modelo === 'promedioMovil') {
        prediccion = modeloPromedioMovil(datosHastaAhora, 7);
      } else if (modelo === 'promedioMovilPonderado') {
        prediccion = modeloPromedioMovilPonderado(datosHastaAhora, 7);
      } else if (modelo === 'tendencia') {
        prediccion = modeloTendenciaLineal(datosHastaAhora);
      } else if (modelo === 'suavizadoExponencial') {
        prediccion = modeloSuavizadoExponencial(datosHastaAhora, 0.3);
      } else if (modelo === 'diaSemana') {
        prediccion = modeloDiaSemana(datosHastaAhora, dato.fecha);
      } else if (modelo === 'promedio') {
        prediccion = datosEntrenamiento.reduce((sum, d) => sum + d.pedidos, 0) / datosEntrenamiento.length;
      } else if (modelo === 'ensamble') {
        // Ensamble de múltiples modelos
        const pred1 = modeloPromedioMovil(datosHastaAhora, 7);
        const pred2 = modeloTendenciaLineal(datosHastaAhora);
        const pred3 = modeloDiaSemana(datosHastaAhora, dato.fecha);
        prediccion = (pred1 * 0.4 + pred2 * 0.3 + pred3 * 0.3);
      }
      
      predicciones.push(Math.max(0, Math.round(prediccion)));
      valoresReales.push(dato.pedidos);
    });
    
    // Calcular métricas
    const mae = calcularMAE(predicciones, valoresReales);
    const rmse = calcularRMSE(predicciones, valoresReales);
    const mape = calcularMAPE(predicciones, valoresReales);
    
    return { mae, rmse, mape, predicciones, valoresReales };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrediccion(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si hay datos históricos, realizar backtesting cuando cambie la fecha
    if (name === 'fecha' && datosHistoricosCompletos.length > 0) {
      const resultadoBacktest = realizarBacktesting(datosHistoricosCompletos, 'promedioMovil');
      setMetricasValidacion({
        mae: resultadoBacktest.mae,
        rmse: resultadoBacktest.rmse,
        mape: resultadoBacktest.mape
      });
    }
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

  // Función para calcular predicción usando todos los pedidos históricos
  const calcularPrediccionLocal = (fechaObjetivo) => {
    if (!fechaObjetivo || pedidosHistoricosCompletos.length === 0) {
      return null;
    }

    const fecha = new Date(fechaObjetivo + 'T00:00:00');
    const diaSemana = fecha.getDay(); // 0 = domingo, 6 = sábado
    const mes = fecha.getMonth(); // 0 = enero, 11 = diciembre
    
    // Agrupar pedidos por fecha
    const pedidosPorFecha = new Map();
    pedidosHistoricosCompletos.forEach(pedido => {
      if (!pedido.fechaNormalizada) return;
      const fechaKey = pedido.fechaNormalizada.toISOString().split('T')[0];
      if (!pedidosPorFecha.has(fechaKey)) {
        pedidosPorFecha.set(fechaKey, []);
      }
      pedidosPorFecha.get(fechaKey).push(pedido);
    });

    // Convertir a array de días con conteo de pedidos
    const datosPorDia = Array.from(pedidosPorFecha.entries())
      .map(([fechaStr, pedidos]) => ({
        fecha: fechaStr,
        pedidos: pedidos.length,
        diaSemana: new Date(fechaStr).getDay(),
        mes: new Date(fechaStr).getMonth()
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    if (datosPorDia.length === 0) {
      return null;
    }

    // CÁLCULOS MATEMÁTICOS
    const detalles = {
      totalDiasDisponibles: datosPorDia.length,
      totalPedidosHistoricos: pedidosHistoricosCompletos.length,
      fechaObjetivo: fechaObjetivo,
      diaSemanaObjetivo: diaSemana,
      mesObjetivo: mes
    };

    // 1. PROMEDIO GENERAL
    const promedioGeneral = datosPorDia.reduce((sum, d) => sum + d.pedidos, 0) / datosPorDia.length;
    detalles.promedioGeneral = promedioGeneral;

    // 2. PROMEDIO MÓVIL (últimos 7 días)
    const ultimos7Dias = datosPorDia.slice(-7);
    const promedioMovil7 = ultimos7Dias.length > 0 
      ? ultimos7Dias.reduce((sum, d) => sum + d.pedidos, 0) / ultimos7Dias.length 
      : promedioGeneral;
    detalles.promedioMovil7 = promedioMovil7;
    detalles.ultimos7Dias = ultimos7Dias.map(d => ({ fecha: d.fecha, pedidos: d.pedidos }));

    // 3. PROMEDIO POR DÍA DE SEMANA
    const pedidosPorDiaSemana = {};
    for (let i = 0; i <= 6; i++) {
      pedidosPorDiaSemana[i] = [];
    }
    datosPorDia.forEach(d => {
      pedidosPorDiaSemana[d.diaSemana].push(d.pedidos);
    });
    
    const promediosPorDiaSemana = {};
    for (let i = 0; i <= 6; i++) {
      const pedidos = pedidosPorDiaSemana[i];
      promediosPorDiaSemana[i] = pedidos.length > 0 
        ? pedidos.reduce((sum, p) => sum + p, 0) / pedidos.length 
        : promedioGeneral;
    }
    detalles.promediosPorDiaSemana = promediosPorDiaSemana;
    detalles.promedioDiaSemanaObjetivo = promediosPorDiaSemana[diaSemana];

    // 4. TENDENCIA LINEAL (últimos 14 días)
    const ultimos14Dias = datosPorDia.slice(-14);
    let tendenciaLineal = promedioGeneral;
    if (ultimos14Dias.length >= 2) {
      const n = ultimos14Dias.length;
      const promedioX = (n - 1) / 2;
      const promedioY = ultimos14Dias.reduce((sum, d) => sum + d.pedidos, 0) / n;
      
      let sumaXY = 0;
      let sumaX2 = 0;
      ultimos14Dias.forEach((d, i) => {
        const x = i - promedioX;
        const y = d.pedidos - promedioY;
        sumaXY += x * y;
        sumaX2 += x * x;
      });
      
      const pendiente = sumaX2 !== 0 ? sumaXY / sumaX2 : 0;
      tendenciaLineal = promedioY + pendiente * (n - promedioX);
    }
    detalles.tendenciaLineal = tendenciaLineal;
    detalles.pendiente = tendenciaLineal - promedioGeneral;

    // 5. ENSAMBLE DE MODELOS (promedio ponderado)
    const pesoPromedioMovil = 0.4;
    const pesoDiaSemana = 0.4;
    const pesoTendencia = 0.2;
    
    const prediccionEnsemble = Math.round(
      (promedioMovil7 * pesoPromedioMovil) +
      (promediosPorDiaSemana[diaSemana] * pesoDiaSemana) +
      (tendenciaLineal * pesoTendencia)
    );
    detalles.prediccionEnsemble = prediccionEnsemble;
    detalles.pesosEnsemble = {
      promedioMovil: pesoPromedioMovil,
      diaSemana: pesoDiaSemana,
      tendencia: pesoTendencia
    };

    // 6. CÁLCULO DE RANGO DE CONFIANZA
    const desviacion = Math.sqrt(
      datosPorDia.reduce((sum, d) => sum + Math.pow(d.pedidos - promedioGeneral, 2), 0) / datosPorDia.length
    );
    detalles.desviacion = desviacion;
    
    const rangoInferior = Math.max(1, Math.round(prediccionEnsemble - (desviacion * 1.5)));
    const rangoSuperior = Math.round(prediccionEnsemble + (desviacion * 1.5));
    detalles.rangoConfianza = [rangoInferior, rangoSuperior];

    // 7. NIVEL DE CONFIANZA
    const coeficienteVariacion = desviacion / promedioGeneral;
    let nivelConfianza = 65;
    if (coeficienteVariacion < 0.3) {
      nivelConfianza = 85;
    } else if (coeficienteVariacion < 0.5) {
      nivelConfianza = 75;
    }
    detalles.nivelConfianza = nivelConfianza;
    detalles.coeficienteVariacion = coeficienteVariacion;

    // 8. DETECCIÓN DE ANOMALÍAS
    const esAnomalia = prediccionEnsemble > (promedioGeneral + (desviacion * 2)) || 
                      prediccionEnsemble < (promedioGeneral - (desviacion * 2));
    detalles.esAnomalia = esAnomalia;

    return {
      prediccion: prediccionEnsemble,
      rango_confianza: detalles.rangoConfianza,
      nivel_confianza: nivelConfianza,
      es_anomalia: esAnomalia,
      factores: {
        base: promedioGeneral,
        promedio_movil: promedioMovil7,
        dia_semana: promediosPorDiaSemana[diaSemana],
        tendencia: tendenciaLineal
      },
      detalles_calculo: detalles
    };
  };

  const generarPrediccionInteligente = async () => {
    if (!prediccion.fecha) {
      mostrarNotificacion('Por favor selecciona una fecha objetivo', 'warning');
      return;
    }
    
    // "general" es válido, no requiere validación adicional de tipo de cliente

    setLoading(true);
    
    try {
      // Calcular predicción local usando todos los pedidos históricos
      const prediccionLocal = calcularPrediccionLocal(prediccion.fecha);
      
      if (prediccionLocal) {
        // Guardar detalles del cálculo
        setDetallesCalculo(prediccionLocal.detalles_calculo);
        
        // Formatear resultado para compatibilidad con el componente
        const resultado = {
          prediccion: prediccionLocal.prediccion,
          rango_confianza: prediccionLocal.rango_confianza,
          nivel_confianza: prediccionLocal.nivel_confianza,
          es_anomalia: prediccionLocal.es_anomalia,
          factores: prediccionLocal.factores,
          estadisticas_base: {
            media: prediccionLocal.detalles_calculo.promedioGeneral,
            mediana: prediccionLocal.detalles_calculo.promedioGeneral, // Aproximación
            desviacion: prediccionLocal.detalles_calculo.desviacion
          },
          detalles_calculo: prediccionLocal.detalles_calculo
        };
        
        setPrediccionInteligente(resultado);
        
        // Generar análisis automático
        const analisis = generarAnalisisInteligente(resultado, prediccion);
        
        // Agregar al historial
        const nuevoHistorial = [analisis, ...historialPredicciones.slice(0, 9)];
        setHistorialPredicciones(nuevoHistorial);
        guardarHistorialLocal(nuevoHistorial);
        
        // Actualizar cumplimiento
        setCumplimiento({
          prediccionEsperada: resultado.prediccion,
          pedidosReales: 0,
          fecha: prediccion.fecha,
          tipoCliente: prediccion.tipoCliente
        });
        
        console.log('✅ Predicción calculada localmente:', resultado);
        console.log('📊 Detalles del cálculo:', prediccionLocal.detalles_calculo);
      } else {
        mostrarNotificacion('No hay suficientes datos históricos para calcular la predicción', 'error');
      }
      
    } catch (error) {
      console.error('Error generando predicción:', error);
      mostrarNotificacion('Error al calcular la predicción. Por favor intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generarAnalisisInteligente = (resultado, prediccion) => {
    const fecha = new Date(prediccion.fecha + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Mapear tipo de cliente a label legible
    const tipoClienteLabels = {
      'general': 'Predicción General',
      'recurrente': 'Cliente Recurrente',
      'residencial': 'Residencial',
      'nuevo': 'Cliente Nuevo',
      'empresa': 'Empresa',
      'vip': 'Cliente VIP'
    };
    const tipoClienteLabel = tipoClienteLabels[prediccion.tipoCliente] || prediccion.tipoCliente;
    
    let analisis = {
      titulo: `Predicción Inteligente - ${fecha.toLocaleDateString('es-ES')} - ${tipoClienteLabel}`,
      fecha: prediccion.fecha,
      tipoCliente: tipoClienteLabel,
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
      bgcolor: 'background.default',
      ml: '280px'
    }}>
      {/* Sistema de Notificaciones Unificado */}
      {notificacion.open && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 400,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <Card sx={{ 
            bgcolor: notificacion.tipo === 'success' 
              ? (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4')
              : notificacion.tipo === 'error'
              ? (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2')
              : notificacion.tipo === 'warning'
              ? (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
              : (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#f0f9ff'),
            border: `1px solid ${
              notificacion.tipo === 'success' 
                ? '#10b981'
                : notificacion.tipo === 'error'
                ? '#ef4444'
                : notificacion.tipo === 'warning'
                ? '#f59e0b'
                : '#3b82f6'
            }`,
            borderRadius: 3,
            boxShadow: theme.shadows[4]
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {notificacion.tipo === 'success' && <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />}
                {notificacion.tipo === 'error' && <ErrorOutline sx={{ color: '#ef4444', fontSize: 20 }} />}
                {notificacion.tipo === 'warning' && <Warning sx={{ color: '#f59e0b', fontSize: 20 }} />}
                {notificacion.tipo === 'info' && <Info sx={{ color: '#3b82f6', fontSize: 20 }} />}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    flex: 1
                  }}
                >
                  {notificacion.mensaje}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setNotificacion(prev => ({ ...prev, open: false }))}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                  }}
                >
                  <Box component="span" sx={{ fontSize: 16, fontWeight: 700 }}>×</Box>
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
            <AutoAwesome sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
        <Typography variant="h4" component="h1" sx={{ 
          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
          fontWeight: 700, 
          fontSize: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          mb: 1
        }}>
              Predictor Inteligente de Pedidos
              <Chip 
                label="AI Powered" 
                size="small" 
                sx={{ 
                  bgcolor: '#10b981', 
                  color: 'white', 
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: '24px'
                }} 
              />
        </Typography>
        <Typography variant="body1" sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#475569',
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
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
          <Card sx={{ 
            mb: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#0ea5e9'}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1]
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome sx={{ color: '#3b82f6', fontSize: 20 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  Predictor Inteligente: Incluye análisis VIP, variables exógenas, calibración dinámica y efectividad estimada
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {factoresReales && (
          <Card sx={{ 
            mb: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#0ea5e9'}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1]
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataUsage sx={{ color: '#3b82f6', fontSize: 20 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  Análisis basado en {factoresReales.total_pedidos_analizados} pedidos reales de Aguas Ancud
                  ({factoresReales.periodo_analisis?.fecha_inicio || 'N/A'} a {factoresReales.periodo_analisis?.fecha_fin || 'N/A'})
                </Typography>
              </Box>
            </CardContent>
          </Card>
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
                <Typography variant="h6" sx={{ 
                  color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>
                Parámetros de Predicción
              </Typography>
              </Box>
              
              <Stack spacing={3}>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Fecha objetivo"
                      type="date"
                      name="fecha"
                      value={prediccion.fecha}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: rangoDatos.fechaMinima || undefined,
                        max: undefined // Permitir fechas futuras
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: theme.palette.divider },
                          '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '14px',
                          fontWeight: 600,
                          color: theme.palette.text.primary
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '14px',
                          fontWeight: 500,
                          color: theme.palette.text.primary
                        }
                      }}
                    />
                    {rangoDatos.fechaMinima && rangoDatos.fechaMaxima && (
                      <Tooltip 
                        title={`Rango de datos disponibles: ${rangoDatos.fechaMinima} a ${rangoDatos.fechaMaxima}. Puedes seleccionar cualquier fecha, incluso futuras.`}
                        placement="top"
                        arrow
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                            cursor: 'help'
                          }}
                        >
                          📅 Datos disponibles: {rangoDatos.fechaMinima} a {rangoDatos.fechaMaxima}
                        </Typography>
                      </Tooltip>
                    )}
                    {rangoDatos.ultimaActualizacion && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: 0.5, 
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 400,
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                          fontStyle: 'italic'
                        }}
                      >
                        Última actualización: {new Date(rangoDatos.ultimaActualizacion).toLocaleString('es-ES')}
                      </Typography>
                    )}
                  </Box>
                
                  {/* Métricas de Validación */}
                  {metricasValidacion.mae !== null && (
                    <Card sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#0ea5e9'}`,
                      borderRadius: 2,
                      mb: 2
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            mb: 1.5,
                            fontSize: '13px',
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}
                        >
                          📊 Métricas de Validación (Backtesting)
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: theme.palette.text.primary,
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {metricasValidacion.mae?.toFixed(2) || '—'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                MAE
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: theme.palette.text.primary,
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {metricasValidacion.rmse?.toFixed(2) || '—'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                RMSE
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: theme.palette.text.primary,
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {metricasValidacion.mape?.toFixed(2) || '—'}%
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                MAPE
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      Tipo de cliente
                    </InputLabel>
                    <Select
                      name="tipoCliente"
                      value={prediccion.tipoCliente}
                      onChange={handleInputChange}
                      label="Tipo de cliente"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      '& .MuiSelect-select': {
                        fontSize: '14px',
                        fontWeight: 500,
                        color: theme.palette.text.primary
                      }
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
                    <MenuItem value="general">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChart sx={{ fontSize: 16, color: '#3b82f6' }} />
                        Predicción General
                      </Box>
                    </MenuItem>
                    </Select>
                  </FormControl>
                
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={generarPrediccion}
                  disabled={loading || !prediccion.fecha}
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
                <Typography variant="h6" sx={{ 
                  color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>
                  Resultados de Predicción Inteligente
              </Typography>
              </Box>
              
              {loading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                  }}>
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
                      <Card sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.1)' : '#f8fafc', 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        boxShadow: theme.shadows[1]
                      }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b', 
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            mb: 0.5
                          }}>
                            {prediccionInteligente.prediccion}
                  </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Predicción Base
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', 
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#22c55e'}`,
                        borderRadius: 3,
                        boxShadow: theme.shadows[1]
                      }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: '#10b981', 
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            mb: 0.5
                          }}>
                            {prediccionInteligente.rango_confianza[0]}-{prediccionInteligente.rango_confianza[1]}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#166534',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Rango Confianza
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        bgcolor: prediccionInteligente.es_anomalia 
                          ? (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2')
                          : (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff'),
                        border: `1px solid ${prediccionInteligente.es_anomalia ? '#ef4444' : '#0ea5e9'}`,
                        borderRadius: 3,
                        boxShadow: theme.shadows[1]
                      }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: prediccionInteligente.es_anomalia ? '#ef4444' : '#0ea5e9', 
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            mb: 0.5
                          }}>
                            {prediccionInteligente.es_anomalia ? 'Sí' : 'No'}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                            color: prediccionInteligente.es_anomalia 
                              ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#dc2626')
                              : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#0ea5e9'),
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Día Anómalo
                            </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    {prediccionInteligente.efectividad_estimada && (
                      <Grid item xs={12} md={3}>
                        <Card sx={{ 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', 
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#f59e0b'}`,
                          borderRadius: 3,
                          boxShadow: theme.shadows[1]
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                              color: '#f59e0b', 
                              fontWeight: 700,
                              fontSize: '1.5rem',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              mb: 0.5
                            }}>
                              {prediccionInteligente.efectividad_estimada}%
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#92400e',
                              fontSize: '13px',
                              fontWeight: 600,
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              Efectividad
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>

                  {/* Detalles del Cálculo Matemático */}
                  {detallesCalculo && (
                    <Card sx={{ 
                      mb: 3, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff', 
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#8b5cf6'}`,
                      borderRadius: 3,
                      boxShadow: theme.shadows[1]
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                          <BarChart sx={{ color: '#8b5cf6', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ 
                            color: '#8b5cf6', 
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}>
                            Detalles del Cálculo Matemático
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {/* Información General */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 700, 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                fontSize: '13px',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                📊 Información General
                              </Typography>
                              <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Total de días disponibles:
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                    fontSize: '12px'
                                  }}>
                                    {detallesCalculo.totalDiasDisponibles} días
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Total de pedidos históricos:
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                    fontSize: '12px'
                                  }}>
                                    {detallesCalculo.totalPedidosHistoricos} pedidos
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Fecha objetivo:
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                    fontSize: '12px'
                                  }}>
                                    {new Date(detallesCalculo.fechaObjetivo).toLocaleDateString('es-ES')}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* Métricas Base */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 700, 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                fontSize: '13px',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                📈 Métricas Base
                              </Typography>
                              <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Promedio general:
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: '#3b82f6',
                                    fontSize: '12px'
                                  }}>
                                    {detallesCalculo.promedioGeneral?.toFixed(2) || '—'} pedidos/día
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Promedio móvil (7 días):
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: '#10b981',
                                    fontSize: '12px'
                                  }}>
                                    {detallesCalculo.promedioMovil7?.toFixed(2) || '—'} pedidos/día
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}>
                                    Desviación estándar:
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 700,
                                    color: '#f59e0b',
                                    fontSize: '12px'
                                  }}>
                                    {detallesCalculo.desviacion?.toFixed(2) || '—'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* Modelos de Predicción */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 700, 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                fontSize: '13px',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                🧮 Modelos de Predicción
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      mb: 0.5
                                    }}>
                                      Promedio Móvil
                                    </Typography>
                                    <Typography variant="h6" sx={{ 
                                      color: '#3b82f6',
                                      fontWeight: 700,
                                      fontSize: '1.25rem'
                                    }}>
                                      {detallesCalculo.promedioMovil7?.toFixed(1) || '—'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '10px'
                                    }}>
                                      Peso: {(detallesCalculo.pesosEnsemble?.promedioMovil * 100).toFixed(0)}%
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      mb: 0.5
                                    }}>
                                      Día de Semana
                                    </Typography>
                                    <Typography variant="h6" sx={{ 
                                      color: '#10b981',
                                      fontWeight: 700,
                                      fontSize: '1.25rem'
                                    }}>
                                      {detallesCalculo.promedioDiaSemanaObjetivo?.toFixed(1) || '—'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '10px'
                                    }}>
                                      Peso: {(detallesCalculo.pesosEnsemble?.diaSemana * 100).toFixed(0)}%
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      mb: 0.5
                                    }}>
                                      Tendencia Lineal
                                    </Typography>
                                    <Typography variant="h6" sx={{ 
                                      color: '#f59e0b',
                                      fontWeight: 700,
                                      fontSize: '1.25rem'
                                    }}>
                                      {detallesCalculo.tendenciaLineal?.toFixed(1) || '—'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '10px'
                                    }}>
                                      Peso: {(detallesCalculo.pesosEnsemble?.tendencia * 100).toFixed(0)}%
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff', borderRadius: 2, border: `2px solid #8b5cf6` }}>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      mb: 0.5
                                    }}>
                                      PREDICCIÓN FINAL
                                    </Typography>
                                    <Typography variant="h5" sx={{ 
                                      color: '#8b5cf6',
                                      fontWeight: 700,
                                      fontSize: '1.5rem'
                                    }}>
                                      {detallesCalculo.prediccionEnsemble || '—'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                      fontSize: '10px'
                                    }}>
                                      Ensamble ponderado
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>

                          {/* Fórmula del Ensamble */}
                          {detallesCalculo.prediccionEnsemble && (
                            <Grid item xs={12}>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff',
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#8b5cf6'}`
                              }}>
                                <Typography variant="subtitle2" sx={{ 
                                  fontWeight: 700, 
                                  mb: 1,
                                  color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                  fontSize: '13px',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}>
                                  📐 Fórmula del Ensamble
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                                  fontSize: '12px',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                  fontStyle: 'italic',
                                  mb: 1
                                }}>
                                  Predicción = (Promedio Móvil × {detallesCalculo.pesosEnsemble?.promedioMovil}) + (Día Semana × {detallesCalculo.pesosEnsemble?.diaSemana}) + (Tendencia × {detallesCalculo.pesosEnsemble?.tendencia})
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                                  fontSize: '12px',
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                  fontStyle: 'italic'
                                }}>
                                  = ({detallesCalculo.promedioMovil7?.toFixed(2)} × {detallesCalculo.pesosEnsemble?.promedioMovil}) + ({detallesCalculo.promedioDiaSemanaObjetivo?.toFixed(2)} × {detallesCalculo.pesosEnsemble?.diaSemana}) + ({detallesCalculo.tendenciaLineal?.toFixed(2)} × {detallesCalculo.pesosEnsemble?.tendencia}) = <strong>{detallesCalculo.prediccionEnsemble}</strong> pedidos
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* Predicción de Bidones (Análisis Híbrido) */}
                  {prediccionInteligente.prediccion_bidones && (
                    <Card sx={{ 
                      mb: 3, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', 
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#22c55e'}`,
                      borderRadius: 3,
                      boxShadow: theme.shadows[1]
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Inventory sx={{ color: '#22c55e', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#10b981' : '#166534', 
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}>
                            Predicción de Bidones
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ 
                                color: theme.palette.mode === 'dark' ? '#10b981' : '#166534', 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                mb: 0.5
                              }}>
                                {prediccionInteligente.prediccion_bidones.valor_medio}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#166534',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Bidones Estimados
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ 
                                color: '#10b981', 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                mb: 0.5
                              }}>
                                {prediccionInteligente.prediccion_bidones.rango_estimado[0]}-{prediccionInteligente.prediccion_bidones.rango_estimado[1]}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#10b981',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Rango Estimado
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ 
                                color: '#3b82f6', 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                mb: 0.5
                              }}>
                                {prediccionInteligente.prediccion_bidones.promedio_por_pedido}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#3b82f6',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Promedio/Pedido
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ 
                                color: '#f59e0b', 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                mb: 0.5
                              }}>
                                {prediccionInteligente.prediccion_bidones.factor_conversion}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#92400e',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Factor Conversión
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', 
                          borderRadius: 2, 
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#22c55e'}`
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#10b981' : '#166534', 
                            fontWeight: 600,
                            fontSize: '13px',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            lineHeight: 1.6
                          }}>
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
                        
                        {prediccionInteligente.estadisticas_base && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                            fontSize: '14px',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Estadísticas Base:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Media: {prediccionInteligente.estadisticas_base.media?.toFixed(1) || '—'}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Mediana: {prediccionInteligente.estadisticas_base.mediana?.toFixed(1) || '—'}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Desv: {prediccionInteligente.estadisticas_base.desviacion?.toFixed(1) || '—'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                        )}
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
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>
                    📊 Métricas de Efectividad
                  </Typography>
                  
                  {trackingMetricas ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.1)' : '#f0f9ff', 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.3)' : '#0ea5e9'}`
                        }}>
                          <Typography variant="h4" sx={{ 
                            color: '#0ea5e9', 
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            mb: 0.5
                          }}>
                            {trackingMetricas.error_promedio}%
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Error Promedio
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#10b981'}`
                        }}>
                          <Typography variant="h4" sx={{ 
                            color: '#10b981', 
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            mb: 0.5
                          }}>
                            {trackingMetricas.efectividad_promedio}%
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Efectividad
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#f59e0b'}`
                        }}>
                          <Typography variant="h4" sx={{ 
                            color: '#f59e0b', 
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            mb: 0.5
                          }}>
                            {trackingMetricas.predicciones_verificadas}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Verificadas
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.1)' : '#f1f5f9', 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.3)' : '#64748b'}`
                        }}>
                          <Typography variant="h4" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b', 
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            mb: 0.5
                          }}>
                            {trackingMetricas.total_predicciones}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
                            Total
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b', 
                      textAlign: 'center', 
                      py: 2,
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      Cargando métricas...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Registrar Pedidos Reales */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>
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
                      InputLabelProps={{
                        sx: {
                          fontSize: '14px',
                          fontWeight: 600,
                          color: theme.palette.text.primary
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          '& fieldset': { borderColor: theme.palette.divider },
                          '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    <TextField
                      label="Número de Pedidos Reales"
                      type="number"
                      value={pedidosRealesInput}
                      onChange={(e) => setPedidosRealesInput(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        sx: {
                          fontSize: '14px',
                          fontWeight: 600,
                          color: theme.palette.text.primary
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          '& fieldset': { borderColor: theme.palette.divider },
                          '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={registrarPedidosRealesHandler}
                      disabled={!fechaPedidosReales || !pedidosRealesInput}
                      sx={{ 
                        bgcolor: '#10b981', 
                        '&:hover': { bgcolor: '#059669' },
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '14px',
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        textTransform: 'none'
                      }}
                    >
                      Registrar Pedidos Reales
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
          </Grid>

            {/* Últimas Predicciones */}
            <Grid item xs={12}>
              <Card sx={{ 
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>
                    📈 Últimas Predicciones
                  </Typography>
                  
                  {ultimasPredicciones.length > 0 ? (
                    <Grid container spacing={2}>
                      {ultimasPredicciones.slice(0, 6).map((pred, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card sx={{ 
                            p: 2, 
                            border: `1px solid ${theme.palette.divider}`, 
                            borderRadius: 3,
                            bgcolor: pred.verificada 
                              ? (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4')
                              : (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7'),
                            boxShadow: theme.shadows[1],
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: theme.shadows[3],
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 700, 
                              color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '14px',
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              mb: 0.5
                            }}>
                              {pred.fecha}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b', 
                              mb: 1,
                              fontSize: '13px',
                              fontWeight: 500,
                              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                            }}>
                              {pred.tipo_cliente}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ 
                                color: '#3b82f6', 
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                {pred.prediccion}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                pedidos
                              </Typography>
                            </Box>
                            <Chip 
                              label={pred.verificada ? '✅ Verificada' : '⏳ Pendiente'}
                              size="small"
                              sx={{ 
                                bgcolor: pred.verificada ? '#10b981' : '#f59e0b',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '11px',
                                height: '24px',
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}
                            />
                            {pred.verificada && pred.error_porcentual && (
                              <Typography variant="body2" sx={{ 
                                mt: 1, 
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                fontSize: '12px',
                                fontWeight: 500,
                                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                              }}>
                                Error: {pred.error_porcentual}%
                              </Typography>
                            )}
                          </Card>
        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b', 
                      textAlign: 'center', 
                      py: 2,
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      No hay predicciones registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recomendaciones */}
            {trackingReporte && trackingReporte.recomendaciones && trackingReporte.recomendaciones.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff', 
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#0ea5e9'}`,
                  borderRadius: 3,
                  boxShadow: theme.shadows[1]
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#0ea5e9', 
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}>
                      <Lightbulb sx={{ color: '#0ea5e9', fontSize: 20 }} />
                      Recomendaciones del Sistema
                    </Typography>
                    <Stack spacing={1}>
                      {trackingReporte.recomendaciones.map((rec, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: '#0ea5e9' }} />
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#0ea5e9',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                          }}>
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
          <Typography variant="h6" sx={{ 
            mb: 3, 
            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b', 
            fontWeight: 700, 
            fontSize: '1.125rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            <History sx={{ color: '#3b82f6', fontSize: 20 }} />
            Historial de Predicciones
          </Typography>
          
          <Grid container spacing={2}>
          {historialPredicciones.map((analisis, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: theme.shadows[3],
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontSize: '14px',
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                      }}>
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
                    
                    <Typography variant="body2" sx={{ 
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b', 
                      mb: 1,
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      {analisis.tipoCliente}
                    </Typography>
                    
                    {analisis.prediccion && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#3b82f6', 
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}>
                          {analisis.prediccion}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                        }}>
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
                      sx={{ 
                        color: '#3b82f6',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff'
                        }
                      }}
                    >
                      {expandedHistorial[index] ? 'Ocultar' : 'Ver detalles'}
                    </Button>
                    
                    <Collapse in={expandedHistorial[index]}>
                      <Box sx={{ 
                        mt: 2, 
                        pt: 2, 
                        borderTop: `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#475569', 
                          mb: 1,
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          lineHeight: 1.6
                        }}>
                  {analisis.resumen}
                </Typography>

                        {analisis.detalles && analisis.detalles.length > 0 && (
                          <Stack spacing={1}>
                            {analisis.detalles.map((detalle, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getIconoAnalisis(detalle.tipo)}
                                <Typography variant="body2" sx={{ 
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}>
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