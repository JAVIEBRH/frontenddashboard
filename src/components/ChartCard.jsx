import React, { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, data, type = 'line', height = 300 }) => {
  const theme = useTheme();
  const formatTooltip = (value, name) => {
    if (name === 'ventas') return [`$${value.toLocaleString()}`, 'Ventas'];
    if (name === 'pedidos') return [value, 'Pedidos'];
    if (name === 'litros') return [`${value}L`, 'Litros'];
    return [value, name];
  };

  const renderChart = () => {
    const gridColor = theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme.palette.text.primary;
    
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ventas" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              tension={0.3}
              animationDuration={300}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <defs>
              {/* Gradiente púrpura brillante para las barras */}
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e879f9" stopOpacity={1} />
                <stop offset="25%" stopColor="#c084fc" stopOpacity={1} />
                <stop offset="50%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="75%" stopColor="#7c3aed" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary
              }}
            />
            <Bar 
              dataKey="ventas" 
              fill="url(#purpleGradient)" 
              radius={[8, 8, 0, 0]}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.6))',
              }}
            />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #000000 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 16,
      padding: 28,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 30px rgba(0, 191, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
        : '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(0, 191, 255, 0.4)' 
        : 'rgba(0, 191, 255, 0.1)'}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
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
      <h3 style={{
        color: theme.palette.text.primary,
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility'
      }}>
        {title}
      </h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(ChartCard); 