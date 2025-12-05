import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Typography, Box, Chip, keyframes } from "@mui/material";
import InsightTooltip from "./InsightTooltip";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const lineGlow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const progressGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px var(--progress-color, rgba(0, 191, 255, 0.5)); }
  50% { box-shadow: 0 0 20px var(--progress-color, rgba(0, 191, 255, 0.8)); }
`;

const numberPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--progress-width); }
`;

const KpiMetaCard = ({
  currentValue = 0,
  targetValue = 500000,
  percentage = 0,
  title = "Meta de Ventas",
  subtitle = "Objetivo Mensual",
  ventasLocal = 0,
  ventasDelivery = 0,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const porcentajeCumplimiento =
    targetValue > 0
      ? Math.min(200, Math.round((currentValue / targetValue) * 100))
      : 0;

  const metaData = {
    ventasActuales: currentValue,
    meta: targetValue,
    porcentajeCumplimiento:
      percentage > 0 ? percentage : porcentajeCumplimiento,
  };

  // Colores dinámicos según el porcentaje
  const getColorByPercentage = (percent) => {
    if (percent >= 100) {
      return {
        primary: "#10b981", // Verde
        secondary: "#34d399",
        glow: "rgba(16, 185, 129, 0.8)",
        status: "Completado",
      };
    } else if (percent >= 80) {
      return {
        primary: "#10b981", // Verde
        secondary: "#34d399",
        glow: "rgba(16, 185, 129, 0.6)",
        status: "En camino",
      };
    } else if (percent >= 50) {
      return {
        primary: "#fbbf24", // Amarillo
        secondary: "#fcd34d",
        glow: "rgba(251, 191, 36, 0.6)",
        status: "Atención",
      };
    } else if (percent >= 25) {
      return {
        primary: "#f97316", // Naranja
        secondary: "#fb923c",
        glow: "rgba(249, 115, 22, 0.6)",
        status: "Atrasado",
      };
    } else {
      return {
        primary: "#ef4444", // Rojo
        secondary: "#f87171",
        glow: "rgba(239, 68, 68, 0.6)",
        status: "Crítico",
      };
    }
  };

  const colorTheme = getColorByPercentage(metaData.porcentajeCumplimiento);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString("es-CL")}`;
  };

  // Calcular porcentajes de desglose de la meta
  const porcentajeLocal =
    currentValue > 0 ? (ventasLocal / currentValue) * 100 : 0;
  const porcentajeDelivery =
    currentValue > 0 ? (ventasDelivery / currentValue) * 100 : 0;
  const porcentajeLocalMeta =
    targetValue > 0 ? (ventasLocal / targetValue) * 100 : 0;
  const porcentajeDeliveryMeta =
    targetValue > 0 ? (ventasDelivery / targetValue) * 100 : 0;

  const tooltipContent = `🎯 META DE VENTAS

💰 Ventas actuales: ${formatValue(metaData.ventasActuales)}
🎯 Meta objetivo: ${formatValue(metaData.meta)}
📊 Cumplimiento: ${metaData.porcentajeCumplimiento.toFixed(1)}%

🏪 DESGLOSE POR ORIGEN:
   🏪 Ventas Local: ${formatValue(ventasLocal)} (${porcentajeLocal.toFixed(
    1
  )}% del total)
      Progreso meta: ${porcentajeLocalMeta.toFixed(1)}%
   🚚 Ventas Delivery: ${formatValue(
     ventasDelivery
   )} (${porcentajeDelivery.toFixed(1)}% del total)
      Progreso meta: ${porcentajeDeliveryMeta.toFixed(1)}%

💡 La meta se calcula como 110% del mes anterior
   Estado: ${colorTheme.status}`;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
            : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
        borderRadius: 3,
        padding: 2,
        color: theme.palette.text.primary,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? `${colorTheme.primary}40`
            : `${colorTheme.primary}20`
        }`,
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 12px 40px ${colorTheme.glow}, 0 0 60px ${colorTheme.primary}20`
              : `0 12px 40px ${colorTheme.primary}30`,
          borderColor: `${colorTheme.primary}60`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "200%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${colorTheme.primary}15, transparent)`,
          animation: `${shimmer} 3s infinite`,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${colorTheme.primary}20 0%, transparent 70%)`,
          animation: `${pulse} 2s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.9)"
                  : "#7c3aed",
              mb: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.7rem",
              textAlign: "center",
            }}
          >
            🎯 {title}
          </Typography>
        </Box>
        <InsightTooltip title={tooltipContent} placement="top">
          <Chip
            label={formatValue(metaData.ventasActuales)}
            size="small"
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.2)"
                  : "rgba(0, 191, 255, 0.1)",
              color: "#9370db",
              fontWeight: 700,
              border: "1px solid rgba(0, 191, 255, 0.3)",
              fontSize: "0.7rem",
              height: "auto",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
              cursor: "help",
              "& .MuiChip-label": { padding: "4px 8px" },
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 0 15px rgba(0, 191, 255, 0.4)",
              },
            }}
          />
        </InsightTooltip>
      </Box>

      {/* Contador centrado */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          position: "relative",
          zIndex: 1,
          my: 1,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            color: theme.palette.text.primary,
            lineHeight: 1,
            fontSize: "3rem",
            textShadow:
              theme.palette.mode === "dark"
                ? `0 0 30px ${colorTheme.glow}`
                : "none",
            transition: "all 0.3s ease",
            animation: isHovered
              ? `${numberPulse} 1.5s ease-in-out infinite`
              : "none",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%)`
                : `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {metaData.porcentajeCumplimiento}%
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.7)"
                : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: "0.7rem",
            textAlign: "center",
          }}
        >
          {subtitle}
        </Typography>
        <Chip
          label={colorTheme.status}
          size="small"
          sx={{
            mt: 0.5,
            background: `${colorTheme.primary}20`,
            color: colorTheme.primary,
            fontWeight: 700,
            border: `1px solid ${colorTheme.primary}40`,
            fontSize: "0.65rem",
            height: "auto",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
            "& .MuiChip-label": { padding: "3px 8px" },
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: `0 0 15px ${colorTheme.glow}`,
            },
          }}
        />
      </Box>

      {/* Barra de progreso con animación */}
      <Box sx={{ width: "100%", mt: "auto", position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            width: "100%",
            height: 8,
            background:
              theme.palette.mode === "dark"
                ? `${colorTheme.primary}15`
                : `${colorTheme.primary}10`,
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              "--progress-width": `${Math.min(
                metaData.porcentajeCumplimiento,
                100
              )}%`,
              "--progress-color": colorTheme.glow,
              width: `${Math.min(metaData.porcentajeCumplimiento, 100)}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%)`,
              borderRadius: 4,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              animation: `${progressFill} 1.5s ease-out, ${progressGlow} 2s ease-in-out infinite`,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                borderRadius: "4px 4px 0 0",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, transparent, ${colorTheme.primary}40, transparent)`,
                animation: `${shimmer} 2s infinite`,
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.3 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.8)"
                  : theme.palette.text.secondary,
              fontWeight: 600,
            }}
          >
            {formatValue(metaData.ventasActuales)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color:
                theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.8)"
                  : theme.palette.text.secondary,
              fontWeight: 600,
            }}
          >
            Meta: {formatValue(metaData.meta)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${colorTheme.primary}60, transparent)`,
          borderRadius: 1,
          animation: `${lineGlow} 2s ease-in-out infinite`,
        }}
      />
    </Box>
  );
};

export default KpiMetaCard;
