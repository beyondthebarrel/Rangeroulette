const CX = 200;
const CY = 225;
const R_OUTER = 105;
const R_INNER = 26;

function wedgePath(index: number, count: number): string {
  const startAngle = (index / count) * 2 * Math.PI - Math.PI / 2;
  const endAngle = ((index + 1) / count) * 2 * Math.PI - Math.PI / 2;
  const x1 = CX + R_OUTER * Math.cos(startAngle);
  const y1 = CY + R_OUTER * Math.sin(startAngle);
  const x2 = CX + R_OUTER * Math.cos(endAngle);
  const y2 = CY + R_OUTER * Math.sin(endAngle);
  const ix1 = CX + R_INNER * Math.cos(startAngle);
  const iy1 = CY + R_INNER * Math.sin(startAngle);
  const ix2 = CX + R_INNER * Math.cos(endAngle);
  const iy2 = CY + R_INNER * Math.sin(endAngle);
  return `M ${ix1} ${iy1} L ${x1} ${y1} A ${R_OUTER} ${R_OUTER} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${R_INNER} ${R_INNER} 0 0 0 ${ix1} ${iy1} Z`;
}

function iconAt(index: number, count: number, node: React.ReactNode) {
  const midAngle = ((index + 0.5) / count) * 2 * Math.PI - Math.PI / 2;
  const r = (R_OUTER + R_INNER) / 2;
  const x = CX + r * Math.cos(midAngle);
  const y = CY + r * Math.sin(midAngle);
  return (
    <g key={index} transform={`translate(${x} ${y})`} stroke="white" strokeWidth="1.6" fill="none">
      {node}
    </g>
  );
}

const CATEGORY_ICONS: React.ReactNode[] = [
  // Time — clock
  <g>
    <circle r="7" />
    <line x1="0" y1="0" x2="0" y2="-4.5" />
    <line x1="0" y1="0" x2="3" y2="1" />
  </g>,
  // Course of Fire — burst
  <g>
    <line x1="0" y1="-7" x2="0" y2="7" />
    <line x1="-7" y1="0" x2="7" y2="0" />
    <line x1="-5" y1="-5" x2="5" y2="5" />
    <line x1="-5" y1="5" x2="5" y2="-5" />
  </g>,
  // Target — bullseye
  <g>
    <circle r="7" />
    <circle r="3.5" />
    <circle r="0.8" fill="white" />
  </g>,
  // Start Position — figure
  <g>
    <circle cx="0" cy="-5" r="2" fill="white" stroke="none" />
    <line x1="0" y1="-3" x2="0" y2="3" />
    <line x1="-4" y1="-1" x2="4" y2="-1" />
    <line x1="0" y1="3" x2="-3" y2="7" />
    <line x1="0" y1="3" x2="3" y2="7" />
  </g>,
  // Distance — ruler
  <g>
    <line x1="-7" y1="0" x2="7" y2="0" />
    <line x1="-7" y1="-3" x2="-7" y2="3" />
    <line x1="-3.5" y1="-2" x2="-3.5" y2="2" />
    <line x1="0" y1="-3" x2="0" y2="3" />
    <line x1="3.5" y1="-2" x2="3.5" y2="2" />
    <line x1="7" y1="-3" x2="7" y2="3" />
  </g>,
];

export function RangeRouletteBadge() {
  const count = CATEGORY_ICONS.length;
  return (
    <svg viewBox="0 0 400 430" className="w-full max-w-[170px] sm:max-w-[280px]">
      <defs>
        <path
          id="rr-arc-top"
          d={`M ${CX - 175} ${CY} A 175 175 0 0 1 ${CX + 175} ${CY}`}
          fill="none"
        />
        <path
          id="rr-arc-bottom"
          d={`M ${CX - 175} ${CY} A 175 175 0 0 0 ${CX + 175} ${CY}`}
          fill="none"
        />
      </defs>

      {Array.from({ length: count }).map((_, i) => (
        <path
          key={i}
          d={wedgePath(i, count)}
          fill={i % 2 === 0 ? "#7f1d1d" : "#450a0a"}
          stroke="#dc2626"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: count }).map((_, i) => iconAt(i, count, CATEGORY_ICONS[i]))}

      <circle cx={CX} cy={CY} r={R_INNER} fill="#111" stroke="#dc2626" strokeWidth="2" />
      <circle cx={CX} cy={CY} r={R_INNER - 8} fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
      <circle cx={CX} cy={CY} r="3" fill="#dc2626" />

      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#dc2626" strokeWidth="2.5" />

      <text fill="#f4f4f5" fontSize="46" fontWeight="800" letterSpacing="4">
        <textPath href="#rr-arc-top" startOffset="50%" textAnchor="middle">
          RANGE
        </textPath>
      </text>
      <text fill="#dc2626" fontSize="40" fontWeight="800" letterSpacing="3">
        <textPath href="#rr-arc-bottom" startOffset="50%" textAnchor="middle">
          ROULETTE
        </textPath>
      </text>
    </svg>
  );
}
