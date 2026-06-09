import type { FrameMap, PresetName } from "./types";

// ---- data (height, width) in inches ----
export const DIM: Record<number, [number, number]> = {
  1: [44, 33.5],
  2: [17.5, 12.25],
  3: [18, 22],
  4: [15, 12],
  5: [5, 13.25],
  6: [8.25, 10],
  7: [18, 26],
  8: [9, 19],
  9: [10.5, 12.25],
};

export const IDS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const FR: FrameMap = {};
IDS.forEach((i) => {
  FR[i] = { w: DIM[i][1], h: DIM[i][0] };
});

export const WIN = 102; // wall width, inches
export const HIN = 44; // wall height, inches
export const GAP = 2.75; // default gap used by preset layout

// ---- preset layout (columns) ----
export const PRESETS: Record<PresetName, number[][]> = {
  cascade: [[1], [7, 8], [3, 4, 5], [2, 6, 9]],
  bookend: [[1], [2, 6, 9], [3, 4, 5], [7, 8]],
  balanced: [[1], [2, 5, 9], [3, 7], [4, 6, 8]],
};
