"use client";

import { useId } from "react";
import { CIRCUIT_PATHS, resolveCircuitKey } from "@/lib/circuits";

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