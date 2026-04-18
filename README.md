# NAVIGATOR.AI — Pathfinding Visualizer

A real-time pathfinding visualizer built with React and TypeScript. Draw walls on a grid, drag start and end points, then watch BFS or DFS explore the space and animate the shortest path.

---

## Features

- **Three algorithms** — BFS (guaranteed shortest path), DFS (depth-first exploration), and side-by-side comparison mode
- **Live wall drawing** — click and drag anywhere on the grid to paint or erase walls; both panes stay in sync
- **Draggable start/end nodes** — drag the `S` and `T` markers to any open cell
- **Animated robot** — a bot icon traverses visited cells during exploration, then retraces the final path
- **Heatmap overlay** — visited cells are shaded by visit order, giving an intuitive view of how each algorithm fans out
- **Compare mode** — run two algorithms simultaneously on identical grids, side by side
- **Configurable grid** — resize rows and columns from the sidebar (5–30 rows, 5–40 columns)
- **Dark / light theme** — persisted to `localStorage`
- **Responsive layout** — sidebar collapses to a drawer on smaller screens

---

## Algorithms

| Algorithm | Shortest path? | Strategy |
|-----------|---------------|----------|
| BFS | ✅ Yes | Explores all neighbors level by level |
| DFS | ❌ No | Dives deep along one branch first; backtracks on dead ends |

Compare mode runs both algorithms on the same grid at the same time, making the difference in explored area and path quality immediately visible.

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Other scripts

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # TypeScript type-check (no emit)
```

---

## How to Use

### Drawing walls
Click and drag on any empty cell to place walls. Drag over existing walls to erase them. The mode (place vs. erase) is determined by whichever cell you first click — so a single stroke is always consistent.

### Moving start and end
Hover over the `S` (start) or `T` (target) cell — the cursor changes to a grab hand. Click and drag it to any open cell. The robot snaps to the new start position immediately.

### Running the visualizer
1. Select an algorithm from the sidebar dropdown (or enable compare mode to pick two)
2. Click **Run** in the header
3. Watch the robot explore the grid, then animate along the discovered path
4. Click **Clear path** to reset the visualization without losing your walls
5. Click **Reset** to clear everything

### Compare mode
Enable the **Compare** toggle in the sidebar and pick two algorithms. Both grids share the same wall layout — painting walls on Pane A automatically mirrors them to Pane B.

---

## Project Structure

```
src/
├── components/
│   ├── Grid.tsx          # Grid renderer + mouse interaction (wall drawing, drag)
│   ├── Header.tsx        # App bar with Run button, theme toggle, sidebar toggle
│   ├── Legend.tsx        # Color key at the bottom of the page
│   └── Sidebar.tsx       # Controls: grid size, start/end coords, algorithm select
├── hooks/
│   └── usePathfinding.ts # All grid state, wall sync, animation loop
├── services/
│   └── algorithms.ts     # BFS and DFS implementations
├── App.tsx               # Root layout: drawer, main content, motion wrapper
├── index.css             # CSS variables, cell sizing, Tailwind base
├── theme.ts              # MUI theme (dark/light)
└── types.ts              # Shared TypeScript types
```

---

## Tech Stack

- **React 19** + **TypeScript**
- **Material UI v9** — layout, drawer, inputs
- **Motion (Framer Motion v12)** — robot spring animation, mount fade
- **Tailwind CSS v4** — cell color utility classes
- **Vite 6** — dev server and build

---

## Architecture Notes

**Wall synchronization** — `usePathfinding` maintains two separate grid states (`grid` for Pane A, `gridR` for Pane B). A shared `setCell` helper applies the same functional updater to both simultaneously, so walls are always identical across panes without a separate sync effect.

**Stale closure avoidance** — draw state (`isDrawing`, `drawMode`, `draggingNode`) and frequently-read values (`grid`, `start`, `end`) are mirrored into refs. This lets the stable `onMouseDown`/`onMouseEnter` callbacks always read current values without being recreated on every render.

**Robot positioning** — the bot icon is a single absolutely-positioned `motion.div` that sits above the grid and animates with a spring to `top/left` coordinates derived from `robotPos`. This avoids re-rendering the entire cell grid on every animation frame.

**Animation loop** — `handleSolve` is an `async` function that drives the step-by-step reveal with `setTimeout`-based delays. Visited cells are revealed at ~10–20 ms intervals; the path trace runs at 80 ms per step so the final route is visually distinct from the exploration phase.