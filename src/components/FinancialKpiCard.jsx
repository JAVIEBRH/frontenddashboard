import React, { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { formatCurrency, formatNumber } from '../utils/formatters';

const FinancialKpiCard = ({ 
  title = 'Ticket Promedio', 
  value = 12500, 
  subtitle = 'Por pedido',
  icon = '💰',
  trend = '+5.2%',
  isPositive = true 
}) => {
  const theme = useTheme();
  
  const formatValue = (val) => {
    // Solo agregar $ si el título es "Ticket Promedio"
    if (title === 'Ticket Promedio') {
      return formatCurrency(val);
    }
    return formatNumber(val);
  };

  return (
    <div style={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 12,
      padding: 20,
      color: theme.palette.text.primary,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 2px 12px rgba(0, 0, 0, 0.2)'
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(147, 112, 219, 0.2)' 
        : 'rgba(147, 112, 219, 0.1)'}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '1rem', // Estandarizado a 1rem
            fontWeight: 700, 
            color: theme.palette.text.primary, 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontDisplay: 'swap'
          }}>
            {title}
          </div>
          <div style={{ 
            fontSize: '2rem', // Estandarizado a 2rem
            fontWeight: 800, 
            marginBottom: 4,
            color: theme.palette.text.primary,
            fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.1,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
            fontDisplay: 'swap'
          }}>
            {formatValue(value)}
          </div>
          <div style={{ 
            fontSize: '0.9rem', // Estandarizado a 0.9rem
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#1e293b',
            fontWeight: 600,
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontDisplay: 'swap'
          }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          background: theme.palette.mode === 'dark' 
            ? 'rgba(147, 112, 219, 0.2)' 
            : 'rgba(147, 112, 219, 0.1)',
          borderRadius: 8,
          padding: '6px 8px',
          fontSize: '0.9rem', // Estandarizado a 0.9rem
          color: isPositive ? '#059669' : '#dc2626',
          fontWeight: 600,
          border: `1px solid ${isPositive ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"liga" 1, "kern" 1',
          fontDisplay: 'swap'
        }}>
          {trend}
        </div>
      </div>
      
      {/* Gráfico de tendencia simplificado */}
      <div style={{ 
        width: '100%', 
        height: 24, 
        marginTop: 8,
        position: 'relative'
      }}>
        <svg width="100%" height="24" style={{ overflow: 'visible' }}>
          <path
            d="M0 18 Q15 10 30 14 T60 6 T90 10 T120 2 T150 6"
            stroke="#9370db"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0 18 Q15 10 30 14 T60 6 T90 10 T120 2 T150 6 L150 24 L0 24 Z"
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

export default memo(FinancialKpiCard); 