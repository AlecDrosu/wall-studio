import { WIN, HIN } from "../lib/constants";
import { computeGaps, frac, rectOf } from "../lib/geometry";
import type { Guide, PosMap } from "../lib/types";

type Props = {
  pos: PosMap;
  pxin: number;
  selected: number | null;
  showMeas: boolean;
  guides: Guide[];
};

/** A dimension line with end-ticks and a centered label chip. */
function DimLine({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  const horiz = Math.abs(y2 - y1) < 0.5;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const tw = label.length * 6.2 + 8;
  const th = 15;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--dim)" strokeWidth={1.4} />
      {horiz ? (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke="var(--dim)" strokeWidth={1.2} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke="var(--dim)" strokeWidth={1.2} />
        </>
      ) : (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke="var(--dim)" strokeWidth={1.2} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke="var(--dim)" strokeWidth={1.2} />
        </>
      )}
      <rect
        x={mx - tw / 2}
        y={my - th / 2}
        width={tw}
        height={th}
        rx={4}
        fill="var(--wall)"
        stroke="var(--line)"
        strokeWidth={0.8}
      />
      <text
        x={mx}
        y={my + 0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--mono)"
        fontSize={10}
        fill="var(--dim)"
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

export function Overlay({ pos, pxin, selected, showMeas, guides }: Props) {
  const w = WIN * pxin;
  const h = HIN * pxin;

  const dims = [];
  if (showMeas && selected !== null) {
    const a = rectOf(pos, selected);
    const gp = computeGaps(pos, selected);
    // RIGHT
    {
      const s = gp.right;
      const y = s.other ? (Math.max(a.t, s.other.t) + Math.min(a.b, s.other.b)) / 2 : (a.t + a.b) / 2;
      dims.push(
        <DimLine key="r" x1={a.r * pxin} y1={y * pxin} x2={(a.r + s.gap) * pxin} y2={y * pxin} label={frac(s.gap) + "″"} />
      );
    }
    // LEFT
    {
      const s = gp.left;
      const y = s.other ? (Math.max(a.t, s.other.t) + Math.min(a.b, s.other.b)) / 2 : (a.t + a.b) / 2;
      dims.push(
        <DimLine key="l" x1={a.l * pxin} y1={y * pxin} x2={(a.l - s.gap) * pxin} y2={y * pxin} label={frac(s.gap) + "″"} />
      );
    }
    // TOP
    {
      const s = gp.top;
      const x = s.other ? (Math.max(a.l, s.other.l) + Math.min(a.r, s.other.r)) / 2 : (a.l + a.r) / 2;
      dims.push(
        <DimLine key="t" x1={x * pxin} y1={a.t * pxin} x2={x * pxin} y2={(a.t - s.gap) * pxin} label={frac(s.gap) + "″"} />
      );
    }
    // BOTTOM
    {
      const s = gp.bottom;
      const x = s.other ? (Math.max(a.l, s.other.l) + Math.min(a.r, s.other.r)) / 2 : (a.l + a.r) / 2;
      dims.push(
        <DimLine key="b" x1={x * pxin} y1={a.b * pxin} x2={x * pxin} y2={(a.b + s.gap) * pxin} label={frac(s.gap) + "″"} />
      );
    }
  }

  return (
    <svg className="overlay" id="overlay" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {guides.map((gd, i) =>
        gd.axis === "x" ? (
          <line
            key={`g${i}`}
            x1={gd.v * pxin}
            y1={0}
            x2={gd.v * pxin}
            y2={HIN * pxin}
            stroke="var(--guide)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ) : (
          <line
            key={`g${i}`}
            x1={0}
            y1={gd.v * pxin}
            x2={WIN * pxin}
            y2={gd.v * pxin}
            stroke="var(--guide)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )
      )}
      {dims}
    </svg>
  );
}
