import React from 'react';
import { Box, Typography } from '@mui/material';

const ClientesInactivosCard = ({ 
  title = 'Clientes Inactivos', 
  value = 450, 
  subtitle = 'Este mes'
}) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)',
        borderRadius: 3,
        padding: 2,
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
      <Typography 
        variant="caption" 
        sx={{ 
          opacity: 0.9, 
          mb: 0.5,
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          mb: 1,
          fontSize: '1.5rem',
          color: '#1e293b'
        }}
      >
        {value.toLocaleString('es-CL')}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          opacity: 0.8,
          fontSize: '0.7rem',
          color: '#64748b'
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default ClientesInactivosCard; 