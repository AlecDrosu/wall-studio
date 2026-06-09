import { WIN, HIN } from "../lib/constants";

const RW = 22; // ruler gutter thickness in px — matches --rw in styles.css

export function RulerTop({ pxin }: { pxin: number }) {
  const w = WIN * pxin;
  const ticks = [];
  for (let i = 0; i <= WIN; i++) {
    const x = i * pxin;
    const major = i % 6 === 0;
    const y1 = major ? 6 : 13;
    ticks.push(
      <line
        key={`t${i}`}
        x1={x}
        y1={y1}
        x2={x}
        y2={RW}
        stroke="var(--rule)"
        strokeWidth={major ? 1 : 0.7}
      />
    );
    if (major && i % 12 === 0) {
      ticks.push(
        <text
          key={`tl${i}`}
          x={x + 2}
          y={9}
          fontFamily="var(--mono)"
          fontSize={8.5}
          fill="var(--muted)"
        >
          {i}
        </text>
      );
    }
  }
  return (
    <div className="ruler" id="ruler-top">
      <svg width={w} height={RW} viewBox={`0 0 ${w} ${RW}`}>
        {ticks}
      </svg>
    </div>
  );
}

export function RulerLeft({ pxin }: { pxin: number }) {
  const h = HIN * pxin;
  const ticks = [];
  for (let j = 0; j <= HIN; j++) {
    const y = j * pxin;
    const maj = j % 6 === 0;
    const x1 = maj ? 6 : 13;
    ticks.push(
      <line
        key={`l${j}`}
        x1={x1}
        y1={y}
        x2={RW}
        y2={y}
        stroke="var(--rule)"
        strokeWidth={maj ? 1 : 0.7}
      />
    );
    if (maj && j % 12 === 0 && j > 0) {
      ticks.push(
        <text
          key={`ll${j}`}
          x={2}
          y={y - 2}
          fontFamily="var(--mono)"
          fontSize={8.5}
          fill="var(--muted)"
        >
          {j}
        </text>
      );
    }
  }
  return (
    <div className="ruler" id="ruler-left">
      <svg width={RW} height={h} viewBox={`0 0 ${RW} ${h}`}>
        {ticks}
      </svg>
    </div>
  );
}
