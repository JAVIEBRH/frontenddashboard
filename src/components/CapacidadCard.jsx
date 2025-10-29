import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';

const CircularProgressBar = ({ value, size = 140, stroke = 12, color = '#3b82f6', bgColor = '#e2e8f0', theme }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.palette.mode === 'dark' ? '#374151' : bgColor}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize={size * 0.28}
        fill={theme.palette.text.primary}
        fontWeight="700"
        dy=".3em"
        fontFamily='"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}
      >
        {`${value}%`}
      </text>
    </svg>
  );
};

const CapacidadCard = ({ 
  title = 'Capacidad de Producción', 
  value = 85, 
  subtitle = 'Litros vendidos este mes',
  maxValue = 100,
  unit = '%',
  litrosVendidos = 0,
  capacidadTotal = 30000
}) => {
  const theme = useTheme();
  const percentage = value; // El valor ya viene como porcentaje
  
  // Determinar el color según el porcentaje
  const getProgressColor = (percent) => {
    if (percent < 60) return '#10b981'; // Verde
    if (percent < 80) return '#f59e0b'; // Amarillo
    if (percent < 95) return '#f97316'; // Naranja
    return '#dc2626'; // Rojo
  };

  const progressColor = getProgressColor(percentage);
  
  return (
    <div style={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 16,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: 32,
      minWidth: 300,
      maxWidth: 360,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(147, 112, 219, 0.2)' 
        : 'rgba(147, 112, 219, 0.1)'}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        fontSize: '1.125rem', 
        fontWeight: 700, 
        color: theme.palette.text.primary, 
        marginBottom: 16, 
        textAlign: 'center',
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility'
      }}>
        {title}
      </div>
      
      <CircularProgressBar value={percentage} color={progressColor} theme={theme} />
      
              <div style={{ 
          fontSize: '1.125rem', // Aumentado de 1rem
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary, 
          margin: '20px 0 12px 0', 
          textAlign: 'center', 
          fontWeight: 500,
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}>
          Litros vendidos este mes
        </div>
      
      <div style={{ width: '100%', margin: '12px 0' }}>
        <div style={{
          width: '100%',
          height: 8,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(147, 112, 219, 0.2)' 
            : 'rgba(147, 112, 219, 0.1)',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: progressColor,
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
      
      <div style={{ 
        fontSize: '0.95rem', // Aumentado de 0.875rem
        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary, 
        marginTop: 12, 
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility'
      }}>
        {`${litrosVendidos.toLocaleString('es-CL')}L vendidos de ${capacidadTotal.toLocaleString('es-CL')}L disponibles`}
      </div>
    </div>
  );
};

export default CapacidadCard; 