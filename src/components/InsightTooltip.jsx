import React from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const InsightTooltip = ({ title, children, placement = 'top' }) => {
  const theme = useTheme();

  const CustomTooltipContent = (
    <Box
      sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        padding: 2.5,
        border: `1px solid ${theme.palette.mode === 'dark'
          ? 'rgba(147, 112, 219, 0.3)'
          : 'rgba(147, 112, 219, 0.2)'}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 40px rgba(147, 112, 219, 0.15)'
          : '0 8px 32px rgba(147, 112, 219, 0.3), 0 0 40px rgba(147, 112, 219, 0.1)',
        maxWidth: 320,
        position: 'relative',
        animation: 'glow-pulse 2s ease-in-out infinite',
        '@keyframes glow-pulse': {
          '0%, 100%': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 40px rgba(147, 112, 219, 0.15)'
              : '0 8px 32px rgba(147, 112, 219, 0.3), 0 0 40px rgba(147, 112, 219, 0.1)',
          },
          '50%': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(147, 112, 219, 0.6), 0 0 50px rgba(147, 112, 219, 0.25)'
              : '0 8px 32px rgba(147, 112, 219, 0.4), 0 0 50px rgba(147, 112, 219, 0.15)',
          },
        },
      }}
    >
      <Box
        component="div"
        sx={{
          fontSize: '0.95rem',
          lineHeight: 1.9,
          color: theme.palette.text.primary,
          fontWeight: 500,
          whiteSpace: 'pre-line',
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        {typeof title === 'string' ? (
          title.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            
            // Líneas vacías
            if (!trimmedLine) {
              return <br key={index} />;
            }
            
            // Títulos principales (empiezan con emoji y mayúsculas)
            if (/^[💰📊📅💵🏪🚚💡✅⚠️📈📉]/.test(trimmedLine) && /^[A-Z]/.test(trimmedLine.substring(1).trim())) {
              return (
                <Typography
                  key={index}
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: theme.palette.mode === 'dark' ? '#a855f7' : '#7c3aed',
                    marginBottom: '10px',
                    marginTop: index > 0 ? '12px' : '0',
                    display: 'block',
                    textShadow: theme.palette.mode === 'dark' 
                      ? '0 0 12px rgba(168, 85, 247, 0.6)' 
                      : '0 2px 4px rgba(124, 58, 237, 0.2)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {trimmedLine}
                </Typography>
              );
            }
            
            // Secciones (empiezan con emoji y tienen dos espacios)
            if (/^  [🏪🚚📅📊💡]/.test(line)) {
              return (
                <Typography
                  key={index}
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: theme.palette.mode === 'dark' ? '#c084fc' : '#a855f7',
                    marginTop: '10px',
                    marginBottom: '6px',
                    display: 'block',
                    letterSpacing: '0.05em',
                  }}
                >
                  {trimmedLine}
                </Typography>
              );
            }
            
            // Función para obtener color según el tipo de métrica
            const obtenerColorMetrica = (texto) => {
              const textoLower = texto.toLowerCase();
              // Ventas - Verde-azul (turquesa → verde esmeralda)
              if (textoLower.includes('venta') || textoLower.includes('ventas') || textoLower.includes('ingreso')) {
                return {
                  color: theme.palette.mode === 'dark' ? '#22d3ee' : '#059669',
                  bgColor: theme.palette.mode === 'dark' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                  shadow: theme.palette.mode === 'dark' 
                    ? '0 0 10px rgba(34, 211, 238, 0.6)' 
                    : '0 1px 3px rgba(5, 150, 105, 0.4)',
                };
              }
              // Costos - Naranja-rojo
              if (textoLower.includes('costo') || textoLower.includes('costos') || textoLower.includes('gasto')) {
                return {
                  color: theme.palette.mode === 'dark' ? '#fb923c' : '#ea580c',
                  bgColor: theme.palette.mode === 'dark' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(234, 88, 12, 0.1)',
                  shadow: theme.palette.mode === 'dark' 
                    ? '0 0 10px rgba(251, 146, 60, 0.6)' 
                    : '0 1px 3px rgba(234, 88, 12, 0.4)',
                };
              }
              // Utilidad - Púrpura-azul
              if (textoLower.includes('utilidad') || textoLower.includes('ganancia') || textoLower.includes('beneficio')) {
                return {
                  color: theme.palette.mode === 'dark' ? '#a855f7' : '#7c3aed',
                  bgColor: theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                  shadow: theme.palette.mode === 'dark' 
                    ? '0 0 10px rgba(168, 85, 247, 0.6)' 
                    : '0 1px 3px rgba(124, 58, 237, 0.4)',
                };
              }
              // Por defecto - turquesa (valor genérico)
              return {
                color: theme.palette.mode === 'dark' ? '#22d3ee' : '#059669',
                bgColor: theme.palette.mode === 'dark' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(5, 150, 105, 0.08)',
                shadow: theme.palette.mode === 'dark' 
                  ? '0 0 10px rgba(34, 211, 238, 0.5)' 
                  : '0 1px 3px rgba(5, 150, 105, 0.3)',
              };
            };

            // Líneas con valores monetarios o números
            if (/\$[\d,]+|[\d,]+[KM]|N\/A/.test(trimmedLine)) {
              const partes = trimmedLine.split(/(\$[\d,]+\.?\d*[KM]?|[\d,]+\.?\d*[KM]?|N\/A)/);
              const colorMetrica = obtenerColorMetrica(trimmedLine);
              
              return (
                <Typography
                  key={index}
                  component="div"
                  sx={{
                    fontSize: '0.9rem',
                    marginBottom: '4px',
                  }}
                >
                  {partes.map((part, partIndex) => {
                    if (/\$[\d,]+\.?\d*[KM]?|[\d,]+\.?\d*[KM]?|N\/A/.test(part)) {
                      return (
                        <Box
                          key={partIndex}
                          component="span"
                          sx={{
                            fontSize: '1.05rem',
                            fontWeight: 900,
                            color: colorMetrica.color,
                            textShadow: colorMetrica.shadow,
                            padding: '0 4px',
                            backgroundColor: colorMetrica.bgColor,
                            borderRadius: '4px',
                          }}
                        >
                          {part}
                        </Box>
                      );
                    }
                    if (part.trim() && part.includes(':')) {
                      const [label, ...rest] = part.split(':');
                      const colorLabel = obtenerColorMetrica(label);
                      return (
                        <span key={partIndex}>
                          <Box
                            component="span"
                            sx={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: colorLabel.color,
                              marginRight: '4px',
                            }}
                          >
                            {label}:
                          </Box>
                          {rest.join(':')}
                        </span>
                      );
                    }
                    return (
                      <Box
                        key={partIndex}
                        component="span"
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {part}
                      </Box>
                    );
                  })}
                </Typography>
              );
            }
            
            // Líneas que mencionan Ventas, Costos o Utilidad sin valores
            if (/venta|ingreso|ingresos|costo|costos|gasto|utilidad|ganancia|beneficio/i.test(trimmedLine)) {
              const colorMetrica = obtenerColorMetrica(trimmedLine);
              return (
                <Typography
                  key={index}
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: colorMetrica.color,
                    marginBottom: '4px',
                    textShadow: colorMetrica.shadow,
                  }}
                >
                  {trimmedLine}
                </Typography>
              );
            }
            
            // Líneas normales
            return (
              <Typography
                key={index}
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  marginBottom: '3px',
                }}
              >
                {line}
              </Typography>
            );
          })
        ) : (
          title
        )}
      </Box>
    </Box>
  );

  return (
    <Tooltip
      title={CustomTooltipContent}
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
            padding: 0,
            boxShadow: 'none',
            maxWidth: 'none',
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(4px) scale(0.95)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              },
            },
          },
        },
        arrow: {
          sx: {
            color: theme.palette.mode === 'dark'
              ? 'rgba(26, 26, 46, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
            '&::before': {
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(147, 112, 219, 0.3)'
                : 'rgba(147, 112, 219, 0.2)'}`,
            },
          },
        },
      }}
      enterDelay={200}
      leaveDelay={100}
      TransitionProps={{
        timeout: { enter: 200, exit: 150 },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default InsightTooltip;

