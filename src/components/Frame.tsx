import { FR } from "../lib/constants";
import { frac } from "../lib/geometry";
import type { Pos } from "../lib/types";

type Props = {
  id: number;
  pos: Pos;
  pxin: number;
  selected: boolean;
  overlapping: boolean;
  dragging: boolean;
  animationDelay: number;
  onPointerDown: (id: number, e: React.PointerEvent<HTMLDivElement>) => void;
};

export function Frame({
  id,
  pos,
  pxin,
  selected,
  overlapping,
  dragging,
  animationDelay,
  onPointerDown,
}: Props) {
  const f = FR[id];
  const wp = f.w * pxin;
  const hp = f.h * pxin;
  const numSize = Math.max(13, Math.min(34, Math.min(wp, hp) * 0.42));

  let szText: string;
  let szShown: boolean;
  if (id === 1) {
    szText = "big";
    szShown = hp > 46;
  } else {
    szText = `${frac(f.w)}×${frac(f.h)}`;
    szShown = wp > 58 && hp > 40;
  }

  const cls =
    "frame" +
    (id === 1 ? " big" : "") +
    (dragging ? " dragging" : "") +
    (selected ? " sel" : "") +
    (overlapping ? " overlap" : "");

  return (
    <div
      className={cls}
      data-id={id}
      style={{
        left: pos.x * pxin,
        top: pos.y * pxin,
        width: wp,
        height: hp,
        animationDelay: `${animationDelay}ms`,
      }}
      onPointerDown={(e) => onPointerDown(id, e)}
    >
      <div className="fnum" style={{ fontSize: numSize }}>
        {id}
      </div>
      <div className="fsz" style={{ display: szShown ? "block" : "none" }}>
        {szText}
      </div>
    </div>
  );
}
