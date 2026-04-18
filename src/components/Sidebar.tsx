import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Switch, 
  FormControlLabel,
  Paper,
  Divider
} from '@mui/material';
import { 
  Bot, 
  Target, 
  Box as BoxIcon, 
  Settings2, 
  Navigation,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Algorithm, GridDimensions, Point } from '../types';

interface SidebarProps {
  gridDim: GridDimensions;
  updateGridSize: (r: number, c: number) => void;
  start: Point;
  updateStart: (r: number, c: number) => void;
  end: Point;
  updateEnd: (r: number, c: number) => void;
  algorithm: Algorithm;
  setAlgorithm: (a: Algorithm) => void;
  isComparing: boolean;
  setIsComparing: (b: boolean) => void;
  compAlgos: [Algorithm, Algorithm];
  setCompAlgos: (a: [Algorithm, Algorithm]) => void;
  handleReset: () => void;
  clearObstacles: () => void;
  isAnimating: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  gridDim, updateGridSize,
  start, updateStart,
  end, updateEnd,
  algorithm, setAlgorithm,
  isComparing, setIsComparing,
  compAlgos, setCompAlgos,
  handleReset, clearObstacles,
  isAnimating
}) => {
  return (
    <Box sx={{ 
      p: 2.5, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2.5,
      height: '100%',
      overflowY: 'auto',
      bgcolor: 'background.paper'
    }}>
      {/* Mobile Branding */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            color: 'primary.main',
            letterSpacing: '-0.02em',
          }}
        >
          NAVIGATOR.AI
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ opacity: 0.5, fontWeight: 700 }}
        >
          v2.5.0
        </Typography>
      </Box>

      {/* Robot Simulation (Start Point) */}
      <Box>
        <SidebarHeader icon={<Bot size={18} />} title="Robot Start (S)" />
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Initial Mission Coords
          </Typography>
          <CoordInputBlock point={start} disabled={isAnimating} onChange={updateStart} />
        </Paper>
      </Box>

      {/* Target Simulation (End Point) */}
      <Box>
        <SidebarHeader icon={<Target size={18} />} title="Target Objective (T)" />
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Destination Coords
          </Typography>
          <CoordInputBlock point={end} disabled={isAnimating} onChange={updateEnd} />
        </Paper>
      </Box>

      {/* Grid Settings */}
      <Box>
        <SidebarHeader icon={<BoxIcon size={18} />} title="Grid Dimensions" />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <Box>
            <TextField 
              label="Rows" type="number" size="small" fullWidth
              value={gridDim.r}
              onChange={(e) => updateGridSize(Number(e.target.value), gridDim.c)}
            />
          </Box>
          <Box>
            <TextField 
              label="Cols" type="number" size="small" fullWidth
              value={gridDim.c}
              onChange={(e) => updateGridSize(gridDim.r, Number(e.target.value))}
            />
          </Box>
        </Box>
      </Box>

      {/* Algorithm Config */}
      <Box>
        <SidebarHeader icon={<Navigation size={18} />} title="Algorithm Config" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FormControlLabel
            sx={{ m: 0, mb: 0.5 }}
            control={<Switch size="small" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Comparison Mode</Typography>}
          />
          
          {!isComparing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Logic Core</InputLabel>
              <Select 
                value={algorithm} label="Logic Core"
                onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              >
                <MenuItem value="bfs">Breadth First Search</MenuItem>
                <MenuItem value="dfs">Depth First Search</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Pane A</InputLabel>
                <Select 
                  value={compAlgos[0]} label="Pane A"
                  onChange={(e) => setCompAlgos([e.target.value as Algorithm, compAlgos[1]])}
                >
                   <MenuItem value="bfs">BFS</MenuItem>
                   <MenuItem value="dfs">DFS</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Pane B</InputLabel>
                <Select 
                  value={compAlgos[1]} label="Pane B"
                  onChange={(e) => setCompAlgos([compAlgos[0], e.target.value as Algorithm])}
                >
                   <MenuItem value="bfs">BFS</MenuItem>
                   <MenuItem value="dfs">DFS</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Box>

      {/* Reset Controls */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block' }}>
          Manual Overrides
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Box>
            <Button 
              fullWidth variant="outlined" size="small" 
              onClick={handleReset} disabled={isAnimating}
              startIcon={<RefreshCw size={14} />}
            >
              Reset
            </Button>
          </Box>
          <Box>
            <Button 
              fullWidth variant="outlined" size="small" 
              onClick={clearObstacles} disabled={isAnimating}
              startIcon={<Trash2 size={14} />}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const SidebarHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
      {title}
    </Typography>
  </Box>
);

const CoordInputBlock: React.FC<{
  point: [number, number];
  disabled: boolean;
  onChange: (r: number, c: number) => void;
}> = ({ point, disabled, onChange }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
    <Box>
      <TextField 
        label="Lng (X)" size="small" fullWidth value={point[1]} 
        onChange={(e) => onChange(point[0], Number(e.target.value))}
        type="number"
        disabled={disabled}
        sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '13px' } }}
      />
    </Box>
    <Box>
      <TextField 
        label="Lat (Y)" size="small" fullWidth value={point[0]} 
        onChange={(e) => onChange(Number(e.target.value), point[1])}
        type="number"
        disabled={disabled}
        sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '13px' } }}
      />
    </Box>
  </Box>
);
