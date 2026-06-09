import { FR } from "../lib/constants";
import { computeGaps, frac, inch } from "../lib/geometry";
import type { GapInfo, PosMap } from "../lib/types";

function gapToTxt(s: GapInfo): string {
  return s.to === "wall" ? "wall" : "frame " + s.to;
}

export function SelectedPanel({ selected, pos }: { selected: number | null; pos: PosMap }) {
  if (selected === null) {
    return (
      <div className="panel">
        <h2>No frame selected</h2>
        <p className="hint">Click or drag a frame to inspect it.</p>
      </div>
    );
  }

  const id = selected;
  const f = FR[id];
  const p = pos[id];
  const gp = computeGaps(pos, id);

  return (
    <div className="panel">
      <h2>{id === 1 ? "Frame 1 — the big one" : "Frame " + id}</h2>
      <div className="sel-head">
        <div className={"sel-badge" + (id === 1 ? " big" : "")}>{id}</div>
        <div>
          <div className="sz">
            {frac(f.w)}″ × {frac(f.h)}″
          </div>
          <div className="szsub">frame size (W × H)</div>
        </div>
      </div>
      <div className="pos-grid">
        <div className="cell">
          <div className="k">From left edge</div>
          <div className="v">{inch(p.x)}</div>
        </div>
        <div className="cell">
          <div className="k">From top edge</div>
          <div className="v">{inch(p.y)}</div>
        </div>
      </div>
      <div className="cross">
        {/* Bug fix 2: every box gets an explicit column + row so the
            "gaps to neighbors" label stays centered and ▶ sits in the right cell. */}
        <div className="gapbox" style={{ gridColumn: 2, gridRow: 1 }}>
          <div className="g">{inch(gp.top.gap)}</div>
          <div className="to">{gapToTxt(gp.top)}</div>
          <div className="arrow">▲</div>
        </div>
        <div className="gapbox" style={{ gridColumn: 1, gridRow: 2 }}>
          <div className="arrow">◀</div>
          <div className="g">{inch(gp.left.gap)}</div>
          <div className="to">{gapToTxt(gp.left)}</div>
        </div>
        <div className="mid" style={{ gridColumn: 2, gridRow: 2 }}>
          <div className="ctr">
            gaps to
            <br />
            neighbors
          </div>
        </div>
        <div className="gapbox" style={{ gridColumn: 3, gridRow: 2 }}>
          <div className="arrow">▶</div>
          <div className="g">{inch(gp.right.gap)}</div>
          <div className="to">{gapToTxt(gp.right)}</div>
        </div>
        <div className="gapbox" style={{ gridColumn: 2, gridRow: 3 }}>
          <div className="arrow">▼</div>
          <div className="g">{inch(gp.bottom.gap)}</div>
          <div className="to">{gapToTxt(gp.bottom)}</div>
        </div>
      </div>
    </div>
  );
}
