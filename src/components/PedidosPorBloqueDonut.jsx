import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import { getPedidos } from "../services/api";

const PedidosPorBloqueDonut = ({
  pedidosManana = 0,
  pedidosTarde = 0,
  title = "Distribución de Pedidos por Franja Horaria",
}) => {
  const theme = useTheme();
  const [horarioData, setHorarioData] = useState({
    pedidos_manana: 0,
    pedidos_tarde: 0,
    total: 0,
    total_mes: 0,
    porcentaje_manana: 0,
    porcentaje_tarde: 0,
  });
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Función para parsear hora desde diferentes formatos
  const parseHora = (horaStr) => {
    if (!horaStr) return null;

    const str = String(horaStr).trim();

    // Formato 24h: "14:30:00" o "14:30"
    const match24h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24h) {
      return parseInt(match24h[1], 10);
    }

    // Formato 12h: "02:53 pm" o "11:30 am"
    const match12h = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match12h) {
      let hora = parseInt(match12h[1], 10);
      const ampm = match12h[3].toLowerCase();

      if (ampm === "pm" && hora !== 12) {
        hora += 12;
      } else if (ampm === "am" && hora === 12) {
        hora = 0;
      }

      return hora;
    }

    return null;
  };

  const calcularDatosHistoricos = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().toLocaleTimeString("es-CL");

      // Obtener todos los pedidos históricos
      const pedidos = await getPedidos();

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        setHorarioData({
          pedidos_manana: 0,
          pedidos_tarde: 0,
          total: 0,
          total_mes: 0,
          porcentaje_manana: 0,
          porcentaje_tarde: 0,
        });
        setUltimaActualizacion(timestamp);
        return;
      }

      // Filtrar solo pedidos de Aguas Ancud
      const pedidosAguasAncud = pedidos.filter((pedido) => {
        const nombreLocal = pedido.nombrelocal || pedido.nombre_local || "";
        return nombreLocal.toString().trim().toLowerCase() === "aguas ancud";
      });

      let bloqueManana = 0;
      let bloqueTarde = 0;
      let pedidosProcesados = 0;

      // Procesar todos los pedidos históricos
      pedidosAguasAncud.forEach((pedido) => {
        // Intentar obtener hora desde diferentes campos
        let horaValida = null;

        // Campo 'hora'
        if (pedido.hora) {
          horaValida = parseHora(pedido.hora);
        }

        // Campo 'horaagenda' si no hay hora
        if (horaValida === null && pedido.horaagenda) {
          horaValida = parseHora(pedido.horaagenda);
        }

        // Clasificar según la hora válida
        if (horaValida !== null) {
          pedidosProcesados++;
          // Mañana: 10:00 - 14:00
          if (horaValida >= 10 && horaValida < 14) {
            bloqueManana++;
          }
          // Tarde: 14:00 - 20:00
          else if (horaValida >= 14 && horaValida < 20) {
            bloqueTarde++;
          }
        }
      });

      const totalEnRangos = bloqueManana + bloqueTarde;
      const porcentajeManana =
        totalEnRangos > 0 ? (bloqueManana / totalEnRangos) * 100 : 0;
      const porcentajeTarde =
        totalEnRangos > 0 ? (bloqueTarde / totalEnRangos) * 100 : 0;

      setHorarioData({
        pedidos_manana: bloqueManana,
        pedidos_tarde: bloqueTarde,
        total: totalEnRangos,
        total_mes: totalEnRangos, // Total histórico completo
        porcentaje_manana: porcentajeManana,
        porcentaje_tarde: porcentajeTarde,
      });

      setUltimaActualizacion(timestamp);
    } catch (error) {
      console.error(
        "Error calculando datos históricos de pedidos por horario:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos históricos inmediatamente
    calcularDatosHistoricos();

    // Actualizar cada 5 minutos (datos históricos no cambian tan frecuentemente)
    const interval = setInterval(() => {
      calcularDatosHistoricos();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Usar total histórico completo
  const total =
    horarioData.total ||
    horarioData.total_mes ||
    horarioData.pedidos_manana + horarioData.pedidos_tarde;
  // Usar porcentajes del backend (basados en muestra histórica completa)
  // Si no vienen del backend (undefined/null), calcular localmente como fallback
  const porcentajeManana =
    horarioData.porcentaje_manana !== undefined &&
    horarioData.porcentaje_manana !== null
      ? horarioData.porcentaje_manana
      : total > 0
      ? (horarioData.pedidos_manana / total) * 100
      : 0;
  const porcentajeTarde =
    horarioData.porcentaje_tarde !== undefined &&
    horarioData.porcentaje_tarde !== null
      ? horarioData.porcentaje_tarde
      : total > 0
      ? (horarioData.pedidos_tarde / total) * 100
      : 0;

  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets para los segmentos
  const mananaOffset = circumference - (porcentajeManana / 100) * circumference;
  const tardeOffset = circumference - (porcentajeTarde / 100) * circumference;

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
            : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
        borderRadius: 3,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
        padding: 3,
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(0, 191, 255, 0.4)"
            : "rgba(0, 191, 255, 0.1)"
        }`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)"
              : "0 12px 40px rgba(0, 0, 0, 0.15)",
          borderColor: "rgba(0, 191, 255, 0.6)",
        },
      }}
      onClick={calcularDatosHistoricos}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.025em",
            fontSize: "1rem",
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {loading && (
          <Typography
            component="span"
            sx={{ fontSize: "0.8rem", color: "#9370db" }}
          >
            🔄
          </Typography>
        )}
        {ultimaActualizacion && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.secondary,
              ml: 1,
            }}
          >
            {ultimaActualizacion}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <svg width="140" height="140" style={{ position: "relative" }}>
            {/* Fondo del donut */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />

            {/* Segmento Mañana */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={mananaOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />

            {/* Segmento Tarde */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#059669"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={tardeOffset}
              strokeLinecap="round"
              transform={`rotate(${
                -90 + (porcentajeManana * 360) / 100
              } 70 70)`}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>

          {/* Texto central */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: "1.25rem",
                lineHeight: 1.2,
              }}
            >
              {total.toLocaleString("es-CL")}
            </Typography>
            {loading && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  color: "#9370db",
                  mt: 0.5,
                }}
              >
                Actualizando...
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Total Histórico
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Leyenda mejorada */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        {/* Mañana */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            p: 1,
            borderRadius: 2,
            bgcolor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#3b82f6",
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#3b82f6",
                fontSize: "0.75rem",
              }}
            >
              Mañana ({porcentajeManana.toFixed(0)}%)
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#3b82f6",
              fontSize: "1.1rem",
            }}
          >
            {horarioData.pedidos_manana.toLocaleString("es-CL")}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
            }}
          >
            10-14h • Histórico
          </Typography>
        </Box>

        {/* Tarde */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            p: 1,
            borderRadius: 2,
            bgcolor: "rgba(5, 150, 105, 0.1)",
            border: "1px solid rgba(5, 150, 105, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#059669",
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#059669",
                fontSize: "0.75rem",
              }}
            >
              Tarde ({porcentajeTarde.toFixed(0)}%)
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#059669",
              fontSize: "1.1rem",
            }}
          >
            {horarioData.pedidos_tarde.toLocaleString("es-CL")}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
            }}
          >
            14-20h • Histórico
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PedidosPorBloqueDonut;
