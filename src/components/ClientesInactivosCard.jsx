import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const ClientesInactivosCard = ({
  title = "Clientes Inactivos",
  value = 450,
  subtitle = "Este mes",
}) => {
  const theme = useTheme();

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
        {value.toLocaleString("es-CL")}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color:
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "#1a1a1a",
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
  );
};

export default ClientesInactivosCard;
