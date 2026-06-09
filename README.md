# Gallery Wall Studio

A TypeScript + React port of the original single-file gallery-wall planner. Drag 9 frames
inside a fixed 102″ × 44″ wall; positions, gaps, overlaps and spacing recalculate live.
Designs can be saved to a local **SQLite** database so you can compare candidate layouts.

## Stack
- **Frontend:** Vite + React 18 + TypeScript (`src/`)
- **Backend:** Express + better-sqlite3 (`server/`) — owns `wall-studio.db` on disk
- Vite proxies `/api` → `http://localhost:3001`

## Run (dev)
```bash
npm install
npm run dev          # starts Vite (5173) and the API server (3001) together
```
Open http://localhost:5173.

- `npm run server` — API only
- `npm run build` — type-check + production bundle
- `npm run preview` — serve the built bundle (still needs `npm run server` for saved designs)

## Saved designs
Stored in `wall-studio.db` (created automatically on first save). Each row holds a name,
timestamp, starting preset, and the top-left position of every frame.

REST API:
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/designs` | list (newest first) |
| POST | `/api/designs` | save current layout |
| PUT | `/api/designs/:id` | rename |
| DELETE | `/api/designs/:id` | delete |
| POST | `/api/designs/import` | bulk import (fresh ids) |

Export/Import buttons in the sidebar round-trip the whole collection as JSON.

## Project layout
```
index.html            Vite entry (loads Google Fonts)
server/               Express API + SQLite (db.ts, index.ts)
src/
  App.tsx             state, drag, keyboard, zoom, presets
  lib/                constants, geometry (ported math), types, api client
  components/         Toolbar, Stage, Rulers, Wall, Frame, Overlay, Sidebar + panels
  styles.css          ported stylesheet
wall_studio.html      original single-file version, kept for reference
```
