import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
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
  Tooltip,
  Grid,
  keyframes,
} from "@mui/material";
import { Rnd } from "react-rnd";
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
  Info,
} from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
// Importar los mismos componentes del dashboard principal
import VentasCard from "../components/VentasCard";
import VentasMensualesCard from "../components/VentasMensualesCard";
import VentasMensualesLocalCard from "../components/VentasMensualesLocalCard";
import VentasSemanalesCard from "../components/VentasSemanalesCard";
import VentasSemanalesLocalCard from "../components/VentasSemanalesLocalCard";
import VentasDiariasCard from "../components/VentasDiariasCard";
import VentasDiariasLocalCard from "../components/VentasDiariasLocalCard";
import VentasTotalesLocalCard from "../components/VentasTotalesLocalCard";
import TicketPromedioCard from "../components/TicketPromedioCard";
import KpiMetaCard from "../components/KpiMetaCard";
import MetodosPagoLocalCard from "../components/MetodosPagoLocalCard";
import VentasPorDiaSemanaCard from "../components/VentasPorDiaSemanaCard";
import VentasPorMesCard from "../components/VentasPorMesCard";
import LocalVsDeliveryCard from "../components/LocalVsDeliveryCard";
import CapacidadLocalCard from "../components/CapacidadLocalCard";
import PromosVendidasCard from "../components/PromosVendidasCard";
import PorcentajePromosCard from "../components/PorcentajePromosCard";
import ImpactoPromosCard from "../components/ImpactoPromosCard";
import BidonesVendidosCard from "../components/BidonesVendidosCard";
import "./Local.css";
import { getVentasLocales, getKpis } from "../services/api";

// Animaciones para el contenedor neon
const neonGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(147, 112, 219, 0.5),
                0 0 40px rgba(147, 112, 219, 0.3),
                0 0 60px rgba(147, 112, 219, 0.2),
                inset 0 0 20px rgba(147, 112, 219, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(147, 112, 219, 0.8),
                0 0 60px rgba(147, 112, 219, 0.5),
                0 0 90px rgba(147, 112, 219, 0.3),
                inset 0 0 30px rgba(147, 112, 219, 0.2);
  }
`;

const borderGlow = keyframes`
  0%, 100% {
    border-color: rgba(147, 112, 219, 0.5);
  }
  50% {
    border-color: rgba(147, 112, 219, 0.9);
  }
`;

// Keyframes para el glow de meta según el color
const borderGlowGreen = keyframes`
  0%, 100% {
    border-color: rgba(16, 185, 129, 0.5);
  }
  50% {
    border-color: rgba(16, 185, 129, 0.9);
  }
`;

const borderGlowYellow = keyframes`
  0%, 100% {
    border-color: rgba(251, 191, 36, 0.5);
  }
  50% {
    border-color: rgba(251, 191, 36, 0.9);
  }
`;

const borderGlowOrange = keyframes`
  0%, 100% {
    border-color: rgba(249, 115, 22, 0.5);
  }
  50% {
    border-color: rgba(249, 115, 22, 0.9);
  }
`;

const borderGlowRed = keyframes`
  0%, 100% {
    border-color: rgba(239, 68, 68, 0.5);
  }
  50% {
    border-color: rgba(239, 68, 68, 0.9);
  }
`;

const shimmerNeon = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Función para obtener colores según el porcentaje de avance de la meta
const getMetaColorByPercentage = (percent) => {
  if (percent >= 100) {
    return {
      primary: "#10b981", // Verde
      glow: "rgba(16, 185, 129, 0.8)",
      glowLight: "rgba(16, 185, 129, 0.3)",
      glowMedium: "rgba(16, 185, 129, 0.5)",
      glowStrong: "rgba(16, 185, 129, 0.6)",
    };
  } else if (percent >= 80) {
    return {
      primary: "#10b981", // Verde
      glow: "rgba(16, 185, 129, 0.6)",
      glowLight: "rgba(16, 185, 129, 0.2)",
      glowMedium: "rgba(16, 185, 129, 0.4)",
      glowStrong: "rgba(16, 185, 129, 0.5)",
    };
  } else if (percent >= 50) {
    return {
      primary: "#fbbf24", // Amarillo
      glow: "rgba(251, 191, 36, 0.6)",
      glowLight: "rgba(251, 191, 36, 0.2)",
      glowMedium: "rgba(251, 191, 36, 0.4)",
      glowStrong: "rgba(251, 191, 36, 0.5)",
    };
  } else if (percent >= 25) {
    return {
      primary: "#f97316", // Naranja
      glow: "rgba(249, 115, 22, 0.6)",
      glowLight: "rgba(249, 115, 22, 0.2)",
      glowMedium: "rgba(249, 115, 22, 0.4)",
      glowStrong: "rgba(249, 115, 22, 0.5)",
    };
  } else {
    return {
      primary: "#ef4444", // Rojo
      glow: "rgba(239, 68, 68, 0.6)",
      glowLight: "rgba(239, 68, 68, 0.2)",
      glowMedium: "rgba(239, 68, 68, 0.4)",
      glowStrong: "rgba(239, 68, 68, 0.5)",
    };
  }
};

// Función para procesar datos del endpoint de ventas locales
const procesarDatosVentasLocales = (datos) => {
  if (!datos || !Array.isArray(datos)) {
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
      ticketPromedioMesPasado: 0,
    };
  }

  // Encontrar la fecha más reciente en los datos para usar como referencia
  let fechaMasReciente = new Date(0);
  datos.forEach((venta) => {
    try {
      const partes = venta.fecha.split("-");
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
      console.error(
        "Error procesando fecha para referencia:",
        venta.fecha,
        error
      );
    }
  });

  // Usar la fecha actual real para el apartado LOCAL
  const fechaActual = new Date();

  // Calcular períodos
  const inicioSemana = new Date(fechaActual);
  inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const inicioMes = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    1
  );
  const inicioDia = new Date(fechaActual);
  inicioDia.setHours(0, 0, 0, 0);

  // Calcular mes anterior para comparaciones
  const mesAnterior = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth() - 1,
    1
  );
  const finMesAnterior = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    0
  );

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
  let promosVendidas = 0; // Contador de ventas de $5,000 (promoción)

  datos.forEach((venta) => {
    const precio = parseInt(venta.precio);

    // Procesar fecha con formato DD-MM-YYYY
    let fechaVenta;
    try {
      const partes = venta.fecha.split("-");
      if (partes.length === 3) {
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const año = parseInt(partes[2]);
        fechaVenta = new Date(año, mes, dia);
      } else {
        fechaVenta = new Date(venta.fecha.split("-").reverse().join("-"));
      }
    } catch (error) {
      console.error("Error procesando fecha:", venta.fecha, error);
      fechaVenta = new Date();
    }

    fechaVenta.setHours(0, 0, 0, 0);

    // Calcular bidones: si es promoción ($5,000) = 3 bidones, sino precio normal ($2,000 por bidón)
    const bidones = precio === 5000 ? 3 : Math.round(precio / 2000);

    // Procesar método de pago
    const metodo = venta.metodopago || "desconocido";
    if (!metodosPago[metodo]) {
      metodosPago[metodo] = { cantidad: 0, monto: 0 };
    }
    metodosPago[metodo].cantidad++;
    metodosPago[metodo].monto += precio;

    const ventaProcesada = {
      ...venta,
      precio: precio,
      bidones: bidones,
      fecha: fechaVenta,
    };

    datosProcesados.push(ventaProcesada);

    // Ventas totales (todo el historial)
    ventasTotales += precio;

    // Ventas del mes actual
    if (fechaVenta >= inicioMes) {
      ventasMes += precio;
      bidonesVendidos += bidones;
      // Contar promos vendidas (ventas de $5,000)
      if (precio === 5000) {
        promosVendidas++;
      }
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
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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
      .filter((venta) => {
        const ventaFecha = new Date(venta.fecha);
        ventaFecha.setHours(0, 0, 0, 0);
        return ventaFecha.getTime() === fecha.getTime();
      })
      .reduce((total, venta) => total + venta.precio, 0);

    const clientesDelDia = datosProcesados.filter((venta) => {
      const ventaFecha = new Date(venta.fecha);
      ventaFecha.setHours(0, 0, 0, 0);
      return ventaFecha.getTime() === fecha.getTime();
    }).length;

    const bidonesDelDia = datosProcesados
      .filter((venta) => {
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
      promedio:
        clientesDelDia > 0 ? Math.round(ventasDelDia / clientesDelDia) : 0,
    };

    ventasDiariasArray.push(diaData);
  }

  // Calcular ticket promedio
  const transaccionesMes = datosProcesados.filter((d) => {
    const fecha = new Date(d.fecha);
    return fecha >= inicioMes;
  }).length;

  const ticketPromedio =
    transaccionesMes > 0 ? Math.round(ventasMes / transaccionesMes) : 0;
  const ticketPromedioMesPasado =
    transaccionesMesAnterior > 0
      ? Math.round(ventasMesAnterior / transaccionesMesAnterior)
      : 0;

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
    ticketPromedioMesPasado,
    promosVendidas,
  };
};

// Función para obtener datos del endpoint
const obtenerDatosVentasLocales = async () => {
  try {
    const data = await getVentasLocales();

    // Validar que los datos sean un objeto válido
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return crearDatosVacios();
    }

    // Validar que tenga al menos alguno de los campos esperados
    const tieneVentasTotales = data.ventas_totales !== undefined;
    const tieneVentasMes = data.ventas_mes !== undefined;
    const tieneEstructuraValida =
      tieneVentasTotales ||
      tieneVentasMes ||
      data.ventas_diarias !== undefined ||
      data.metodos_pago !== undefined;

    if (tieneEstructuraValida) {
      // Asegurar que todos los campos necesarios existan
      return {
        ventas_totales: data.ventas_totales ?? 0,
        ventas_mes: data.ventas_mes ?? 0,
        ventas_semana: data.ventas_semana ?? 0,
        ventas_hoy: data.ventas_hoy ?? 0,
        ventas_mes_anterior: data.ventas_mes_anterior ?? 0,
        ventas_semana_anterior: data.ventas_semana_anterior ?? 0,
        ventas_ayer: data.ventas_ayer ?? 0,
        bidones_totales: data.bidones_totales ?? 0,
        bidones_mes: data.bidones_mes ?? 0,
        bidones_semana: data.bidones_semana ?? 0,
        bidones_hoy: data.bidones_hoy ?? 0,
        bidones_mes_anterior: data.bidones_mes_anterior ?? 0,
        bidones_semana_anterior: data.bidones_semana_anterior ?? 0,
        ticket_promedio: data.ticket_promedio ?? 0,
        ticket_promedio_total: data.ticket_promedio_total ?? 0,
        ticket_promedio_mes_anterior: data.ticket_promedio_mes_anterior ?? 0,
        transacciones_mes: data.transacciones_mes ?? 0,
        transacciones_mes_anterior: data.transacciones_mes_anterior ?? 0,
        transacciones_semana: data.transacciones_semana ?? 0,
        transacciones_semana_anterior: data.transacciones_semana_anterior ?? 0,
        metodos_pago: data.metodos_pago ?? {},
        ventas_diarias: data.ventas_diarias ?? [],
        ventas_semanales: data.ventas_semanales ?? [],
        ventas_mensuales: data.ventas_mensuales ?? [],
        total_transacciones: data.total_transacciones ?? 0,
        clientes_unicos: data.clientes_unicos ?? 0,
        promos_vendidas: data.promos_vendidas ?? 0,
        ventas_promos: data.ventas_promos ?? 0,
        porcentaje_promos: data.porcentaje_promos ?? 0,
        impacto_promos: data.impacto_promos ?? 0,
      };
    } else {
      console.error("❌ Error: La respuesta no tiene la estructura esperada");
      console.error("❌ Respuesta recibida:", JSON.stringify(data, null, 2));
      return crearDatosVacios();
    }
  } catch (error) {
    console.error("❌ Error obteniendo datos de ventas locales:", error);
    console.error("❌ Stack trace:", error.stack);
    return crearDatosVacios();
  }
};

// Función auxiliar para crear datos vacíos
const crearDatosVacios = () => {
  return {
    ventas_totales: 0,
    ventas_mes: 0,
    ventas_semana: 0,
    ventas_hoy: 0,
    ventas_mes_anterior: 0,
    ventas_semana_anterior: 0,
    ventas_ayer: 0,
    bidones_totales: 0,
    bidones_mes: 0,
    bidones_semana: 0,
    bidones_hoy: 0,
    bidones_mes_anterior: 0,
    bidones_semana_anterior: 0,
    ticket_promedio: 0,
    ticket_promedio_total: 0,
    ticket_promedio_mes_anterior: 0,
    transacciones_mes: 0,
    transacciones_mes_anterior: 0,
    transacciones_semana: 0,
    transacciones_semana_anterior: 0,
    metodos_pago: {},
    ventas_diarias: [],
    ventas_semanales: [],
    ventas_mensuales: [],
    total_transacciones: 0,
    clientes_unicos: 0,
    promos_vendidas: 0,
    ventas_promos: 0,
    porcentaje_promos: 0,
    impacto_promos: 0,
  };
};

// Layout inicial para cards - COMPLETAMENTE LIBRE (posiciones en píxeles)
const getInitialPositions = () => {
  // Posiciones por defecto - establecidas según layout actual
  const defaults = {
    "ventas-totales": {
      x: 0,
      y: 0,
      width: 343,
      height: 160,
    },
    "ventas-mensuales": {
      x: 359,
      y: 0,
      width: 343,
      height: 160,
    },
    "ventas-semanales": {
      x: 718,
      y: 0,
      width: 343,
      height: 160,
    },
    "ventas-diarias": {
      x: 1077,
      y: 0,
      width: 343,
      height: 160,
    },
    bidones: {
      x: 0,
      y: 225,
      width: 343,
      height: 203,
    },
    ticket: {
      x: 723,
      y: 223,
      width: 346,
      height: 177,
    },
    meta: {
      x: 355,
      y: 223,
      width: 343,
      height: 206,
    },
    metodos: {
      x: 726,
      y: 456,
      width: 339,
      height: 363,
    },
    "ventas-dia": {
      x: 0,
      y: 456,
      width: 708,
      height: 209,
    },
    "local-delivery": {
      x: 0,
      y: 928,
      width: 654,
      height: 379,
    },
    "grafico-7dias": {
      x: 3,
      y: 1181,
      width: 1451,
      height: 450,
    },
    "ventas-mes-grafico": {
      x: 0,
      y: 695,
      width: 681,
      height: 210,
    },
    "capacidad-local": {
      x: 1083,
      y: 223,
      width: 343,
      height: 531,
    },
    "promos-vendidas": {
      x: 1089,
      y: 659,
      width: 343,
      height: 201,
    },
    "contenedor-promos": {
      x: 714,
      y: 842,
      width: 724,
      height: 295,
    },
  };

  // Las posiciones guardadas en localStorage tienen prioridad
  // Si existen, se usan como defaults (con merge para cards nuevos)
  const saved = localStorage.getItem("localDashboardPositions");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge: usar guardados como base, añadir defaults para cards nuevos
      return { ...parsed, ...defaults };
    } catch (e) {
      console.error("Error parsing saved positions:", e);
      return defaults;
    }
  }
  return defaults;
};

export default function Local() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [ventasLocales, setVentasLocales] = useState([]);
  const [showEfectivoTable, setShowEfectivoTable] = useState(false);
  const [showTransferenciaTable, setShowTransferenciaTable] = useState(false);
  const [showTarjetaTable, setShowTarjetaTable] = useState(false);
  const [positions, setPositions] = useState(getInitialPositions());

  // Actualizar posición de un card
  const updatePosition = (id, x, y) => {
    setPositions((prev) => {
      const newPos = { ...prev, [id]: { ...prev[id], x, y } };
      localStorage.setItem("localDashboardPositions", JSON.stringify(newPos));
      return newPos;
    });
  };

  // Actualizar tamaño de un card
  const updateSize = (id, width, height, x, y) => {
    setPositions((prev) => {
      const newPos = { ...prev, [id]: { ...prev[id], width, height, x, y } };
      localStorage.setItem("localDashboardPositions", JSON.stringify(newPos));
      return newPos;
    });
  };

  // Resetear layout
  const resetLayout = () => {
    localStorage.removeItem("localDashboardPositions");
    setPositions(getInitialPositions());
  };
  const [localData, setLocalData] = useState({
    // Información del local
    nombre: "Aguas Ancud - Local Principal",
    direccion: "Lago la Paloma 4565, Villa el Alba",
    telefono: "+56 9 1234 5678",
    email: "cesar.barahona.b@gmail.com",
    horario: "Lunes a Sábado: 10:00 - 19:00",

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
      { dia: "Lunes", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Martes", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Miércoles", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Jueves", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Viernes", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Sábado", ventas: 0, clientes: 0, bidones: 0 },
      { dia: "Domingo", ventas: 0, clientes: 0, bidones: 0 },
    ],

    // Productos más vendidos
    productosTop: [],

    // Métodos de pago utilizados
    metodosPago: [],

    // Personal del local
    personal: [],

    // Datos de Delivery (del Home/KPIs)
    ventasDelivery: 0,

    // Ventas por día de la semana
    ventasPorDiaSemana: [
      { dia: "Lun", ventas: 0 },
      { dia: "Mar", ventas: 0 },
      { dia: "Mié", ventas: 0 },
      { dia: "Jue", ventas: 0 },
      { dia: "Vie", ventas: 0 },
      { dia: "Sáb", ventas: 0 },
      { dia: "Dom", ventas: 0 },
    ],

    // Ventas por mes del año
    ventasPorMes: [
      { mes: 1, ventas: 0 },
      { mes: 2, ventas: 0 },
      { mes: 3, ventas: 0 },
      { mes: 4, ventas: 0 },
      { mes: 5, ventas: 0 },
      { mes: 6, ventas: 0 },
      { mes: 7, ventas: 0 },
      { mes: 8, ventas: 0 },
      { mes: 9, ventas: 0 },
      { mes: 10, ventas: 0 },
      { mes: 11, ventas: 0 },
      { mes: 12, ventas: 0 },
    ],

    // Promos vendidas (ventas de $5,000 del mes)
    promosVendidas: 0,

    // Métricas de promociones
    ventasPromos: 0,
    porcentajePromos: 0,
    impactoPromos: 0,
  });

  useEffect(() => {
    const cargarDatosLocales = async () => {
      try {
        setLoading(true);

        // Cargar datos del local y del delivery (KPIs) en paralelo
        const [datosProcesados, kpisData] = await Promise.all([
          obtenerDatosVentasLocales(),
          getKpis().catch((err) => {
            console.error("Error obteniendo KPIs:", err);
            return null;
          }),
        ]);

        // Calcular ventas de delivery (ventas totales del Home/KPIs)
        const ventasMensualesDelivery = kpisData?.ventas_mes || 0;

        // Calcular ventas por día de la semana desde las ventas diarias
        // El backend devuelve ventas_diarias con los últimos 7 días
        const ventasDiariasArray = datosProcesados.ventas_diarias || [];

        // Crear mapa para acumular ventas por día de la semana
        const diasSemanaMap = {
          0: "Dom", // Domingo
          1: "Lun", // Lunes
          2: "Mar", // Martes
          3: "Mié", // Miércoles
          4: "Jue", // Jueves
          5: "Vie", // Viernes
          6: "Sáb", // Sábado
        };

        // Inicializar acumuladores por día de la semana
        const ventasPorDiaSemanaMap = {
          Lun: 0,
          Mar: 0,
          Mié: 0,
          Jue: 0,
          Vie: 0,
          Sáb: 0,
          Dom: 0,
        };

        // Acumular ventas por día de la semana desde ventas_diarias
        ventasDiariasArray.forEach((diaData) => {
          try {
            const fecha = new Date(diaData.fecha);
            if (!isNaN(fecha.getTime())) {
              const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
              const nombreDia = diasSemanaMap[diaSemana];
              if (nombreDia && diaData.ventas) {
                ventasPorDiaSemanaMap[nombreDia] += diaData.ventas;
              }
            }
          } catch (error) {
            console.error("Error procesando fecha:", diaData.fecha, error);
          }
        });

        // Convertir mapa a array ordenado (Lunes a Domingo)
        const ventasPorDiaSemanaOrdenado = [
          { dia: "Lun", ventas: ventasPorDiaSemanaMap["Lun"] },
          { dia: "Mar", ventas: ventasPorDiaSemanaMap["Mar"] },
          { dia: "Mié", ventas: ventasPorDiaSemanaMap["Mié"] },
          { dia: "Jue", ventas: ventasPorDiaSemanaMap["Jue"] },
          { dia: "Vie", ventas: ventasPorDiaSemanaMap["Vie"] },
          { dia: "Sáb", ventas: ventasPorDiaSemanaMap["Sáb"] },
          { dia: "Dom", ventas: ventasPorDiaSemanaMap["Dom"] },
        ];

        // Actualizar el estado con los datos reales del LOCAL
        setLocalData((prevData) => ({
          ...prevData,
          // Ventas del LOCAL - PERÍODO ACTUAL
          ventasHoy: datosProcesados.ventas_hoy || 0,
          ventasSemana: datosProcesados.ventas_semana || 0,
          ventasMes: datosProcesados.ventas_mes || 0,
          ventasAnio: datosProcesados.ventas_totales || 0,

          // Bidones vendidos en el LOCAL - PERÍODO ACTUAL
          bidonesVendidosHoy: datosProcesados.bidones_hoy || 0,
          bidonesVendidosSemana: datosProcesados.bidones_semana || 0,
          bidonesVendidosMes: datosProcesados.bidones_mes || 0,
          bidonesVendidosAnio: datosProcesados.bidones_totales || 0,

          // Ticket promedio del LOCAL
          ticketPromedio: datosProcesados.ticket_promedio || 0,

          // Número de transacciones del LOCAL
          clientesMes:
            datosProcesados.transacciones_mes ||
            datosProcesados.total_transacciones ||
            0,
          clientesSemana: datosProcesados.transacciones_semana || 0,
          clientesHoy:
            datosProcesados.ventas_hoy > 0
              ? Math.ceil(
                  datosProcesados.ventas_hoy /
                    (datosProcesados.ticket_promedio || 1)
                )
              : 0,

          // Datos de comparación del LOCAL - PERÍODO ANTERIOR
          ventasMesPasado: datosProcesados.ventas_mes_anterior || 0,
          ventasHoyMesPasado: datosProcesados.ventas_ayer || 0,
          ventasSemanaMesPasado: datosProcesados.ventas_semana_anterior || 0,
          ventasAnioPasado: datosProcesados.ventas_totales * 0.85 || 0, // Estimación 15% crecimiento
          clientesMesPasado: datosProcesados.transacciones_mes_anterior || 0,
          bidonesVendidosMesPasado: datosProcesados.bidones_mes_anterior || 0,
          ticketPromedioMesPasado:
            datosProcesados.ticket_promedio_mes_anterior || 0,

          // Datos de ventas diarias para el gráfico (transformar formato)
          ventasDiarias: (() => {
            const ventasDiariasRaw = datosProcesados.ventas_diarias || [];
            const diasNombres = [
              "Dom",
              "Lun",
              "Mar",
              "Mié",
              "Jue",
              "Vie",
              "Sáb",
            ];

            // Transformar del formato del backend {fecha, ventas, bidones} al formato del gráfico {dia, ventas}
            return ventasDiariasRaw.map((diaData) => {
              try {
                const fecha = new Date(diaData.fecha);
                if (!isNaN(fecha.getTime())) {
                  const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
                  return {
                    dia: diasNombres[diaSemana] || "Dom",
                    ventas: diaData.ventas || 0,
                    clientes: 0, // No disponible en el backend actual
                    bidones: diaData.bidones || 0,
                    promedio: 0, // Se calculará si es necesario
                  };
                }
              } catch (error) {
                console.error(
                  "Error transformando fecha para gráfico:",
                  diaData.fecha,
                  error
                );
              }
              return {
                dia: "Dom",
                ventas: diaData.ventas || 0,
                clientes: 0,
                bidones: diaData.bidones || 0,
                promedio: 0,
              };
            });
          })(),

          // Métodos de pago (pasar directamente del backend, el componente lo procesa)
          metodosPago: datosProcesados.metodos_pago || {},

          // Datos de Delivery (ventas del Home)
          ventasDelivery: ventasMensualesDelivery,

          // Ventas por día de la semana
          ventasPorDiaSemana: ventasPorDiaSemanaOrdenado,

          // Ventas por mes (del backend o calculadas)
          ventasPorMes: datosProcesados.ventas_mensuales || [],

          // Promos vendidas (ventas de $5,000 del mes)
          promosVendidas: datosProcesados.promos_vendidas || 0,

          // Métricas de promociones
          ventasPromos: datosProcesados.ventas_promos || 0,
          porcentajePromos: datosProcesados.porcentaje_promos || 0,
          impactoPromos: datosProcesados.impacto_promos || 0,
        }));
      } catch (error) {
        console.error("Error cargando datos locales:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosLocales();

    // Actualización automática cada 5 minutos para mantener datos actualizados
    const interval = setInterval(() => {
      cargarDatosLocales();
    }, 5 * 60 * 1000); // 5 minutos (estandarizado con Home)

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      cargarDatosLocales();
    };

    window.addEventListener("globalRefresh", handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("globalRefresh", handleGlobalRefresh);
    };
  }, []);

  // Función para calcular porcentaje de cambio
  const calcularPorcentajeCambio = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            Cargando datos del local...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        padding: { xs: 2, md: 4 },
        paddingBottom: { xs: 4, md: 6 },
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.005) 100%)",
      }}
    >
      {/* Header del Dashboard */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            marginBottom: 0.5,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard Local Aguas Ancud
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          Panel de control y métricas del local en tiempo real
        </Typography>
      </Box>

      {/* Contenido principal */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingBottom: "100px",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        {/* Header del Local */}
        <Card
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            mb: 4,
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Store sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontFamily:
                      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  {localData.nombre}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Gestión y administración del local físico
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOn sx={{ color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {localData.direccion}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Phone sx={{ color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {localData.telefono}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Email sx={{ color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {localData.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Schedule sx={{ color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {localData.horario}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Dashboard Local - COMPLETAMENTE LIBRE */}
        <Box sx={{ position: "relative", height: 1800, mb: 2 }}>
          <Box
            sx={{
              position: "absolute",
              top: -25,
              right: 0,
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem" }}
            >
              💡 Arrastra y redimensiona libremente
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={resetLayout}
              sx={{ fontSize: "0.65rem", py: 0.3 }}
            >
              Reset Layout
            </Button>
          </Box>

          <Rnd
            position={{
              x: positions["ventas-totales"].x,
              y: positions["ventas-totales"].y,
            }}
            size={{
              width: positions["ventas-totales"].width,
              height: positions["ventas-totales"].height,
            }}
            onDragStop={(e, d) => updatePosition("ventas-totales", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-totales",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasTotalesLocalCard
                title="VENTAS TOTALES LOCALES"
                subtitle="Acumulado del local"
                ventasTotales={localData.ventasAnio}
                ventasAnioPasado={localData.ventasAnioPasado}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{
              x: positions["ventas-mensuales"].x,
              y: positions["ventas-mensuales"].y,
            }}
            size={{
              width: positions["ventas-mensuales"].width,
              height: positions["ventas-mensuales"].height,
            }}
            onDragStop={(e, d) => updatePosition("ventas-mensuales", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-mensuales",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasMensualesLocalCard
                title="VENTAS MENSUALES"
                subtitle="Este mes"
                ventasMensuales={localData.ventasMes}
                ventasMesAnterior={localData.ventasMesPasado}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{
              x: positions["ventas-semanales"].x,
              y: positions["ventas-semanales"].y,
            }}
            size={{
              width: positions["ventas-semanales"].width,
              height: positions["ventas-semanales"].height,
            }}
            onDragStop={(e, d) => updatePosition("ventas-semanales", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-semanales",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasSemanalesLocalCard
                title="VENTAS SEMANALES"
                subtitle="Esta semana"
                ventasSemanales={localData.ventasSemana}
                ventasSemanaAnterior={localData.ventasSemanaMesPasado}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{
              x: positions["ventas-diarias"].x,
              y: positions["ventas-diarias"].y,
            }}
            size={{
              width: positions["ventas-diarias"].width,
              height: positions["ventas-diarias"].height,
            }}
            onDragStop={(e, d) => updatePosition("ventas-diarias", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-diarias",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasDiariasLocalCard
                title="VENTAS DIARIAS"
                subtitle="Hoy vs Mismo día mes anterior"
                ventasDiarias={localData.ventasHoy}
                ventasDiaAnterior={localData.ventasHoyMesPasado}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{ x: positions["bidones"].x, y: positions["bidones"].y }}
            size={{
              width: positions["bidones"].width,
              height: positions["bidones"].height,
            }}
            onDragStop={(e, d) => updatePosition("bidones", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "bidones",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <BidonesVendidosCard
                bidonesVendidos={localData.bidonesVendidosMes}
                bidonesMesAnterior={localData.bidonesVendidosMesPasado}
                title="BIDONES VENDIDOS"
              />
            </Box>
          </Rnd>

          <Rnd
            position={{ x: positions["ticket"].x, y: positions["ticket"].y }}
            size={{
              width: positions["ticket"].width,
              height: positions["ticket"].height,
            }}
            onDragStop={(e, d) => updatePosition("ticket", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ticket",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <TicketPromedioCard
                title="TICKET PROMEDIO"
                value={localData.ticketPromedio}
                subtitle="Por pedido"
                percentageChange={calcularPorcentajeCambio(
                  localData.ticketPromedio,
                  localData.ticketPromedioMesPasado
                )}
                isPositive={
                  calcularPorcentajeCambio(
                    localData.ticketPromedio,
                    localData.ticketPromedioMesPasado
                  ) >= 0
                }
              />
            </Box>
          </Rnd>

          <Rnd
            position={{ x: positions["meta"].x, y: positions["meta"].y }}
            size={{
              width: positions["meta"].width,
              height: positions["meta"].height,
            }}
            onDragStop={(e, d) => updatePosition("meta", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "meta",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box
              sx={(theme) => {
                const metaPercentage = Math.round(
                  (localData.ventasMes / 500000) * 100
                );
                const metaColors = getMetaColorByPercentage(metaPercentage);

                // Seleccionar el keyframe de borde según el porcentaje
                let borderAnimation;
                if (metaPercentage >= 80) {
                  borderAnimation = borderGlowGreen;
                } else if (metaPercentage >= 50) {
                  borderAnimation = borderGlowYellow;
                } else if (metaPercentage >= 25) {
                  borderAnimation = borderGlowOrange;
                } else {
                  borderAnimation = borderGlowRed;
                }

                return {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  padding: "2px",
                  borderRadius: 3,
                  border: `2px solid ${metaColors.primary}80`,
                  overflow: "hidden",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? `0 0 20px ${metaColors.glowMedium}, 0 0 40px ${metaColors.glowLight}, 0 0 60px ${metaColors.glowLight}, inset 0 0 20px ${metaColors.glowLight}`
                      : `0 0 20px ${metaColors.glowMedium}, 0 0 40px ${metaColors.glowLight}, inset 0 0 20px ${metaColors.glowLight}`,
                  animation: `${shimmerNeon} 4s infinite, ${borderAnimation} 2s ease-in-out infinite`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? `0 0 30px ${metaColors.glow}, 0 0 60px ${metaColors.glowMedium}, 0 0 90px ${metaColors.glowLight}, inset 0 0 30px ${metaColors.glowLight}`
                        : `0 0 30px ${metaColors.glow}, 0 0 60px ${metaColors.glowMedium}, inset 0 0 30px ${metaColors.glowLight}`,
                    borderColor: `${metaColors.primary}CC`,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "200%",
                    height: "100%",
                    background: `linear-gradient(90deg, transparent, ${metaColors.primary}30, transparent)`,
                    animation: `${shimmerNeon} 4s infinite`,
                    pointerEvents: "none",
                    zIndex: 0,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "-50%",
                    right: "-50%",
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle, ${metaColors.primary}20 0%, transparent 70%)`,
                    pointerEvents: "none",
                    zIndex: 0,
                    animation: `${shimmerNeon} 3s ease-in-out infinite`,
                  },
                };
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <KpiMetaCard
                  title="META DE VENTAS LOCAL"
                  currentValue={localData.ventasMes}
                  targetValue={500000}
                  percentage={Math.round((localData.ventasMes / 500000) * 100)}
                  subtitle="Objetivo Mensual"
                />
              </Box>
            </Box>
          </Rnd>

          <Rnd
            position={{ x: positions["metodos"].x, y: positions["metodos"].y }}
            size={{
              width: positions["metodos"].width,
              height: positions["metodos"].height,
            }}
            onDragStop={(e, d) => updatePosition("metodos", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "metodos",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <MetodosPagoLocalCard
                title="MÉTODOS DE PAGO"
                subtitle="Distribución de pagos por método en el local"
                metodosPago={localData.metodosPago || {}}
                totalVentas={localData.ventasMes}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{
              x: positions["ventas-dia"].x,
              y: positions["ventas-dia"].y,
            }}
            size={{
              width: positions["ventas-dia"].width,
              height: positions["ventas-dia"].height,
            }}
            onDragStop={(e, d) => updatePosition("ventas-dia", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-dia",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasPorDiaSemanaCard
                ventasPorDia={localData.ventasPorDiaSemana}
              />
            </Box>
          </Rnd>

          <Rnd
            position={{
              x: positions["local-delivery"].x,
              y: positions["local-delivery"].y,
            }}
            size={{
              width: positions["local-delivery"].width,
              height: positions["local-delivery"].height,
            }}
            onDragStop={(e, d) => updatePosition("local-delivery", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "local-delivery",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <LocalVsDeliveryCard
                ventasLocal={localData.ventasMes}
                ventasDelivery={localData.ventasDelivery}
              />
            </Box>
          </Rnd>

          {/* Ventas por Mes - DRAGGABLE */}
          <Rnd
            position={{
              x: positions["ventas-mes-grafico"].x,
              y: positions["ventas-mes-grafico"].y,
            }}
            size={{
              width: positions["ventas-mes-grafico"].width,
              height: positions["ventas-mes-grafico"].height,
            }}
            onDragStop={(e, d) =>
              updatePosition("ventas-mes-grafico", d.x, d.y)
            }
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "ventas-mes-grafico",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <VentasPorMesCard ventasPorMes={localData.ventasPorMes} />
            </Box>
          </Rnd>

          {/* Capacidad de Producción Local - DRAGGABLE */}
          <Rnd
            position={{
              x: positions["capacidad-local"].x,
              y: positions["capacidad-local"].y,
            }}
            size={{
              width: positions["capacidad-local"].width,
              height: positions["capacidad-local"].height,
            }}
            onDragStop={(e, d) => updatePosition("capacidad-local", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "capacidad-local",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <CapacidadLocalCard
                title="CAPACIDAD DE PRODUCCIÓN"
                value={Math.round(
                  ((localData.bidonesVendidosMes * 20) / 30000) * 100
                )}
                litrosVendidos={localData.bidonesVendidosMes * 20}
                capacidadTotal={30000}
              />
            </Box>
          </Rnd>

          {/* Contenedor de Promos - DRAGGABLE Y REDIMENSIONABLE */}
          <Rnd
            position={{
              x: positions["contenedor-promos"].x,
              y: positions["contenedor-promos"].y,
            }}
            size={{
              width: positions["contenedor-promos"].width,
              height: positions["contenedor-promos"].height,
            }}
            onDragStop={(e, d) => updatePosition("contenedor-promos", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "contenedor-promos",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 0 }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                gap: 2,
                padding: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(15, 15, 26, 0.6)"
                    : "rgba(248, 249, 255, 0.8)",
                borderRadius: 3,
                border: "2px solid rgba(147, 112, 219, 0.5)",
                position: "relative",
                overflow: "hidden",
                animation: `${neonGlow} 3s ease-in-out infinite, ${borderGlow} 2s ease-in-out infinite`,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 0 30px rgba(147, 112, 219, 0.6), inset 0 0 30px rgba(147, 112, 219, 0.1)"
                    : "0 0 20px rgba(147, 112, 219, 0.4), inset 0 0 20px rgba(147, 112, 219, 0.05)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "200%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(147, 112, 219, 0.2), transparent)",
                  animation: `${shimmerNeon} 4s infinite`,
                  pointerEvents: "none",
                  zIndex: 0,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  right: "-50%",
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle, rgba(147, 112, 219, 0.15) 0%, transparent 70%)",
                  animation: `${borderGlow} 3s ease-in-out infinite`,
                  pointerEvents: "none",
                  zIndex: 0,
                },
              }}
            >
              {/* Promos Vendidas Este Mes */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box sx={{ height: "100%" }}>
                  <PromosVendidasCard
                    promosVendidas={localData.promosVendidas || 0}
                    title="PROMOS VENDIDAS ESTE MES"
                  />
                </Box>
              </Box>
              {/* Porcentaje de Promos */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box sx={{ height: "100%" }}>
                  <PorcentajePromosCard
                    porcentajePromos={localData.porcentajePromos || 0}
                  />
                </Box>
              </Box>
              {/* Impacto de Promos */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box sx={{ height: "100%" }}>
                  <ImpactoPromosCard
                    impactoPromos={localData.impactoPromos || 0}
                  />
                </Box>
              </Box>
            </Box>
          </Rnd>

          {/* Gráfico de Barras - Ventas Diarias - DRAGGABLE */}
          <Rnd
            position={{
              x: positions["grafico-7dias"].x,
              y: positions["grafico-7dias"].y,
            }}
            size={{
              width: positions["grafico-7dias"].width,
              height: positions["grafico-7dias"].height,
            }}
            onDragStop={(e, d) => updatePosition("grafico-7dias", d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateSize(
                "grafico-7dias",
                ref.offsetWidth,
                ref.offsetHeight,
                pos.x,
                pos.y
              )
            }
            bounds="parent"
            style={{ zIndex: 1 }}
          >
            <Card
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1],
                height: "100%",
                width: "100%",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 3,
                    fontFamily:
                      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  📊 Ventas Diarias - Últimos 7 Días
                </Typography>

                <Box
                  sx={{
                    width: "100%",
                    height: 400,
                    position: "relative",
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {localData.ventasDiarias &&
                  localData.ventasDiarias.length > 0 ? (
                    <>
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 900 500"
                        style={{ overflow: "visible" }}
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {/* Definir gradiente púrpura brillante para las barras */}
                        <defs>
                          {/* Gradiente púrpura brillante - estilo de la imagen */}
                          <linearGradient
                            id="barGradientLocal"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#e879f9"
                              stopOpacity="1"
                            />
                            <stop
                              offset="25%"
                              stopColor="#c084fc"
                              stopOpacity="1"
                            />
                            <stop
                              offset="50%"
                              stopColor="#a855f7"
                              stopOpacity="1"
                            />
                            <stop
                              offset="75%"
                              stopColor="#7c3aed"
                              stopOpacity="1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#6366f1"
                              stopOpacity="1"
                            />
                          </linearGradient>
                          {/* Gradiente blanco muy brillante en la parte superior */}
                          <linearGradient
                            id="barGradientTopLocal"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#ffffff"
                              stopOpacity="0.7"
                            />
                            <stop
                              offset="20%"
                              stopColor="#ffffff"
                              stopOpacity="0.5"
                            />
                            <stop
                              offset="40%"
                              stopColor="#ffffff"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="transparent"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          {/* Filtro de glow púrpura más intenso */}
                          <filter
                            id="glowLocal"
                            x="-100%"
                            y="-100%"
                            width="300%"
                            height="300%"
                          >
                            <feGaussianBlur
                              stdDeviation="6"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          {/* Filtro de brillo blanco muy visible */}
                          <filter
                            id="brightGlowLocal"
                            x="-100%"
                            y="-100%"
                            width="300%"
                            height="300%"
                          >
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feOffset
                              in="blur"
                              dx="0"
                              dy="0"
                              result="offsetBlur"
                            />
                            <feFlood floodColor="#ffffff" floodOpacity="0.6" />
                            <feComposite in2="offsetBlur" operator="in" />
                            <feMerge>
                              <feMergeNode />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Ejes */}
                        <line
                          x1="120"
                          y1="420"
                          x2="820"
                          y2="420"
                          stroke={
                            theme.palette.mode === "dark"
                              ? "#4b5563"
                              : "#d1d5db"
                          }
                          strokeWidth="3"
                        />
                        <line
                          x1="120"
                          y1="60"
                          x2="120"
                          y2="420"
                          stroke={
                            theme.palette.mode === "dark"
                              ? "#4b5563"
                              : "#d1d5db"
                          }
                          strokeWidth="3"
                        />

                        {/* Barras del gráfico */}
                        {localData.ventasDiarias.map((dia, index) => {
                          // Escala fija de 5,000 a 40,000 para las barras
                          const maxHeight = 320; // Altura máxima en píxeles (mucho más grande)
                          const barHeight = Math.max(
                            ((dia.ventas - 5000) / 35000) * maxHeight,
                            12
                          ); // Mínimo 12px de altura
                          const barWidth = 100; // Ancho de barra (más ancho)
                          const availableWidth = 700; // Ancho disponible (820 - 120)
                          const totalBars = localData.ventasDiarias.length;
                          const barSpacing =
                            (availableWidth - totalBars * barWidth) /
                            (totalBars + 1);
                          const barX =
                            120 + barSpacing + index * (barWidth + barSpacing);
                          const barY = 420 - barHeight;

                          return (
                            <g key={index}>
                              {/* Barra con gradiente púrpura brillante - estilo de la imagen */}
                              <rect
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill="url(#barGradientLocal)"
                                filter="url(#glowLocal)"
                                rx="8"
                                ry="8"
                                opacity="1"
                              />
                              {/* Capa de brillo blanco muy visible en la parte superior */}
                              <rect
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={Math.max(barHeight * 0.35, 15)}
                                fill="url(#barGradientTopLocal)"
                                rx="8"
                                ry="8"
                                opacity="1"
                                filter="url(#brightGlowLocal)"
                              />
                              {/* Resplandor adicional muy brillante en la parte superior */}
                              <ellipse
                                cx={barX + barWidth / 2}
                                cy={barY + barHeight * 0.12}
                                rx={barWidth / 2}
                                ry={barHeight * 0.08}
                                fill="rgba(255, 255, 255, 0.8)"
                                filter="url(#brightGlowLocal)"
                                opacity="1"
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
                                {dia.ventas > 0
                                  ? `$${dia.ventas.toLocaleString()}`
                                  : "$0"}
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
                                  e.target.style.opacity = "0.1";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.opacity = "0";
                                }}
                              />
                            </g>
                          );
                        })}

                        {/* Líneas de referencia horizontales con montos */}
                        {(() => {
                          const montos = [
                            5000, 10000, 15000, 20000, 25000, 30000, 35000,
                            40000,
                          ];

                          return montos.map((monto, index) => {
                            const maxHeight = 320; // Altura máxima en píxeles (mucho más grande)
                            const y =
                              420 - ((monto - 5000) / 35000) * maxHeight; // Escala de 5,000 a 40,000
                            return (
                              <g key={index}>
                                <line
                                  x1="115"
                                  y1={y}
                                  x2="825"
                                  y2={y}
                                  stroke={
                                    theme.palette.mode === "dark"
                                      ? "#374151"
                                      : "#e5e7eb"
                                  }
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <Typography variant="body1">
                        Cargando datos de ventas diarias...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Leyenda */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        background: "url(#barGradient)",
                        borderRadius: 2,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.875rem",
                        fontFamily:
                          '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Ventas Diarias
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Rnd>
        </Box>
      </Box>
    </Box>
  );
}
