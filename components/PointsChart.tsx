'use client';

import { useMemo } from 'react';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * DriverPointsSeries - Points data for a single driver across race rounds
 */
interface DriverPointsSeries {
  driverNumber: number;
  nameAcronym: string;
  teamColour: string;
  data: number[];
}

/**
 * Chart configuration
 */
interface ChartConfig {
  yMax: number;
  maxRounds: number;
  chartWidth: number;
  chartHeight: number;
  margins: { top: number; right: number; bottom: number; left: number };
}

/**
 * Coordinate on the chart
 */
interface Coordinate {
  x: number;
  y: number;
}

/**
 * Chart margin constants
 */
const MARGINS = { top: 20, right: 20, bottom: 30, left: 50 };

/**
 * Calculate chart scales from series data
 */
function calculateScales(series: DriverPointsSeries[], width: number, height: number): ChartConfig {
  const chartWidth = width - MARGINS.left - MARGINS.right;
  const chartHeight = height - MARGINS.top - MARGINS.bottom;

  let maxPoints = 0;
  let maxRounds = 0;

  for (const driver of series) {
    for (const pts of driver.data) {
      if (pts > maxPoints) maxPoints = pts;
    }
    if (driver.data.length > maxRounds) maxRounds = driver.data.length;
  }

  // Round up yMax to nearest 50
  const yMax = Math.max(Math.ceil((maxPoints + 10) / 50) * 50, 50);
  maxRounds = Math.max(maxRounds, 2);

  return { yMax, maxRounds, chartWidth, chartHeight, margins: MARGINS };
}

/**
 * Convert data point to SVG coordinate
 */
function dataToCoordinate(
  roundIndex: number,
  points: number,
  chartW: number,
  chartH: number,
  yMax: number,
  marginTop: number,
  marginLeft: number
): Coordinate {
  const x = marginLeft + (roundIndex / Math.max(1, 1)) * chartW;
  const y = marginTop + chartH - (points / yMax) * chartH;
  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Generate a smooth SVG path from coordinates
 */
function generateSmoothPath(coords: Coordinate[]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;

  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cx = (prev.x + curr.x) / 2;
    path += ` Q ${prev.x},${prev.y} ${cx},${(prev.y + curr.y) / 2} T ${curr.x},${curr.y}`;
  }
  return path;
}

/**
 * PointsChartProps
 */
interface PointsChartProps {
  series: DriverPointsSeries[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * PointsChart - SVG points progression chart showing championship points over race rounds
 */
export default function PointsChart({
  series,
  width = 400,
  height = 250,
  className,
}: PointsChartProps) {
  const config = useMemo(() => calculateScales(series, width, height), [series, width, height]);
  const { margins, chartWidth, chartHeight, yMax, maxRounds } = config;
  const { top: marginTop, left: marginLeft } = margins;

  // Calculate driver paths (must be before early return for Hook rules)
  const driverPaths = useMemo(() => {
    return series.map((driver) => {
      const coords = driver.data.map((pts, idx) =>
        dataToCoordinate(idx, pts, chartWidth, chartHeight, yMax, marginTop, marginLeft)
      );
      return {
        driver,
        coords,
        path: generateSmoothPath(coords),
      };
    });
  }, [series, chartWidth, chartHeight, yMax, marginTop, marginLeft]);

  // Empty state
  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <div className={cn('bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4', className)}>
        <div className="text-[10px] uppercase tracking-widest text-[#9b9b9b] mb-4">
          Points Progression
        </div>
        <div className="flex items-center justify-center text-[#9b9b9b] text-sm h-[200px]">
          No points data
        </div>
      </div>
    );
  }

  // Grid interval
  const gridInterval = yMax > 100 ? 50 : 10;

  // Y-axis labels
  const yLabels: number[] = [];
  for (let i = 0; i <= yMax; i += gridInterval) {
    yLabels.push(i);
  }

  // X-axis labels
  const xLabels: number[] = [];
  for (let i = 0; i < maxRounds; i++) {
    xLabels.push(i + 1);
  }

  return (
    <div className={cn('bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4', className)}>
      <div className="text-[10px] uppercase tracking-widest text-[#9b9b9b] mb-4">
        Points Progression
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {series.map((s) => (
          <div key={s.driverNumber} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.teamColour }} />
            <span className="text-[10px] text-[#e5e2e1] font-medium">{s.nameAcronym}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Y-axis grid lines */}
        {yLabels.map((label) => {
          const y = marginTop + chartHeight - (label / yMax) * chartHeight;
          return (
            <g key={`y-${label}`}>
              <line
                x1={marginLeft}
                y1={y}
                x2={marginLeft + chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="4"
              />
              <text x={marginLeft - 8} y={y + 3} textAnchor="end" fill="#9b9b9b" fontSize="10">
                {label}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((label) => {
          const x = marginLeft + ((label - 1) / Math.max(maxRounds - 1, 1)) * chartWidth;
          return (
            <g key={`x-${label}`}>
              <text x={x} y={height - 5} textAnchor="middle" fill="#9b9b9b" fontSize="10">
                {label}
              </text>
            </g>
          );
        })}

        {/* Data lines */}
        {driverPaths.map((dp) => (
          <g key={dp.driver.driverNumber}>
            <path
              d={dp.path}
              fill="none"
              stroke={dp.driver.teamColour}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {dp.coords.map((c, i) => (
              <circle
                key={`${dp.driver.driverNumber}-${i}`}
                cx={c.x}
                cy={c.y}
                r="3"
                fill={dp.driver.teamColour}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

export type { DriverPointsSeries, PointsChartProps };
