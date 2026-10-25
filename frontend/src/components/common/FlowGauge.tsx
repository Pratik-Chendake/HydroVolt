import React from 'react';

interface FlowGaugeProps {
  flowRate: number; // in L/min
  maxFlow?: number; // default 30 L/min for YF-S201
  warningThreshold?: number;
  className?: string;
}

export const FlowGauge: React.FC<FlowGaugeProps> = ({
  flowRate,
  maxFlow = 30,
  warningThreshold = 25,
  className = '',
}) => {
  const clampedFlow = Math.min(Math.max(flowRate, 0), maxFlow);
  const percentage = clampedFlow / maxFlow;

  // Arc calculation from -210 degrees to 30 degrees (240 degree sweep)
  const startAngle = -210;
  const sweepAngle = 240;
  const needleAngle = startAngle + percentage * sweepAngle;

  const cx = 150;
  const cy = 145;
  const r = 108;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, radius, endA);
    const end = polarToCartesian(x, y, radius, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Background track
  const backgroundTrack = describeArc(cx, cy, r, startAngle, startAngle + sweepAngle);
  // Active value track
  const activeTrack = describeArc(cx, cy, r, startAngle, Math.max(needleAngle, startAngle + 0.1));

  // Determine stroke color & gradient based on flow velocity
  const isHighWarning = flowRate >= warningThreshold;
  const isMediumFlow = flowRate >= 12;

  // Outer needle tip position
  const needleTip = polarToCartesian(cx, cy, r - 8, needleAngle);
  const needleBaseLeft = polarToCartesian(cx, cy, 14, needleAngle - 90);
  const needleBaseRight = polarToCartesian(cx, cy, 14, needleAngle + 90);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 300 240" className="w-full max-w-[290px] drop-shadow-2xl">
        <defs>
          {/* Neon Rose & Cyber Blue Gradient for active track */}
          <linearGradient id="flowTrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="65%" stopColor="#0070F3" />
            <stop offset="100%" stopColor="#FF007F" />
          </linearGradient>

          {/* Skeuomorphic Metallic Bezel Gradient */}
          <linearGradient id="metallicBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38496D" />
            <stop offset="50%" stopColor="#0D1628" />
            <stop offset="100%" stopColor="#1E2A42" />
          </linearGradient>

          {/* Needle Gradient */}
          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="cyberGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="roseGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Skeuomorphic Outer Metal Bezel Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 26}
          fill="none"
          stroke="url(#metallicBezel)"
          strokeWidth="3.5"
          opacity="0.8"
        />

        {/* Industrial Ticks Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 20}
          fill="none"
          stroke="#00D2FF"
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.35"
        />

        {/* Dark Neomorphic Inset Dial Face */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 14}
          fill="#03060F"
          stroke="#101B30"
          strokeWidth="2"
        />

        {/* Background Track (Recessed Track) */}
        <path
          d={backgroundTrack}
          fill="none"
          stroke="#0A1122"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d={backgroundTrack}
          fill="none"
          stroke="#060914"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active Flow Track with Radiant Neon Gradient */}
        <path
          d={activeTrack}
          fill="none"
          stroke="url(#flowTrackGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          filter={isHighWarning ? 'url(#roseGlow)' : 'url(#cyberGlow)'}
          className="transition-all duration-300 ease-out"
        />

        {/* Scale Ticks & Values */}
        {[0, 5, 10, 15, 20, 25, 30].map((tick) => {
          const tickPct = tick / maxFlow;
          const tickAngle = startAngle + tickPct * sweepAngle;
          const isWarningTick = tick >= warningThreshold;
          const p1 = polarToCartesian(cx, cy, r - 12, tickAngle);
          const p2 = polarToCartesian(cx, cy, r - 22, tickAngle);
          const textPos = polarToCartesian(cx, cy, r - 34, tickAngle);

          return (
            <g key={tick}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isWarningTick ? '#FF007F' : '#00D2FF'}
                strokeWidth={tick % 10 === 0 ? '2' : '1.5'}
                opacity={isWarningTick ? 0.9 : 0.6}
              />
              <text
                x={textPos.x}
                y={textPos.y + 4}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold"
                fill={isWarningTick ? '#FF66B2' : '#94A3B8'}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Skeuomorphic Needle */}
        <polygon
          points={`${needleBaseLeft.x},${needleBaseLeft.y} ${needleTip.x},${needleTip.y} ${needleBaseRight.x},${needleBaseRight.y}`}
          fill="url(#needleGradient)"
          filter="url(#cyberGlow)"
          opacity="0.9"
          className="transition-all duration-300 ease-out"
        />

        {/* Needle Center Cap (Skeuomorphic Chrome/Titanium Rivet) */}
        <circle cx={cx} cy={cy} r="15" fill="#0D1627" stroke="#253557" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="10" fill="url(#metallicBezel)" />
        <circle
          cx={cx}
          cy={cy}
          r="4"
          fill={isHighWarning ? '#FF007F' : '#00D2FF'}
          filter={isHighWarning ? 'url(#roseGlow)' : 'url(#cyberGlow)'}
        />

        {/* Center Digital Display (Liquid Glass Readout) */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="text-3xl font-black font-mono tracking-tight"
          fill="#FFFFFF"
          filter="url(#cyberGlow)"
        >
          {flowRate.toFixed(2)}
        </text>

        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          className="text-[10px] font-extrabold uppercase tracking-widest font-mono"
          fill="#00D2FF"
        >
          LITERS / MIN
        </text>

        {/* Tactical Sub-Status Pill Text */}
        <text
          x={cx}
          y={cy + 75}
          textAnchor="middle"
          className="text-[11px] font-mono font-bold tracking-wider uppercase"
          fill={
            flowRate === 0
              ? '#64748B'
              : isHighWarning
              ? '#FF007F'
              : '#00D2FF'
          }
        >
          {flowRate === 0
            ? '● IDLE (NO FLOW)'
            : isHighWarning
            ? '▲ HIGH VELOCITY DETECTED'
            : '● STEADY TURBINE FLOW'}
        </text>
      </svg>
    </div>
  );
};
