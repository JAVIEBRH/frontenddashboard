import React, { useState, useEffect, Fragment, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  InfoOutlined,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AttachMoney,
  Assessment,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getCostosUtilidadesDetallado } from "../services/api";

const EstadoResultadosCard = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [periodo, setPeriodo] = useState("mensual");
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Refs para debugging del centrado
  const centerContainerRef = useRef(null);
  const centerContentRef = useRef(null);
  const numberRef = useRef(null);

  // Debug de posicionamiento deshabilitado para mejorar rendimiento

  // Función auxiliar para obtener el ancho correcto de cada card para el scroll
  const getCardWidth = () => {
    const container = document.getElementById("carousel-container");
    if (!container) {
      // Si el contenedor no existe aún, usar el ancho del viewport como fallback
      return window.innerWidth - 64; // Restar padding aproximado
    }

    // Usar clientWidth para obtener el ancho visible real (sin padding/border)
    // Esto asegura que el scroll avance exactamente un card completo
    return container.clientWidth;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCostosUtilidadesDetallado();

        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        console.error("Error obteniendo datos de estado de resultados:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Listener para actualizar currentIndex cuando el usuario hace scroll manual
  useEffect(() => {
    const container = document.getElementById("carousel-container");
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= 1) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex]);

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data || data.error) {
    return (
      <Box
        sx={{
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Alert severity="error">
          {error ||
            data?.error ||
            "No se pudieron cargar los datos del estado de resultados"}
        </Alert>
        {data?.error && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color:
                theme.palette.mode === "dark" ? "text.secondary" : "#1a1a1a",
            }}
          >
            Verifica que el backend esté corriendo en http://localhost:8001
          </Typography>
        )}
      </Box>
    );
  }

  // Función para convertir meses a español
  const convertirMesAEspanol = (mes) => {
    if (!mes) return "Sin datos";

    const mesesMap = {
      january: "Enero",
      jan: "Ene",
      enero: "Ene",
      ene: "Ene",
      february: "Febrero",
      feb: "Feb",
      febrero: "Feb",
      march: "Marzo",
      mar: "Mar",
      marzo: "Mar",
      april: "Abril",
      apr: "Abr",
      abril: "Abr",
      abr: "Abr",
      may: "Mayo",
      mayo: "May",
      june: "Junio",
      jun: "Jun",
      junio: "Jun",
      july: "Julio",
      jul: "Jul",
      julio: "Jul",
      august: "Agosto",
      aug: "Ago",
      agosto: "Ago",
      ago: "Ago",
      september: "Septiembre",
      sep: "Sep",
      septiembre: "Sep",
      sept: "Sep",
      october: "Octubre",
      oct: "Oct",
      octubre: "Oct",
      november: "Noviembre",
      nov: "Nov",
      noviembre: "Nov",
      december: "Diciembre",
      dec: "Dic",
      diciembre: "Dic",
    };

    const mesLower = mes.toLowerCase().trim();

    // Si ya está en español, devolverlo
    if (mesesMap[mesLower]) {
      return mesesMap[mesLower];
    }

    // Si contiene el nombre del mes, extraerlo
    for (const [key, value] of Object.entries(mesesMap)) {
      if (mesLower.includes(key)) {
        return value;
      }
    }

    return mes; // Si no se encuentra, devolver el original
  };

  // Preparar datos para gráfico de barras (últimos 6 meses)
  const historicoCostos = data.costos?.historico || [];
  const historicoUtilidades = data.utilidades?.historico || [];

  // Si no hay datos históricos, crear datos vacíos para evitar errores
  const barChartData =
    historicoCostos.length > 0
      ? historicoCostos.map((item, index) => {
          const utilidadItem = historicoUtilidades[index] || {};
          const mesOriginal =
            item.nombre_mes?.split(" ")[0] || item.mes || `Mes ${index + 1}`;
          const mesEspanol = convertirMesAEspanol(mesOriginal);
          return {
            mes: mesEspanol,
            Ventas: utilidadItem.ventas || 0,
            "Costos Totales": item.costos_totales || 0,
            "Utilidad Neta": utilidadItem.utilidades || 0,
          };
        })
      : [
          {
            mes: "Sin datos",
            Ventas: 0,
            "Costos Totales": 0,
            "Utilidad Neta": 0,
          },
        ];

  // Calcular datos según el período seleccionado (mensual, trimestral, semestral)
  const calcularDatosPorPeriodo = (periodoSeleccionado) => {
    const historicoUtilidades = data.utilidades?.historico || [];
    const historicoCostos = data.costos?.historico || [];

    if (periodoSeleccionado === "mensual") {
      // Datos mensuales (mes actual vs mes anterior)
      const costosActuales = data.costos?.mes_actual || {};
      const utilidadesActuales = data.utilidades?.mes_actual || {};
      const costosAnteriores = data.costos?.mes_anterior || {};
      const utilidadesAnteriores = data.utilidades?.mes_anterior || {};

      return {
        ingresos: utilidadesActuales.ventas || 0,
        costosVariables: costosActuales.costos_variables || 0,
        costosFijos: costosActuales.costos_fijos || 0,
        utilidadNeta: utilidadesActuales.utilidad_neta || 0,
        ingresosAnterior: utilidadesAnteriores.ventas || 0,
        costosTotalesAnterior:
          (costosAnteriores.costos_fijos || 0) +
          (costosAnteriores.costos_variables || 0),
        margenAnterior: utilidadesAnteriores.margen_neto_porcentaje || 0,
      };
    } else if (periodoSeleccionado === "trimestral") {
      // Sumar últimos 3 meses vs 3 meses anteriores
      const ultimos3Meses = historicoUtilidades.slice(0, 3);
      const anteriores3Meses = historicoUtilidades.slice(3, 6);
      const ultimos3MesesCostos = historicoCostos.slice(0, 3);
      const anteriores3MesesCostos = historicoCostos.slice(3, 6);

      const ingresos = ultimos3Meses.reduce(
        (sum, item) => sum + (item.ventas || 0),
        0
      );
      const costosVariables = ultimos3MesesCostos.reduce(
        (sum, item) => sum + (item.costos_variables || 0),
        0
      );
      const costosFijos = ultimos3MesesCostos.reduce(
        (sum, item) => sum + (item.costos_fijos || 0),
        0
      );
      const utilidadNeta = ultimos3Meses.reduce(
        (sum, item) => sum + (item.utilidades || 0),
        0
      );

      const ingresosAnterior = anteriores3Meses.reduce(
        (sum, item) => sum + (item.ventas || 0),
        0
      );
      const costosTotalesAnterior = anteriores3MesesCostos.reduce(
        (sum, item) => sum + (item.costos_totales || 0),
        0
      );
      const margenAnterior =
        anteriores3Meses.length > 0 && ingresosAnterior > 0
          ? (anteriores3Meses.reduce(
              (sum, item) => sum + (item.utilidades || 0),
              0
            ) /
              ingresosAnterior) *
            100
          : 0;

      return {
        ingresos,
        costosVariables,
        costosFijos,
        utilidadNeta,
        ingresosAnterior,
        costosTotalesAnterior,
        margenAnterior,
      };
    } else if (periodoSeleccionado === "semestral") {
      // Sumar últimos 6 meses vs 6 meses anteriores
      const ultimos6Meses = historicoUtilidades.slice(0, 6);
      const anteriores6Meses = historicoUtilidades.slice(6, 12);
      const ultimos6MesesCostos = historicoCostos.slice(0, 6);
      const anteriores6MesesCostos = historicoCostos.slice(6, 12);

      const ingresos = ultimos6Meses.reduce(
        (sum, item) => sum + (item.ventas || 0),
        0
      );
      const costosVariables = ultimos6MesesCostos.reduce(
        (sum, item) => sum + (item.costos_variables || 0),
        0
      );
      const costosFijos = ultimos6MesesCostos.reduce(
        (sum, item) => sum + (item.costos_fijos || 0),
        0
      );
      const utilidadNeta = ultimos6Meses.reduce(
        (sum, item) => sum + (item.utilidades || 0),
        0
      );

      const ingresosAnterior = anteriores6Meses.reduce(
        (sum, item) => sum + (item.ventas || 0),
        0
      );
      const costosTotalesAnterior = anteriores6MesesCostos.reduce(
        (sum, item) => sum + (item.costos_totales || 0),
        0
      );
      const margenAnterior =
        anteriores6Meses.length > 0 && ingresosAnterior > 0
          ? (anteriores6Meses.reduce(
              (sum, item) => sum + (item.utilidades || 0),
              0
            ) /
              ingresosAnterior) *
            100
          : 0;

      return {
        ingresos,
        costosVariables,
        costosFijos,
        utilidadNeta,
        ingresosAnterior,
        costosTotalesAnterior,
        margenAnterior,
      };
    }

    // Fallback a mensual
    const costosActuales = data.costos?.mes_actual || {};
    const utilidadesActuales = data.utilidades?.mes_actual || {};
    const costosAnteriores = data.costos?.mes_anterior || {};
    const utilidadesAnteriores = data.utilidades?.mes_anterior || {};

    return {
      ingresos: utilidadesActuales.ventas || 0,
      costosVariables: costosActuales.costos_variables || 0,
      costosFijos: costosActuales.costos_fijos || 0,
      utilidadNeta: utilidadesActuales.utilidad_neta || 0,
      ingresosAnterior: utilidadesAnteriores.ventas || 0,
      costosTotalesAnterior:
        (costosAnteriores.costos_fijos || 0) +
        (costosAnteriores.costos_variables || 0),
      margenAnterior: utilidadesAnteriores.margen_neto_porcentaje || 0,
    };
  };

  const datosPeriodo = calcularDatosPorPeriodo(periodo);
  const ingresos = datosPeriodo.ingresos;
  const costosVariables = datosPeriodo.costosVariables;
  const costosFijos = datosPeriodo.costosFijos;
  const utilidadNeta = datosPeriodo.utilidadNeta;

  // Calcular total para porcentajes
  const total =
    ingresos + costosVariables + costosFijos + Math.abs(utilidadNeta);

  // Preparar datos en formato Figma con colores exactos y rotationOffset
  // Calcular rotationOffset dinámicamente para posicionar el segmento seleccionado en esquina inferior derecha (315°)
  const distribucion = [];
  let porcentajeAcumulado = 0; // Para calcular la posición de cada segmento

  // Función para calcular el rotationOffset que posiciona el segmento en esquina inferior derecha (315°)
  const calcularRotationOffset = (porcentajeAcum, porcentajeSeg, label) => {
    // El círculo tiene transform="rotate(-90 140 140)", lo que rota el círculo -90°
    // El strokeDashoffset se mide desde el punto 0° (arriba antes de la rotación -90°)
    // Después de la rotación -90°, el punto 0° está visualmente a la izquierda
    //
    // El tooltip está fijo en la esquina inferior derecha (315° desde arriba en coordenadas estándar)
    // Necesitamos rotar el SVG completo para que el punto del segmento quede en 315°

    // Calcular el ángulo de inicio del segmento (en grados, donde 0° = inicio del strokeDashoffset = arriba)
    // El usuario quiere que el INICIO del segmento (donde empieza) se posicione en 315° (esquina inferior derecha)
    const anguloInicio = (porcentajeAcum / 100) * 360;

    // El tooltip está fijo en la esquina inferior derecha, que es 315° desde arriba
    // Queremos rotar el SVG para que el INICIO del segmento quede exactamente en 315°
    const anguloObjetivo = 315;

    // Calcular la rotación necesaria para llevar el inicio del segmento a 315°
    // Rotación = objetivo - ángulo actual
    let rotationOffset = anguloObjetivo - anguloInicio;

    // Normalizar a rango -180 a 180 para la rotación más corta
    while (rotationOffset > 180) rotationOffset -= 360;
    while (rotationOffset < -180) rotationOffset += 360;

    // Debug log deshabilitado para mejorar rendimiento

    return rotationOffset;
  };

  if (ingresos > 0) {
    const porcentaje = (ingresos / total) * 100;
    distribucion.push({
      label: "Ingresos",
      porcentaje: porcentaje,
      value: ingresos,
      color: "#06b6d4", // Cyan exacto de Figma
      rotationOffset: calcularRotationOffset(
        porcentajeAcumulado,
        porcentaje,
        "Ingresos"
      ),
    });
    porcentajeAcumulado += porcentaje;
  }

  if (costosVariables > 0) {
    const porcentaje = (costosVariables / total) * 100;
    distribucion.push({
      label: "Costos Variables",
      porcentaje: porcentaje,
      value: costosVariables,
      color: "#f59e0b", // Amber exacto de Figma
      rotationOffset: calcularRotationOffset(
        porcentajeAcumulado,
        porcentaje,
        "Costos Variables"
      ),
    });
    porcentajeAcumulado += porcentaje;
  }

  if (costosFijos > 0) {
    const porcentaje = (costosFijos / total) * 100;
    distribucion.push({
      label: "Costos Fijos",
      porcentaje: porcentaje,
      value: costosFijos,
      color: "#ef4444", // Red exacto de Figma
      rotationOffset: calcularRotationOffset(
        porcentajeAcumulado,
        porcentaje,
        "Costos Fijos"
      ),
    });
    porcentajeAcumulado += porcentaje;
  }

  if (utilidadNeta !== 0) {
    const valorAbsoluto = Math.abs(utilidadNeta);
    const porcentaje = (valorAbsoluto / total) * 100;
    distribucion.push({
      label: utilidadNeta > 0 ? "Utilidad Neta" : "Pérdidas",
      porcentaje: porcentaje,
      value: valorAbsoluto,
      color: "#a855f7", // Purple exacto de Figma
      rotationOffset: calcularRotationOffset(
        porcentajeAcumulado,
        porcentaje,
        utilidadNeta > 0 ? "Utilidad Neta" : "Pérdidas"
      ),
    });
    porcentajeAcumulado += porcentaje;
  }

  // Mantener pieChartData para compatibilidad con código existente
  const pieChartData = distribucion.map((item) => ({
    name: item.label,
    value: item.value,
    color: item.color,
    gradientStart: item.color,
    gradientEnd: item.color,
    porcentaje: item.porcentaje,
    rotationOffset: item.rotationOffset,
  }));

  // Calcular métricas para indicadores visuales según el período
  const margenNeto = ingresos > 0 ? (utilidadNeta / ingresos) * 100 : 0;
  const margenAnterior = datosPeriodo.margenAnterior;

  // Calcular variación según el período
  const calcularVariacion = () => {
    if (periodo === "mensual") {
      // Variación mensual: comparar con mes anterior
      return data.utilidades?.variacion_margen || 0;
    } else if (periodo === "trimestral") {
      // Variación trimestral: comparar últimos 3 meses vs 3 anteriores
      const margenActual = margenNeto;
      const margenAnteriorTrim = datosPeriodo.margenAnterior;
      return margenAnteriorTrim !== 0 ? margenActual - margenAnteriorTrim : 0;
    } else if (periodo === "semestral") {
      // Variación semestral: comparar últimos 6 meses vs 6 anteriores
      const margenActual = margenNeto;
      const margenAnteriorSem = datosPeriodo.margenAnterior;
      return margenAnteriorSem !== 0 ? margenActual - margenAnteriorSem : 0;
    }
    return 0;
  };

  const variacionPorcentaje = calcularVariacion();
  const variacionEsPositiva = variacionPorcentaje >= 0;

  const eficiencia = data.metricas_avanzadas?.eficiencia_costos || 0;
  const porcentajeCostosVariables =
    ingresos > 0 ? (costosVariables / ingresos) * 100 : 0;
  const porcentajeCostosFijos =
    ingresos > 0 ? (costosFijos / ingresos) * 100 : 0;
  const porcentajeCostosTotal =
    porcentajeCostosVariables + porcentajeCostosFijos;

  // Función para calcular valores SVG del donut chart (basado en diseño Figma)
  // Usa la misma lógica que el diseño: círculos con strokeDasharray y strokeDashoffset
  const calcularValoresSVG = (distribucion) => {
    if (!distribucion || distribucion.length === 0) return [];

    const CIRCUMFERENCE = 623; // Circunferencia total (2 * π * r ≈ 623 para r=99)
    const segments = [];
    let accumulatedOffset = 0;

    distribucion.forEach((item, index) => {
      // Validar que el item tenga todas las propiedades necesarias
      if (
        !item ||
        typeof item.porcentaje !== "number" ||
        isNaN(item.porcentaje)
      ) {
        return; // Saltar items inválidos
      }

      // Calcular longitud del segmento basado en porcentaje
      const porcentaje = Math.max(0, Math.min(100, item.porcentaje)); // Asegurar rango válido
      const segmentLength = (porcentaje / 100) * CIRCUMFERENCE;

      // Validar que segmentLength sea un número válido
      if (isNaN(segmentLength) || segmentLength < 0) {
        return; // Saltar si el cálculo no es válido
      }

      const strokeDasharray = `${segmentLength} ${CIRCUMFERENCE}`;
      // strokeDashoffset debe ser negativo para desplazar hacia la izquierda
      const strokeDashoffset = index === 0 ? 0 : -accumulatedOffset;

      segments.push({
        ...item,
        porcentaje: porcentaje, // Asegurar que porcentaje sea válido
        strokeDasharray,
        strokeDashoffset: strokeDashoffset || 0, // Asegurar valor válido
        segmentLength,
      });

      // Acumular offset para el siguiente segmento (incluyendo gap de 4px entre segmentos)
      accumulatedOffset +=
        segmentLength + (index < distribucion.length - 1 ? 4 : 0);
    });

    return segments;
  };

  const distribucionSVG =
    distribucion && distribucion.length > 0
      ? calcularValoresSVG(distribucion)
      : [];

  // Validar que distribucion tenga valores válidos antes de renderizar
  const hasValidDistribucion =
    distribucion && Array.isArray(distribucion) && distribucion.length > 0;

  // Mapear colores de Figma
  const colorMap = {
    Ingresos: "#06b6d4", // Cyan
    "Costos Variables": "#f59e0b", // Amber
    "Costos Fijos": "#ef4444", // Red
    Pérdidas: "#a855f7", // Purple
    "Utilidad Neta": "#a855f7", // Purple también
  };

  // Calcular dirección de animación basada en posición del segmento
  const calcularDireccionAnimacion = (index) => {
    const totalValue = pieChartData.reduce((sum, item) => sum + item.value, 0);
    let acumulado = 0;

    // Calcular porcentaje acumulado hasta este segmento
    for (let i = 0; i < index; i++) {
      acumulado += pieChartData[i].value;
    }

    // Calcular ángulo medio del segmento
    // El gráfico empieza en 90° (arriba) y va en sentido horario (-270°)
    const porcentajeAcumulado = acumulado / totalValue;
    const porcentajeSegmento = pieChartData[index].value / totalValue;

    // Calcular el ángulo medio del segmento
    // startAngle = 90° (arriba), va en sentido horario
    // Ángulo medio = ángulo inicial - (porcentaje acumulado + mitad del porcentaje del segmento) * 360
    const anguloMedioGrados =
      90 - (porcentajeAcumulado + porcentajeSegmento / 2) * 360;

    // Convertir a radianes
    // En matemáticas estándar: 0° = derecha, 90° = arriba, 180° = izquierda, 270° = abajo
    const radianes = (anguloMedioGrados * Math.PI) / 180;
    const distancia = 12; // píxeles de desplazamiento hacia afuera

    // Calcular dirección hacia afuera del centro
    // Para expandir hacia afuera, el vector debe apuntar desde el centro hacia el segmento
    // X: positivo = derecha, negativo = izquierda
    // Y: positivo = abajo, negativo = arriba (en SVG Y crece hacia abajo)
    // El ángulo se calcula en sentido horario desde 90° (arriba)
    // Usamos cos y -sin para obtener el vector radial correcto
    const translateX = Math.cos(radianes) * distancia;
    const translateY = -Math.sin(radianes) * distancia;

    return {
      translateX: translateX,
      translateY: translateY,
    };
  };

  // Formatear valores monetarios
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(value).toLocaleString("es-CL")}`;
  };

  return (
    <>
      <Box
        sx={{
          pt: 0.375,
          px: 2.5,
          pb: 4, // Aumentar padding bottom significativamente para que los cards inferiores no se corten
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
              : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
          borderRadius: 3,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(0, 191, 255, 0.4)"
              : "rgba(0, 191, 255, 0.1)"
          }`,
          mb: 0.75,
          width: "100%",
          maxWidth: "100%",
          minHeight: "850px", // Aumentar altura mínima para asegurar que se muestren los cards inferiores
          overflow: "visible", // Cambiar a visible para que no corte el contenido
          boxSizing: "border-box",
          position: "relative",
          isolation: "isolate",
          contain: "layout style", // Remover "paint" para permitir que el contenido se muestre fuera
          transition: "box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)"
                : "0 12px 40px rgba(0, 0, 0, 0.15)",
            borderColor: "rgba(0, 191, 255, 0.6)",
          },
        }}
      >
        {/* Título */}
        <Box sx={{ mb: 0.375 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 0.25,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textShadow:
                theme.palette.mode === "dark"
                  ? "0 0 8px rgba(0, 191, 255, 0.3)"
                  : "none",
            }}
          >
            📊 Estado de Resultados
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                theme.palette.mode === "dark" ? "text.secondary" : "#1a1a1a",
              fontSize: "0.875rem",
            }}
          >
            {data.periodo_actual
              ? `Período: ${data.periodo_actual} (${
                  periodo === "mensual"
                    ? "Mensual"
                    : periodo === "trimestral"
                    ? "Trimestral"
                    : "Semestral"
                })`
              : "Análisis financiero detallado"}
          </Typography>
        </Box>

        {/* Contenedor del carrusel */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            mt: 1,
            mb: 0,
            px: 2,
            boxSizing: "border-box",
            minWidth: 0,
            maxHeight: "600px", // Limitar altura máxima
          }}
        >
          {/* Botón izquierdo */}
          <IconButton
            onClick={() => {
              const container = document.getElementById("carousel-container");
              if (container) {
                const cardWidth = getCardWidth();
                if (cardWidth > 0) {
                  const newIndex = Math.max(0, currentIndex - 1);
                  container.scrollTo({
                    left: newIndex * cardWidth,
                    behavior: "smooth",
                  });
                  setCurrentIndex(newIndex);
                }
              }
            }}
            disabled={currentIndex === 0}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(0, 0, 0, 0.6)"
                  : "rgba(255, 255, 255, 0.9)",
              color: theme.palette.text.primary,
              margin: 0,
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 1)",
              },
              boxShadow: theme.shadows[4],
              "& svg": {
                margin: 0,
                display: "block",
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Botón derecho */}
          <IconButton
            onClick={() => {
              const container = document.getElementById("carousel-container");
              if (container) {
                const cardWidth = getCardWidth();
                if (cardWidth > 0) {
                  const newIndex = Math.min(1, currentIndex + 1);
                  container.scrollTo({
                    left: newIndex * cardWidth,
                    behavior: "smooth",
                  });
                  setCurrentIndex(newIndex);
                }
              }
            }}
            disabled={currentIndex === 1}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(0, 0, 0, 0.6)"
                  : "rgba(255, 255, 255, 0.9)",
              color: theme.palette.text.primary,
              margin: 0,
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 1)",
              },
              boxShadow: theme.shadows[4],
              "& svg": {
                margin: 0,
                display: "block",
              },
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Contenedor de cards con scroll horizontal */}
          <Box
            id="carousel-container"
            sx={{
              display: "flex",
              gap: 0,
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              pb: 0.4,
              boxSizing: "border-box",
              minWidth: 0,
              maxHeight: "600px", // Limitar altura
              scrollSnapType: "x mandatory",
              "& > *": {
                scrollSnapAlign: "start",
                flexShrink: 0,
                maxWidth: "100%", // Cada card no puede exceder el ancho del contenedor
              },
            }}
          >
            {/* Gráfico de Barras - Card 1 */}
            <Box
              sx={{
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                flexShrink: 0,
                flexBasis: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
                      : "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.005) 100%)",
                  borderRadius: 3,
                  pt: 0.25,
                  px: 1.5,
                  pb: 0.25,
                  height: "100%",
                  minHeight: "37.5px",
                  width: "100%",
                  overflow: "visible",
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(0, 191, 255, 0.15)"
                      : "rgba(0, 191, 255, 0.08)"
                  }`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 4px 15px rgba(0, 0, 0, 0.2)"
                      : "0 4px 15px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 6px 20px rgba(0, 0, 0, 0.3)"
                        : "0 6px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "text.primary",
                    fontSize: "0.65rem",
                    textShadow:
                      theme.palette.mode === "dark"
                        ? "0 0 6px rgba(0, 191, 255, 0.2)"
                        : "none",
                  }}
                >
                  Evolución Últimos 6 Meses
                </Typography>
                <Box sx={{ flex: 1, width: "100%", minHeight: "32.5px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <defs>
                        {/* Gradiente verde-azul brillante para Ventas con brillo blanco */}
                        <linearGradient
                          id="purpleGradientVentas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ffffff"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="10%"
                            stopColor="#22d3ee"
                            stopOpacity={1}
                          />
                          <stop
                            offset="30%"
                            stopColor="#14b8a6"
                            stopOpacity={1}
                          />
                          <stop
                            offset="60%"
                            stopColor="#10b981"
                            stopOpacity={1}
                          />
                          <stop
                            offset="85%"
                            stopColor="#059669"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#047857"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        {/* Gradiente naranja-rojo brillante para Costos con brillo blanco */}
                        <linearGradient
                          id="purpleGradientCostos"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ffffff"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="10%"
                            stopColor="#fb923c"
                            stopOpacity={1}
                          />
                          <stop
                            offset="30%"
                            stopColor="#f97316"
                            stopOpacity={1}
                          />
                          <stop
                            offset="60%"
                            stopColor="#ea580c"
                            stopOpacity={1}
                          />
                          <stop
                            offset="85%"
                            stopColor="#dc2626"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#b91c1c"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        {/* Gradiente púrpura-azul brillante para Utilidad con brillo blanco */}
                        <linearGradient
                          id="purpleGradientUtilidad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ffffff"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="10%"
                            stopColor="#e879f9"
                            stopOpacity={1}
                          />
                          <stop
                            offset="30%"
                            stopColor="#c084fc"
                            stopOpacity={1}
                          />
                          <stop
                            offset="60%"
                            stopColor="#a855f7"
                            stopOpacity={1}
                          />
                          <stop
                            offset="85%"
                            stopColor="#7c3aed"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#6366f1"
                            stopOpacity={1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="mes"
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                        tick={{ fill: theme.palette.text.secondary }}
                      />
                      <YAxis
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                        tick={{ fill: theme.palette.text.secondary }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            // Colores según el tipo de métrica (mismo que las barras)
                            const colores = {
                              Ventas: {
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#22d3ee"
                                    : "#059669",
                                bgColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(34, 211, 238, 0.15)"
                                    : "rgba(5, 150, 105, 0.1)",
                              },
                              "Costos Totales": {
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#fb923c"
                                    : "#ea580c",
                                bgColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(251, 146, 60, 0.15)"
                                    : "rgba(234, 88, 12, 0.1)",
                              },
                              "Utilidad Neta": {
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#a855f7"
                                    : "#7c3aed",
                                bgColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(168, 85, 247, 0.15)"
                                    : "rgba(124, 58, 237, 0.1)",
                              },
                            };

                            return (
                              <Box
                                sx={{
                                  background:
                                    theme.palette.mode === "dark"
                                      ? "#1e1e1e"
                                      : "#fff",
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: "8px",
                                  padding: 1.5,
                                  boxShadow:
                                    theme.palette.mode === "dark"
                                      ? "0 4px 15px rgba(0, 0, 0, 0.5)"
                                      : "0 4px 15px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    marginBottom: 1,
                                  }}
                                >
                                  {label}
                                </Typography>
                                {payload.map((entry, index) => {
                                  const colorInfo = colores[entry.name] || {
                                    color: theme.palette.text.primary,
                                    bgColor: "transparent",
                                  };
                                  return (
                                    <Box
                                      key={index}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        marginBottom: 0.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: "50%",
                                          backgroundColor: colorInfo.color,
                                          boxShadow: `0 0 8px ${colorInfo.color}80`,
                                        }}
                                      />
                                      <Typography
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: 600,
                                          color: colorInfo.color,
                                          flex: 1,
                                        }}
                                      >
                                        {entry.name}:
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontSize: "0.9rem",
                                          fontWeight: 800,
                                          color: colorInfo.color,
                                        }}
                                      >
                                        {formatCurrency(entry.value)}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "10px" }}
                        iconType="circle"
                        formatter={(value, entry) => {
                          // Colores según el tipo de métrica
                          const colores = {
                            Ventas:
                              theme.palette.mode === "dark"
                                ? "#22d3ee"
                                : "#059669",
                            "Costos Totales":
                              theme.palette.mode === "dark"
                                ? "#fb923c"
                                : "#ea580c",
                            "Utilidad Neta":
                              theme.palette.mode === "dark"
                                ? "#a855f7"
                                : "#7c3aed",
                          };
                          return (
                            <span
                              style={{
                                color:
                                  colores[value] || theme.palette.text.primary,
                                fontWeight: 600,
                                fontSize: "0.85rem",
                              }}
                            >
                              {value}
                            </span>
                          );
                        }}
                      />
                      <Bar
                        dataKey="Ventas"
                        fill="url(#purpleGradientVentas)"
                        radius={[8, 8, 0, 0]}
                        style={{
                          filter:
                            "drop-shadow(0 4px 8px rgba(16, 185, 129, 0.6))",
                        }}
                      />
                      <Bar
                        dataKey="Costos Totales"
                        fill="url(#purpleGradientCostos)"
                        radius={[8, 8, 0, 0]}
                        style={{
                          filter:
                            "drop-shadow(0 4px 8px rgba(249, 115, 22, 0.6))",
                        }}
                      />
                      <Bar
                        dataKey="Utilidad Neta"
                        fill="url(#purpleGradientUtilidad)"
                        radius={[8, 8, 0, 0]}
                        style={{
                          filter:
                            "drop-shadow(0 4px 8px rgba(168, 85, 247, 0.6))",
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>

            {/* Gráfico Donut 3D - Card 2 */}
            <Box
              sx={{
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                flexShrink: 0,
                flexBasis: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.95)",
                  borderRadius: 3,
                  pt: 1.5,
                  px: 2,
                  pb: 3, // Aumentar padding bottom para que los cards inferiores no se corten
                  width: "100%",
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)"
                  }`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                      : "0 2px 8px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Header rediseñado: Título y tabs en una línea */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: "1rem",
                      }}
                    >
                      DISTRIBUCIÓN DEL MARGEN NETO
                    </Typography>

                    {/* Tabs estilo chip moderno con glow leve */}
                    <ToggleButtonGroup
                      value={periodo}
                      exclusive
                      onChange={(e, newPeriodo) => {
                        if (newPeriodo !== null) setPeriodo(newPeriodo);
                      }}
                      size="small"
                      sx={{
                        bgcolor: "transparent",
                        gap: 0.5,
                        "& .MuiToggleButton-root": {
                          px: 2,
                          py: 0.75,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          textTransform: "none",
                          "&.Mui-selected": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(168, 85, 247, 0.2)"
                                : "rgba(168, 85, 247, 0.1)",
                            color:
                              theme.palette.mode === "dark"
                                ? "#c084fc"
                                : "#7c3aed",
                            border: `1px solid ${
                              theme.palette.mode === "dark"
                                ? "#a855f7"
                                : "#a855f7"
                            }`,
                            boxShadow:
                              theme.palette.mode === "dark"
                                ? "0 0 12px rgba(168, 85, 247, 0.4)"
                                : "0 0 8px rgba(168, 85, 247, 0.3)",
                            "&:hover": {
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(168, 85, 247, 0.25)"
                                  : "rgba(168, 85, 247, 0.15)",
                            },
                          },
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.03)",
                          },
                        },
                      }}
                    >
                      <ToggleButton value="mensual">Mensual</ToggleButton>
                      <ToggleButton value="trimestral">Trimestral</ToggleButton>
                      <ToggleButton value="semestral">Semestral</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                  >
                    Última actualización:{" "}
                    {new Date().toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                {/* Contenedor principal: Donut izquierda, Métricas derecha */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 3,
                  }}
                >
                  {/* Sección izquierda: Donut Chart SVG animado - Diseño exacto Figma */}
                  <Box
                    sx={{
                      flex: "0 0 280px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      minWidth: "280px",
                      maxWidth: "280px",
                      width: "280px",
                      height: "280px",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {/* Multiple glow layers - Diseño exacto Figma */}
                    <motion.div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "320px",
                        height: "320px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${
                          hoveredSegment !== null &&
                          distribucion[hoveredSegment]
                            ? `${distribucion[hoveredSegment].color}40`
                            : "rgba(168, 85, 247, 0.15)"
                        } 0%, transparent 70%)`,
                        filter: "blur(32px)",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Donut Chart SVG - Diseño exacto Figma 280x280px */}
                    <Box
                      component="div"
                      sx={{
                        width: "280px",
                        height: "280px",
                        position: "relative",
                        display: "block",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                        zIndex: 1,
                        overflow: "visible",
                        margin: 0,
                        padding: 0,
                        boxSizing: "border-box",
                        flexShrink: 0,
                        flexGrow: 0,
                      }}
                    >
                      {/* SVG animado exacto del diseño Figma */}
                      <motion.svg
                        width="280"
                        height="280"
                        viewBox="0 0 280 280"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "280px",
                          height: "280px",
                          maxWidth: "280px",
                          maxHeight: "280px",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                          margin: 0,
                          padding: 0,
                          transformOrigin: "140px 140px",
                        }}
                        animate={{
                          rotate:
                            hoveredSegment !== null &&
                            distribucion[hoveredSegment]
                              ? distribucion[hoveredSegment].rotationOffset
                              : 0,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut",
                        }}
                      >
                        <defs>
                          {/* Filtros de glow del diseño Figma */}
                          <filter id="glow-enhanced">
                            <feGaussianBlur
                              stdDeviation="3"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="glow-active">
                            <feGaussianBlur
                              stdDeviation="6"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>

                          {/* Gradientes exactos del diseño Figma */}
                          <linearGradient
                            id="grad-cyan"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#06b6d4"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#22d3ee"
                              stopOpacity={1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="grad-amber"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#f59e0b"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#fbbf24"
                              stopOpacity={1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="grad-red"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#ef4444"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#f87171"
                              stopOpacity={1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="grad-purple"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#a855f7"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#c084fc"
                              stopOpacity={1}
                            />
                          </linearGradient>
                        </defs>

                        {/* Círculos animados para cada segmento - Diseño exacto Figma */}
                        {distribucionSVG &&
                          distribucionSVG.length > 0 &&
                          distribucionSVG.map((segment, index) => {
                            // Validar que el segmento tenga todas las propiedades necesarias
                            if (
                              !segment ||
                              !segment.strokeDasharray ||
                              segment.strokeDasharray === undefined
                            ) {
                              return null; // No renderizar si falta información
                            }

                            const isHovered = hoveredSegment === index;
                            const gradientId =
                              segment.label === "Ingresos"
                                ? "grad-cyan"
                                : segment.label === "Costos Variables"
                                ? "grad-amber"
                                : segment.label === "Costos Fijos"
                                ? "grad-red"
                                : "grad-purple";

                            // Valores por defecto válidos
                            const baseRadius = 85;
                            const hoverRadius = 95;
                            const baseStrokeWidth = 28;
                            const hoverStrokeWidth = 32;
                            const baseOpacity = 1;
                            const inactiveOpacity = 0.25;

                            return (
                              <g key={`segment-group-${index}`}>
                                {/* Área invisible más grande para hover estable */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={hoverRadius + 10}
                                  fill="transparent"
                                  stroke="none"
                                  onMouseEnter={() => setHoveredSegment(index)}
                                  onMouseLeave={() => setHoveredSegment(null)}
                                  style={{
                                    cursor: "pointer",
                                    pointerEvents: "all",
                                  }}
                                />
                                {/* Círculo visible animado */}
                                <motion.circle
                                  cx="140"
                                  cy="140"
                                  r={baseRadius}
                                  fill="none"
                                  stroke={`url(#${gradientId})`}
                                  strokeWidth={baseStrokeWidth}
                                  strokeDasharray={
                                    segment.strokeDasharray || "0 623"
                                  }
                                  strokeDashoffset={
                                    segment.strokeDashoffset || 0
                                  }
                                  transform="rotate(-90 140 140)"
                                  filter={
                                    isHovered
                                      ? "url(#glow-active)"
                                      : "url(#glow-enhanced)"
                                  }
                                  initial={{
                                    strokeDasharray: "0 623",
                                    opacity: baseOpacity,
                                    r: baseRadius,
                                    strokeWidth: baseStrokeWidth,
                                  }}
                                  animate={{
                                    strokeDasharray:
                                      segment.strokeDasharray || "0 623",
                                    opacity:
                                      hoveredSegment === null || isHovered
                                        ? baseOpacity
                                        : inactiveOpacity,
                                    r: isHovered ? hoverRadius : baseRadius,
                                    strokeWidth: isHovered
                                      ? hoverStrokeWidth
                                      : baseStrokeWidth,
                                  }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeOut",
                                  }}
                                  style={{
                                    cursor: "pointer",
                                    strokeLinecap: "round",
                                    pointerEvents: "none",
                                  }}
                                />
                              </g>
                            );
                          })}

                        {/* Inner glow circle */}
                        <circle
                          cx="140"
                          cy="140"
                          r="57"
                          fill="none"
                          stroke="url(#grad-red)"
                          strokeWidth="0.5"
                          opacity="0.3"
                        />
                      </motion.svg>

                      {/* Center content with animation - Diseño exacto Figma */}
                      <motion.div
                        ref={centerContainerRef}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          margin: "auto",
                          textAlign: "center",
                          pointerEvents: "none",
                          zIndex: 10,
                          width: "114px",
                          height: "114px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        {/* Animated rings */}
                        {hoveredSegment === null && (
                          <motion.div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "114px",
                              height: "114px",
                              borderRadius: "50%",
                              border: "2px solid rgba(239, 68, 68, 0.3)",
                              pointerEvents: "none",
                              zIndex: 0,
                            }}
                            animate={{
                              scale: [1, 1.15, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}

                        {hoveredSegment === null ? (
                          <div
                            ref={centerContentRef}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                              margin: 0,
                              padding: 0,
                              position: "relative",
                              zIndex: 2,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#64748b"
                                    : "#94a3b8",
                                textTransform: "uppercase",
                                textAlign: "center",
                                lineHeight: 1.2,
                                margin: "0 0 4px 0",
                                padding: 0,
                                display: "block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Margen Neto
                            </div>
                            <motion.div
                              ref={numberRef}
                              style={{
                                fontSize: "1.75rem",
                                fontWeight: 900,
                                color: margenNeto >= 0 ? "#22c55e" : "#ef4444",
                                textShadow:
                                  theme.palette.mode === "dark"
                                    ? "0 0 20px rgba(248,113,113,0.8), 0 0 40px rgba(248,113,113,0.4)"
                                    : "none",
                                textAlign: "center",
                                lineHeight: 1,
                                margin: 0,
                                padding: 0,
                                display: "block",
                                whiteSpace: "nowrap",
                              }}
                              animate={{
                                textShadow:
                                  theme.palette.mode === "dark"
                                    ? [
                                        "0 0 20px rgba(248,113,113,0.8), 0 0 40px rgba(248,113,113,0.4)",
                                        "0 0 30px rgba(248,113,113,1), 0 0 60px rgba(248,113,113,0.6)",
                                        "0 0 20px rgba(248,113,113,0.8), 0 0 40px rgba(248,113,113,0.4)",
                                      ]
                                    : "none",
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              {margenNeto.toFixed(1)}
                            </motion.div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color:
                                  margenNeto >= 0
                                    ? "rgba(34, 197, 94, 0.6)"
                                    : "rgba(239, 68, 68, 0.6)",
                                textAlign: "center",
                                lineHeight: 1.2,
                                margin: "4px 0 0 0",
                                padding: 0,
                                display: "block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              %
                            </div>
                          </div>
                        ) : (
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              maxWidth: "114px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              boxSizing: "border-box",
                              zIndex: 2,
                              margin: 0,
                            }}
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                width: "100%",
                                maxWidth: "114px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "8px",
                                boxSizing: "border-box",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  mb: 0.5,
                                  color:
                                    distribucion[hoveredSegment]?.color ||
                                    "#64748b",
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                }}
                              >
                                {distribucion[hoveredSegment]?.label || ""}
                              </Typography>
                              <motion.span
                                style={{
                                  display: "block",
                                  fontSize: "2rem",
                                  fontWeight: 900,
                                  color:
                                    distribucion[hoveredSegment]?.color ||
                                    "#64748b",
                                  textShadow:
                                    theme.palette.mode === "dark"
                                      ? `0 0 30px ${
                                          distribucion[hoveredSegment]?.color ||
                                          "#64748b"
                                        }, 0 0 60px ${
                                          distribucion[hoveredSegment]?.color ||
                                          "#64748b"
                                        }80`
                                      : "none",
                                  textAlign: "center",
                                  lineHeight: 1,
                                }}
                              >
                                {distribucion[
                                  hoveredSegment
                                ]?.porcentaje?.toFixed(1) || 0}
                              </motion.span>
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  mt: 0.25,
                                  opacity: 0.8,
                                  color:
                                    distribucion[hoveredSegment]?.color ||
                                    "#64748b",
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                }}
                              >
                                %
                              </Typography>
                            </motion.div>
                          </Box>
                        )}
                      </motion.div>
                    </Box>

                    {/* Tooltip fijo en esquina inferior derecha - Diseño exacto Figma */}
                    {hoveredSegment !== null &&
                      distribucion[hoveredSegment] && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            style={{
                              position: "absolute",
                              pointerEvents: "none",
                              bottom: "-60px",
                              right: "-60px",
                              zIndex: 10,
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(15, 23, 42, 0.95)"
                                    : "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(12px)",
                                border: `2px solid ${distribucion[hoveredSegment].color}80`,
                                borderRadius: "12px",
                                px: 2.5,
                                py: 1.5,
                                minWidth: "220px",
                                boxShadow: `0 0 30px ${distribucion[hoveredSegment].color}60, 0 10px 40px rgba(0,0,0,0.5)`,
                              }}
                            >
                              {/* Línea conectora diagonal */}
                              <motion.div
                                style={{
                                  position: "absolute",
                                  width: "64px",
                                  height: "2px",
                                  backgroundColor:
                                    distribucion[hoveredSegment].color,
                                  top: "20px",
                                  right: "calc(100% - 8px)",
                                  transform: "rotate(-45deg)",
                                  transformOrigin: "right",
                                  boxShadow: `0 0 10px ${distribucion[hoveredSegment].color}`,
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              />

                              {/* Punto pulsante en el punto de conexión */}
                              <motion.div
                                style={{
                                  position: "absolute",
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    distribucion[hoveredSegment].color,
                                  top: "8px",
                                  right: "calc(100% + 38px)",
                                  boxShadow: `0 0 20px ${distribucion[hoveredSegment].color}`,
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                <motion.div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: "50%",
                                    backgroundColor:
                                      distribucion[hoveredSegment].color,
                                  }}
                                  animate={{
                                    scale: [1, 2.5, 1],
                                    opacity: [0.8, 0, 0.8],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                />
                              </motion.div>

                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#94a3b8"
                                      : "#64748b",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  mb: 0.5,
                                }}
                              >
                                {distribucion[hoveredSegment].label}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "1.875rem",
                                  fontWeight: 900,
                                  color: distribucion[hoveredSegment].color,
                                  mb: 1,
                                }}
                              >
                                {distribucion[
                                  hoveredSegment
                                ].porcentaje.toFixed(1)}
                                %
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    height: "6px",
                                    flex: 1,
                                    borderRadius: "9999px",
                                    bgcolor: `${distribucion[hoveredSegment].color}20`,
                                  }}
                                >
                                  <motion.div
                                    style={{
                                      height: "100%",
                                      borderRadius: "9999px",
                                      backgroundColor:
                                        distribucion[hoveredSegment].color,
                                      boxShadow: `0 0 10px ${distribucion[hoveredSegment].color}80`,
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{
                                      width: `${distribucion[hoveredSegment].porcentaje}%`,
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      ease: "easeOut",
                                      delay: 0.2,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </motion.div>
                        </AnimatePresence>
                      )}
                  </Box>

                  {/* Leyenda Mejorada - Grid de 2 columnas a la derecha - Diseño exacto Figma */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "40px 40px",
                    }}
                  >
                    {distribucion &&
                      distribucion.length > 0 &&
                      distribucion.map((item, index) => {
                        if (!item) return null;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity:
                                hoveredSegment === null ||
                                hoveredSegment === index
                                  ? 1
                                  : 0.4,
                              x: 0,
                            }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            style={{ cursor: "pointer" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${
                                  hoveredSegment === index
                                    ? theme.palette.mode === "dark"
                                      ? "rgba(6, 182, 212, 0.3)"
                                      : "rgba(6, 182, 212, 0.3)"
                                    : theme.palette.mode === "dark"
                                    ? "rgba(51, 65, 85, 0.3)"
                                    : "rgba(148, 163, 184, 0.3)"
                                }`,
                                bgcolor:
                                  hoveredSegment === index
                                    ? theme.palette.mode === "dark"
                                      ? "rgba(30, 41, 59, 0.5)"
                                      : "rgba(241, 245, 249, 0.5)"
                                    : hoveredSegment === null
                                    ? theme.palette.mode === "dark"
                                      ? "rgba(30, 41, 59, 0.2)"
                                      : "rgba(241, 245, 249, 0.2)"
                                    : theme.palette.mode === "dark"
                                    ? "rgba(30, 41, 59, 0.1)"
                                    : "rgba(241, 245, 249, 0.1)",
                                opacity:
                                  hoveredSegment === null ||
                                  hoveredSegment === index
                                    ? 1
                                    : 0.4,
                                transition: "all 0.3s ease",
                                transform:
                                  hoveredSegment === index
                                    ? "scale(1.05)"
                                    : "scale(1)",
                                boxShadow:
                                  hoveredSegment === index
                                    ? theme.palette.mode === "dark"
                                      ? "0 4px 12px rgba(6, 182, 212, 0.1)"
                                      : "0 4px 12px rgba(6, 182, 212, 0.1)"
                                    : "none",
                              }}
                            >
                              <motion.div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  backgroundColor: item.color,
                                  boxShadow: `0 0 15px ${item.color}80`,
                                  position: "relative",
                                  flexShrink: 0,
                                }}
                                animate={{
                                  scale: hoveredSegment === index ? 1.4 : 1,
                                  boxShadow:
                                    hoveredSegment === index
                                      ? `0 0 25px ${item.color}`
                                      : `0 0 15px ${item.color}80`,
                                }}
                              >
                                {hoveredSegment === index && (
                                  <motion.div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      borderRadius: "50%",
                                      backgroundColor: item.color,
                                    }}
                                    animate={{
                                      scale: [1, 2, 1],
                                      opacity: [0.6, 0, 0.6],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  />
                                )}
                              </motion.div>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color:
                                      hoveredSegment === index
                                        ? theme.palette.mode === "dark"
                                          ? "#67e8f9"
                                          : "#0891b2"
                                        : theme.palette.mode === "dark"
                                        ? "#cbd5e1"
                                        : "#475569",
                                    transition: "color 0.3s ease",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.label}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        hoveredSegment === index
                                          ? "1.25rem"
                                          : "1.125rem",
                                      fontWeight: 600,
                                      color:
                                        hoveredSegment === index
                                          ? theme.palette.mode === "dark"
                                            ? "#06b6d4"
                                            : "#0891b2"
                                          : theme.palette.mode === "dark"
                                          ? "#64748b"
                                          : "#94a3b8",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    {item.porcentaje.toFixed(1)}%
                                  </Typography>
                                  {hoveredSegment === index && (
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: "40px" }}
                                      style={{
                                        height: "4px",
                                        borderRadius: "9999px",
                                        backgroundColor: item.color,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      })}
                  </Box>
                </Box>

                {/* Divisor con glow - Diseño exacto Figma */}
                <Box
                  sx={{
                    position: "relative",
                    my: 4,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        borderTop: `1px solid ${
                          theme.palette.mode === "dark"
                            ? "rgba(6, 182, 212, 0.2)"
                            : "rgba(6, 182, 212, 0.1)"
                        }`,
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 0 8px rgba(6, 182, 212, 0.1)"
                            : "0 0 4px rgba(6, 182, 212, 0.05)",
                      }}
                    />
                  </Box>
                </Box>

                {/* Métricas en Grid de 4 columnas - Diseño exacto Figma */}
                <Box
                  sx={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 3,
                  }}
                >
                  {[
                    {
                      label: "INGRESOS TOTALES",
                      valor: formatCurrency(ingresos),
                      trend: "neutral",
                      color: "#06b6d4",
                    },
                    {
                      label: "COSTOS TOTALES",
                      valor: formatCurrency(costosVariables + costosFijos),
                      trend: "neutral",
                      color: "#f97316",
                    },
                    {
                      label: "MARGEN NETO",
                      valor: `${margenNeto.toFixed(1)}%`,
                      trend: margenNeto >= 0 ? "up" : "down",
                      color: margenNeto >= 0 ? "#22c55e" : "#ef4444",
                    },
                    {
                      label:
                        periodo === "mensual"
                          ? "VARIACIÓN MENSUAL"
                          : periodo === "trimestral"
                          ? "VARIACIÓN TRIMESTRAL"
                          : "VARIACIÓN SEMESTRAL",
                      valor: `${
                        variacionEsPositiva ? "+" : ""
                      }${variacionPorcentaje.toFixed(1)}%`,
                      trend: variacionEsPositiva ? "up" : "down",
                      color: variacionEsPositiva ? "#22c55e" : "#ef4444",
                    },
                  ].map((metrica, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        p: 2,
                        borderRadius: 3,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(30, 41, 59, 0.3)"
                            : "rgba(241, 245, 249, 0.5)",
                        border: `1px solid ${
                          theme.palette.mode === "dark"
                            ? "rgba(51, 65, 85, 0.5)"
                            : "rgba(148, 163, 184, 0.3)"
                        }`,
                        backdropFilter: "blur(4px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(6, 182, 212, 0.3)"
                              : "rgba(6, 182, 212, 0.2)",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(30, 41, 59, 0.5)"
                              : "rgba(241, 245, 249, 0.7)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 3,
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, rgba(6, 182, 212, 0) 0%, rgba(168, 85, 247, 0) 100%)"
                              : "linear-gradient(135deg, rgba(6, 182, 212, 0) 0%, rgba(168, 85, 247, 0) 100%)",
                          transition: "all 0.3s ease",
                          pointerEvents: "none",
                          "&:hover": {
                            background:
                              theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)"
                                : "linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          position: "relative",
                          fontSize: "0.625rem",
                          color:
                            theme.palette.mode === "dark"
                              ? "#64748b"
                              : "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          mb: 1,
                        }}
                      >
                        {metrica.label}
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            color: metrica.color,
                          }}
                        >
                          {metrica.valor}
                        </Typography>
                        {metrica.trend === "up" && (
                          <TrendingUp
                            sx={{
                              width: 16,
                              height: 16,
                              color: "#22c55e",
                              filter:
                                theme.palette.mode === "dark"
                                  ? "drop-shadow(0 0 6px rgba(52,211,153,0.6))"
                                  : "none",
                            }}
                          />
                        )}
                        {metrica.trend === "down" && (
                          <TrendingDown
                            sx={{
                              width: 16,
                              height: 16,
                              color: "#ef4444",
                              filter:
                                theme.palette.mode === "dark"
                                  ? "drop-shadow(0 0 6px rgba(248,113,113,0.6))"
                                  : "none",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Indicadores Clave - Rediseñados: 3 cards pequeños con números enormes */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2.5,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Indicadores Clave
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "repeat(3, 1fr)" },
                      gap: 2,
                    }}
                  >
                    {/* Margen Neto - Con animaciones */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          p: 2,
                          borderRadius: 2,
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)"
                              : "linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(34, 197, 94, 0.02) 100%)",
                          border: `1px solid ${
                            theme.palette.mode === "dark"
                              ? "rgba(34, 197, 94, 0.15)"
                              : "rgba(34, 197, 94, 0.2)"
                          }`,
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 2px 4px rgba(0,0,0,0.1)"
                              : "0 2px 4px rgba(0,0,0,0.05)",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: `0 4px 12px ${
                              margenNeto >= 0
                                ? "rgba(34, 197, 94, 0.3)"
                                : "rgba(239, 68, 68, 0.3)"
                            }`,
                            borderColor:
                              margenNeto >= 0
                                ? "rgba(34, 197, 94, 0.4)"
                                : "rgba(239, 68, 68, 0.4)",
                          },
                        }}
                      >
                        {/* Patrón de fondo animado */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.1,
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                            pointerEvents: "none",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            position: "relative",
                          }}
                        >
                          Margen Neto
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: margenNeto >= 0 ? "#22c55e" : "#ef4444",
                            fontSize: "32px",
                            lineHeight: 1,
                            mb: 1,
                            position: "relative",
                            textShadow:
                              theme.palette.mode === "dark"
                                ? `0 0 20px ${
                                    margenNeto >= 0
                                      ? "rgba(34, 197, 94, 0.5)"
                                      : "rgba(239, 68, 68, 0.5)"
                                  }`
                                : "none",
                          }}
                        >
                          {margenNeto.toFixed(1)}%
                        </Typography>
                      </Box>
                    </motion.div>

                    {/* Eficiencia - Con animaciones */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          p: 2,
                          borderRadius: 2,
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)"
                              : "linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(168, 85, 247, 0.02) 100%)",
                          border: `1px solid ${
                            theme.palette.mode === "dark"
                              ? "rgba(168, 85, 247, 0.15)"
                              : "rgba(168, 85, 247, 0.2)"
                          }`,
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 2px 4px rgba(0,0,0,0.1)"
                              : "0 2px 4px rgba(0,0,0,0.05)",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                            borderColor: "rgba(168, 85, 247, 0.4)",
                          },
                        }}
                      >
                        {/* Patrón de fondo animado */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.1,
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                            pointerEvents: "none",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            position: "relative",
                          }}
                        >
                          Eficiencia
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: "#a855f7",
                            fontSize: "32px",
                            lineHeight: 1,
                            mb: 1,
                            position: "relative",
                            textShadow:
                              theme.palette.mode === "dark"
                                ? "0 0 20px rgba(168, 85, 247, 0.5)"
                                : "none",
                          }}
                        >
                          {eficiencia.toFixed(1)}x
                        </Typography>
                      </Box>
                    </motion.div>

                    {/* Porcentaje de Costos - Con animaciones */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          p: 2,
                          borderRadius: 2,
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)"
                              : "linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(239, 68, 68, 0.02) 100%)",
                          border: `1px solid ${
                            theme.palette.mode === "dark"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(239, 68, 68, 0.2)"
                          }`,
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 2px 4px rgba(0,0,0,0.1)"
                              : "0 2px 4px rgba(0,0,0,0.05)",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                          },
                        }}
                      >
                        {/* Patrón de fondo animado */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.1,
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                            pointerEvents: "none",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            position: "relative",
                          }}
                        >
                          %Costos
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color:
                              porcentajeCostosTotal > 70
                                ? "#ef4444"
                                : "#f59e0b",
                            fontSize: "32px",
                            lineHeight: 1,
                            mb: 1,
                            position: "relative",
                            textShadow:
                              theme.palette.mode === "dark"
                                ? `0 0 20px ${
                                    porcentajeCostosTotal > 70
                                      ? "rgba(239, 68, 68, 0.5)"
                                      : "rgba(245, 158, 11, 0.5)"
                                  }`
                                : "none",
                          }}
                        >
                          {porcentajeCostosTotal.toFixed(1)}%
                        </Typography>
                      </Box>
                    </motion.div>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Indicadores de navegación (dots) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 1.5,
            mb: 1,
          }}
        >
          {[0, 1].map((index) => {
            const isActive = currentIndex === index;
            return (
              <Box
                key={index}
                onClick={() => {
                  const container =
                    document.getElementById("carousel-container");
                  if (container) {
                    const cardWidth = getCardWidth();
                    if (cardWidth > 0) {
                      container.scrollTo({
                        left: index * cardWidth,
                        behavior: "smooth",
                      });
                      setCurrentIndex(index);
                    }
                  }
                }}
                sx={{
                  width: isActive ? 24 : 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: isActive
                    ? theme.palette.mode === "dark"
                      ? "rgba(0, 191, 255, 0.9)"
                      : "rgba(0, 191, 255, 0.7)"
                    : theme.palette.mode === "dark"
                    ? "rgba(0, 191, 255, 0.3)"
                    : "rgba(0, 191, 255, 0.2)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(0, 191, 255, 0.8)"
                        : "rgba(0, 191, 255, 0.6)",
                    transform: "scale(1.2)",
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default EstadoResultadosCard;
