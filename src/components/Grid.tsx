import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { Point } from "../types";

interface GridProps {
  grid: number[][];
  path: Point[];
  start: Point;
  end: Point;
  robotPos: Point;
  onMouseDown: (r: number, c: number) => void;
  onMouseEnter: (r: number, c: number) => void;
  title?: string;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  path,
  start,
  end,
  robotPos,
  onMouseDown,
  onMouseEnter,
  title,
}) => {
  const isSecondPane = title?.includes("Pane B");

  const pathSet = React.useMemo(() => {
    const set = new Set<string>();
    path.forEach((p) => set.add(`${p[0]},${p[1]}`));
    return set;
  }, [path]);

  // Prevent text selection while drawing walls
  const handleDragStart = React.useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    [],
  );

  const getCellBg = (val: number, r: number, c: number) => {
    if (r === start[0] && c === start[1]) return "var(--color-start)";
    if (r === end[0] && c === end[1]) return "var(--color-target)";
    if (val === 0) return "var(--color-obstacle)";
    if (pathSet.has(`${r},${c}`)) return "rgba(59,130,246,0.18)";
    if (val > 1) {
      const intensity = Math.min((val - 1) * 0.04, 0.35);
      return `rgba(59,130,246,${intensity})`;
    }
    return "background.default";
  };

  const getCellBorder = (val: number, r: number, c: number) => {
    if (pathSet.has(`${r},${c}`)) return "2px solid var(--color-accent)";
    return undefined;
  };

  const handleContainerMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      // Prevent native drag behavior that can "steal" the pointer during wall painting
      e.preventDefault();
      const target = (e.target as HTMLElement).closest("[data-r]");
      if (!target) return;
      const r = target.getAttribute("data-r");
      const c = target.getAttribute("data-c");
      if (r !== null && c !== null) onMouseDown(Number(r), Number(c));
    },
    [onMouseDown],
  );

  const handleContainerMouseOver = React.useCallback(
    (e: React.MouseEvent) => {
      // Only fire when a mouse button is held (buttons > 0)
      if (e.buttons === 0) return;
      const target = (e.target as HTMLElement).closest("[data-r]");
      if (!target) return;
      const r = target.getAttribute("data-r");
      const c = target.getAttribute("data-c");
      if (r !== null && c !== null) onMouseEnter(Number(r), Number(c));
    },
    [onMouseEnter],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {title && (
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 10,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Paper>
      )}

      <Box
        sx={{
          p: 1,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            bgcolor: "divider",
            border: "2px solid",
            borderColor: "divider",
            borderRadius: "4px",
            overflow: "hidden",
            gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, var(--cell-size))`,
            gap: "var(--cell-gap)",
            position: "relative",
            // Crosshair cursor only when not on start/end
            cursor: "crosshair",
            // Prevent browser text-selection highlight while drag-painting walls
            userSelect: "none",
          }}
          onMouseDown={handleContainerMouseDown}
          onMouseOver={handleContainerMouseOver}
          onDragStart={handleDragStart}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isStart = r === start[0] && c === start[1];
              const isEnd = r === end[0] && c === end[1];
              const isWall = cell === 0;
              const isPath = pathSet.has(`${r},${c}`);

              return (
                <Box
                  key={`${r}-${c}`}
                  data-r={r}
                  data-c={c}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "monospace",
                    fontSize: { xs: 8, sm: 10 },
                    fontWeight: 700,
                    // Smooth color transitions for visited/path reveals
                    transition: "background-color 0.18s ease, border 0.1s",
                    cursor: isStart || isEnd ? "grab" : "crosshair",
                    width: "var(--cell-size)",
                    height: "var(--cell-size)",
                    bgcolor: isWall
                      ? undefined
                      : isStart || isEnd
                        ? undefined
                        : "background.default",
                    backgroundColor: getCellBg(cell, r, c),
                    border: getCellBorder(cell, r, c),
                    color: isPath
                      ? "var(--color-accent)"
                      : isStart || isEnd
                        ? "#fff"
                        : "text.secondary",
                    "&:hover":
                      !isStart && !isEnd
                        ? { filter: "brightness(1.15)" }
                        : { cursor: "grab" },
                  }}
                >
                  {isStart ? (
                    "S"
                  ) : isEnd ? (
                    "T"
                  ) : cell > 1 ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 16,
                        padding: "0 3px",
                        borderRadius: 999,
                      }}
                    >
                      {cell - 1}
                    </motion.span>
                  ) : null}
                </Box>
              );
            }),
          )}

          {/* Animated robot — floats over the grid using absolute positioning */}
          <motion.div
            style={{
              position: "absolute",
              width: "var(--cell-size)",
              height: "var(--cell-size)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
            animate={{
              top: `calc(${robotPos[0]} * (var(--cell-size) + var(--cell-gap)))`,
              left: `calc(${robotPos[1]} * (var(--cell-size) + var(--cell-gap)))`,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          >
            <Box
              sx={{
                width: "82%",
                height: "82%",
                bgcolor: isSecondPane ? "#ef4444" : "#3b82f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSecondPane
                  ? "0 0 14px 2px #ef444488"
                  : "0 0 14px 2px #3b82f688",
                border: "2px solid rgba(255,255,255,0.7)",
              }}
            >
              <Bot color="white" size="58%" />
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};