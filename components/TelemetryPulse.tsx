"use client";

interface TelemetryPulseProps {
  className?: string;
  color?: string;
}

export function TelemetryPulse({ className = "", color = "#e10600" }: TelemetryPulseProps) {
  return (
    <div className={`relative w-full py-4 opacity-60 ${className}`}>
      <svg viewBox="0 0 400 40" className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path 
          d="M0 20 L40 20 L60 5 L80 35 L100 10 L125 38 L150 15 L180 20 L240 20 L260 5 L280 35 L300 10 L325 38 L350 15 L380 20 L400 20" 
          fill="none" 
          stroke={color} 
          strokeWidth="2"
          filter="url(#glow)"
          className="animate-telemetry"
        />
        <circle cx="400" cy="20" r="3" fill={color} className="animate-pulse shadow-[0_0_8px_#e10600]" />
      </svg>
    </div>
  );
}
