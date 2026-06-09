import { forwardRef } from "react";
import { WIN, HIN, IDS } from "../lib/constants";
import type { Guide, PosMap } from "../lib/types";
import { Frame } from "./Frame";
import { Overlay } from "./Overlay";

type Props = {
  pos: PosMap;
  pxin: number;
  selected: number | null;
  overlaps: Set<number>;
  dragId: number | null;
  showMeas: boolean;
  guides: Guide[];
  onFramePointerDown: (id: number, e: React.PointerEvent<HTMLDivElement>) => void;
  onBackgroundPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
};

export const Wall = forwardRef<HTMLDivElement, Props>(function Wall(
  { pos, pxin, selected, overlaps, dragId, showMeas, guides, onFramePointerDown, onBackgroundPointerDown },
  ref
) {
  const w = WIN * pxin;
  const h = HIN * pxin;
  const mn = pxin;
  const mj = 6 * pxin;

  return (
    <div
      className="wall"
      id="wall"
      ref={ref}
      onPointerDown={onBackgroundPointerDown}
      style={{
        width: w,
        height: h,
        backgroundImage:
          "linear-gradient(var(--grid-minor) 1px, transparent 1px)," +
          "linear-gradient(90deg, var(--grid-minor) 1px, transparent 1px)," +
          "linear-gradient(var(--grid-major) 1px, transparent 1px)," +
          "linear-gradient(90deg, var(--grid-major) 1px, transparent 1px)",
        backgroundSize: `${mn}px ${mn}px,${mn}px ${mn}px,${mj}px ${mj}px,${mj}px ${mj}px`,
      }}
    >
      <Overlay pos={pos} pxin={pxin} selected={selected} showMeas={showMeas} guides={guides} />
      {IDS.map((id, idx) => (
        <Frame
          key={id}
          id={id}
          pos={pos[id]}
          pxin={pxin}
          selected={selected === id}
          overlapping={overlaps.has(id)}
          dragging={dragId === id}
          animationDelay={idx * 45}
          onPointerDown={onFramePointerDown}
        />
      ))}
    </div>
  );
});
