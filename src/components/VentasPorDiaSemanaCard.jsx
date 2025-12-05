import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, keyframes, Fade } from "@mui/material";

// Animaciones futuristas
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(168, 85, 247, 0.4), 0 0 10px rgba(168, 85, 247, 0.2);
  }
  50% { 
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6), 0 0 25px rgba(168, 85, 247, 0.3);
  }
`;

const barGrow = keyframes`
  0% { transform: scaleY(0); opacity: 0; }
  100% { transform: scaleY(1); opacity: 1; }
`;

const tooltipFadeIn = keyframes`
  0% { opacity: 0; transform: translateY(8px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const VentasPorDiaSemanaCard = ({ ventasPorDia = [] }) => {
  const theme = useTheme();
  const [hoveredBar, setHoveredBar] = useState(null);

  // Días de la semana abreviados
  const diasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  // Asegurar que tenemos 7 días de datos
  const datosCompletos = diasSemana.map((dia) => {
    const encontrado = ventasPorDia.find((d) =>
      d.dia?.toLowerCase().startsWith(dia.toLowerCase().slice(0, 3))
    );
    return {
      dia,
      ventas: encontrado?.ventas || 0,
    };
  });

  // Calcular el máximo para la escala
  const maxVentas = Math.max(...datosCompletos.map((d) => d.ventas), 1);

  // Calcular total semanal
  const totalSemanal = datosCompletos.reduce((sum, d) => sum + d.ventas, 0);

  // Formatear moneda
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString("es-CL")}`;
  };

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)"
            : "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)",
        borderRadius: 3,
        padding: 2.5,
        color: theme.palette.text.primary,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        height: "100%",
        width: "100%",
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(0, 191, 255, 0.3)"
            : "rgba(0, 191, 255, 0.15)"
        }`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 12px 40px rgba(0, 191, 255, 0.3), 0 0 60px rgba(0, 191, 255, 0.1)"
              : "0 12px 40px rgba(0, 0, 0, 0.15)",
          borderColor: "rgba(0, 191, 255, 0.5)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "200%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent)",
          animation: `${shimmer} 3s infinite`,
          pointerEvents: "none",
        },
      }}
    >
      {/* Efecto de esquina brillante */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle, rgba(0, 191, 255, 0.15) 0%, transparent 70%)",
          animation: `${pulse} 2s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />

      {/* Header con título y valor */}
      <Box sx={{ mb: 1.5, position: "relative", zIndex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color:
              theme.palette.mode === "dark"
                ? "rgba(0, 191, 255, 0.9)"
                : "#7c3aed",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontSize: "0.7rem",
            display: "block",
            mb: 0.5,
          }}
        >
          📊 VENTAS SEMANALES
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            lineHeight: 1,
            fontSize: "1.5rem",
            textShadow:
              theme.palette.mode === "dark"
                ? "0 0 20px rgba(0, 191, 255, 0.3)"
                : "none",
          }}
        >
          {formatCurrency(totalSemanal)}
        </Typography>
      </Box>

      {/* Gráfico de barras */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 0.8,
          px: 0.5,
          pb: 0.5,
          minHeight: 80,
          position: "relative",
          zIndex: 1,
        }}
      >
        {datosCompletos.map((dia, index) => {
          const alturaRelativa =
            maxVentas > 0 ? (dia.ventas / maxVentas) * 100 : 10;
          const alturaMinima = 15;
          const alturaFinal =
            dia.ventas > 0 ? Math.max(alturaRelativa, 25) : alturaMinima;
          const isHovered = hoveredBar === index;

          return (
            <Box
              key={index}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                position: "relative",
              }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip elegante */}
              <Fade in={isHovered} timeout={200}>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: `calc(${alturaFinal}% + 12px)`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    animation: isHovered
                      ? `${tooltipFadeIn} 0.25s ease-out`
                      : "none",
                    pointerEvents: "none",
                  }}
                >
                  <Box
                    sx={{
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(20, 20, 35, 0.95)"
                          : "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(12px)",
                      borderRadius: 2,
                      padding: "8px 12px",
                      border: `1px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(0, 191, 255, 0.4)"
                          : "rgba(0, 191, 255, 0.25)"
                      }`,
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 191, 255, 0.2)"
                          : "0 8px 32px rgba(0, 0, 0, 0.15)",
                      minWidth: 70,
                      textAlign: "center",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -6,
                        left: "50%",
                        transform: "translateX(-50%) rotate(45deg)",
                        width: 10,
                        height: 10,
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(20, 20, 35, 0.95)"
                            : "rgba(255, 255, 255, 0.98)",
                        borderRight: `1px solid ${
                          theme.palette.mode === "dark"
                            ? "rgba(0, 191, 255, 0.4)"
                            : "rgba(0, 191, 255, 0.25)"
                        }`,
                        borderBottom: `1px solid ${
                          theme.palette.mode === "dark"
                            ? "rgba(0, 191, 255, 0.4)"
                            : "rgba(0, 191, 255, 0.25)"
                        }`,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color:
                          theme.palette.mode === "dark"
                            ? "rgba(0, 191, 255, 0.9)"
                            : "#7c3aed",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        mb: 0.3,
                      }}
                    >
                      {dia.dia}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(dia.ventas)}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Barra con animación */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 35,
                  height: `${alturaFinal}%`,
                  minHeight: 15,
                  background: isHovered
                    ? "linear-gradient(180deg, #e879f9 0%, #c084fc 25%, #a855f7 50%, #7c3aed 75%, #6366f1 100%)"
                    : "linear-gradient(180deg, #e879f9 0%, #c084fc 25%, #a855f7 50%, #7c3aed 75%, #6366f1 100%)",
                  borderRadius: "8px 8px 3px 3px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `${barGrow} 0.6s ease-out ${index * 0.08}s both`,
                  transformOrigin: "bottom",
                  position: "relative",
                  transform: isHovered
                    ? "scaleY(1.08) scaleX(1.1)"
                    : "scaleY(1) scaleX(1)",
                  boxShadow: isHovered
                    ? "0 0 30px rgba(168, 85, 247, 1), 0 0 60px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)"
                    : `0 0 8px rgba(168, 85, 247, 0.6), 0 0 15px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.15)`,
                  filter: isHovered ? "brightness(1.2)" : "brightness(1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "8px 8px 3px 3px",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 30%, transparent 60%)",
                    transition: "all 0.3s ease",
                    pointerEvents: "none",
                    opacity: isHovered ? 1 : 0.8,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "35%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.2) 40%, transparent 100%)",
                    borderRadius: "8px 8px 0 0",
                    pointerEvents: "none",
                    filter: "blur(1px)",
                  },
                }}
              />

              {/* Indicador de punto en hover */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: `calc(${alturaFinal}% - 4px)`,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow:
                    "0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.5)",
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "scale(1)" : "scale(0)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 5,
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Etiquetas de días con estilo futurista */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 0.5,
          pt: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {diasSemana.map((dia, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              flex: 1,
              textAlign: "center",
              color:
                hoveredBar === index
                  ? "#a855f7"
                  : theme.palette.mode === "dark"
                  ? "rgba(0, 191, 255, 0.8)"
                  : theme.palette.text.secondary,
              fontSize: "0.6rem",
              fontWeight: hoveredBar === index ? 700 : 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.3s ease",
              textShadow:
                hoveredBar === index
                  ? "0 0 10px rgba(168, 85, 247, 0.5)"
                  : "none",
            }}
          >
            {dia}
          </Typography>
        ))}
      </Box>

      {/* Línea decorativa inferior */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent)",
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

export default VentasPorDiaSemanaCard;
