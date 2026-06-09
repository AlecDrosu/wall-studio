import { useEffect, useMemo, useRef, useState } from "react";
import { FR, IDS, PRESETS, WIN, HIN } from "./lib/constants";
import { clamp, flipPositions, overlapSet, presetPositions, snap } from "./lib/geometry";
import type { Guide, PosMap, PresetName, SavedDesign } from "./lib/types";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { SelectedPanel } from "./components/SelectedPanel";
import { ArrangementPanel } from "./components/ArrangementPanel";
import { SavedDesignsPanel } from "./components/SavedDesignsPanel";
import { AllPositionsPanel } from "./components/AllPositionsPanel";

function fitZoom(): number {
  const avail = Math.min((window.innerWidth || 1000) - 56, 820);
  return clamp(avail / WIN, 5.0, 8.0);
}

export default function App() {
  const [pos, setPos] = useState<PosMap>(() => presetPositions(PRESETS.cascade));
  const [selected, setSelected] = useState<number | null>(null);
  const [pxin, setPxin] = useState<number>(() => fitZoom());
  const [currentPreset, setCurrentPreset] = useState<PresetName>("cascade");
  const [snapAlign, setSnapAlign] = useState(true);
  const [snapGrid, setSnapGrid] = useState(false);
  const [showMeas, setShowMeas] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);

  const wallRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const manualZoomRef = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const overlaps = useMemo(() => overlapSet(pos), [pos]);

  // ---- drag (window-level pointer listeners, latest pxin/snap from deps) ----
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = dragRef.current;
      if (!d || !wallRef.current) return;
      const wr = wallRef.current.getBoundingClientRect();
      const nx = (e.clientX - wr.left - d.dx) / pxin;
      const ny = (e.clientY - wr.top - d.dy) / pxin;
      const sn = snap(posRef.current, d.id, nx, ny, pxin, snapAlign, snapGrid);
      setGuides(sn.guides);
      setPos((prev) => ({ ...prev, [d.id]: { x: sn.x, y: sn.y } }));
    }
    function onUp() {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDragId(null);
      setGuides([]);
    }
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [pxin, snapAlign, snapGrid]);

  // ---- keyboard nudge ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      const step = e.shiftKey ? 1 : 0.25;
      setPos((prev) => {
        const p = prev[selected];
        const f = FR[selected];
        let nx = p.x;
        let ny = p.y;
        if (e.key === "ArrowLeft") nx = clamp(p.x - step, 0, WIN - f.w);
        else if (e.key === "ArrowRight") nx = clamp(p.x + step, 0, WIN - f.w);
        else if (e.key === "ArrowUp") ny = clamp(p.y - step, 0, HIN - f.h);
        else if (e.key === "ArrowDown") ny = clamp(p.y + step, 0, HIN - f.h);
        return { ...prev, [selected]: { x: nx, y: ny } };
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // ---- fit-to-width on resize (unless the user manually zoomed) ----
  useEffect(() => {
    function onResize() {
      if (manualZoomRef.current) return;
      setPxin(fitZoom());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---- handlers ----
  function onFramePointerDown(id: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!wallRef.current) return;
    setSelected(id);
    setDragId(id);
    const wr = wallRef.current.getBoundingClientRect();
    dragRef.current = {
      id,
      dx: e.clientX - wr.left - pos[id].x * pxin,
      dy: e.clientY - wr.top - pos[id].y * pxin,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    e.preventDefault();
  }

  function onBackgroundPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setSelected(null);
  }

  function applyPreset(name: PresetName) {
    setSelected(null);
    setCurrentPreset(name);
    setPos(presetPositions(PRESETS[name]));
  }
  function flip() {
    setPos((prev) => flipPositions(prev));
  }
  function reset() {
    setSelected(null);
    setPos(presetPositions(PRESETS[currentPreset]));
  }

  function setZoom(px: number) {
    manualZoomRef.current = true;
    setPxin(clamp(px, 4.5, 12));
  }

  function loadDesign(d: SavedDesign) {
    setSelected(null);
    if (d.preset && d.preset in PRESETS) setCurrentPreset(d.preset as PresetName);
    setPos((prev) => {
      const out: PosMap = { ...prev };
      IDS.forEach((i) => {
        const p = d.pos[i];
        if (p && typeof p.x === "number" && typeof p.y === "number") {
          out[i] = {
            x: clamp(p.x, 0, WIN - FR[i].w),
            y: clamp(p.y, 0, HIN - FR[i].h),
          };
        }
      });
      return out;
    });
  }

  return (
    <div className="app">
      <header className="head">
        <div className="brand">
          <h1>
            Gallery Wall <em>Studio</em>
          </h1>
          <p>
            Drag frames anywhere inside the fixed wall. Edges snap to align; positions, gaps and
            distances recalculate live as you move.
          </p>
        </div>
        <div className="envchip">
          WALL&nbsp;<b>102″ × 44″</b>&nbsp; (8.5′ wide × 44″ tall)
        </div>
      </header>

      <Toolbar
        pxin={pxin}
        snapAlign={snapAlign}
        snapGrid={snapGrid}
        showMeas={showMeas}
        onPreset={applyPreset}
        onFlip={flip}
        onReset={reset}
        onToggleSnap={setSnapAlign}
        onToggleGrid={setSnapGrid}
        onToggleMeas={setShowMeas}
        onZoomIn={() => setZoom(pxin + 0.75)}
        onZoomOut={() => setZoom(pxin - 0.75)}
      />

      <div className="layout">
        <div className="stage-card">
          <Stage
            ref={wallRef}
            pos={pos}
            pxin={pxin}
            selected={selected}
            overlaps={overlaps}
            dragId={dragId}
            showMeas={showMeas}
            guides={guides}
            onFramePointerDown={onFramePointerDown}
            onBackgroundPointerDown={onBackgroundPointerDown}
          />
          <div className="legend">
            <span>
              <span className="sw c" /> Big frame (#1)
            </span>
            <span>
              <span className="sw b" /> Other 8 frames
            </span>
            <span>teal lines = live distances</span>
            <span>orange = alignment guide</span>
          </div>
        </div>

        <div className="side">
          <SelectedPanel selected={selected} pos={pos} />
        </div>
      </div>

      <div className="lower">
        <ArrangementPanel pos={pos} />
        <SavedDesignsPanel pos={pos} preset={currentPreset} onLoad={loadDesign} />
        <AllPositionsPanel pos={pos} selected={selected} onSelect={setSelected} />
      </div>

      <p className="foot">
        Arrow keys nudge the selected frame <span className="kbd">¼″</span> · hold{" "}
        <span className="kbd">Shift</span> for <span className="kbd">1″</span>. All sizes read height
        × width. Frames can't leave the 102″ × 44″ wall.
      </p>
    </div>
  );
}
