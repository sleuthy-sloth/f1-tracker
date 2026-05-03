"use client";

interface TireData {
  fl: number; // Front Left percentage (0-100)
  fr: number; // Front Right percentage (0-100)
  rl: number; // Rear Left percentage (0-100)
  rr: number; // Rear Right percentage (0-100)
}

interface TireIndicatorProps {
  /** Tire wear percentages for each position */
  tires: TireData;
  /** Size of each tire circle in pixels (default 48) */
  size?: number;
  /** Optional label */
  label?: string;
  /** Additional className */
  className?: string;
}

function getTireColor(percentage: number): string {
  if (percentage > 60) return "#22c55e"; // green - good
  if (percentage > 30) return "#eab308"; // yellow - warning
  return "#ef4444"; // red - critical
}

function TireCircle({ percentage, size = 48 }: { percentage: number; size: number }) {
  const center = size / 2;
  const radius = center - 4;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getTireColor(percentage);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
        filter={`drop-shadow(0 0 4px ${color}40)`}
      />
      {/* Percentage text */}
      <text
        x={center}
        y={center + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={Math.floor(size * 0.22)}
        fontFamily="var(--font-heading)"
        fontWeight="900"
        className="transition-colors duration-300 transform rotate-90"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

const TIRE_LABELS: Record<keyof TireData, string> = {
  fl: "FL",
  fr: "FR",
  rl: "RL",
  rr: "RR",
};

export function TireIndicator({
  tires,
  size = 48,
  label,
  className = "",
}: TireIndicatorProps) {
  const positions = Object.keys(TIRE_LABELS) as (keyof TireData)[];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex gap-3">
        {positions.map((pos) => (
          <div key={pos} className="flex flex-col items-center gap-1">
            <TireCircle percentage={tires[pos]} size={size} />
            <span className="font-mono text-[10px] font-semibold text-f1-silver/50 uppercase tracking-wider">
              {TIRE_LABELS[pos]}
            </span>
          </div>
        ))}
      </div>
      {label && (
        <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60 opacity-60 mt-2">
          {label}
        </span>
      )}
    </div>
  );
}

export type { TireData };