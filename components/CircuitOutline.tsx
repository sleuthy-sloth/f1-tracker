"use client";

import { useId } from "react";

export interface CircuitOutlineProps {
  /** SVG path data for the circuit layout */
  pathData?: string;
  /** Circuit short name for built-in lookup (if pathData not provided) */
  circuitName?: string;
  /** Glow color - hex format (defaults to indigo #6366F1) */
  glowColor?: string;
  /** Width and height of the SVG viewBox */
  size?: number;
  /** Stroke width (default 2) */
  strokeWidth?: number;
  /** Apply hover intensify effect */
  hoverable?: boolean;
  /** Additional className */
  className?: string;
}

// Built-in simplified circuit paths (approximate SVG outlines)
const CIRCUIT_PATHS: Record<string, string> = {
  "monza": "M60 20 Q80 5 100 15 Q120 25 115 45 Q110 60 90 65 Q70 70 60 85 Q50 100 35 95 Q20 90 25 70 Q30 50 45 40 Q55 30 60 20Z",
  "monaco": "M30 15 L50 10 L70 20 L80 40 L75 55 L60 65 L45 60 L35 45 L25 35 L20 25Z",
  "spa": "M20 30 Q40 10 65 15 Q85 20 90 40 Q95 60 80 75 Q65 85 45 80 Q30 70 25 55 Q20 40 20 30Z",
  "silverstone": "M40 10 Q65 5 80 20 Q95 35 85 55 Q75 70 55 75 Q35 80 20 65 Q10 50 15 30 Q25 15 40 10Z",
  "suzuka": "M25 15 Q50 5 70 15 Q85 25 90 45 Q85 65 65 75 Q45 80 30 65 Q20 50 25 30Z",
  "interlagos": "M50 5 Q70 10 80 30 Q85 50 70 65 Q55 75 35 70 Q20 60 15 40 Q15 20 35 10Z",
  "red_bull_ring": "M30 15 L60 10 L85 20 L90 45 L75 65 L50 75 L25 65 L15 40Z",
  "yas_marina": "M15 35 Q30 15 55 10 Q80 10 90 30 Q95 50 80 65 Q65 75 45 70 Q30 65 20 50Z",
  "marina_bay": "M25 10 L55 5 L80 15 L90 35 L85 55 L60 65 L35 60 L15 45 L10 25Z",
  "catalunya": "M35 10 Q60 5 80 20 Q95 35 85 55 Q70 70 50 75 Q30 80 15 60 Q10 40 20 20Z",
  "default": "M20 20 L80 20 L90 50 L70 80 L30 80 L10 50Z",
};

export function CircuitOutline({
  pathData,
  circuitName,
  glowColor = "#6366F1",
  size = 100,
  strokeWidth = 2,
  hoverable = false,
  className = "",
}: CircuitOutlineProps) {
  const filterId = useId();
  const path = pathData || CIRCUIT_PATHS[(circuitName || "").toLowerCase()] || CIRCUIT_PATHS.default;
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className={`block ${hoverable ? "group" : ""} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={circuitName ? `Circuit outline for ${circuitName}` : "Circuit outline"}
      role="img"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="sharp" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="sharp" />
          </feMerge>
        </filter>
      </defs>

      {path && (
        <path
          d={path}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          className={
            hoverable
              ? "transition-all duration-300 group-hover:stroke-[3] group-hover:opacity-90"
              : ""
          }
        />
      )}

      {/* Fallback if no path */}
      {!path && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontSize="8"
          className="text-f1-silver/40"
        >
          No circuit
        </text>
      )}
    </svg>
  );
}