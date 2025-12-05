import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  useTheme,
  Grid,
  Tooltip,
  Chip,
} from "@mui/material";
import { getPedidos } from "../services/api";
import "leaflet/dist/leaflet.css";
import "./MapaCalor.css";

// URL dinámica que funciona en desarrollo y producción (misma lógica que api.js)
const API_URL =
  import.meta.env.VITE_API_URL || "https://backenddashboard-vh7d.onrender.com";

// Función local para parsear fechas (DD-MM-YYYY o ISO)
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

// Función local para obtener pedidos de un cliente específico
function obtenerPedidosCliente(pedidos, address, user, phone) {
  if (!pedidos || pedidos.length === 0) return [];

  const addressLower = (address || "").trim().toLowerCase();
  const userLower = (user || "").trim().toLowerCase();
  const phoneLower = (phone || "").trim().toLowerCase();

  return pedidos.filter((p) => {
    // Coincidencia por dirección
    const dirPedido = (p.dire || p.direccion || p.customer?.address || "")
      .trim()
      .toLowerCase();
    const matchDireccion =
      addressLower && dirPedido && dirPedido === addressLower;

    // Coincidencia por email/usuario
    const emailPedido = (
      p.usuario ||
      p.customer?.email ||
      p.customer?.name ||
      ""
    )
      .trim()
      .toLowerCase();
    const matchEmail = userLower && emailPedido && emailPedido === userLower;

    // Coincidencia por teléfono
    const telPedido = (p.telefonou || p.phone || p.customer?.phone || "")
      .trim()
      .toLowerCase();
    const matchTelefono = phoneLower && telPedido && telPedido === phoneLower;

    return matchDireccion || matchEmail || matchTelefono;
  });
}

// Función local para calcular ticket promedio
function calcularTicketPromedio(pedidosCliente) {
  if (!pedidosCliente || pedidosCliente.length === 0) return 0;

  const total = pedidosCliente.reduce((sum, p) => {
    const precio = parseFloat(p.precio || p.price || 0);
    return sum + (isNaN(precio) ? 0 : precio);
  }, 0);

  return pedidosCliente.length > 0 ? total / pedidosCliente.length : 0;
}

// Función local para calcular total gastado histórico
function calcularTotalGastado(pedidosCliente) {
  if (!pedidosCliente || pedidosCliente.length === 0) return 0;

  return pedidosCliente.reduce((sum, p) => {
    const precio = parseFloat(p.precio || p.price || 0);
    return sum + (isNaN(precio) ? 0 : precio);
  }, 0);
}

// Función local para calcular promedio de días entre pedidos
function calcularPromedioDiasEntrePedidos(pedidosCliente) {
  if (!pedidosCliente || pedidosCliente.length < 2) return null;

  // Obtener fechas válidas y ordenarlas
  const fechas = pedidosCliente
    .map((p) => {
      const fechaStr = p.fecha || p.createdAt || p.deliveryDate;
      return parseFecha(fechaStr);
    })
    .filter((f) => f !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (fechas.length < 2) return null;

  // Calcular diferencias entre pedidos consecutivos
  const diferencias = [];
  for (let i = 1; i < fechas.length; i++) {
    const diff =
      (fechas[i].getTime() - fechas[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    diferencias.push(diff);
  }

  // Promediar las diferencias
  const promedio =
    diferencias.reduce((sum, diff) => sum + diff, 0) / diferencias.length;
  return Math.round(promedio);
}

// Función local para obtener método de pago del último pedido
function obtenerMetodoPagoUltimoPedido(pedidosCliente) {
  if (!pedidosCliente || pedidosCliente.length === 0) return null;

  // Ordenar por fecha (más reciente primero)
  const pedidosOrdenados = [...pedidosCliente].sort((a, b) => {
    const fa = parseFecha(a.fecha || a.createdAt || a.deliveryDate);
    const fb = parseFecha(b.fecha || b.createdAt || b.deliveryDate);
    if (!fa || !fb) return 0;
    return fb.getTime() - fa.getTime();
  });

  const ultimoPedido = pedidosOrdenados[0];
  if (!ultimoPedido) return null;

  // Obtener método de pago (compatible con ambos esquemas)
  const metodoPago =
    ultimoPedido.metodopago || ultimoPedido.paymentMethod || null;

  if (!metodoPago) return null;

  // Normalizar método de pago
  const metodoLower = (metodoPago || "").toLowerCase();
  if (metodoLower.includes("efectivo")) return "Efectivo";
  if (metodoLower.includes("transfer")) return "Transferencia";
  if (metodoLower.includes("tarjeta") || metodoLower.includes("webpay"))
    return "Tarjeta";
  if (metodoLower.includes("mercadopago")) return "MercadoPago";

  // Capitalizar primera letra
  return metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1).toLowerCase();
}

// Componente para exponer el mapa al componente padre
function MapController({ onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

// Componente para manejar el zoom dinámicamente
function ZoomAwareCircles({ mapData, pedidos, circleRefs }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map]);

  // Función para obtener color basado en concentración
  const getColorByConcentration = (totalSpent) => {
    const amount = parseInt(totalSpent) || 0;

    if (amount > 15000) return "#ff0000"; // Rojo - alta concentración
    if (amount > 10000) return "#ff6600"; // Naranja - media-alta
    if (amount > 6000) return "#ffcc00"; // Amarillo - media
    if (amount > 3000) return "#99cc00"; // Verde-amarillo - baja-media
    return "#00cc00"; // Verde - baja concentración
  };

  // Función para obtener radio basado en concentración Y ZOOM - LÓGICA CORREGIDA
  const getRadiusByConcentrationAndZoom = (totalSpent) => {
    const amount = parseInt(totalSpent) || 0;

    // Radio base según concentración
    let baseRadius;
    if (amount > 15000) baseRadius = 3; // Alta concentración
    else if (amount > 10000) baseRadius = 2.5; // Media-alta
    else if (amount > 6000) baseRadius = 2; // Media
    else if (amount > 3000) baseRadius = 1.5; // Baja-media
    else baseRadius = 1; // Baja concentración

    // Ajustar según el zoom - LÓGICA INVERTIDA
    // Zoom alto (acercado) = círculos más pequeños
    // Zoom bajo (alejado) = círculos más grandes
    const zoomFactor = Math.max(0.3, Math.min(2, (18 - zoom) / 6)); // Factor entre 0.3 y 2
    return baseRadius * zoomFactor;
  };

  // Validar que mapData sea un array y tenga datos
  if (!mapData || !Array.isArray(mapData) || mapData.length === 0) {
    return null;
  }

  return mapData
    .map((point, index) => {
      // Validar que el punto tenga coordenadas válidas
      if (
        !point ||
        !point.lat ||
        !point.lng ||
        isNaN(point.lat) ||
        isNaN(point.lng)
      ) {
        return null;
      }

      const totalSpent = parseInt(point.total_spent) || 0;
      const radius = getRadiusByConcentrationAndZoom(totalSpent);

      const circleKey = `${point.lat}-${point.lng}`;
      const circleRef = circleRefs?.current?.[circleKey];

      return (
        <Circle
          ref={(el) => {
            if (el && circleRefs?.current) {
              // Intentar obtener el elemento Leaflet de diferentes maneras
              let leafletElement = null;

              // React-Leaflet puede almacenar el elemento Leaflet de diferentes formas
              if (el.leafletElement) {
                leafletElement = el.leafletElement;
              } else if (el.contextValue?.leafletElement) {
                leafletElement = el.contextValue.leafletElement;
              } else if (el.getLatLng && typeof el.openPopup === "function") {
                // Si el elemento tiene métodos de Leaflet, es el elemento mismo
                leafletElement = el;
              } else if (el.leafletElement?.leafletElement) {
                leafletElement = el.leafletElement.leafletElement;
              }

              // Guardar tanto el componente React como el elemento Leaflet
              circleRefs.current[circleKey] = {
                reactComponent: el,
                leafletElement: leafletElement,
              };
            }
          }}
          key={circleKey}
          center={[parseFloat(point.lat), parseFloat(point.lng)]}
          radius={radius * 50} // Convertir a metros
          pathOptions={{
            color: getColorByConcentration(totalSpent),
            fillColor: getColorByConcentration(totalSpent),
            fillOpacity: 0.7,
            weight: 0.5,
          }}
        >
          <Popup>
            <div
              style={{
                minWidth: "280px",
                maxWidth: "320px",
                fontFamily:
                  '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "12px 16px",
                  margin: "-10px -10px 12px -10px",
                  borderRadius: "4px 4px 0 0",
                  borderBottom: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📍</span>
                  Información del Cliente
                </h3>
              </div>

              {/* Contenido */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* Dirección */}
                <div
                  style={{
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginBottom: "4px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Dirección
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {point.address || "N/A"}
                  </div>
                </div>

                {/* Teléfono */}
                <div
                  style={{
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginBottom: "4px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Teléfono
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {point.phone || "N/A"}
                  </div>
                </div>

                {(() => {
                  // Obtener pedidos del cliente
                  const pedidosCliente = obtenerPedidosCliente(
                    pedidos,
                    point.address,
                    point.user,
                    point.phone
                  );

                  // Calcular valores
                  const ticketPromedio = calcularTicketPromedio(pedidosCliente);
                  const totalGastado = calcularTotalGastado(pedidosCliente);
                  const promedioDias =
                    calcularPromedioDiasEntrePedidos(pedidosCliente);
                  const metodoPago =
                    obtenerMetodoPagoUltimoPedido(pedidosCliente);

                  // Obtener fecha del último pedido
                  let fechaUltimoPedido = point.fecha_ultimo_pedido || "N/A";
                  if (pedidosCliente.length > 0) {
                    const pedidosOrdenados = [...pedidosCliente].sort(
                      (a, b) => {
                        const fa = parseFecha(
                          a.fecha || a.createdAt || a.deliveryDate
                        );
                        const fb = parseFecha(
                          b.fecha || b.createdAt || b.deliveryDate
                        );
                        if (!fa || !fb) return 0;
                        return fb.getTime() - fa.getTime();
                      }
                    );
                    const ultimoPedido = pedidosOrdenados[0];
                    if (ultimoPedido) {
                      const fechaStr =
                        ultimoPedido.fecha ||
                        ultimoPedido.createdAt ||
                        ultimoPedido.deliveryDate;
                      const fecha = parseFecha(fechaStr);
                      if (fecha) {
                        fechaUltimoPedido = fecha
                          .toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          .replace(/\//g, "-");
                      }
                    }
                  }

                  return (
                    <>
                      {/* Ticket Promedio */}
                      <div
                        style={{
                          paddingBottom: "10px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            marginBottom: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Ticket Promedio
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                            fontWeight: 600,
                          }}
                        >
                          ${Math.round(ticketPromedio).toLocaleString("es-CL")}
                        </div>
                      </div>

                      {/* Total Gastado Histórico */}
                      <div
                        style={{
                          paddingBottom: "10px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            marginBottom: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Total Gastado Histórico
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            color: "#059669",
                            fontWeight: 700,
                          }}
                        >
                          ${Math.round(totalGastado).toLocaleString("es-CL")}
                        </div>
                      </div>

                      {/* Promedio de Días que Pide */}
                      <div
                        style={{
                          paddingBottom: "10px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            marginBottom: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Promedio de Días que Pide
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {promedioDias !== null
                            ? `${promedioDias} días`
                            : "N/A"}
                        </div>
                      </div>

                      {/* Fecha del Último Pedido */}
                      <div
                        style={{
                          paddingBottom: "10px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            marginBottom: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Fecha del Último Pedido
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {fechaUltimoPedido}
                        </div>
                      </div>

                      {/* Método de Pago del Último Pedido */}
                      <div
                        style={{
                          paddingBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            marginBottom: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Método de Pago del Último Pedido
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {metodoPago || "N/A"}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Popup>
        </Circle>
      );
    })
    .filter(Boolean); // Filtrar valores null
}

export default function MapaCalor() {
  const theme = useTheme();
  const [mapData, setMapData] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState(6); // meses por defecto
  const mapRef = useRef(null);
  const circleRefs = useRef({});

  // Función para obtener datos del heatmap desde el backend
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);

      const currentDate = new Date();
      let allMapPoints = [];

      // Para períodos largos (>6 meses), obtener todos los datos sin filtro
      if (filterPeriod > 6) {
        const url = `${API_URL}/heatmap`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          allMapPoints = data
            .filter(
              (point) =>
                point &&
                point.lat &&
                point.lon &&
                !isNaN(point.lat) &&
                !isNaN(point.lon)
            )
            .map((point, index) => ({
              lat: parseFloat(point.lat),
              lng: parseFloat(point.lon),
              count: 1,
              address: point.address || "Sin dirección",
              user: point.user || "Sin nombre",
              phone: point.phone || "Sin teléfono",
              total_spent: parseInt(point.total_spent || 0),
              ticket_promedio: parseInt(point.ticket_promedio || 0),
              fecha_ultimo_pedido: point.fecha_ultimo_pedido || "N/A",
              isClient: true,
            }));
        } else {
          console.error("Error al obtener datos del heatmap:", response.status);
        }
      } else {
        // Para períodos cortos (3-6 meses), obtener datos de cada mes del período
        const monthPromises = [];

        // Obtener datos de los últimos N meses
        for (let i = 0; i < filterPeriod; i++) {
          const targetDate = new Date();
          targetDate.setMonth(currentDate.getMonth() - i);
          const mes = targetDate.getMonth() + 1;
          const anio = targetDate.getFullYear();

          const url = `${API_URL}/heatmap?mes=${mes}&anio=${anio}`;
          monthPromises.push(
            fetch(url)
              .then((response) => (response.ok ? response.json() : []))
              .then((data) => {
                return data
                  .filter(
                    (point) =>
                      point &&
                      point.lat &&
                      point.lon &&
                      !isNaN(point.lat) &&
                      !isNaN(point.lon)
                  )
                  .map((point, index) => ({
                    lat: parseFloat(point.lat),
                    lng: parseFloat(point.lon),
                    count: 1,
                    address: point.address || "Sin dirección",
                    user: point.user || "Sin nombre",
                    phone: point.phone || "Sin teléfono",
                    total_spent: parseInt(point.total_spent || 0),
                    ticket_promedio: parseInt(point.ticket_promedio || 0),
                    fecha_ultimo_pedido: point.fecha_ultimo_pedido || "N/A",
                    isClient: true,
                  }));
              })
              .catch((error) => {
                console.error(
                  `Error obteniendo datos del mes ${mes}/${anio}:`,
                  error
                );
                return [];
              })
          );
        }

        // Esperar todas las solicitudes y combinar resultados
        const monthResults = await Promise.all(monthPromises);
        allMapPoints = monthResults.flat();
      }

      setMapData(allMapPoints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      setLoading(false);
    }
  };

  // Función para cargar pedidos (solo local, para calcular valores en el popup)
  const cargarPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data || []);
    } catch (error) {
      console.error("Error cargando pedidos para popup:", error);
      setPedidos([]);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    cargarPedidos();

    // Actualización automática cada 5 minutos para mantener datos actualizados
    const interval = setInterval(() => {
      fetchHeatmapData();
      cargarPedidos();
    }, 5 * 60 * 1000); // 5 minutos (estandarizado con Home)

    // Escuchar evento de actualización global
    const handleGlobalRefresh = () => {
      fetchHeatmapData();
      cargarPedidos();
    };

    window.addEventListener("globalRefresh", handleGlobalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("globalRefresh", handleGlobalRefresh);
    };
  }, [filterPeriod]);

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          ml: "280px",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            Mapa de Calor - Concentración de Pedidos
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Cargando datos del mapa...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        ml: "280px",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            Mapa de Calor - Concentración de Pedidos
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            Visualiza las zonas con mayor concentración de pedidos en el período
            seleccionado
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Período de análisis:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(Number(e.target.value))}
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.divider,
                  },
                }}
              >
                <MenuItem value={3}>Últimos 3 meses</MenuItem>
                <MenuItem value={6}>Últimos 6 meses</MenuItem>
                <MenuItem value={12}>Últimos 12 meses</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Fila de Indicadores Principales (KPIs) */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            {/* KPI: Punto de mayor densidad */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Tooltip
                    title="Zona con mayor concentración de pedidos en el período seleccionado. Click para ver en el mapa."
                    placement="top"
                    arrow
                  >
                    <Typography
                      variant="h4"
                      onClick={() => {
                        if (!mapData || mapData.length === 0 || !mapRef.current)
                          return;

                        // Encontrar el punto con mayor densidad
                        const maxPoint = mapData.reduce((max, point) => {
                          const spent = parseInt(point.total_spent || 0);
                          const maxSpent = parseInt(max.total_spent || 0);
                          return spent > maxSpent ? point : max;
                        }, mapData[0]);

                        if (!maxPoint || !maxPoint.lat || !maxPoint.lng) return;

                        const circleKey = `${maxPoint.lat}-${maxPoint.lng}`;

                        // Hacer zoom suave al punto
                        mapRef.current.flyTo(
                          [parseFloat(maxPoint.lat), parseFloat(maxPoint.lng)],
                          15, // Nivel de zoom (15 = bastante cercano)
                          {
                            duration: 1.2, // Duración en segundos (suave pero relativamente veloz)
                            easeLinearity: 0.25, // Suavidad de la curva (0.25 = más suave)
                            animate: true,
                          }
                        );

                        // Usar un flag para asegurar que solo se abra una vez
                        let popupOpened = false;

                        const openPopupOnce = () => {
                          if (popupOpened) return;
                          popupOpened = true;

                          // Intentar abrir el popup usando la referencia del círculo
                          setTimeout(() => {
                            const circleRef = circleRefs.current[circleKey];

                            if (circleRef) {
                              // Intentar diferentes formas de acceder al elemento Leaflet
                              let leafletElement = null;

                              if (circleRef.leafletElement) {
                                leafletElement = circleRef.leafletElement;
                              } else if (
                                circleRef.reactComponent?.contextValue
                                  ?.leafletElement
                              ) {
                                leafletElement =
                                  circleRef.reactComponent.contextValue
                                    .leafletElement;
                              } else if (
                                circleRef.reactComponent?.leafletElement
                              ) {
                                leafletElement =
                                  circleRef.reactComponent.leafletElement;
                              } else if (circleRef.reactComponent) {
                                leafletElement = circleRef.reactComponent;
                              }

                              // Si tenemos el elemento Leaflet, intentar abrir el popup
                              if (
                                leafletElement &&
                                typeof leafletElement.openPopup === "function"
                              ) {
                                leafletElement.openPopup();
                                return;
                              }
                            }

                            // Si no funciona con la referencia, buscar en las capas del mapa
                            mapRef.current.eachLayer((layer) => {
                              // Verificar si es un Circle de Leaflet
                              if (
                                layer.getLatLng &&
                                typeof layer.openPopup === "function"
                              ) {
                                try {
                                  const latlng = layer.getLatLng();
                                  const targetLat = parseFloat(maxPoint.lat);
                                  const targetLng = parseFloat(maxPoint.lng);
                                  const tolerance = 0.0001;

                                  // Comparar coordenadas con tolerancia
                                  if (
                                    Math.abs(latlng.lat - targetLat) <
                                      tolerance &&
                                    Math.abs(latlng.lng - targetLng) < tolerance
                                  ) {
                                    // Abrir el popup del círculo encontrado
                                    layer.openPopup();
                                    return; // Salir una vez encontrado
                                  }
                                } catch (e) {
                                  // Ignorar errores si no se puede obtener latlng
                                }
                              }
                            });
                          }, 200); // Aumentar el delay para asegurar que el zoom terminó
                        };

                        // Escuchar múltiples eventos para asegurar que el zoom terminó
                        const handleFlyEnd = () => {
                          openPopupOnce();
                          mapRef.current.off("flyend", handleFlyEnd);
                        };

                        const handleMoveEnd = () => {
                          openPopupOnce();
                          mapRef.current.off("moveend", handleMoveEnd);
                        };

                        const handleZoomEnd = () => {
                          openPopupOnce();
                          mapRef.current.off("zoomend", handleZoomEnd);
                        };

                        // Escuchar eventos del mapa
                        mapRef.current.on("flyend", handleFlyEnd);
                        mapRef.current.on("moveend", handleMoveEnd);
                        mapRef.current.on("zoomend", handleZoomEnd);
                      }}
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        cursor: "pointer",
                        mb: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: theme.palette.primary.main,
                          transform: "scale(1.02)",
                        },
                        fontFamily:
                          '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                      }}
                    >
                      {(() => {
                        if (!mapData || mapData.length === 0) return "—";
                        const maxPoint = mapData.reduce((max, point) => {
                          const spent = parseInt(point.total_spent || 0);
                          const maxSpent = parseInt(max.total_spent || 0);
                          return spent > maxSpent ? point : max;
                        }, mapData[0]);
                        return maxPoint
                          ? (maxPoint.address || "—").substring(0, 20) +
                              (maxPoint.address && maxPoint.address.length > 20
                                ? "..."
                                : "")
                          : "—";
                      })()}
                    </Typography>
                  </Tooltip>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Mayor Densidad
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI: Total de pedidos analizados */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Tooltip
                    title="Total de pedidos analizados en el período seleccionado"
                    placement="top"
                    arrow
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        cursor: "pointer",
                        mb: 1,
                        fontFamily:
                          '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                      }}
                    >
                      {mapData && mapData.length > 0 ? mapData.length : "—"}
                    </Typography>
                  </Tooltip>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Total Pedidos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI: Promedio de valor por pedido */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[1],
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Tooltip
                    title="Valor promedio por pedido en el período seleccionado"
                    placement="top"
                    arrow
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        cursor: "pointer",
                        mb: 1,
                        fontFamily:
                          '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                      }}
                    >
                      {(() => {
                        if (!mapData || mapData.length === 0) return "—";
                        const totalSpent = mapData.reduce(
                          (sum, point) =>
                            sum + parseInt(point.total_spent || 0),
                          0
                        );
                        const promedio =
                          mapData.length > 0 ? totalSpent / mapData.length : 0;
                        return promedio > 0
                          ? `$${Math.round(promedio).toLocaleString("es-CL")}`
                          : "—";
                      })()}
                    </Typography>
                  </Tooltip>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Promedio/Pedido
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Card
          sx={{
            bgcolor: "background.paper",
            boxShadow: theme.shadows[2],
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <MapContainer
              center={[-33.6167, -70.5833]} // Puente Alto, Santiago
              zoom={12}
              style={{
                height: "600px",
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 4px 12px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapController
                onMapReady={(map) => {
                  mapRef.current = map;
                }}
              />

              <ZoomAwareCircles
                mapData={mapData}
                pedidos={pedidos}
                circleRefs={circleRefs}
              />
            </MapContainer>

            <Box
              sx={{
                mt: 3,
                p: 3,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "#f9fafb",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 2.5,
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  textRendering: "optimizeLegibility",
                }}
              >
                Leyenda - Concentración de Pedidos
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#00cc00",
                      border: `2px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "white"
                      }`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      p: 0,
                      minWidth: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Baja concentración (0 - $3.000)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#99cc00",
                      border: `2px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "white"
                      }`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      p: 0,
                      minWidth: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Baja-Media ($3.001 - $6.000)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#ffcc00",
                      border: `2px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "white"
                      }`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      p: 0,
                      minWidth: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Media ($6.001 - $10.000)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#ff6600",
                      border: `2px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "white"
                      }`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      p: 0,
                      minWidth: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Media-Alta ($10.001 - $15.000)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#ff0000",
                      border: `2px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "white"
                      }`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      p: 0,
                      minWidth: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontFamily:
                        '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    Alta concentración ($15.001+)
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", mb: 1 }}
                >
                  <strong>Total de pedidos mostrados:</strong> {mapData.length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", mb: 1 }}
                >
                  <strong>Período:</strong> Últimos {filterPeriod} meses
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", mb: 1 }}
                >
                  <strong>Total facturado:</strong> $
                  {mapData
                    .reduce(
                      (sum, point) => sum + parseInt(point.total_spent || 0),
                      0
                    )
                    .toLocaleString("es-CL")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    fontFamily:
                      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  💡 Los círculos se ajustan automáticamente al nivel de zoom
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tarjeta de Insight/Análisis */}
        <Card
          sx={{
            bgcolor: "background.paper",
            boxShadow: theme.shadows[1],
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            mt: 3,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                💡
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                    fontFamily:
                      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  Análisis del Período
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                    fontFamily:
                      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  {(() => {
                    if (!mapData || mapData.length === 0) {
                      return "No hay datos disponibles para el período seleccionado.";
                    }
                    // Calcular zona de mayor concentración
                    const puntosPorZona = {};
                    mapData.forEach((point) => {
                      const zona = point.address
                        ? point.address.toLowerCase().includes("sur") ||
                          point.address.toLowerCase().includes("poniente")
                          ? "sur-poniente"
                          : point.address.toLowerCase().includes("norte") ||
                            point.address.toLowerCase().includes("oriente")
                          ? "norte-oriente"
                          : "centro"
                        : "desconocida";
                      puntosPorZona[zona] = (puntosPorZona[zona] || 0) + 1;
                    });
                    const zonaMayor = Object.keys(puntosPorZona).reduce(
                      (a, b) => (puntosPorZona[a] > puntosPorZona[b] ? a : b)
                    );
                    const zonaMayorNombre =
                      zonaMayor === "sur-poniente"
                        ? "sector sur-poniente"
                        : zonaMayor === "norte-oriente"
                        ? "sector norte-oriente"
                        : zonaMayor === "centro"
                        ? "sector centro"
                        : "zona principal";
                    return `Mayor concentración en el ${zonaMayorNombre}. Distribución estable respecto al período anterior.`;
                  })()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
