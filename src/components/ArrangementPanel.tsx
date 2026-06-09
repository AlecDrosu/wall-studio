import { IDS } from "../lib/constants";
import { closestSpacing, frac, overlapSet, rectOf } from "../lib/geometry";
import type { PosMap } from "../lib/types";

export function ArrangementPanel({ pos }: { pos: PosMap }) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  IDS.forEach((i) => {
    const r = rectOf(pos, i);
    if (r.l < minX) minX = r.l;
    if (r.t < minY) minY = r.t;
    if (r.r > maxX) maxX = r.r;
    if (r.b > maxY) maxY = r.b;
  });
  const ov = overlapSet(pos);
  const cs = closestSpacing(pos);

  return (
    <div className="panel">
      <h2>Arrangement</h2>
      <p className="hint">Live summary across all 9 frames.</p>
      <div className="summary">
        <div className="srow">
          <span className="k">Frames span</span>
          <span className="v">
            {frac(maxX - minX)}″ × {frac(maxY - minY)}″
          </span>
        </div>
        <div className="srow">
          <span className="k">Closest spacing</span>
          <span className="v">{ov.size > 0 ? "overlap" : frac(cs) + "″"}</span>
        </div>
        {ov.size > 0 ? (
          <div className="warn">⚠ <span>{ov.size} frames overlapping — move them apart</span></div>
        ) : (
          <div className="ok">✓ no overlaps — nothing touching</div>
        )}
      </div>
    </div>
  );
}
