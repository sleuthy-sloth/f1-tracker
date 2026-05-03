"use client";

interface DataCardProps {
  /** The metric label (displayed uppercase, small) */
  label: string;
  /** The large numeric value to display */
  value: string | number;
  /** Optional trend indicator: up, down, or neutral */
  trend?: "up" | "down" | "neutral";
  /** Optional trend label text (e.g., "+2.5%", "-1.2s") */
  trendLabel?: string;
  /** Optional unit to display after the value (smaller text) */
  unit?: string;
  /** Optional className for customization */
  className?: string;
}

function TrendArrow({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  }
  // Neutral direction → no arrow rendered
  return null;
}

export function DataCard({
  label,
  value,
  trend,
  trendLabel,
  unit,
  className = "",
}: DataCardProps) {
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-f1-silver";

  return (
    <div className={`rounded-xl border border-white/[0.07] bg-[#111418] p-4 ${className}`}>
      {/* Label */}
      <div className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60 opacity-60 mb-1.5">
        {label}
      </div>

      {/* Value + Unit */}
      <div className="flex items-baseline gap-1">
        <span className="font-heading font-black tracking-[-0.04em] text-f1-white leading-none text-3xl">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-f1-silver/50">
            {unit}
          </span>
        )}
      </div>

      {/* Trend Indicator */}
      {(trend || trendLabel) && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trendColor}`}>
          {trend && <TrendArrow direction={trend} />}
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

export type { DataCardProps };