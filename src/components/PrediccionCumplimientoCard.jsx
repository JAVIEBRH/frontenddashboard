import React from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import { TrendingUp, TrendingDown, CheckCircle, Warning } from "@mui/icons-material";

export default function PrediccionCumplimientoCard({
  prediccionEsperada,
  pedidosReales,
  fecha,
  zona,
  tipoCliente
}) {
  // Calcular porcentaje de cumplimiento
  const porcentajeCumplimiento = pedidosReales > 0 
    ? Math.round((pedidosReales / prediccionEsperada) * 100)
    : 0;

  // Determinar estado y color
  const getEstado = () => {
    if (porcentajeCumplimiento >= 90 && porcentajeCumplimiento <= 110) {
      return { estado: "Excelente", color: "#10b981", icon: <CheckCircle /> };
    } else if (porcentajeCumplimiento >= 80 && porcentajeCumplimiento <= 120) {
      return { estado: "Bueno", color: "#3b82f6", icon: <TrendingUp /> };
    } else if (porcentajeCumplimiento >= 70 && porcentajeCumplimiento <= 130) {
      return { estado: "Aceptable", color: "#f59e0b", icon: <Warning /> };
    } else {
      return { estado: "Requiere ajuste", color: "#ef4444", icon: <TrendingDown /> };
    }
  };

  const { estado, color, icon } = getEstado();

  // Calcular diferencia
  const diferencia = pedidosReales - prediccionEsperada;
  const diferenciaTexto = diferencia > 0 ? `+${diferencia}` : diferencia.toString();

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        border: '1px solid rgba(147, 112, 219, 0.1)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Cumplimiento Predicción
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {React.cloneElement(icon, { sx: { color: color, fontSize: 20 } })}
            <Typography 
              variant="caption" 
              sx={{ 
                color: color, 
                fontSize: '0.875rem', 
                fontWeight: 600 
              }}
            >
              {estado}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            color: color,
            fontWeight: 800,
            mb: 1,
            fontSize: '2rem'
          }}
        >
          {porcentajeCumplimiento}%
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            mb: 2,
            fontSize: '0.875rem'
          }}
        >
          {pedidosReales} / {prediccionEsperada} pedidos
        </Typography>

        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(porcentajeCumplimiento, 150)} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 4
              }
            }} 
          />
        </Box>

        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.4
          }}
        >
          {fecha && zona && tipoCliente ? (
            <>
              {fecha} - {zona}<br/>
              {tipoCliente}
            </>
          ) : (
            <>
              Predicción vs Real<br/>
              {diferencia !== 0 && (
                <Typography 
                  component="span" 
                  sx={{ 
                    color: diferencia > 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem'
                  }}
                >
                  {diferenciaTexto} pedidos
                </Typography>
              )}
            </>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
} 