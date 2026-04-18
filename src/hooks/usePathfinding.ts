import { useState, useCallback, useRef, useEffect } from "react";
import { Point, Algorithm, GridDimensions, DraggingNode } from "../types";
import { solveAlgorithm } from "../services/algorithms";

export const INITIAL_GRID_SIZE = { r: 12, c: 22 };
export const INITIAL_START: Point = [1, 1];
export const INITIAL_END: Point = [10, 20];

const generateGrid = (rows: number, cols: number): number[][] =>
  Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(1));

/** Write the same cell value to both grids atomically. */
const setCell = (
  setA: React.Dispatch<React.SetStateAction<number[][]>>,
  setB: React.Dispatch<React.SetStateAction<number[][]>>,
  r: number,
  c: number,
  value: number,
) => {
  const updater = (prev: number[][]): number[][] => {
    const next = prev.map((row) => row.slice());
    next[r][c] = value;
    return next;
  };
  setA(updater);
  setB(updater);
};

export const usePathfinding = () => {
  const [gridDim, setGridDim] = useState<GridDimensions>(INITIAL_GRID_SIZE);
  const [grid, setGrid] = useState<number[][]>(() =>
    generateGrid(INITIAL_GRID_SIZE.r, INITIAL_GRID_SIZE.c),
  );
  const [gridR, setGridR] = useState<number[][]>(() =>
    generateGrid(INITIAL_GRID_SIZE.r, INITIAL_GRID_SIZE.c),
  );
  const [start, setStart] = useState<Point>(INITIAL_START);
  const [end, setEnd] = useState<Point>(INITIAL_END);
  const [isSolving, setIsSolving] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [isComparing, setIsComparing] = useState(false);
  const [compAlgos, setCompAlgos] = useState<[Algorithm, Algorithm]>([
    "bfs",
    "dfs",
  ]);
  const [robotPos, setRobotPos] = useState<Point>(INITIAL_START);
  const [robotPosR, setRobotPosR] = useState<Point>(INITIAL_START);
  const [path, setPath] = useState<Point[]>([]);
  const [pathR, setPathR] = useState<Point[]>([]);
  const [animationStep, setAnimationStep] = useState(0);

  // Refs for draw state — using refs instead of state avoids stale-closure
  // issues inside the mousemove handler without triggering extra re-renders.
  const isDrawingRef = useRef(false);
  const drawModeRef = useRef<0 | 1>(0);
  const draggingNodeRef = useRef<DraggingNode>(null);

  // Keep a ref to the latest grid so onMouseEnter can read walls without a
  // stale closure (the handler is stable but grid state changes every render).
  const gridRef = useRef(grid);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  const startRef = useRef(start);
  useEffect(() => { startRef.current = start; }, [start]);
  const endRef = useRef(end);
  useEffect(() => { endRef.current = end; }, [end]);

  // ─── Grid resize ────────────────────────────────────────────────────────────

  const updateGridSize = useCallback(
    (newRows: number, newCols: number) => {
      const dimR = Math.min(Math.max(5, newRows), 30);
      const dimC = Math.min(Math.max(5, newCols), 40);

      setGridDim({ r: dimR, c: dimC });

      // Preserve existing walls; strip visited/path values (> 1).
      const newGrid = Array(dimR)
        .fill(null)
        .map((_, r) =>
          Array(dimC)
            .fill(null)
            .map((_, c) => {
              const cur = gridRef.current;
              if (r < cur.length && c < cur[0].length) {
                return cur[r][c] > 1 ? 1 : cur[r][c];
              }
              return 1;
            }),
        );
      setGrid(newGrid);
      setGridR(newGrid); // both grids share the same wall layout

      const s = startRef.current;
      const e = endRef.current;
      const newStart: Point = [
        Math.min(s[0], dimR - 1),
        Math.min(s[1], dimC - 1),
      ];
      const newEnd: Point = [
        Math.min(e[0], dimR - 1),
        Math.min(e[1], dimC - 1),
      ];

      if (newStart[0] === newEnd[0] && newStart[1] === newEnd[1]) {
        if (newEnd[0] > 0) newEnd[0]--;
        else newEnd[0]++;
      }

      setStart(newStart);
      setEnd(newEnd);
      setRobotPos(newStart);
      setRobotPosR(newStart);
      setPath([]);
      setPathR([]);
      setAnimationStep(0);
    },
    [], // no deps — reads current values via refs
  );

  // ─── Solve ──────────────────────────────────────────────────────────────────

  const handleSolve = async () => {
    if (isAnimating) return;
    setIsSolving(true);
    setIsAnimating(true);
    setAnimationStep(0);
    setPath([]);
    setPathR([]);
    setRobotPos(startRef.current);
    setRobotPosR(startRef.current);

    const cleanGrid = gridRef.current.map((row) =>
      row.map((cell) => (cell > 1 ? 1 : cell)),
    );
    const algosToRun = isComparing ? compAlgos : [algorithm];

    const leftRes = solveAlgorithm(
      cleanGrid,
      startRef.current,
      endRef.current,
      algosToRun[0],
      true,
    );
    const rightRes = isComparing
      ? solveAlgorithm(
          cleanGrid,
          startRef.current,
          endRef.current,
          algosToRun[1],
          true,
        )
      : null;

    const maxSteps = Math.max(
      leftRes.visitSequence.length,
      rightRes?.visitSequence.length ?? 0,
    );

    for (let i = 0; i < maxSteps; i++) {
      setAnimationStep(i + 1);

      if (i < leftRes.visitSequence.length) {
        const [r, c] = leftRes.visitSequence[i];
        setGrid((prev) => {
          const next = prev.map((row) => row.slice());
          next[r][c] = leftRes.grid[r][c];
          return next;
        });
        setRobotPos([r, c]);
      }

      if (rightRes && i < rightRes.visitSequence.length) {
        const [r, c] = rightRes.visitSequence[i];
        setGridR((prev) => {
          const next = prev.map((row) => row.slice());
          next[r][c] = rightRes.grid[r][c];
          return next;
        });
        setRobotPosR([r, c]);
      }

      const delay = algosToRun.includes("dfs") ? 20 : 10;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    setGrid(leftRes.grid);
    if (rightRes) setGridR(rightRes.grid);
    setPath(leftRes.path);
    if (rightRes) setPathR(rightRes.path);

    const pathL = leftRes.path;
    const pathRFinal = rightRes ? rightRes.path : [];
    const finalMaxPath = Math.max(pathL.length, pathRFinal.length);

    for (let i = 0; i < finalMaxPath; i++) {
      if (i < pathL.length) setRobotPos(pathL[i]);
      if (i < pathRFinal.length) setRobotPosR(pathRFinal[i]);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    setIsSolving(false);
    setIsAnimating(false);
  };

  // ─── Reset / clear ──────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    const newGrid = generateGrid(
      gridDim.r,
      gridDim.c,
    );
    setGrid(newGrid);
    setGridR(newGrid);
    setStart(INITIAL_START);
    setEnd(INITIAL_END);
    setPath([]);
    setPathR([]);
    setRobotPos(INITIAL_START);
    setRobotPosR(INITIAL_START);
    setAnimationStep(0);
  }, [gridDim]);

  const clearObstacles = useCallback(() => {
    const clear = (prev: number[][]): number[][] =>
      prev.map((row) => row.map((cell) => (cell === 0 ? 1 : cell)));
    setGrid(clear);
    setGridR(clear);
    setPath([]);
    setPathR([]);
  }, []);

  // ─── Wall drawing (synchronized across both grids) ──────────────────────────

  const onMouseDown = useCallback(
    (r: number, c: number) => {
      if (isAnimating) return;

      const s = startRef.current;
      const e = endRef.current;

      if (r === s[0] && c === s[1]) {
        draggingNodeRef.current = "start";
        return;
      }
      if (r === e[0] && c === e[1]) {
        draggingNodeRef.current = "end";
        return;
      }

      const currentVal = gridRef.current[r][c];
      // Toggle: clicking a wall removes it; clicking empty adds one.
      const targetMode: 0 | 1 = currentVal === 0 ? 1 : 0;
      drawModeRef.current = targetMode;
      isDrawingRef.current = true;

      // Write to BOTH grids so Pane B stays in sync immediately.
      setCell(setGrid, setGridR, r, c, targetMode);
    },
    [isAnimating],
  );

  const onMouseEnter = useCallback(
    (r: number, c: number) => {
      if (isAnimating) return;

      const s = startRef.current;
      const e = endRef.current;

      if (draggingNodeRef.current === "start") {
        const cur = gridRef.current;
        if (cur[r][c] !== 0 && !(r === e[0] && c === e[1])) {
          setStart([r, c]);
          setRobotPos([r, c]);
        }
        return;
      }
      if (draggingNodeRef.current === "end") {
        const cur = gridRef.current;
        if (cur[r][c] !== 0 && !(r === s[0] && c === s[1])) {
          setEnd([r, c]);
        }
        return;
      }

      if (!isDrawingRef.current) return;
      if ((r === s[0] && c === s[1]) || (r === e[0] && c === e[1])) return;

      // Write to BOTH grids — this is the key sync point for drag-painting.
      setCell(setGrid, setGridR, r, c, drawModeRef.current);
    },
    [isAnimating],
  );

  const onMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    draggingNodeRef.current = null;
  }, []);

  const onMouseEnterReadOnly = useCallback(() => {
    // intentional no-op for Pane B — walls are painted via Pane A and synced
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseUp]);

  // ─── Public API ─────────────────────────────────────────────────────────────

  return {
    grid,
    setGrid,
    gridR,
    setGridR,
    start,
    setStart,
    end,
    setEnd,
    isSolving,
    isAnimating,
    gridDim,
    updateGridSize,
    handleSolve,
    handleReset,
    clearObstacles,
    onMouseDown,
    onMouseEnter,
    onMouseEnterReadOnly,
    updateStart: (r: number, c: number) => {
      const nr = Math.min(Math.max(0, r), gridDim.r - 1);
      const nc = Math.min(Math.max(0, c), gridDim.c - 1);
      if (!(nr === endRef.current[0] && nc === endRef.current[1])) {
        setStart([nr, nc]);
        setRobotPos([nr, nc]);
      }
    },
    updateEnd: (r: number, c: number) => {
      const nr = Math.min(Math.max(0, r), gridDim.r - 1);
      const nc = Math.min(Math.max(0, c), gridDim.c - 1);
      if (!(nr === startRef.current[0] && nc === startRef.current[1])) {
        setEnd([nr, nc]);
      }
    },
    algorithm,
    setAlgorithm,
    isComparing,
    setIsComparing,
    compAlgos,
    setCompAlgos,
    robotPos,
    robotPosR,
    path,
    pathR,
    animationStep,
  };
};