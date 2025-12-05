import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Chip, keyframes } from "@mui/material";

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

const barGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.7); }
`;

const LocalVsDeliveryCard = ({ ventasLocal = 0, ventasDelivery = 0 }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  const totalVentas = ventasLocal + ventasDelivery;
  const porcentajeLocal = totalVentas > 0 ? (ventasLocal / totalVentas) * 100 : 50;
  const canalDominante = ventasLocal >= ventasDelivery ? "Local" : "Delivery";
  const valorDominante = ventasLocal >= ventasDelivery ? ventasLocal : ventasDelivery;

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString("es-CL")}`;
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
          : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
        borderRadius: 3,
        padding: 3,
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === "dark"
          ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        minHeight: 180,
        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(0, 191, 255, 0.4)" : "rgba(0, 191, 255, 0.15)"}`,
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)"
            : "0 12px 40px rgba(0, 0, 0, 0.15)",
          borderColor: "rgba(0, 191, 255, 0.6)"
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "200%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent)",
          animation: `${shimmer} 3s infinite`,
          pointerEvents: "none"
        }
      }}
    >
      <Box sx={{
        position: "absolute",
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        background: "radial-gradient(circle, rgba(0, 191, 255, 0.15) 0%, transparent 70%)",
        animation: `${pulse} 2s ease-in-out infinite`,
        pointerEvents: "none"
      }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, position: "relative", zIndex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "rgba(0, 191, 255, 0.9)" : "#7c3aed",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "0.75rem"
          }}>
            🏪 LOCAL VS DELIVERY
          </Typography>
          <Typography variant="h3" sx={{
            fontWeight: 800,
            mb: 1,
            color: theme.palette.text.primary,
            lineHeight: 1.1,
            fontSize: "2.2rem",
            textShadow: theme.palette.mode === "dark" ? "0 0 20px rgba(0, 191, 255, 0.3)" : "none",
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.02)" : "scale(1)"
          }}>
            {formatCurrency(totalVentas)}
          </Typography>
          <Typography variant="body2" sx={{
            color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: "0.85rem"
          }}>
            {canalDominante} lidera ({porcentajeLocal.toFixed(0)}% local)
          </Typography>
        </Box>
        <Chip
          label={formatCurrency(valorDominante)}
          sx={{
            background: theme.palette.mode === "dark" ? "rgba(0, 191, 255, 0.2)" : "rgba(0, 191, 255, 0.1)",
            color: "#9370db",
            fontWeight: 700,
            border: "1px solid rgba(0, 191, 255, 0.3)",
            fontSize: "0.85rem",
            height: "auto",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
            "& .MuiChip-label": { padding: "6px 10px" },
            "&:hover": { transform: "scale(1.05)", boxShadow: "0 0 15px rgba(0, 191, 255, 0.4)" }
          }}
        />
      </Box>

      {/* Barras de comparación con animación */}
      <Box sx={{ width: "100%", mt: 2, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" sx={{ 
            color: hoveredBar === 'local' ? '#a855f7' : (theme.palette.mode === "dark" ? "rgba(0, 191, 255, 0.8)" : theme.palette.text.secondary), 
            fontSize: "0.7rem",
            fontWeight: hoveredBar === 'local' ? 700 : 600,
            transition: 'all 0.3s ease'
          }}>
            Local: {formatCurrency(ventasLocal)}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: hoveredBar === 'delivery' ? '#22d3ee' : (theme.palette.mode === "dark" ? "rgba(0, 191, 255, 0.8)" : theme.palette.text.secondary), 
            fontSize: "0.7rem",
            fontWeight: hoveredBar === 'delivery' ? 700 : 600,
            transition: 'all 0.3s ease'
          }}>
            Delivery: {formatCurrency(ventasDelivery)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, height: 10 }}>
          <Box
            onMouseEnter={() => setHoveredBar('local')}
            onMouseLeave={() => setHoveredBar(null)}
            sx={{
              flex: porcentajeLocal,
              background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
              borderRadius: "6px 0 0 6px",
              minWidth: porcentajeLocal > 0 ? 8 : 0,
              transition: "all 0.3s ease",
              animation: hoveredBar === 'local' ? `${barGlow} 1s ease-in-out infinite` : 'none',
              transform: hoveredBar === 'local' ? 'scaleY(1.3)' : 'scaleY(1)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                borderRadius: '6px 0 0 0'
              }
            }}
          />
          <Box
            onMouseEnter={() => setHoveredBar('delivery')}
            onMouseLeave={() => setHoveredBar(null)}
            sx={{
              flex: 100 - porcentajeLocal,
              background: "linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
              borderRadius: "0 6px 6px 0",
              minWidth: 100 - porcentajeLocal > 0 ? 8 : 0,
              transition: "all 0.3s ease",
              animation: hoveredBar === 'delivery' ? `${barGlow} 1s ease-in-out infinite` : 'none',
              transform: hoveredBar === 'delivery' ? 'scaleY(1.3)' : 'scaleY(1)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                borderRadius: '0 6px 0 0'
              }
            }}
          />
        </Box>
      </Box>

      <Box sx={{
        position: "absolute",
        bottom: 0,
        left: "10%",
        right: "10%",
        height: 2,
        background: "linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent)",
        borderRadius: 1,
        animation: `${lineGlow} 2s ease-in-out infinite`
      }} />
    </Box>
  );
};

export default LocalVsDeliveryCard;
