export type Point = [number, number];
export type Algorithm = "bfs" | "dfs";
export type ThemeMode = "dark" | "light";
export type DraggingNode = "start" | "end" | null;

export interface SolveResponse {
  grid: number[][];
  visitSequence: Point[];
  path: Point[];
}

export interface SolveRequest {
  grid: number[][];
  start: Point;
  end: Point;
  algorithm: Algorithm;
}

export interface GridDimensions {
  r: number;
  c: number;
}
