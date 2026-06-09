import { FR, IDS } from "../lib/constants";
import { frac } from "../lib/geometry";
import type { PosMap } from "../lib/types";

type Props = {
  pos: PosMap;
  selected: number | null;
  onSelect: (id: number) => void;
};

export function AllPositionsPanel({ pos, selected, onSelect }: Props) {
  return (
    <div className="panel">
      <h2>All positions</h2>
      <p className="hint">Top-left corner of each frame. Tap a row to select.</p>
      <table className="allpos">
        <thead>
          <tr>
            <th>#</th>
            <th>X ↓left</th>
            <th>Y ↓top</th>
            <th>W×H</th>
          </tr>
        </thead>
        <tbody>
          {IDS.map((i) => {
            const f = FR[i];
            const p = pos[i];
            return (
              <tr key={i} className={i === selected ? "active" : ""} onClick={() => onSelect(i)}>
                <td className="idc">
                  <span className={"dot" + (i === 1 ? " big" : "")} />
                  {i}
                </td>
                <td>{frac(p.x)}″</td>
                <td>{frac(p.y)}″</td>
                <td>
                  {frac(f.w)}×{frac(f.h)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
