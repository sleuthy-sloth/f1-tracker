"use client";

interface SpeedGaugeProps {
  /** Current speed value (default 0) */
  speed?: number;
  /** Maximum speed for the gauge (default 360) */
  maxSpeed?: number;
  /** Size of the gauge in pixels (default 160) */
  size?: number;
  /** Optional label below the gauge */
  label?: string;
  /** Additional class name */
  className?: string;
}

function getSpeedColor(speed: number, maxSpeed: number): string {
  const ratio = speed / maxSpeed;
  if (ratio < 0.5) return "#22c55e"; // green-500
  if (ratio < 0.8) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function getSpeedTextColor(speed: number, maxSpeed: number): string {
  const ratio = speed / maxSpeed;
  if (ratio < 0.5) return "#22c55e";
  if (ratio < 0.8) return "#eab308";
  return "#ef4444";
}

export function SpeedGauge({
  speed = 0,
  maxSpeed = 360,
  size = 160,
  label,
  className = "",
}: SpeedGaugeProps) {
  const center = size / 2;
  const radius = center - 16;
  const strokeWidth = 12;
  const arcLength = 270; // degrees
  const startAngle = 135; // offset from top
  const endAngle = startAngle + arcLength;

  // SVG arc path
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Background arc (full 270deg)
  const bgArcPath = describeArc(center, center, radius, startAngle, endAngle);

  // Active arc (proportional to speed)
  const activeArcDeg = Math.min((speed / maxSpeed) * arcLength, arcLength);
  const activeArcPath = describeArc(center, center, radius, startAngle, startAngle + activeArcDeg);

  const currentColor = getSpeedColor(speed, maxSpeed);
  const textColor = getSpeedTextColor(speed, maxSpeed);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active arc */}
        <path
          d={activeArcPath}
          fill="none"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          filter={`drop-shadow(0 0 6px ${currentColor}60)`}
        />
        {/* Speed value */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={Math.floor(size * 0.18)}
          fontFamily="var(--font-heading)"
          fontWeight="900"
          className="transition-colors duration-300"
        >
          {Math.round(speed)}
        </text>
        {/* KM/H label */}
        <text
          x={center}
          y={center + Math.floor(size * 0.08)}
          textAnchor="middle"
          fill="#a0a0a0"
          fontSize={Math.floor(size * 0.055)}
          fontFamily="var(--font-mono)"
          opacity={0.6}
        >
          KM/H
        </text>
      </svg>
      {label && (
        <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60 opacity-60 mt-1">
          {label}
        </span>
      )}
    </div>
  );
}