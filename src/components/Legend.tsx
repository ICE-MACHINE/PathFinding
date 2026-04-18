import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export const Legend: React.FC = () => {
  return (
    <Box sx={{ mt: 'auto', py: 4, width: '100%', display: 'flex', justifyContent: 'center', px: 2, position: 'relative', zIndex: 10 }}>
      <Paper 
        elevation={10} 
        sx={{ 
          bgcolor: 'background.paper', 
          border: '1px solid', 
          borderColor: 'divider', 
          backdropFilter: 'blur(10px)',
          px: { xs: 2, sm: 4 }, 
          py: 1.5, 
          borderRadius: 10,
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: { xs: 2, sm: 4 } 
        }}
      >
        <LegendItem color="bg-start" shadow="#ef4444" label="Start" />
        <LegendItem color="bg-target" shadow="#22c55e" label="Target" />
        <LegendItem color="bg-obstacle" label="Wall" border="white/5" />
        <LegendItem border="var(--color-accent)" shadow="rgba(59,130,246,0.5)" label="Path" isPath />
      </Paper>
    </Box>
  );
};

const LegendItem: React.FC<{ color?: string; shadow?: string; label: string; border?: string; isPath?: boolean }> = ({ 
  color, shadow, label, border, isPath 
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ 
      width: 10, 
      height: 10, 
      borderRadius: '2px', 
      bgcolor: color,
      border: isPath ? '2px solid' : (border ? '1px solid' : 'none'),
      borderColor: border,
      boxShadow: shadow ? `0 0 8px ${shadow}` : 'none'
    }} />
    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{label}</Typography>
  </Box>
);
