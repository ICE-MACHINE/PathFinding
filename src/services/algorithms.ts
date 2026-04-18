import { Point, SolveResponse, Algorithm } from "../types";

const DIRECTIONS: Point[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

class FastQueue<T> {
  private items: T[] = [];
  private head = 0;
  
  push(item: T) {
    this.items.push(item);
  }
  
  shift(): T | undefined {
    if (this.head < this.items.length) {
      return this.items[this.head++];
    }
    return undefined;
  }
  
  get length() {
    return this.items.length - this.head;
  }
}

const dfsSolve = (
  currentGrid: number[][],
  rCount: number,
  cCount: number,
  source: Point,
  target: Point,
  resultGrid: number[][],
  fromEnd: boolean
): { visitSequence: Point[], path: Point[] } => {
  const visited = Array(rCount).fill(0).map(() => new Uint8Array(cCount));
  const visitSequence: Point[] = [];
  let path: Point[] = [];
  let visitCount = 1;
  const currentPath: Point[] = [];

  const dfsVisit = (r: number, c: number): boolean => {
    if (visited[r][c]) return false;

    visited[r][c] = 1;
    visitSequence.push([r, c]);
    currentPath.push([r, c]);
    resultGrid[r][c] = ++visitCount;

    if (r === target[0] && c === target[1]) {
      path = fromEnd ? [...currentPath].reverse() : [...currentPath];
      return true;
    }

    for (let i = 0; i < DIRECTIONS.length; i++) {
        const dr = DIRECTIONS[i][0];
        const dc = DIRECTIONS[i][1];
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < rCount &&
        nc >= 0 && nc < cCount &&
        currentGrid[nr][nc] !== 0 &&
        !visited[nr][nc]
      ) {
        if (dfsVisit(nr, nc)) return true;
        // Backtracking visual
        visitSequence.push([r, c]);
      }
    }
    currentPath.pop();
    return false;
  };

  dfsVisit(source[0], source[1]);
  return { visitSequence, path };
};

const bfsSolve = (
  currentGrid: number[][],
  rCount: number,
  cCount: number,
  source: Point,
  target: Point,
  resultGrid: number[][],
  fromEnd: boolean
): { visitSequence: Point[], path: Point[] } => {
  const visited = Array(rCount).fill(0).map(() => new Uint8Array(cCount));
  const visitSequence: Point[] = [];
  let path: Point[] = [];
  
  type QueueItem = [number, number, number]; // r, c, distance
  const queue = new FastQueue<QueueItem>();
  
  queue.push([source[0], source[1], 2]);
  visited[source[0]][source[1]] = 1;
  resultGrid[source[0]][source[1]] = 2;
  
  const parentMap = Array(rCount).fill(null).map(() => Array<Point | null>(cCount).fill(null));

  while (queue.length > 0) {
    const item = queue.shift()!;
    const [r, c, d] = item;
    
    visitSequence.push([r, c]);
    resultGrid[r][c] = d;

    if (r === target[0] && c === target[1]) {
      const rawPath: Point[] = [];
      let currR = r;
      let currC = c;
      
      while (currR !== source[0] || currC !== source[1]) {
        rawPath.push([currR, currC]);
        const p = parentMap[currR][currC]!;
        currR = p[0];
        currC = p[1];
      }
      rawPath.push([source[0], source[1]]);
      rawPath.reverse(); // Backwards from target, so reversing makes it source -> target
      
      path = fromEnd ? rawPath.reverse() : rawPath; 
      break;
    }

    for (let i = 0; i < DIRECTIONS.length; i++) {
        const dr = DIRECTIONS[i][0];
        const dc = DIRECTIONS[i][1];
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < rCount &&
        nc >= 0 && nc < cCount &&
        currentGrid[nr][nc] !== 0 &&
        !visited[nr][nc]
      ) {
        visited[nr][nc] = 1;
        parentMap[nr][nc] = [r, c];
        queue.push([nr, nc, d + 1]);
      }
    }
  }
  
  return { visitSequence, path };
};

export const solveAlgorithm = (
  currentGrid: number[][],
  startPoint: Point,
  endPoint: Point,
  algo: Algorithm,
  fromEnd: boolean
): SolveResponse => {
  const rCount = currentGrid.length;
  const cCount = currentGrid[0].length;
  const resultGrid: number[][] = currentGrid.map((row) =>
    row.map((cell) => (cell === 0 ? 0 : 1))
  );

  const source = fromEnd ? endPoint : startPoint;
  const target = fromEnd ? startPoint : endPoint;

  if (algo === "dfs") {
    const { visitSequence, path } = dfsSolve(currentGrid, rCount, cCount, source, target, resultGrid, fromEnd);
    return { grid: resultGrid, visitSequence, path };
  } else {
    const { visitSequence, path } = bfsSolve(currentGrid, rCount, cCount, source, target, resultGrid, fromEnd);
    return { grid: resultGrid, visitSequence, path };
  }
};
