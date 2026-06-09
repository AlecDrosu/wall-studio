import type { PresetName } from "../lib/types";

type Props = {
  pxin: number;
  snapAlign: boolean;
  snapGrid: boolean;
  showMeas: boolean;
  onPreset: (name: PresetName) => void;
  onFlip: () => void;
  onReset: () => void;
  onToggleSnap: (v: boolean) => void;
  onToggleGrid: (v: boolean) => void;
  onToggleMeas: (v: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function Toolbar({
  pxin,
  snapAlign,
  snapGrid,
  showMeas,
  onPreset,
  onFlip,
  onReset,
  onToggleSnap,
  onToggleGrid,
  onToggleMeas,
  onZoomIn,
  onZoomOut,
}: Props) {
  return (
    <div className="toolbar">
      <div className="group">
        <span className="lbl">Start</span>
        <button className="btn" onClick={() => onPreset("cascade")}>
          Cascade
        </button>
        <button className="btn" onClick={() => onPreset("bookend")}>
          Bookend
        </button>
        <button className="btn" onClick={() => onPreset("balanced")}>
          Balanced
        </button>
      </div>
      <div className="group">
        <button className="btn ghost" onClick={onFlip}>
          ⇄ Flip L/R
        </button>
        <button className="btn ghost" onClick={onReset}>
          ↺ Reset
        </button>
      </div>
      <div className="group">
        <label className="toggle">
          <input type="checkbox" checked={snapAlign} onChange={(e) => onToggleSnap(e.target.checked)} /> Snap to align
        </label>
        <label className="toggle">
          <input type="checkbox" checked={snapGrid} onChange={(e) => onToggleGrid(e.target.checked)} /> ¼″ grid
        </label>
        <label className="toggle">
          <input type="checkbox" checked={showMeas} onChange={(e) => onToggleMeas(e.target.checked)} /> Measurements
        </label>
      </div>
      <div className="group">
        <span className="lbl">Zoom</span>
        <span className="zoom">
          <button className="btn" onClick={onZoomOut}>
            −
          </button>
          <span className="zval">{Math.round((pxin / 7) * 100)}%</span>
          <button className="btn" onClick={onZoomIn}>
            +
          </button>
        </span>
      </div>
    </div>
  );
}
