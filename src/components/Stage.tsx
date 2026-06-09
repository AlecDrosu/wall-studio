import { forwardRef } from "react";
import type { Guide, PosMap } from "../lib/types";
import { RulerTop, RulerLeft } from "./Rulers";
import { Wall } from "./Wall";

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

export const Stage = forwardRef<HTMLDivElement, Props>(function Stage(props, wallRef) {
  const { pxin } = props;
  return (
    <div className="stage" id="stage">
      <div className="corner" />
      <RulerTop pxin={pxin} />
      <RulerLeft pxin={pxin} />
      <Wall ref={wallRef} {...props} />
    </div>
  );
});
