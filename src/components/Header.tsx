import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Tabs, 
  Tab, 
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Sun, 
  Moon, 
  Play, 
  Settings2, 
  Bot 
} from 'lucide-react';
import { ThemeMode, Algorithm } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  toggleTheme: () => void;
  isSolving: boolean;
  isAnimating: boolean;
  algorithm: Algorithm;
  handleSolve: () => void;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  isSolving,
  isAnimating,
  algorithm,
  handleSolve,
  toggleSidebar
}) => {
  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'background.paper', 
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ display: { lg: 'none' } }}
            color="inherit"
          >
            <Settings2 size={20} />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 800, 
              color: 'primary.main',
              letterSpacing: '-0.02em',
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 1
            }}
          >
            NAVIGATOR.AI
            <Typography 
              variant="caption" 
              sx={{ opacity: 0.5, display: { xs: 'none', sm: 'inline' } }}
            >
              v2.5.0
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#3b82f6" />}
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ my: 2, display: { xs: 'none', md: 'block' } }} />

          <Button
            variant="contained"
            color="success"
            disableElevation
            onClick={handleSolve}
            disabled={isSolving || isAnimating}
            startIcon={isSolving ? <CircularProgress size={16} color="inherit" /> : <Play size={16} fill="currentColor" />}
            sx={{ 
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: 0.8,
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {isSolving ? 'Solving...' : algorithm.toUpperCase()}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
               {isSolving ? '' : 'GO'}
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
