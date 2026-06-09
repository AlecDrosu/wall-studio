import { FR, IDS, WIN, HIN, GAP } from "./constants";
import type { Gaps, GapInfo, PosMap, Rect, Side } from "./types";

export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v;
}

// eighth-inch glyphs for fractional display
const EI = ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"];
export function frac(v: number): string {
  const s = v < 0 ? "-" : "";
  v = Math.abs(v);
  let whole = Math.floor(v + 1e-6);
  let e = Math.round((v - whole) * 8);
  if (e === 8) {
    whole++;
    e = 0;
  }
  const g = EI[e];
  if (whole === 0 && g === "") return s + "0";
  if (g === "") return s + whole;
  if (whole === 0) return s + g;
  return s + whole + g;
}
export function inch(v: number): string {
  return frac(v) + "″";
}

export function rectOf(pos: PosMap, id: number): Rect {
  const p = pos[id],
    f = FR[id];
  return { l: p.x, t: p.y, r: p.x + f.w, b: p.y + f.h };
}

// ---- preset layout (columns) ----
export function layoutColumns(order: number[][]): PosMap {
  const res: PosMap = {};
  let x = 0;
  order.forEach((col) => {
    const cw = Math.max(...col.map((f) => FR[f].w));
    const stack = col.reduce((s, f) => s + FR[f].h, 0) + (col.length - 1) * GAP;
    let y = (HIN - stack) / 2;
    col.forEach((f) => {
      res[f] = { x: x + (cw - FR[f].w) / 2, y };
      y += FR[f].h + GAP;
    });
    x += cw + GAP;
  });
  return res;
}

/** Compute clamped positions for a named preset's column layout. */
export function presetPositions(order: number[][]): PosMap {
  const L = layoutColumns(order);
  const out: PosMap = {};
  IDS.forEach((i) => {
    out[i] = {
      x: clamp(L[i].x, 0, WIN - FR[i].w),
      y: clamp(L[i].y, 0, HIN - FR[i].h),
    };
  });
  return out;
}

export function flipPositions(pos: PosMap): PosMap {
  const out: PosMap = {};
  IDS.forEach((i) => {
    out[i] = { x: WIN - (pos[i].x + FR[i].w), y: pos[i].y };
  });
  return out;
}

// ---- overlap + spacing ----
function intersect(a: Rect, b: Rect): boolean {
  return a.l < b.r - 0.01 && a.r > b.l + 0.01 && a.t < b.b - 0.01 && a.b > b.t + 0.01;
}
export function overlapSet(pos: PosMap): Set<number> {
  const s = new Set<number>();
  for (let x = 0; x < IDS.length; x++)
    for (let y = x + 1; y < IDS.length; y++) {
      const a = rectOf(pos, IDS[x]),
        b = rectOf(pos, IDS[y]);
      if (intersect(a, b)) {
        s.add(IDS[x]);
        s.add(IDS[y]);
      }
    }
  return s;
}
export function closestSpacing(pos: PosMap): number {
  let best = Infinity;
  for (let x = 0; x < IDS.length; x++)
    for (let y = x + 1; y < IDS.length; y++) {
      const a = rectOf(pos, IDS[x]),
        b = rectOf(pos, IDS[y]);
      const dx = Math.max(0, Math.max(b.l - a.r, a.l - b.r));
      const dy = Math.max(0, Math.max(b.t - a.b, a.t - b.b));
      const vov = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      const hov = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      let g: number;
      if (vov > 0 && hov <= 0) g = Math.max(b.l - a.r, a.l - b.r);
      else if (hov > 0 && vov <= 0) g = Math.max(b.t - a.b, a.t - b.b);
      else g = Math.sqrt(dx * dx + dy * dy);
      if (g < best) best = g;
    }
  return best;
}

// ---- gaps to nearest neighbor / wall on each side ----
export function computeGaps(pos: PosMap, id: number): Gaps {
  const a = rectOf(pos, id);
  function scan(side: Side): GapInfo {
    let best = Infinity,
      to: number | "wall" = "wall",
      other: Rect | null = null;
    IDS.forEach((j) => {
      if (j === id) return;
      const b = rectOf(pos, j);
      let g: number;
      if (side === "right" || side === "left") {
        const vov = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        if (vov <= 0.01) return;
        if (side === "right" && b.l >= a.r - 0.01) {
          g = b.l - a.r;
        } else if (side === "left" && b.r <= a.l + 0.01) {
          g = a.l - b.r;
        } else return;
      } else {
        const hov = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        if (hov <= 0.01) return;
        if (side === "bottom" && b.t >= a.b - 0.01) {
          g = b.t - a.b;
        } else if (side === "top" && b.b <= a.t + 0.01) {
          g = a.t - b.b;
        } else return;
      }
      if (g < best) {
        best = g;
        to = j;
        other = b;
      }
    });
    const wallG =
      side === "right" ? WIN - a.r : side === "left" ? a.l : side === "top" ? a.t : HIN - a.b;
    if (wallG < best) {
      best = wallG;
      to = "wall";
      other = null;
    }
    return { gap: best, to, other };
  }
  return { right: scan("right"), left: scan("left"), top: scan("top"), bottom: scan("bottom") };
}

// ---- snapping ----
export type SnapResult = { x: number; y: number; guides: { axis: "x" | "y"; v: number }[] };
export function snap(
  pos: PosMap,
  id: number,
  nx: number,
  ny: number,
  pxin: number,
  snapAlign: boolean,
  snapGrid: boolean
): SnapResult {
  const guides: { axis: "x" | "y"; v: number }[] = [];
  const f = FR[id],
    tol = 8 / pxin;
  // build target lines from other frames + wall
  const xs = [{ v: 0 }, { v: WIN }, { v: WIN / 2 }];
  const ys = [{ v: 0 }, { v: HIN }, { v: HIN / 2 }];
  IDS.forEach((j) => {
    if (j === id) return;
    const r = rectOf(pos, j);
    xs.push({ v: r.l }, { v: r.r }, { v: (r.l + r.r) / 2 });
    ys.push({ v: r.t }, { v: r.b }, { v: (r.t + r.b) / 2 });
  });
  if (snapAlign) {
    const anchorsX = [{ a: nx }, { a: nx + f.w }, { a: nx + f.w / 2 }];
    let bestdx: number | null = null,
      bx: number | null = null;
    anchorsX.forEach((an) => {
      xs.forEach((t) => {
        const d = t.v - an.a;
        if (Math.abs(d) <= tol && (bestdx === null || Math.abs(d) < Math.abs(bestdx))) {
          bestdx = d;
          bx = t.v;
        }
      });
    });
    if (bestdx !== null) {
      nx += bestdx;
      guides.push({ axis: "x", v: bx! });
    }
    const anchorsY = [{ a: ny }, { a: ny + f.h }, { a: ny + f.h / 2 }];
    let bestdy: number | null = null,
      by: number | null = null;
    anchorsY.forEach((an) => {
      ys.forEach((t) => {
        const d = t.v - an.a;
        if (Math.abs(d) <= tol && (bestdy === null || Math.abs(d) < Math.abs(bestdy))) {
          bestdy = d;
          by = t.v;
        }
      });
    });
    if (bestdy !== null) {
      ny += bestdy;
      guides.push({ axis: "y", v: by! });
    }
  }
  if (snapGrid) {
    if (!guides.some((g) => g.axis === "x")) nx = Math.round(nx * 4) / 4;
    if (!guides.some((g) => g.axis === "y")) ny = Math.round(ny * 4) / 4;
  }
  nx = clamp(nx, 0, WIN - f.w);
  ny = clamp(ny, 0, HIN - f.h);
  return { x: nx, y: ny, guides };
}
