import React from 'react';
import { useTheme } from '@mui/material/styles';

const LitrosCard = ({ 
  title = 'Litros Vendidos', 
  value = 25000, 
  subtitle = 'Este mes',
  percentageChange = 6.7,
  isPositive = true 
}) => {
  const theme = useTheme();
  
  const formatValue = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K L`;
    } else {
      return `${val.toLocaleString('es-CL')} L`;
    }
  };

  return (
    <div style={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 16,
      padding: 28,
      color: theme.palette.text.primary,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
        : '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      minHeight: 180,
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(0, 191, 255, 0.4)' 
        : 'rgba(0, 191, 255, 0.1)'}`,
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 12px 40px rgba(0, 191, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.2)'
          : '0 12px 40px rgba(0, 0, 0, 0.15)',
        borderColor: 'rgba(0, 191, 255, 0.6)'
      }
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: theme.palette.text.primary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            {title}
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: 8,
            color: theme.palette.text.primary,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.1,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            {formatValue(value)}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#1a1a1a',
            fontWeight: 500,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          background: theme.palette.mode === 'dark' 
            ? 'rgba(0, 191, 255, 0.2)' 
            : 'rgba(0, 191, 255, 0.1)',
          borderRadius: 12,
          padding: '8px 12px',
          fontSize: '0.875rem',
          color: isPositive ? '#059669' : '#dc2626',
          fontWeight: 600,
          border: `1px solid ${isPositive ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}>
          {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
        </div>
      </div>
      
      {/* Gráfico de tendencia simplificado */}
      <div style={{ 
        width: '100%', 
        height: 40, 
        marginTop: 16,
        position: 'relative'
      }}>
        <svg width="100%" height="40" style={{ overflow: 'visible' }}>
          <path
            d="M0 28 Q20 18 40 23 T80 13 T120 18 T160 8 T200 13"
            stroke="#9370db"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0 28 Q20 18 40 23 T80 13 T120 18 T160 8 T200 13 L200 40 L0 40 Z"
            fill="url(#gradient)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9370db" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#9370db" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LitrosCard; 