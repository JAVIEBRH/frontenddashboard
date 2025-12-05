import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Chip } from "@mui/material";
import InsightTooltip from "./InsightTooltip";

const IvaCard = ({
  title = "IVA",
  value = 2375000,
  subtitle = "Este mes",
  previousValue = 0,
  percentageChange = 12.5,
  isPositive = true,
  historicalData = [],
}) => {
  const theme = useTheme();
  const IVA_RATE = 0.19; // 19% IVA
  const [ivaData, setIvaData] = useState({
    iva_mes_actual: value,
    iva_mes_anterior: 0,
    porcentaje_cambio: percentageChange,
    es_positivo: isPositive,
    tendencia_mensual: [],
    fecha_analisis: "",
  });

  // Calcular tendencia mensual desde datos históricos (IVA = ventas × 0.19 / 1.19)
  useEffect(() => {
    if (
      historicalData &&
      Array.isArray(historicalData) &&
      historicalData.length > 0
    ) {
      const ultimosMeses = historicalData.slice(-6);
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
        const iva = (ventas * IVA_RATE) / (1 + IVA_RATE); // IVA incluido en precio

        return {
          mes: mesAbrev,
          iva: iva,
        };
      });

      setIvaData((prev) => ({
        ...prev,
        tendencia_mensual: tendenciaMensual,
      }));
    }
  }, [historicalData]);

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setIvaData((prev) => ({
      ...prev,
      iva_mes_actual: value,
      iva_mes_anterior: previousValue || 0,
      porcentaje_cambio: percentageChange,
      es_positivo: isPositive,
    }));
  }, [value, previousValue, percentageChange, isPositive]);

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    } else {
      return `$${val.toLocaleString("es-CL")}`;
    }
  };

  // Generar puntos del gráfico de tendencia mensual
  const generarPuntosGrafico = () => {
    if (!ivaData.tendencia_mensual || ivaData.tendencia_mensual.length === 0) {
      return "M0 30 Q20 20 40 25 T80 15 T120 20 T160 10 T200 15";
    }

    const puntos = ivaData.tendencia_mensual.map((mes, index) => {
      const x = (index / (ivaData.tendencia_mensual.length - 1)) * 200;
      const maxIva = Math.max(...ivaData.tendencia_mensual.map((m) => m.iva));
      const y = maxIva > 0 ? 40 - (mes.iva / maxIva) * 30 : 30;
      return `${x} ${y}`;
    });

    return `M${puntos.join(" L")}`;
  };

  const tooltipContent = `📊 IVA MENSUAL

💰 Mes actual: ${formatValue(ivaData.iva_mes_actual)}
📅 Mes anterior: ${formatValue(ivaData.iva_mes_anterior)}

${ivaData.es_positivo ? "📈" : "📉"} Variación: ${
    ivaData.es_positivo ? "+" : ""
  }${ivaData.porcentaje_cambio.toFixed(1)}%

💡 Cálculo: IVA incluido en precio de venta
   IVA = Ventas × 19% / 1.19 (precio ya incluye IVA)
   Basado en ventas = Bidones × $2,000
   
   El precio de $2,000 por bidón ya incluye el 19% de IVA,
   por lo que el IVA real es: $2,000 × 0.19 / 1.19 = $319.33 por bidón`;

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
            {formatValue(ivaData.iva_mes_actual)}
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
              ivaData.es_positivo ? "+" : ""
            }${ivaData.porcentaje_cambio.toFixed(1)}%`}
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.2)"
                  : "rgba(0, 191, 255, 0.1)",
              color: ivaData.es_positivo ? "#059669" : "#dc2626",
              fontWeight: 600,
              border: `1px solid ${
                ivaData.es_positivo
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
        {ivaData.tendencia_mensual && ivaData.tendencia_mensual.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 0.5,
              px: 1,
            }}
          >
            {ivaData.tendencia_mensual.map((mes, index) => (
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

export default IvaCard;
