import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Button } from "@mui/material";
import KpiCard from "../components/KpiCard";
import FinancialKpiCard from "../components/FinancialKpiCard";
import ChartCard from "../components/ChartCard";
import CapacidadCard from "../components/CapacidadCard";
import LitrosCard from "../components/LitrosCard";
import KpiMetaCard from "../components/KpiMetaCard";
import VentasCard from "../components/VentasCard";
import VentasMensualesCard from "../components/VentasMensualesCard";
import PedidosPorBloqueDonut from "../components/PedidosPorBloqueDonut";
import VentasSemanalesCard from "../components/VentasSemanalesCard";
import VentasDiariasCard from "../components/VentasDiariasCard";
import BidonesCard from "../components/BidonesCard";
import IvaCard from "../components/IvaCard";
import CostosCard from "../components/CostosCard";
import UtilidadesCard from "../components/UtilidadesCard";
import EstadoResultadosCard from "../components/EstadoResultadosCard";
import RentabilidadCard from "../components/RentabilidadCard";
import {
  getKpis,
  getPedidos,
  getVentasHistoricas,
  getVentasTotalesHistoricas,
  getVentasLocales,
} from "../services/api";
import "./Home.css";

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
    ventasSemanaMesPasado: 0,
    ventasMismoDiaMesPasado: 0,
    pedidosMesPasado: 0,
    capacidadUtilizada: 0,
    litrosVendidos: 0,
    capacidadTotal: 30000,
    ventasHistoricas: [],
    costosMesPasado: 0,
    bidonesMesPasado: 0,
    bidonesSemanaMesPasado: 0,
    bidonesMismoDiaMesPasado: 0,
    bidonesTotalesHistoricos: 0,
    fechaMasAntiguaHistorica: null,
    fechaMasRecienteHistorica: null,
    totalPedidosHistoricos: 0,
    ivaMesPasado: 0,
    utilidadesMesPasado: 0,
    ticketPromedioMesPasado: 0,
    clientesActivosMesPasado: 0,
    clientesInactivosMesPasado: 0,
    porcentajeCambioProyectado: 0,
    esPositivoProyectado: false,
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
  const calcularPorcentajeCambioProyectado = (
    actual,
    anterior,
    diasActuales,
    diasAnterior
  ) => {
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

  const fetchData = async (isInitialLoad = false) => {
    try {
      // Solo poner loading: true en la carga inicial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Para actualizaciones automáticas, solo mostrar indicador de refresh
        setIsRefreshing(true);
      }
      setError(null);

      // CARGA PROGRESIVA: Primero obtener KPIs (datos críticos para mostrar)
      const kpisData = await getKpis();

      // NO mostrar datos de ventas hasta que tengamos los pedidos cargados
      // Las ventas se calculan SOLO desde bidones vendidos en los pedidos

      // CARGAR PEDIDOS PRIMERO (necesarios para calcular ventas desde bidones)
      const [
        pedidosData,
        ventasHistoricas,
        ventasTotalesHistoricas,
        ventasLocalesData,
      ] = await Promise.all([
        getPedidos().catch((err) => {
          console.error("Error obteniendo pedidos:", err);
          return [];
        }),
        getVentasHistoricas().catch((err) => {
          console.error("Error obteniendo ventas históricas:", err);
          return [];
        }),
        getVentasTotalesHistoricas().catch((err) => {
          console.error("Error obteniendo ventas totales históricas:", err);
          return { ventas_totales: 0 };
        }),
        getVentasLocales().catch((err) => {
          console.error("Error obteniendo ventas locales:", err);
          return { bidones_mes: 0 };
        }),
      ]);

      // SI NO HAY PEDIDOS, MOSTRAR ADVERTENCIA PERO CONTINUAR
      if (!Array.isArray(pedidosData) || pedidosData.length === 0) {
        console.error(
          "No se encontraron pedidos. No se pueden calcular ventas desde bidones."
        );
        // Aún así, ocultar loading para mostrar el dashboard
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // CALCULAR VENTAS DIRECTAMENTE DESDE BIDONES VENDIDOS
      // Lógica: Ventas = Bidones Vendidos × $2,000
      const PRECIO_BIDON = 2000;

      const fechaActual = new Date();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Calcular inicio del mes actual
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      inicioMes.setHours(0, 0, 0, 0);

      // Calcular inicio de la semana actual (lunes)
      const inicioSemana = new Date(hoy);
      const diaSemana = hoy.getDay();
      const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
      inicioSemana.setDate(hoy.getDate() - diasDesdeLunes);
      inicioSemana.setHours(0, 0, 0, 0);

      // Función para parsear fecha de pedido
      const parseFechaPedido = (fechaStr) => {
        if (!fechaStr) return null;
        try {
          // Formato DD-MM-YYYY
          const partes = fechaStr.split("-");
          if (partes.length === 3) {
            const dia = parseInt(partes[0]);
            const mes = parseInt(partes[1]) - 1;
            const anio = parseInt(partes[2]);
            const fecha = new Date(anio, mes, dia);
            fecha.setHours(0, 0, 0, 0);
            return fecha;
          }
          return null;
        } catch (error) {
          console.error("Error parseando fecha:", fechaStr, error);
          return null;
        }
      };

      // Función para obtener cantidad de bidones de un pedido
      const obtenerBidonesPedido = (pedido, retornarInfo = false) => {
        let tieneCampoExplicito = false;
        let bidones = 0;

        // Intentar obtener cantidad de diferentes campos
        if (pedido.products && Array.isArray(pedido.products)) {
          bidones = pedido.products.reduce(
            (sum, product) => sum + (product.quantity || 0),
            0
          );
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.cantidad) {
          bidones = parseInt(pedido.cantidad) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.cant) {
          bidones = parseInt(pedido.cant) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.qty) {
          bidones = parseInt(pedido.qty) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.quantity) {
          bidones = parseInt(pedido.quantity) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.bidones) {
          bidones = parseInt(pedido.bidones) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.unidades) {
          bidones = parseInt(pedido.unidades) || 0;
          if (bidones > 0) tieneCampoExplicito = true;
        } else if (pedido.ordenpedido) {
          // ordenpedido puede ser un string como "6 bidones" o solo "6"
          const ordenpedidoStr = String(pedido.ordenpedido || "").trim();
          if (ordenpedidoStr) {
            // Extraer solo números del string
            const numeros = ordenpedidoStr.match(/\d+/);
            if (numeros) {
              bidones = parseInt(numeros[0]) || 0;
              // VALIDACIÓN CRÍTICA: Si el precio no coincide con bidones × $2,000, recalcular desde precio
              const precio = parseInt(pedido.precio || pedido.price || 0);
              if (precio > 0) {
                const bidonesDesdePrecio = Math.round(precio / PRECIO_BIDON);
                // Si hay una discrepancia grande (>20%), usar el cálculo desde precio
                if (
                  bidones > 0 &&
                  Math.abs(bidones - bidonesDesdePrecio) / bidonesDesdePrecio >
                    0.2
                ) {
                  // Silenciar warning individual - se mostrará resumen al final
                  bidones = bidonesDesdePrecio;
                  tieneCampoExplicito = false; // Marcar como calculado desde precio
                }
              }
              if (bidones > 0) tieneCampoExplicito = true;
            }
          }
        }

        // Si no hay campo de cantidad, calcular desde precio (2000 por bidón)
        if (!tieneCampoExplicito) {
          const precio = parseInt(pedido.precio || pedido.price || 0);
          if (precio > 0) {
            bidones = Math.round(precio / PRECIO_BIDON);
          }
        }

        if (retornarInfo) {
          return { bidones, tieneCampoExplicito };
        }

        return bidones;
      };

      // Calcular fechas del mes pasado para comparaciones
      const mesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      mesPasado.setHours(0, 0, 0, 0);
      const inicioMesPasado = new Date(
        mesPasado.getFullYear(),
        mesPasado.getMonth(),
        1
      );
      inicioMesPasado.setHours(0, 0, 0, 0);
      const finMesPasado = new Date(
        mesPasado.getFullYear(),
        mesPasado.getMonth() + 1,
        0
      );
      finMesPasado.setHours(23, 59, 59, 999);

      // Calcular inicio de la misma semana del mes pasado (mismo día de la semana que hoy)
      // Encontrar qué día de la semana es hoy (0 = domingo, 1 = lunes, etc.)
      const diaSemanaHoy = hoy.getDay();
      // Calcular el lunes de la semana actual
      const lunesSemanaActual = new Date(inicioSemana);

      // Calcular el lunes de la misma semana del mes pasado
      // Restar 7 días desde el lunes de la semana actual para llegar a la semana pasada del mes pasado
      const lunesSemanaMesPasado = new Date(lunesSemanaActual);
      lunesSemanaMesPasado.setDate(lunesSemanaMesPasado.getDate() - 7);

      // Asegurar que esté en el mes pasado
      if (lunesSemanaMesPasado.getMonth() !== mesPasado.getMonth()) {
        // Si no está en el mes pasado, calcular el lunes de la última semana del mes pasado
        const ultimoDiaMesPasado = new Date(
          mesPasado.getFullYear(),
          mesPasado.getMonth() + 1,
          0
        );
        const diaSemanaUltimoDia = ultimoDiaMesPasado.getDay();
        const diasDesdeLunesUltimoDia =
          diaSemanaUltimoDia === 0 ? 6 : diaSemanaUltimoDia - 1;
        lunesSemanaMesPasado.setTime(ultimoDiaMesPasado.getTime());
        lunesSemanaMesPasado.setDate(
          lunesSemanaMesPasado.getDate() - diasDesdeLunesUltimoDia - 6
        );
      }

      lunesSemanaMesPasado.setHours(0, 0, 0, 0);
      const finSemanaMesPasado = new Date(lunesSemanaMesPasado);
      finSemanaMesPasado.setDate(finSemanaMesPasado.getDate() + 6);
      finSemanaMesPasado.setHours(23, 59, 59, 999);

      // Calcular mismo día del mes anterior
      const mismoDiaMesPasado = new Date(
        mesPasado.getFullYear(),
        mesPasado.getMonth(),
        hoy.getDate()
      );
      mismoDiaMesPasado.setHours(0, 0, 0, 0);
      const finMismoDiaMesPasado = new Date(mismoDiaMesPasado);
      finMismoDiaMesPasado.setHours(23, 59, 59, 999);

      // Contar bidones vendidos del MES ACTUAL
      let bidonesMesActual = 0;
      let bidonesSemanaActual = 0;
      let bidonesHoy = 0;

      // Contar bidones vendidos del MES PASADO (para comparación)
      let bidonesMesPasado = 0;
      let bidonesSemanaMesPasado = 0; // Misma semana del mes pasado
      let bidonesMismoDiaMesPasado = 0; // Mismo día del mes anterior

      // Contar bidones TOTALES HISTÓRICOS (todos los pedidos desde que hay datos)
      let bidonesTotalesHistoricos = 0;

      // Variables para determinar rango de fechas históricas
      let fechaMasAntigua = null;
      let fechaMasReciente = null;
      let totalPedidosHistoricos = 0;

      // Análisis temporal de pedidos históricos
      const pedidosPorAnio = {};
      const pedidosPorMes = {};
      const bidonesPorAnio = {};
      const bidonesPorMes = {};

      // Validación: detectar pedidos duplicados por ID
      const pedidosIds = new Set();
      const pedidosDuplicados = [];

      // Estadísticas de cálculo de bidones
      let pedidosConCampoExplicito = 0;
      let pedidosCalculadosDesdePrecio = 0;
      let bidonesDesdeCamposExplicitos = 0;
      let bidonesDesdePrecio = 0;
      let sumaPreciosReales = 0;

      let pedidosProcesados = 0;
      let pedidosRechazados = 0;
      let pedidosDelMesDetalle = []; // Para debugging

      pedidosData.forEach((pedido, index) => {
        // FILTRO CRÍTICO: Solo pedidos de Aguas Ancud
        const nombreLocal = pedido.nombrelocal || pedido.nombre_local || "";
        if (nombreLocal !== "Aguas Ancud") {
          pedidosRechazados++;
          return; // Rechazar pedidos de otros locales
        }

        const fechaPedido = parseFechaPedido(pedido.fecha);
        if (!fechaPedido) {
          pedidosRechazados++;
          return;
        }

        const infoBidones = obtenerBidonesPedido(pedido, true);
        let bidonesPedido = infoBidones.bidones;
        let tieneCampoExplicito = infoBidones.tieneCampoExplicito;

        // VALIDACIÓN CRÍTICA: Verificar coherencia con precio
        const precio = parseInt(pedido.precio || pedido.price || 0);
        if (precio > 0 && bidonesPedido > 0) {
          const bidonesDesdePrecio = Math.round(precio / PRECIO_BIDON);
          const diferencia = Math.abs(bidonesPedido - bidonesDesdePrecio);
          const diferenciaPorcentual =
            (diferencia / Math.max(bidonesPedido, bidonesDesdePrecio)) * 100;

          // Si hay una discrepancia significativa (>30%), usar el cálculo desde precio
          if (diferenciaPorcentual > 30) {
            bidonesPedido = bidonesDesdePrecio;
            tieneCampoExplicito = false; // Marcar como calculado desde precio
          }
        }

        if (bidonesPedido <= 0) {
          pedidosRechazados++;
          return;
        }

        // Acumular estadísticas de cálculo
        sumaPreciosReales += precio;

        if (tieneCampoExplicito) {
          pedidosConCampoExplicito++;
          bidonesDesdeCamposExplicitos += bidonesPedido;
        } else {
          pedidosCalculadosDesdePrecio++;
          bidonesDesdePrecio += bidonesPedido;
        }

        // Validar si el pedido es duplicado (mismo ID)
        const pedidoId =
          pedido.id ||
          pedido.idpedido ||
          pedido._id ||
          `${pedido.fecha}-${pedido.usuario}-${pedido.precio}`;
        if (pedidosIds.has(pedidoId)) {
          pedidosDuplicados.push({
            id: pedidoId,
            fecha: pedido.fecha,
            usuario: pedido.usuario,
            precio: pedido.precio,
            bidones: bidonesPedido,
          });
          // NO contar duplicados en el total
          return;
        }
        pedidosIds.add(pedidoId);

        pedidosProcesados++;

        // === CONTAR BIDONES TOTALES HISTÓRICOS ===
        // Todos los pedidos de Aguas Ancud (sin filtro de fecha, pero con filtro de local)
        // IMPORTANTE: Solo incluye pedidos donde nombrelocal === 'Aguas Ancud'
        bidonesTotalesHistoricos += bidonesPedido;
        totalPedidosHistoricos++;

        // Determinar rango de fechas históricas
        if (!fechaMasAntigua || fechaPedido < fechaMasAntigua) {
          fechaMasAntigua = fechaPedido;
        }
        if (!fechaMasReciente || fechaPedido > fechaMasReciente) {
          fechaMasReciente = fechaPedido;
        }

        // Análisis temporal: agrupar por año y mes
        const anio = fechaPedido.getFullYear();
        const mesAnio = `${anio}-${String(fechaPedido.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

        pedidosPorAnio[anio] = (pedidosPorAnio[anio] || 0) + 1;
        pedidosPorMes[mesAnio] = (pedidosPorMes[mesAnio] || 0) + 1;
        bidonesPorAnio[anio] = (bidonesPorAnio[anio] || 0) + bidonesPedido;
        bidonesPorMes[mesAnio] = (bidonesPorMes[mesAnio] || 0) + bidonesPedido;

        // Bidones del mes actual
        // IMPORTANTE: Verificar que la fecha parseada esté en el mes y año correctos
        const esDelMesActual =
          fechaPedido.getMonth() === hoy.getMonth() &&
          fechaPedido.getFullYear() === hoy.getFullYear();

        if (fechaPedido >= inicioMes && esDelMesActual) {
          bidonesMesActual += bidonesPedido;
          pedidosDelMesDetalle.push({
            index: index + 1,
            fecha: pedido.fecha,
            fechaParseada: fechaPedido.toISOString(),
            bidones: bidonesPedido,
            acumulado: bidonesMesActual,
            precio: pedido.precio || pedido.price || "N/A",
          });
        } else if (fechaPedido >= inicioMes && !esDelMesActual) {
          // Fecha fuera del mes actual - ignorar
        }

        // Bidones de la semana actual
        if (fechaPedido >= inicioSemana) {
          bidonesSemanaActual += bidonesPedido;
        }

        // Bidones de hoy
        if (fechaPedido.getTime() === hoy.getTime()) {
          bidonesHoy += bidonesPedido;
        }

        // === CALCULAR BIDONES DEL MES PASADO ===
        // Bidones del mes pasado completo
        if (fechaPedido >= inicioMesPasado && fechaPedido <= finMesPasado) {
          bidonesMesPasado += bidonesPedido;
        }

        // Bidones de la misma semana del mes pasado
        if (
          fechaPedido >= lunesSemanaMesPasado &&
          fechaPedido <= finSemanaMesPasado
        ) {
          bidonesSemanaMesPasado += bidonesPedido;
        }

        // Bidones del mismo día del mes anterior
        if (
          fechaPedido >= mismoDiaMesPasado &&
          fechaPedido <= finMismoDiaMesPasado
        ) {
          bidonesMismoDiaMesPasado += bidonesPedido;
        }
      });

      if (pedidosDuplicados.length > 0) {
        console.error(
          `Pedidos duplicados encontrados: ${pedidosDuplicados.length} (NO incluidos en el total)`
        );
      }

      // Validación: ¿Los precios coinciden con bidones × $2,000?
      const ventasEsperadasDesdePrecios = sumaPreciosReales;
      const ventasCalculadasDesdeBidones =
        bidonesTotalesHistoricos * PRECIO_BIDON;
      const diferenciaPorcentual =
        ventasEsperadasDesdePrecios > 0
          ? ((ventasCalculadasDesdeBidones - ventasEsperadasDesdePrecios) /
              ventasEsperadasDesdePrecios) *
            100
          : 0;

      // DECISIÓN CRÍTICA: Si hay una discrepancia grande (>50%), los campos de cantidad están incorrectos
      // Usar la suma de precios como fuente de verdad y recalcular bidones desde precios
      let ventasTotalesHistoricasFinal = ventasCalculadasDesdeBidones;
      let bidonesTotalesHistoricosCorregidos = bidonesTotalesHistoricos;

      if (diferenciaPorcentual > 50 && ventasEsperadasDesdePrecios > 0) {
        console.error(
          "ADVERTENCIA CRÍTICA: Los campos de cantidad no reflejan la cantidad real. Usando suma de precios como fuente de verdad."
        );
        // Usar suma de precios como fuente de verdad
        ventasTotalesHistoricasFinal = ventasEsperadasDesdePrecios;
        bidonesTotalesHistoricosCorregidos = Math.round(
          ventasEsperadasDesdePrecios / PRECIO_BIDON
        );
        // Actualizar bidonesTotalesHistoricos para mantener coherencia
        bidonesTotalesHistoricos = bidonesTotalesHistoricosCorregidos;
      }

      // Resumen del período histórico
      if (fechaMasAntigua && fechaMasReciente) {
        const diasDiferencia = Math.round(
          (fechaMasReciente - fechaMasAntigua) / (1000 * 60 * 60 * 24)
        );
        const aniosDiferencia = (diasDiferencia / 365).toFixed(1);

        // Calcular meses completos
        const mesesDiferencia = Math.round(
          (fechaMasReciente.getTime() - fechaMasAntigua.getTime()) /
            (1000 * 60 * 60 * 24 * 30.44)
        );
        const mesesCompletos = Math.floor(diasDiferencia / 30.44);

        // Calcular ventas totales históricas
        const ventasTotalesHistoricasCalculadas =
          bidonesTotalesHistoricos * PRECIO_BIDON;

        // Validación de coherencia
        const ventasEsperadas = bidonesTotalesHistoricos * PRECIO_BIDON;
        if (Math.abs(ventasTotalesHistoricasCalculadas - ventasEsperadas) > 1) {
          console.error(
            `ERROR: Las ventas calculadas no coinciden con bidones × $2,000. Bidones: ${bidonesTotalesHistoricos}, Ventas: ${ventasTotalesHistoricasCalculadas}, Esperado: ${ventasEsperadas}`
          );
        }

        // Advertencia si el promedio mensual es muy alto
        const promedioMensual =
          ventasTotalesHistoricasCalculadas / Math.max(mesesCompletos, 1);
        if (promedioMensual > 5000000) {
          console.error(
            `ADVERTENCIA: Promedio mensual > $5M. Verificar datos. Promedio: $${Math.round(
              promedioMensual
            ).toLocaleString("es-CL")}`
          );
        }
      }
      // Obtener ventas del local desde ventasLocalesData
      const ventasLocalMes = ventasLocalesData?.ventas_mes || 0;
      const ventasLocalSemana = ventasLocalesData?.ventas_semana || 0;
      const ventasLocalHoy = ventasLocalesData?.ventas_hoy || 0;
      const bidonesLocalMes = ventasLocalesData?.bidones_mes || 0;
      const bidonesLocalSemana = ventasLocalesData?.bidones_semana || 0;
      const bidonesLocalHoy = ventasLocalesData?.bidones_hoy || 0;
      const ventasLocalTotales = ventasLocalesData?.ventas_totales || 0;

      // Calcular ventas DELIVERY directamente desde bidones vendidos
      const ventasDeliveryMensuales = bidonesMesActual * PRECIO_BIDON;
      const ventasDeliverySemanales = bidonesSemanaActual * PRECIO_BIDON;
      const ventasDeliveryDiarias = bidonesHoy * PRECIO_BIDON;

      // SUMAR VENTAS DEL LOCAL A LAS VENTAS DEL DELIVERY (TOTAL DEL NEGOCIO)
      const ventasMensuales = ventasDeliveryMensuales + ventasLocalMes;
      const ventasSemanales = ventasDeliverySemanales + ventasLocalSemana;
      const ventasDiarias = ventasDeliveryDiarias + ventasLocalHoy;

      // SUMAR BIDONES DEL LOCAL A LOS BIDONES DEL DELIVERY
      const bidonesMesTotal = bidonesMesActual + bidonesLocalMes;
      const bidonesSemanaTotal = bidonesSemanaActual + bidonesLocalSemana;
      const bidonesHoyTotal = bidonesHoy + bidonesLocalHoy;

      // Calcular ventas del mes pasado, misma semana del mes pasado y mismo día del mes anterior
      const ventasMesPasado = bidonesMesPasado * PRECIO_BIDON;
      const ventasSemanaMesPasado = bidonesSemanaMesPasado * PRECIO_BIDON;
      const ventasMismoDiaMesPasado = bidonesMismoDiaMesPasado * PRECIO_BIDON;

      // Calcular ventas totales históricas desde bidones reales (todos los pedidos históricos)
      const ventasTotalesHistoricasDesdeBidones =
        bidonesTotalesHistoricos * PRECIO_BIDON;

      // Calcular totales de los últimos 12 meses vs total histórico
      const mesesUltimos12 = Object.keys(pedidosPorMes).sort().slice(-12);
      const bidonesUltimos12Meses = mesesUltimos12.reduce(
        (sum, mes) => sum + (bidonesPorMes[mes] || 0),
        0
      );
      const ventasUltimos12Meses = bidonesUltimos12Meses * PRECIO_BIDON;

      // Validación crítica: verificar que el cálculo sea razonable
      if (ventasTotalesHistoricasDesdeBidones > 100000000) {
        console.error(
          "ERROR CRÍTICO: Ventas totales históricas > 100M. Verificar datos."
        );
      }

      // Validar discrepancia entre ambos cálculos
      const ventasDesdeEndpoint = ventasTotalesHistoricas.ventas_totales || 0;
      const diferencia = Math.abs(
        ventasTotalesHistoricasDesdeBidones - ventasDesdeEndpoint
      );
      const porcentajeDiferencia =
        ventasDesdeEndpoint > 0 ? (diferencia / ventasDesdeEndpoint) * 100 : 0;

      if (ventasDesdeEndpoint > 0 && porcentajeDiferencia > 10) {
        console.error(
          `DISCREPANCIA EN VENTAS HISTÓRICAS: Desde bidones: $${ventasTotalesHistoricasDesdeBidones.toLocaleString(
            "es-CL"
          )}, Desde endpoint: $${ventasDesdeEndpoint.toLocaleString(
            "es-CL"
          )}, Diferencia: ${porcentajeDiferencia.toFixed(1)}%`
        );
      }

      // Validar coherencia con gráficos mensuales (solo para información, NO para cambiar el valor)
      // El card de "Ventas Totales Históricas" debe mostrar TODOS los datos históricos sin restricciones
      if (
        ventasHistoricas &&
        Array.isArray(ventasHistoricas) &&
        ventasHistoricas.length > 0
      ) {
        const sumaVentasMensuales = ventasHistoricas.reduce(
          (sum, mes) => sum + (mes.ventas || 0),
          0
        );
        const diferenciaConGraficos = Math.abs(
          ventasTotalesHistoricasDesdeBidones - sumaVentasMensuales
        );
        const porcentajeDiferenciaGraficos =
          sumaVentasMensuales > 0
            ? (diferenciaConGraficos / sumaVentasMensuales) * 100
            : 0;

        if (porcentajeDiferenciaGraficos > 20) {
          console.error(
            `ADVERTENCIA: Gran diferencia entre gráfico y total histórico. Diferencia: ${porcentajeDiferenciaGraficos.toFixed(
              1
            )}%`
          );
        }
      }

      // SIEMPRE usar el cálculo desde bidones históricos completos (sin restricciones)
      // ventasTotalesHistoricasFinal ya se calculó arriba con la validación de discrepancia

      // VALIDACIÓN CRÍTICA: Las ventas deben ser bidones × $2,000
      const ventasEsperadas = bidonesMesActual * PRECIO_BIDON;
      if (ventasMensuales !== ventasEsperadas) {
        console.error(
          "❌ ERROR: Las ventas mensuales no coinciden con bidones × $2,000"
        );
        console.error(
          `Bidones: ${bidonesMesActual}, Ventas calculadas: ${ventasMensuales}, Esperado: ${ventasEsperadas}`
        );
      }
      // Sumar ventas del mes pasado del local
      const ventasLocalMesPasado = ventasLocalesData?.ventas_mes_anterior || 0;
      const ventasMesPasadoTotal = ventasMesPasado + ventasLocalMesPasado;

      // Calcular meta incluyendo ventas del local
      const meta = calcularMeta(ventasMesPasadoTotal);
      const progresoMeta = calcularProgresoMeta(ventasMensuales, meta);
      const ticketPromedio = calcularTicketPromedio(
        ventasMensuales,
        kpisData.total_pedidos_mes
      );

      // Calcular tickets promedio por origen (Local vs Delivery)
      // Pedidos delivery = pedidos del mes actual (solo Aguas Ancud)
      const pedidosDelivery = pedidosDelMesDetalle.length;
      // Pedidos local = estimado desde ventasLocalesData o desde kpisData
      const pedidosLocal =
        ventasLocalesData?.compras_mes || ventasLocalesData?.pedidos_mes || 0;
      const ticketPromedioDelivery =
        pedidosDelivery > 0
          ? calcularTicketPromedio(ventasDeliveryMensuales, pedidosDelivery)
          : 0;
      const ticketPromedioLocal =
        pedidosLocal > 0
          ? calcularTicketPromedio(ventasLocalMes, pedidosLocal)
          : 0;

      // VALIDACIONES Y CORRECCIONES DE INCONSISTENCIAS
      // 1. Calcular IVA correctamente: Si el precio de venta INCLUYE IVA (caso Chile)
      // IVA incluido = Ventas × 0.19 / 1.19 (porque el precio ya incluye el IVA)
      // Si el precio NO incluye IVA, sería: IVA = Ventas × 0.19
      // Asumimos que el precio de $2,000 por bidón INCLUYE IVA
      const IVA_RATE = 0.19; // 19% IVA Chile
      let ivaCorregido = (ventasMensuales * IVA_RATE) / (1 + IVA_RATE); // IVA incluido en precio

      // Si hay un IVA del backend que es diferente, validar y usar el más razonable
      if (kpisData.iva && kpisData.iva > 0) {
        // Si el IVA del backend es razonable (entre 15% y 20% de ventas), usarlo
        const ivaPorcentajeBackend = (kpisData.iva / ventasMensuales) * 100;
        if (ivaPorcentajeBackend >= 15 && ivaPorcentajeBackend <= 20) {
          ivaCorregido = kpisData.iva;
        }
      }

      // Validar que IVA no sea mayor que ventas
      if (ivaCorregido > ventasMensuales) {
        ivaCorregido = Math.min(
          ivaCorregido,
          (ventasMensuales * IVA_RATE) / (1 + IVA_RATE)
        );
      }

      // Los bidones del mes pasado ya se calcularon desde pedidos reales arriba
      // No necesitamos recalcular desde litros

      // Calcular costos del mes actual: 260,000 (cuota camión fijo) + (tapas unitarias × bidones vendidos)
      // Nota: Los costos solo incluyen delivery (el local tiene costos separados)
      const COSTO_CUOTA_CAMION = 260000; // Cuota fija del camión
      const COSTO_TAPA_UNITARIA = 60.69; // Costo de tapa unitaria por bidón
      const costosMesActual =
        COSTO_CUOTA_CAMION + bidonesMesActual * COSTO_TAPA_UNITARIA;

      // Calcular costos del mes pasado desde bidones reales (solo delivery)
      const costosMesPasado =
        COSTO_CUOTA_CAMION + bidonesMesPasado * COSTO_TAPA_UNITARIA;

      // 2. Validar cálculo de utilidades: Ventas - Costos (usando costos calculados)
      const utilidadesCalculadas = ventasMensuales - costosMesActual;
      const utilidadesCorregidas =
        kpisData.utilidad !== undefined
          ? kpisData.utilidad
          : utilidadesCalculadas;

      // Calcular utilidades por origen (Local vs Delivery)
      // Nota: Los costos solo aplican a delivery (cuota camión + tapas)
      // El local tiene sus propios costos que no se incluyen aquí
      const utilidadesDelivery = ventasDeliveryMensuales - costosMesActual;
      const utilidadesLocal = ventasLocalMes; // Asumiendo que el local no tiene costos adicionales aquí

      // Calcular utilidades del mes pasado
      const utilidadesMesPasado = ventasMesPasado - costosMesPasado;

      // Calcular IVA del mes pasado (IVA incluido en precio: 19% / 1.19 de ventas)
      const ivaMesPasado = (ventasMesPasado * IVA_RATE) / (1 + IVA_RATE);

      // 3. Verificar coherencia: Ticket Promedio * Pedidos = Ventas Mensuales (aproximadamente)
      const ventasCalculadasDesdeTicket =
        ticketPromedio * (kpisData.total_pedidos_mes || 0);
      const diferenciaVentas = Math.abs(
        ventasMensuales - ventasCalculadasDesdeTicket
      );
      if (ventasMensuales > 0 && diferenciaVentas > ventasMensuales * 0.1) {
        // Más del 10% de diferencia - registrar error pero continuar
        console.error(
          `Inconsistencia detectada entre Ticket Promedio * Pedidos y Ventas Mensuales. Ventas desde bidones: ${ventasMensuales}, Ventas desde ticket: ${ventasCalculadasDesdeTicket}`
        );
      }

      // Calcular clientes inactivos (aproximación)
      const clientesInactivos = Math.max(
        0,
        Math.round(kpisData.clientes_activos * 0.2)
      );

      // Calcular porcentaje de capacidad utilizada basado en litros vendidos
      // SUMA: Litros Delivery + Litros Local (usando totales combinados)
      const litrosDelivery = bidonesMesActual * 20; // Cada bidón = 20 litros
      const litrosLocal = bidonesLocalMes * 20; // Cada bidón = 20 litros
      const litrosVendidos = litrosDelivery + litrosLocal;
      const capacidadTotal = 30000; // Capacidad fija de 30,000 litros mensuales
      const porcentajeCapacidad = calcularPorcentajeCapacidad(
        litrosVendidos,
        capacidadTotal
      );

      // Calcular bidones vendidos totales (ya tenemos bidonesMesTotal)
      const bidonesVendidos = bidonesMesTotal;

      // Calcular días transcurridos en el mes actual
      const diasActuales = hoy.getDate();
      const diasAnterior = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        0
      ).getDate(); // Días del mes anterior

      // Calcular proyección para pedidos del mes
      const pedidosMesPasadoProyectado =
        ((kpisData.total_pedidos_mes_pasado || 0) / diasAnterior) *
        diasActuales;
      const porcentajeCambioProyectado = calcularPorcentajeCambioProyectado(
        kpisData.total_pedidos_mes || 0,
        kpisData.total_pedidos_mes_pasado || 0,
        diasActuales,
        diasAnterior
      );

      // Actualizar estado con datos completos (incluyendo pedidos y gráficos)
      // Si es carga inicial, ya actualizamos antes, solo agregamos campos adicionales
      setData((prev) => ({
        ...prev, // Mantener datos previos (ya establecidos en carga inicial)
        // Ventas totales históricas: SIEMPRE usar TODOS los datos históricos (sin restricciones de tiempo)
        // Objetivo: mostrar el flujo monetario histórico completo del negocio desde el inicio
        // NO usar ventasTotalesHistoricas.ventas_totales del endpoint porque suma campos "precio" que pueden estar incorrectos
        // Sumar ventas del local a las ventas históricas de delivery
        ventasTotalesHistoricas:
          ventasTotalesHistoricasFinal > 0
            ? ventasTotalesHistoricasFinal + (ventasLocalTotales || 0)
            : prev.ventasTotalesHistoricas || 0,
        pedidos: kpisData.total_pedidos_mes || 0,
        clientes: kpisData.clientes_activos || 0,
        eficiencia: 94.2, // Mantener valor fijo por ahora
        capacidad: kpisData.capacidad_utilizada || 0,
        litros: kpisData.litros_vendidos || 0,
        // Ventas calculadas directamente desde bidones vendidos (bidones × $2,000)
        ventasMensuales: ventasMensuales,
        ventasSemanales: ventasSemanales,
        ventasDiarias: ventasDiarias,
        // Ventas del mes pasado calculadas desde bidones reales (Delivery + Local)
        ventasMesPasado: ventasMesPasadoTotal,
        ventasSemanaMesPasado: ventasSemanaMesPasado,
        ventasMismoDiaMesPasado: ventasMismoDiaMesPasado,
        // Bidones calculados directamente desde pedidos + bidones del local
        bidones: bidonesMesTotal,
        // IVA corregido (validado para no exceder ventas)
        iva: ivaCorregido,
        // Costos calculados: 260,000 (cuota camión) + (tapas unitarias × bidones vendidos)
        // Nota: Los costos solo incluyen delivery, el local tiene costos separados
        costos: costosMesActual,
        // Datos desglosados para insights (Local vs Delivery)
        ventasDelivery: {
          mensual: ventasDeliveryMensuales,
          semanal: ventasDeliverySemanales,
          diaria: ventasDeliveryDiarias,
          bidones: bidonesMesActual,
        },
        ventasLocal: {
          mensual: ventasLocalMes,
          semanal: ventasLocalSemana,
          diaria: ventasLocalHoy,
          bidones: bidonesLocalMes,
          totales: ventasLocalTotales,
        },
        costosMesPasado: costosMesPasado,
        // Utilidades corregidas (validadas: Ventas - Costos)
        utilidades: utilidadesCorregidas,
        utilidadesLocal: utilidadesLocal,
        utilidadesDelivery: utilidadesDelivery,
        meta: progresoMeta,
        ticketPromedio: ticketPromedio,
        ticketPromedioLocal: ticketPromedioLocal,
        ticketPromedioDelivery: ticketPromedioDelivery,
        pedidosLocal: pedidosLocal,
        pedidosDelivery: pedidosDelivery,
        clientesActivos: kpisData.clientes_activos || 0,
        pedidosMes: kpisData.total_pedidos_mes || 0,
        clientesInactivos: clientesInactivos,
        pedidosMesPasado: kpisData.total_pedidos_mes_pasado || 0,
        capacidadUtilizada: porcentajeCapacidad,
        litrosVendidos: litrosVendidos,
        capacidadTotal: capacidadTotal,
        ventasHistoricas: ventasHistoricas,
        bidonesMesPasado: bidonesMesPasado,
        bidonesSemanaMesPasado: bidonesSemanaMesPasado,
        bidonesMismoDiaMesPasado: bidonesMismoDiaMesPasado,
        bidonesTotalesHistoricos: bidonesTotalesHistoricos,
        // Rango de fechas históricas
        fechaMasAntiguaHistorica: fechaMasAntigua
          ? fechaMasAntigua.toISOString()
          : null,
        fechaMasRecienteHistorica: fechaMasReciente
          ? fechaMasReciente.toISOString()
          : null,
        totalPedidosHistoricos: totalPedidosHistoricos,
        // IVA y utilidades del mes pasado calculados desde ventas reales
        ivaMesPasado: ivaMesPasado,
        utilidadesMesPasado: utilidadesMesPasado,
        ticketPromedioMesPasado: kpisData.ticket_promedio_mes_pasado || 0,
        clientesActivosMesPasado: kpisData.clientes_activos_mes_pasado || 0,
        clientesInactivosMesPasado: kpisData.clientes_inactivos_mes_pasado || 0,
        porcentajeCambioProyectado: porcentajeCambioProyectado,
        esPositivoProyectado:
          (kpisData.total_pedidos_mes || 0) >= pedidosMesPasadoProyectado,
      }));

      // Ocultar loading después de cargar todos los datos
      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error("❌ Error obteniendo datos:", err);
      setError("Error al cargar los datos del dashboard");
      setLoading(false);
      setIsRefreshing(false);
    } finally {
      // Asegurar que siempre se limpie el estado de refreshing
      setIsRefreshing(false);
    }
  };

  // Función para actualización manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(false); // Actualización manual sin loading inicial
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Carga inicial con loading
    fetchData(true);

    // Actualización automática cada 5 minutos (sin ocultar contenido)
    const interval = setInterval(() => {
      fetchData(false);
    }, 5 * 60 * 1000); // 5 minutos

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      fetchData(false);
    };

    window.addEventListener("globalRefresh", handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("globalRefresh", handleGlobalRefresh);
    };
  }, []);

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
    compactCards: { x: 700, y: 580 },
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
    compactCards: { width: 640, height: 320 },
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
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
        <Typography variant="h6" sx={{ color: "error.main" }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Header fijo mejorado */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: { xs: 0, md: "240px" },
          right: 0,
          zIndex: 1000,
          bgcolor: "background.default",
          padding: { xs: 2, md: 4 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          backdropFilter: "blur(20px)",
          height: "auto",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
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
              Dashboard Aguas Ancud
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color:
                  theme.palette.mode === "dark" ? "text.secondary" : "#1a1a1a",
                fontSize: "1rem",
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              Panel de control y métricas en tiempo real
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={resetLayout}
            sx={{
              mt: { xs: 1, md: 0 },
              color: "primary.main",
              borderColor: "primary.main",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.dark",
                backgroundColor: "primary.main",
                color: "white",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Resetear Layout
          </Button>
        </Box>
      </Box>

      {/* Contenedor principal mejorado */}
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          padding: { xs: 2, md: 4 },
          paddingTop: "220px", // Espacio para el header fijo mejorado
          position: "relative",
          overflow: "auto",
          height: "100vh",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
              : "linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.005) 100%)",
        }}
      >
        {/* Contenido principal */}
        <Box
          sx={{
            position: "relative",
            minHeight: "calc(100vh - 220px)",
            width: "100%",
            paddingBottom: "400px",
            maxWidth: "100%",
            margin: "0 auto",
            overflow: "visible",
          }}
        >
          {/* Cards principales */}
          {/* Ventas Totales Históricas */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.ventasTotales.x,
              top: cardPositions.ventasTotales.y,
              width: cardSizes.ventasTotales.width,
              height: cardSizes.ventasTotales.height,
              zIndex: 1,
            }}
          >
            <VentasCard
              title="Ventas Totales Históricas"
              value={data.ventasTotalesHistoricas}
              subtitle="Acumulado desde el inicio"
              percentageChange={calcularPorcentajeCambio(
                data.ventas,
                data.ventasMesPasado
              )}
              isPositive={data.ventas >= data.ventasMesPasado}
              fechaInicio={data.fechaMasAntiguaHistorica}
              fechaFin={data.fechaMasRecienteHistorica}
              totalPedidos={data.totalPedidosHistoricos}
              ventasLocal={data.ventasLocal?.totales || 0}
              ventasDelivery={
                (data.ventasTotalesHistoricas || 0) -
                (data.ventasLocal?.totales || 0)
              }
            />
          </Box>

          {/* Ventas Mensuales */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.ventasMensuales.x,
              top: cardPositions.ventasMensuales.y,
              width: cardSizes.ventasMensuales.width,
              height: cardSizes.ventasMensuales.height,
              zIndex: 1,
            }}
          >
            <VentasMensualesCard
              value={data.ventasMensuales}
              previousValue={data.ventasMesPasado || 0}
              percentageChange={calcularPorcentajeCambio(
                data.ventasMensuales,
                data.ventasMesPasado || 0
              )}
              isPositive={data.ventasMensuales >= (data.ventasMesPasado || 0)}
              historicalData={data.ventasHistoricas || []}
              ventasLocal={data.ventasLocal?.mensual || 0}
              ventasDelivery={data.ventasDelivery?.mensual || 0}
            />
          </Box>

          {/* Ventas Semanales */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.ventasSemanales.x,
              top: cardPositions.ventasSemanales.y,
              width: cardSizes.ventasSemanales.width,
              height: cardSizes.ventasSemanales.height,
              zIndex: 1,
            }}
          >
            <VentasSemanalesCard
              value={data.ventasSemanales}
              percentageChange={calcularPorcentajeCambio(
                data.ventasSemanales,
                data.ventasSemanaMesPasado || 0
              )}
              isPositive={
                data.ventasSemanales >= (data.ventasSemanaMesPasado || 0)
              }
              ventasLocal={data.ventasLocal?.semanal || 0}
              ventasDelivery={data.ventasDelivery?.semanal || 0}
            />
          </Box>

          {/* Ventas Diarias */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.ventasDiarias.x,
              top: cardPositions.ventasDiarias.y,
              width: cardSizes.ventasDiarias.width,
              height: cardSizes.ventasDiarias.height,
              zIndex: 1,
            }}
          >
            <VentasDiariasCard
              value={data.ventasDiarias}
              percentageChange={calcularPorcentajeCambio(
                data.ventasDiarias,
                data.ventasMismoDiaMesPasado || 0
              )}
              isPositive={
                data.ventasDiarias >= (data.ventasMismoDiaMesPasado || 0)
              }
              ventasLocal={data.ventasLocal?.diaria || 0}
              ventasDelivery={data.ventasDelivery?.diaria || 0}
            />
          </Box>

          {/* Bidones */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.bidones.x,
              top: cardPositions.bidones.y,
              width: cardSizes.bidones.width,
              height: cardSizes.bidones.height,
              zIndex: 1,
            }}
          >
            <BidonesCard
              value={data.bidones}
              previousValue={data.bidonesMesPasado || 0}
              percentageChange={calcularPorcentajeCambio(
                data.bidones,
                data.bidonesMesPasado || 0
              )}
              isPositive={data.bidones >= (data.bidonesMesPasado || 0)}
              historicalData={data.ventasHistoricas || []}
              bidonesLocal={data.ventasLocal?.bidones || 0}
              bidonesDelivery={data.ventasDelivery?.bidones || 0}
            />
          </Box>

          {/* IVA */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.iva.x,
              top: cardPositions.iva.y,
              width: cardSizes.iva.width,
              height: cardSizes.iva.height,
              zIndex: 1,
            }}
          >
            <IvaCard
              value={data.iva}
              previousValue={data.ivaMesPasado || 0}
              percentageChange={calcularPorcentajeCambio(
                data.iva,
                data.ivaMesPasado || 0
              )}
              isPositive={data.iva >= (data.ivaMesPasado || 0)}
              historicalData={data.ventasHistoricas || []}
            />
          </Box>

          {/* Costos */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.costos.x,
              top: cardPositions.costos.y,
              width: cardSizes.costos.width,
              height: cardSizes.costos.height,
              zIndex: 1,
            }}
          >
            <CostosCard
              value={data.costos}
              percentageChange={calcularPorcentajeCambio(
                data.costos,
                data.costosMesPasado || 0
              )}
              isPositive={data.costos <= (data.costosMesPasado || 0)}
              historicalData={data.ventasHistoricas || []}
              costoCuotaCamion={260000}
              costoTapaUnitaria={60.69}
              bidonesVendidos={data.ventasDelivery?.bidones || 0}
              costosMesPasado={data.costosMesPasado || 0}
            />
          </Box>

          {/* Utilidades */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.utilidades.x,
              top: cardPositions.utilidades.y,
              width: cardSizes.utilidades.width,
              height: cardSizes.utilidades.height,
              zIndex: 1,
            }}
          >
            <UtilidadesCard
              value={data.utilidades}
              percentageChange={calcularPorcentajeCambio(
                data.utilidades,
                data.utilidadesMesPasado || 0
              )}
              isPositive={data.utilidades >= (data.utilidadesMesPasado || 0)}
              utilidadesLocal={data.utilidadesLocal || 0}
              utilidadesDelivery={data.utilidadesDelivery || 0}
            />
          </Box>

          {/* KPI Meta */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.kpiMeta.x,
              top: cardPositions.kpiMeta.y,
              width: cardSizes.kpiMeta.width,
              height: cardSizes.kpiMeta.height,
              zIndex: 1,
            }}
          >
            <KpiMetaCard
              currentValue={data.ventasMensuales}
              targetValue={calcularMeta(data.ventasMesPasado)}
              percentage={data.meta}
              title="Meta de Ventas"
              subtitle="Objetivo Mensual"
              description="Progreso respecto a la meta establecida para este mes."
              ventasLocal={data.ventasLocal?.mensual || 0}
              ventasDelivery={data.ventasDelivery?.mensual || 0}
            />
          </Box>

          {/* Capacidad */}
          <Box
            sx={{
              position: "absolute",
              left: cardPositions.capacidad.x,
              top: cardPositions.capacidad.y,
              width: cardSizes.capacidad.width,
              height: cardSizes.capacidad.height,
              zIndex: 1,
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
              position: "absolute",
              left: cardPositions.compactCards.x,
              top: cardPositions.compactCards.y,
              width: cardSizes.compactCards.width,
              height: cardSizes.compactCards.height,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 1.5,
                height: "100%",
                padding: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <FinancialKpiCard
                title="Ticket Promedio"
                value={data.ticketPromedio}
                subtitle="Por pedido"
                icon="💰"
                trend={`${calcularPorcentajeCambio(
                  data.ticketPromedio,
                  data.ticketPromedioMesPasado || 0
                ).toFixed(1)}%`}
                isPositive={
                  data.ticketPromedio >= (data.ticketPromedioMesPasado || 0)
                }
                ticketPromedioLocal={data.ticketPromedioLocal || 0}
                ticketPromedioDelivery={data.ticketPromedioDelivery || 0}
                ventasLocal={data.ventasLocal?.mensual || 0}
                ventasDelivery={data.ventasDelivery?.mensual || 0}
                pedidosLocal={data.pedidosLocal || 0}
                pedidosDelivery={data.pedidosDelivery || 0}
              />
              <FinancialKpiCard
                title="Clientes Activos"
                value={data.clientesActivos}
                subtitle="Este mes"
                icon="👥"
                trend={`${calcularPorcentajeCambio(
                  data.clientesActivos,
                  data.clientesActivosMesPasado || 0
                ).toFixed(1)}%`}
                isPositive={
                  data.clientesActivos >= (data.clientesActivosMesPasado || 0)
                }
              />
              <FinancialKpiCard
                title="Pedidos del Mes"
                value={data.pedidosMes}
                subtitle="Total"
                icon="📦"
                trend={`${data.porcentajeCambioProyectado.toFixed(1)}%`}
                isPositive={data.esPositivoProyectado}
                ventasLocalMes={data.ventasLocal?.mensual || 0}
              />
              <FinancialKpiCard
                title="Clientes Inactivos"
                value={data.clientesInactivos}
                subtitle="Este mes"
                icon="⏸️"
                trend={`${calcularPorcentajeCambio(
                  data.clientesInactivos,
                  data.clientesInactivosMesPasado || 0
                ).toFixed(1)}%`}
                isPositive={
                  data.clientesInactivos <=
                  (data.clientesInactivosMesPasado || 0)
                }
              />
            </Box>
          </Box>

          {/* GRÁFICOS SIEMPRE AL FINAL - FUERA DEL FLUJO NORMAL */}
          <Box
            sx={{
              position: "absolute",
              top: "1000px", // Reducir espacio - posición más cercana a los cards
              left: 0,
              right: 0,
              display: "flex",
              gap: 3,
              justifyContent: "flex-start",
              zIndex: 1, // Asegurar que estén por encima del fondo
            }}
          >
            <Box sx={{ flex: 2 }}>
              <ChartCard
                title="Ventas Históricas"
                data={data.ventasHistoricas}
                type="bar"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <PedidosPorBloqueDonut title="Pedidos por Horario" />
            </Box>
          </Box>

          {/* ESTADO DE RESULTADOS - ENTRE GRÁFICOS Y ANÁLISIS FINANCIERO */}
          <Box
            sx={{
              position: "absolute",
              top: "1500px", // Más espacio después de los gráficos superiores
              left: 0,
              right: 0,
              zIndex: 1,
              px: { xs: 1, md: 3 },
              maxWidth: "100%",
              overflow: "visible",
              mt: 4,
            }}
          >
            <EstadoResultadosCard />
          </Box>

          {/* ANÁLISIS DE RENTABILIDAD - ABAJO DEL ESTADO DE RESULTADOS */}
          <Box
            sx={{
              position: "absolute",
              top: "2800px", // Más espacio después del estado de resultados para evitar solapamiento
              left: 0,
              right: 0,
              zIndex: 1,
              overflow: "visible",
            }}
          >
            <RentabilidadCard
              kpiData={{
                ventasMensuales: data.ventasMensuales,
                ventasMesPasado: data.ventasMesPasado,
                ventasSemanales: data.ventasSemanales,
                ventasDiarias: data.ventasDiarias,
                costos: data.costos,
                costosMesPasado: data.costosMesPasado,
                utilidades: data.utilidades,
                utilidadesMesPasado: data.utilidadesMesPasado,
                bidones: data.bidones,
                bidonesMesPasado: data.bidonesMesPasado,
                bidonesTotalesHistoricos: data.bidonesTotalesHistoricos,
                ventasTotalesHistoricas: data.ventasTotalesHistoricas,
                iva: data.iva,
                ivaMesPasado: data.ivaMesPasado,
                ticketPromedio: data.ticketPromedio,
                pedidosMes: data.pedidosMes,
                pedidosMesPasado: data.pedidosMesPasado,
                clientesActivos: data.clientesActivos,
                clientesActivosMesPasado: data.clientesActivosMesPasado,
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
