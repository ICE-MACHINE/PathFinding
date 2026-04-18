import React, { useState, useMemo, useCallback } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { motion } from "motion/react";
import { getTheme } from "./theme";
import { usePathfinding } from "./hooks/usePathfinding";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Grid } from "./components/Grid";
import { Legend } from "./components/Legend";
import { ThemeMode } from "./types";

const SIDEBAR_WIDTH = 340;

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // localStorage may be unavailable in some environments (SSR, sandboxes)
    try {
      return (localStorage.getItem("themeMode") as ThemeMode) || "dark";
    } catch {
      return "dark";
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const pathfinding = usePathfinding();

  const onMouseEnterReadOnly = useCallback<
    (...args: Parameters<typeof pathfinding.onMouseEnter>) => void
  >((..._args) => {
    // no-op: read-only pane should not paint obstacles on hover
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("themeMode", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Close the temporary drawer when the screen grows to large
  const handleDrawerClose = useCallback(() => {
    if (!isLargeScreen) setSidebarOpen(false);
  }, [isLargeScreen]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Header
          theme={themeMode}
          toggleTheme={toggleTheme}
          isSolving={pathfinding.isSolving}
          isAnimating={pathfinding.isAnimating}
          algorithm={pathfinding.algorithm}
          handleSolve={pathfinding.handleSolve}
          toggleSidebar={toggleSidebar}
        />

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Drawer
            variant={isLargeScreen ? "permanent" : "temporary"}
            open={isLargeScreen || sidebarOpen}
            onClose={handleDrawerClose}
            sx={{
              width: isLargeScreen ? SIDEBAR_WIDTH : 0,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: SIDEBAR_WIDTH,
                position: isLargeScreen ? "static" : "fixed",
                boxSizing: "border-box",
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                boxShadow: isLargeScreen ? "none" : 10,
                backgroundImage: "none",
              },
            }}
          >
            {/* Push content below the fixed header on mobile */}
            {!isLargeScreen && <Box sx={{ height: 60 }} />}
            <Sidebar
              gridDim={pathfinding.gridDim}
              updateGridSize={pathfinding.updateGridSize}
              start={pathfinding.start}
              updateStart={pathfinding.updateStart}
              end={pathfinding.end}
              updateEnd={pathfinding.updateEnd}
              algorithm={pathfinding.algorithm}
              setAlgorithm={pathfinding.setAlgorithm}
              isComparing={pathfinding.isComparing}
              setIsComparing={pathfinding.setIsComparing}
              compAlgos={pathfinding.compAlgos}
              setCompAlgos={pathfinding.setCompAlgos}
              handleReset={pathfinding.handleReset}
              clearObstacles={pathfinding.clearObstacles}
              isAnimating={pathfinding.isAnimating}
            />
          </Drawer>

          {/* Main content area — scrolls independently of the sidebar */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              // Scroll only vertically so the grid is always reachable on small screens
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // Even vertical padding instead of an arbitrary margin-top
                py: { xs: 3, md: 5 },
                px: { xs: 2, md: 4 },
              }}
            >
              {/* Fade-in on first mount only; no exit animation needed since the
                  content never unmounts — the previous AnimatePresence with a
                  static key "visualizer-content" never triggered exit anyway. */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ width: "100%" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    // Stack vertically on everything below xl; side-by-side only
                    // when there's genuinely enough horizontal room (compare mode)
                    flexDirection: {
                      xs: "column",
                      xl: pathfinding.isComparing ? "row" : "column",
                    },
                    gap: { xs: 4, xl: 6 },
                    justifyContent: "center",
                    alignItems: { xs: "center", xl: "flex-start" },
                    // Let the grids breathe without relying on margin-top
                    width: "100%",
                  }}
                >
                  <Grid
                    grid={pathfinding.grid}
                    path={pathfinding.path}
                    start={pathfinding.start}
                    end={pathfinding.end}
                    robotPos={pathfinding.robotPos}
                    onMouseDown={pathfinding.onMouseDown}
                    onMouseEnter={pathfinding.onMouseEnter}
                    title={
                      pathfinding.isComparing
                        ? `Pane A: ${pathfinding.compAlgos[0].toUpperCase()}`
                        : undefined
                    }
                  />

                  {pathfinding.isComparing && (
                    <Grid
                      grid={pathfinding.gridR}
                      path={pathfinding.pathR}
                      start={pathfinding.start}
                      end={pathfinding.end}
                      robotPos={pathfinding.robotPosR}
                      onMouseDown={pathfinding.onMouseDown}
                      // Pane B mirrors the same obstacle layout as Pane A, so
                      // mouse-enter is intentionally a no-op here — walls are
                      // painted only on Pane A then synced to both grids by
                      // the hook.
                      onMouseEnter={onMouseEnterReadOnly}
                      title={`Pane B: ${pathfinding.compAlgos[1].toUpperCase()}`}
                    />
                  )}
                </Box>
              </motion.div>

              <Legend />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
