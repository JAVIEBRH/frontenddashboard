import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Chip } from "@mui/material";
import InsightTooltip from "./InsightTooltip";

const VentasDiariasCard = ({
  title = "Ventas Diarias",
  value = 0,
  subtitle = "Hoy vs Mismo día mes anterior",
  percentageChange = 0,
  isPositive = true,
  ventasLocal = 0,
  ventasDelivery = 0,
}) => {
  const theme = useTheme();
  const [ventasData, setVentasData] = useState({
    ventas_hoy: value,
    ventas_mismo_dia_mes_anterior: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    fecha_comparacion: "",
    tendencia_7_dias: [],
    tipo_comparacion: "mensual",
  });
  // NO hacer cálculo interno - usar SOLO el prop value que viene de Home.jsx
  // El cálculo ya se hace en Home.jsx desde bidones vendidos reales
  // Este componente solo debe mostrar el valor recibido

  // Calcular valor del mismo día del mes anterior desde el porcentaje de cambio
  const calcularValorAnterior = () => {
    if (percentageChange === 0) return value;
    if (percentageChange === 100 && value > 0) return 0; // Caso especial: aumento del 100%
    return value / (1 + percentageChange / 100);
  };

  const ventasMismoDiaMesAnterior = calcularValorAnterior();

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setVentasData((prev) => ({
      ...prev,
      ventas_hoy: value,
      ventas_mismo_dia_mes_anterior: ventasMismoDiaMesAnterior,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive,
    }));
  }, [value, percentageChange, isPositive, ventasMismoDiaMesAnterior]);

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    } else {
      return `$${val.toLocaleString("es-CL")}`;
    }
  };

  // Generar puntos del gráfico de 7 días
  const generarPuntosGrafico = () => {
    if (
      !ventasData.tendencia_7_dias ||
      ventasData.tendencia_7_dias.length === 0
    ) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }

    const puntos = ventasData.tendencia_7_dias.map((dia, index) => {
      const x = (index / 6) * 200; // 200 es el ancho del SVG
      const maxVentas = Math.max(
        ...ventasData.tendencia_7_dias.map((d) => d.ventas)
      );
      const y = maxVentas > 0 ? 40 - (dia.ventas / maxVentas) * 30 : 30;
      return `${x} ${y}`;
    });

    return `M${puntos.join(" L")}`;
  };

  // Calcular porcentajes de desglose
  const totalVentas = ventasData.ventas_hoy;
  const porcentajeLocal =
    totalVentas > 0 ? (ventasLocal / totalVentas) * 100 : 0;
  const porcentajeDelivery =
    totalVentas > 0 ? (ventasDelivery / totalVentas) * 100 : 0;

  const tooltipContent = `📊 VENTAS DIARIAS

💰 Hoy: ${formatValue(ventasData.ventas_hoy)}
📅 Mismo día mes anterior: ${formatValue(
    ventasData.ventas_mismo_dia_mes_anterior || 0
  )}

${ventasData.es_positivo ? "📈" : "📉"} Variación: ${
    ventasData.es_positivo ? "+" : ""
  }${ventasData.porcentaje_cambio.toFixed(1)}%

🏪 DESGLOSE POR ORIGEN:
   🏪 Ventas Local: ${formatValue(ventasLocal)} (${porcentajeLocal.toFixed(1)}%)
   🚚 Ventas Delivery: ${formatValue(
     ventasDelivery
   )} (${porcentajeDelivery.toFixed(1)}%)

💡 Cálculo: Ventas = Bidones vendidos × $2,000
   Comparación: Hoy vs Mismo día del mes anterior
   Basado en pedidos reales de ambos días`;

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
              fontSize: "1rem", // Estandarizado a 1rem
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
              fontSize: "2.5rem", // Estandarizado a 2.5rem
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontDisplay: "swap",
            }}
          >
            {formatValue(ventasData.ventas_hoy)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.8)"
                  : "#1a1a1a",
              fontWeight: 500,
              fontSize: "0.9rem", // Estandarizado a 0.9rem
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
        <InsightTooltip title={tooltipContent} placement="top">
          <Chip
            label={`${ventasData.es_positivo ? "+" : ""}${Number(
              ventasData.porcentaje_cambio || 0
            ).toFixed(1)}%`}
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.2)"
                  : "rgba(0, 191, 255, 0.1)",
              color: ventasData.es_positivo ? "#059669" : "#dc2626",
              fontWeight: 600,
              border: `1px solid ${
                ventasData.es_positivo
                  ? "rgba(5, 150, 105, 0.2)"
                  : "rgba(220, 38, 38, 0.2)"
              }`,
              fontSize: "0.9rem", // Estandarizado a 0.9rem
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

      {/* Gráfico real de últimos 7 días */}
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

        {/* Etiquetas de días */}
        {ventasData.tendencia_7_dias &&
          ventasData.tendencia_7_dias.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                px: 1,
              }}
            >
              {ventasData.tendencia_7_dias.map((dia, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem", // Estandarizado a 0.75rem
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
                  {dia.dia}
                </Typography>
              ))}
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default VentasDiariasCard;
