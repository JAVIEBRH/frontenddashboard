import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import InsightTooltip from "./InsightTooltip";

const CostosCard = ({
  title = "Costos",
  value = 0,
  subtitle = "Este mes",
  percentageChange = 0,
  isPositive = false,
  costoCuotaCamion = 260000,
  costoTapaUnitaria = 60.69,
  bidonesVendidos = 0,
  costosMesPasado = 0,
}) => {
  const theme = useTheme();
  const [costosData, setCostosData] = useState({
    costos_mes_actual: value,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
  });

  // Estado para gastos manuales agregados por el usuario
  const [gastosManuales, setGastosManuales] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    monto: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
  });

  // Cargar gastos manuales desde localStorage al montar el componente
  useEffect(() => {
    const gastosGuardados = localStorage.getItem("gastosManualesCostos");
    if (gastosGuardados) {
      try {
        const gastos = JSON.parse(gastosGuardados);
        setGastosManuales(gastos);
      } catch (error) {
        console.error("Error cargando gastos manuales:", error);
      }
    }
  }, []);

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setCostosData((prev) => ({
      ...prev,
      costos_mes_actual: value,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive,
    }));
  }, [value, percentageChange, isPositive]);

  // Calcular total de gastos manuales
  const totalGastosManuales = gastosManuales.reduce(
    (sum, gasto) => sum + (gasto.monto || 0),
    0
  );

  // Costos totales = costos calculados + gastos manuales
  const costosTotales = costosData.costos_mes_actual + totalGastosManuales;

  // Función para agregar nuevo gasto
  const handleAgregarGasto = () => {
    if (!nuevoGasto.monto || parseFloat(nuevoGasto.monto) <= 0) {
      return;
    }

    const gasto = {
      id: Date.now().toString(),
      monto: parseFloat(nuevoGasto.monto),
      descripcion: nuevoGasto.descripcion || "Sin descripción",
      fecha: nuevoGasto.fecha || new Date().toISOString().split("T")[0],
      fechaAgregado: new Date().toISOString(),
    };

    const nuevosGastos = [...gastosManuales, gasto];
    setGastosManuales(nuevosGastos);

    // Guardar en localStorage
    localStorage.setItem("gastosManualesCostos", JSON.stringify(nuevosGastos));

    // Limpiar formulario
    setNuevoGasto({
      monto: "",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
    });

    setOpenDialog(false);
  };

  // Función para eliminar un gasto
  const handleEliminarGasto = (id) => {
    const nuevosGastos = gastosManuales.filter((g) => g.id !== id);
    setGastosManuales(nuevosGastos);
    localStorage.setItem("gastosManualesCostos", JSON.stringify(nuevosGastos));
  };

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    } else {
      return `$${val.toLocaleString("es-CL")}`;
    }
  };

  // Generar puntos del gráfico de tendencia mensual (gráfico simple)
  const generarPuntosGrafico = () => {
    return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
  };

  // Calcular desglose de costos
  const costoFijo = costoCuotaCamion;
  const costoVariable = bidonesVendidos * costoTapaUnitaria;
  const porcentajeFijo =
    costosTotales > 0 ? (costoFijo / costosTotales) * 100 : 0;
  const porcentajeVariable =
    costosTotales > 0 ? (costoVariable / costosTotales) * 100 : 0;
  const porcentajeGastosManuales =
    costosTotales > 0 ? (totalGastosManuales / costosTotales) * 100 : 0;

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "N/A";
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return fechaISO;
    }
  };

  // Generar historial de gastos manuales para el insight
  const historialGastos = gastosManuales
    .sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado))
    .slice(0, 10) // Mostrar solo los últimos 10
    .map(
      (gasto) =>
        `   📝 ${formatearFecha(gasto.fecha)}: ${formatValue(gasto.monto)} - ${
          gasto.descripcion
        }`
    )
    .join("\n");

  const tooltipContent = `💰 COSTOS MENSUALES

💵 Costos totales: ${formatValue(costosTotales)}
   • Costos calculados: ${formatValue(costosData.costos_mes_actual)}
   • Gastos manuales: ${formatValue(totalGastosManuales)}
📅 Costos mes anterior: ${formatValue(costosMesPasado || 0)}

${costosData.es_positivo ? "📉" : "📈"} Variación: ${
    costosData.es_positivo ? "+" : ""
  }${costosData.porcentaje_cambio.toFixed(1)}%

📊 DESGLOSE POR COMPONENTE:
   🚚 Cuota Camión (Fijo): ${formatValue(costoFijo)} (${porcentajeFijo.toFixed(
    1
  )}%)
   🔩 Tapas Unitarias (Variable): ${formatValue(
     costoVariable
   )} (${porcentajeVariable.toFixed(1)}%)
      (${bidonesVendidos.toLocaleString(
        "es-CL"
      )} bidones × $${costoTapaUnitaria.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })})
   ✏️ Gastos Manuales: ${formatValue(
     totalGastosManuales
   )} (${porcentajeGastosManuales.toFixed(1)}%)

${
  gastosManuales.length > 0
    ? `📋 HISTORIAL DE GASTOS MANUALES:\n${historialGastos}\n`
    : ""
}

💡 Cálculo: Costos = Cuota Camión + (Bidones × Tapa Unitaria) + Gastos Manuales
   
   Nota: Los costos mostrados corresponden solo a delivery
   El local tiene costos separados que no se incluyen aquí`;

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
            : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
        borderRadius: 3,
        padding: 3,
        color: theme.palette.text.primary,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        minHeight: 180,
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(0, 191, 255, 0.4)"
            : "rgba(0, 191, 255, 0.1)"
        }`,
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)"
              : "0 12px 40px rgba(0, 0, 0, 0.15)",
          borderColor: "rgba(0, 191, 255, 0.6)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "1rem",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: "swap",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              color: theme.palette.text.primary,
              lineHeight: 1.1,
              fontSize: "2.5rem",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: "swap",
            }}
          >
            {formatValue(costosTotales)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.8)"
                  : "#1a1a1a",
              fontWeight: 500,
              fontSize: "0.9rem",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: "swap",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <InsightTooltip title={tooltipContent} placement="bottom">
          <Chip
            label={`${
              costosData.es_positivo ? "+" : ""
            }${costosData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.2)"
                  : "rgba(0, 191, 255, 0.1)",
              color: costosData.es_positivo ? "#059669" : "#dc2626",
              fontWeight: 600,
              border: `1px solid ${
                costosData.es_positivo
                  ? "rgba(5, 150, 105, 0.2)"
                  : "rgba(220, 38, 38, 0.2)"
              }`,
              fontSize: "0.9rem",
              height: "auto",
              cursor: "help",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontDisplay: "swap",
              "& .MuiChip-label": {
                padding: "8px 12px",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeLegibility",
              },
            }}
          />
        </InsightTooltip>
      </Box>

      {/* Gráfico de tendencia mensual */}
      <Box
        sx={{
          width: "100%",
          height: 40,
          mt: 2,
          position: "relative",
        }}
      >
        <svg width="100%" height="40" style={{ overflow: "visible" }}>
          <path
            d={generarPuntosGrafico()}
            stroke="#9370db"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`${generarPuntosGrafico()} L200 40 L0 40 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9370db" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9370db" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Etiquetas de meses */}
        {costosData.tendencia_mensual &&
          costosData.tendencia_mensual.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                px: 1,
              }}
            >
              {costosData.tendencia_mensual.map((mes, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    color:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary",
                    fontWeight: 500,
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                    fontFeatureSettings: '"liga" 1, "kern" 1',
                    fontDisplay: "swap",
                  }}
                >
                  {mes.mes}
                </Typography>
              ))}
            </Box>
          )}
      </Box>

      {/* Botón de suma en esquina inferior derecha */}
      <IconButton
        onClick={() => setOpenDialog(true)}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 40,
          height: 40,
          background:
            theme.palette.mode === "dark"
              ? "rgba(0, 191, 255, 0.2)"
              : "rgba(0, 191, 255, 0.1)",
          color: theme.palette.mode === "dark" ? "#00bfff" : "#007bff",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(0, 191, 255, 0.4)"
              : "rgba(0, 191, 255, 0.3)"
          }`,
          "&:hover": {
            background:
              theme.palette.mode === "dark"
                ? "rgba(0, 191, 255, 0.3)"
                : "rgba(0, 191, 255, 0.2)",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
          zIndex: 10,
        }}
      >
        <AddIcon />
      </IconButton>

      {/* Dialog para agregar gastos manuales */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
            borderRadius: 3,
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(0, 191, 255, 0.3)"
                : "rgba(0, 191, 255, 0.2)"
            }`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)"
            }`,
            pb: 2,
          }}
        >
          Agregar Gasto Manual
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Monto"
              type="number"
              value={nuevoGasto.monto}
              onChange={(e) =>
                setNuevoGasto({ ...nuevoGasto, monto: e.target.value })
              }
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              fullWidth
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 191, 255, 0.5)",
                  },
                },
              }}
            />
            <TextField
              label="Descripción"
              value={nuevoGasto.descripcion}
              onChange={(e) =>
                setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Ej: Mantenimiento vehículo, Reparación..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 191, 255, 0.5)",
                  },
                },
              }}
            />
            <TextField
              label="Fecha"
              type="date"
              value={nuevoGasto.fecha}
              onChange={(e) =>
                setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 191, 255, 0.5)",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)"
            }`,
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAgregarGasto}
            variant="contained"
            disabled={!nuevoGasto.monto || parseFloat(nuevoGasto.monto) <= 0}
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #00bfff 0%, #007bff 100%)"
                  : "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)"
                    : "linear-gradient(135deg, #0056b3 0%, #004085 100%)",
              },
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostosCard;
