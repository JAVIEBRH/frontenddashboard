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
            <Bar dataKey="ventas" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
      borderRadius: 16,
      padding: 28,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(147, 112, 219, 0.2)' 
        : 'rgba(147, 112, 219, 0.1)'}`,
      transition: 'all 0.3s ease'
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