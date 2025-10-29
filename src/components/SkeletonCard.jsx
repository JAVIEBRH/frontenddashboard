import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

export default function SkeletonCard({ variant = "default" }) {
  const theme = useTheme();

  const variants = {
    default: (
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
      </Box>
    ),
    kpi: (
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="30%" height={16} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
      </Box>
    ),
    chart: (
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1, mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
      </Box>
    ),
    table: (
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 3 }} />
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="text" width="25%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
          </Box>
        ))}
      </Box>
    )
  };

  return variants[variant] || variants.default;
} 