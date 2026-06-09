export type Pos = { x: number; y: number };
export type PosMap = Record<number, Pos>;

export type Frame = { w: number; h: number };
export type FrameMap = Record<number, Frame>;

export type Rect = { l: number; t: number; r: number; b: number };

export type Side = "top" | "bottom" | "left" | "right";

/** Result of scanning one side of a frame for its nearest neighbor / wall. */
export type GapInfo = { gap: number; to: number | "wall"; other: Rect | null };
export type Gaps = Record<Side, GapInfo>;

/** Live alignment guide shown while dragging. */
export type Guide = { axis: "x" | "y"; v: number };

export type PresetName = "cascade" | "bookend" | "balanced";

export type SavedDesign = {
  id: string;
  name: string;
  createdAt: number;
  preset: string;
  pos: PosMap;
};
