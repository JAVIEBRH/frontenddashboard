import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Chip } from "@mui/material";
import InsightTooltip from "./InsightTooltip";

const BidonesCard = ({
  title = "Bidones Vendidos",
  value = 0,
  previousValue = 0,
  subtitle = "Este mes",
  percentageChange = 0,
  isPositive = true,
  historicalData = [],
  bidonesLocal = 0,
  bidonesDelivery = 0,
}) => {
  const theme = useTheme();
  const PRECIO_BIDON = 2000;
  const [bidonesData, setBidonesData] = useState({
    total_bidones: value,
    bidones_mes_actual: value,
    bidones_mes_anterior: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    tendencia_mensual: [],
    fecha_analisis: "",
  });

  // Calcular tendencia mensual desde datos históricos (bidones = ventas / 2000)
  useEffect(() => {
    if (
      historicalData &&
      Array.isArray(historicalData) &&
      historicalData.length > 0
    ) {
      // Obtener últimos 6 meses y calcular bidones desde ventas
      const ultimosMeses = historicalData.slice(-6);
      const mesesNombres = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const mesesMap = {
        Jan: "Ene",
        Feb: "Feb",
        Mar: "Mar",
        Apr: "Abr",
        May: "May",
        Jun: "Jun",
        Jul: "Jul",
        Aug: "Ago",
        Sep: "Sep",
        Oct: "Oct",
        Nov: "Nov",
        Dec: "Dic",
      };

      const tendenciaMensual = ultimosMeses.map((item) => {
        const nombreMes = item.name || "";
        const mesKey = nombreMes.split(" ")[0];
        const mesAbrev = mesesMap[mesKey] || mesKey;
        const ventas = item.ventas || 0;
        const bidones = Math.round(ventas / PRECIO_BIDON);

        return {
          mes: mesAbrev,
          bidones: bidones,
        };
      });

      setBidonesData((prev) => ({
        ...prev,
        tendencia_mensual: tendenciaMensual,
      }));
    }
  }, [historicalData]);

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setBidonesData((prev) => ({
      ...prev,
      total_bidones: value,
      bidones_mes_actual: value,
      bidones_mes_anterior: previousValue,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive,
    }));
  }, [value, previousValue, percentageChange, isPositive]);

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (
      !bidonesData.tendencia_mensual ||
      bidonesData.tendencia_mensual.length === 0
    ) {
      return "M0 25 Q20 15 40 20 T80 10 T120 15 T160 5 T200 10";
    }

    const puntos = bidonesData.tendencia_mensual.map((mes, index) => {
      const x = (index / (bidonesData.tendencia_mensual.length - 1)) * 200;
      const maxBidones = Math.max(
        ...bidonesData.tendencia_mensual.map((m) => m.bidones)
      );
      const y = maxBidones > 0 ? 40 - (mes.bidones / maxBidones) * 30 : 30;
      return `${x} ${y}`;
    });

    return `M${puntos.join(" L")}`;
  };

  // Calcular porcentajes de desglose
  const totalBidones = bidonesData.bidones_mes_actual;
  const porcentajeLocal =
    totalBidones > 0 ? (bidonesLocal / totalBidones) * 100 : 0;
  const porcentajeDelivery =
    totalBidones > 0 ? (bidonesDelivery / totalBidones) * 100 : 0;

  const tooltipContent = `📦 BIDONES VENDIDOS

🔢 Mes actual: ${bidonesData.bidones_mes_actual.toLocaleString("es-CL")} bidones
📅 Mes anterior: ${bidonesData.bidones_mes_anterior.toLocaleString(
    "es-CL"
  )} bidones

${bidonesData.es_positivo ? "📈" : "📉"} Variación: ${
    bidonesData.es_positivo ? "+" : ""
  }${bidonesData.porcentaje_cambio.toFixed(1)}%

🏪 DESGLOSE POR ORIGEN:
   🏪 Bidones Local: ${bidonesLocal.toLocaleString(
     "es-CL"
   )} bidones (${porcentajeLocal.toFixed(1)}%)
   🚚 Bidones Delivery: ${bidonesDelivery.toLocaleString(
     "es-CL"
   )} bidones (${porcentajeDelivery.toFixed(1)}%)

💡 Cálculo: Contado directamente desde pedidos reales
   Cada bidón = 20 litros`;

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
            {bidonesData.total_bidones.toLocaleString("es-CL")}
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
            label={`${
              bidonesData.es_positivo ? "+" : ""
            }${bidonesData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.2)"
                  : "rgba(0, 191, 255, 0.1)",
              color: bidonesData.es_positivo ? "#059669" : "#dc2626",
              fontWeight: 600,
              border: `1px solid ${
                bidonesData.es_positivo
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

      {/* Gráfico de tendencia diaria */}
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
        {bidonesData.tendencia_mensual &&
          bidonesData.tendencia_mensual.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                px: 1,
              }}
            >
              {bidonesData.tendencia_mensual.map((mes, index) => (
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
    </Box>
  );
};

export default BidonesCard;
