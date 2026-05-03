'use client';

import type { ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values and joins with spaces
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface SafetyCarProps {
  currentFrame: ReplayFrame | null;
  previousFrames?: ReplayFrame[];
  className?: string;
}

/**
 * Safety Car visualization component for race replay
 * Displays safety car deployment status with glassmorphic design
 */
export default function SafetyCar({
  currentFrame,
  className,
}: SafetyCarProps) {
  // Empty state - no race data
  if (!currentFrame) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-xs uppercase tracking-widest text-f1-silver mb-4">
          Safety Car
        </h3>
        <div className="flex items-center justify-center h-[200px] text-f1-silver/50">
          <span className="text-sm">No race data</span>
        </div>
      </div>
    );
  }

  const safetyCar = currentFrame.safety_car;
  const isNotDeployed = !safetyCar || safetyCar.status === 'none';

  // Not deployed state
  if (isNotDeployed) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-xs uppercase tracking-widest text-f1-silver mb-4">
          Safety Car
        </h3>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full border-2 border-white/[0.1] bg-white/[0.02]" />
          <span className="text-sm text-f1-silver/50">Not deployed</span>
        </div>
      </div>
    );
  }

  const isDeployed = safetyCar.status === 'deployed';
  const isReturning = safetyCar.status === 'returning';

  // SC deployed state with orange pulsing indicator
  if (isDeployed) {
    // Find SC-related race control message for lap number
    const scMessage = currentFrame.race_control_messages?.find(
      (msg) =>
        msg.category === 'SafetyCar' ||
        msg.message?.toLowerCase().includes('safety car')
    );

    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-xs uppercase tracking-widest text-f1-silver mb-4">
          Safety Car
        </h3>
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing orange indicator */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75" />
            <div className="relative w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
              <svg
                width="40"
                height="20"
                viewBox="0 0 40 20"
                className="text-white"
                fill="currentColor"
              >
                <rect x="2" y="8" width="36" height="8" rx="4" />
                <circle cx="10" cy="16" r="3" fill="white" />
                <circle cx="30" cy="16" r="3" fill="white" />
              </svg>
            </div>
          </div>

          {/* SC status text */}
          <div className="text-center">
            <span className="text-lg font-bold text-orange-500">
              SC DEPLOYED
            </span>
            {scMessage?.lap_number && (
              <p className="text-sm text-f1-silver/70 mt-1">
                Lap {scMessage.lap_number}
              </p>
            )}
          </div>

          {/* Active bar with orange glow */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-f1-silver/70 mb-1">
              <span>Status</span>
              <span className="text-orange-500">ACTIVE</span>
            </div>
            <div className="h-1 w-full bg-orange-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full animate-pulse"
                style={{
                  boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
                }}
              />
            </div>
          </div>

          {/* Simple track visualization */}
          <div className="w-full h-12 mt-2 relative">
            <svg
              viewBox="0 0 120 40"
              className="w-full h-full"
              fill="none"
            >
              {/* Track outline */}
              <path
                d="M10 20 C10 10, 30 5, 60 5 C90 5, 110 10, 110 20 C110 30, 90 35, 60 35 C30 35, 10 30, 10 20Z"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="2"
                fill="none"
              />
              {/* Safety car position marker */}
              <rect
                x={Math.min(Math.max(safetyCar.x ?? 55, 0), 110)}
                y={Math.min(Math.max(safetyCar.y ?? 16, 0), 34)}
                width="10"
                height="6"
                rx="2"
                fill="#F97316"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // SC returning state with yellow indicator
  if (isReturning) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-xs uppercase tracking-widest text-f1-silver mb-4">
          Safety Car
        </h3>
        <div className="flex flex-col items-center gap-4">
          {/* Yellow indicator (no pulse) */}
          <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
            <svg
              width="40"
              height="20"
              viewBox="0 0 40 20"
              className="text-white"
              fill="currentColor"
            >
              <rect x="2" y="8" width="36" height="8" rx="4" />
              <circle cx="10" cy="16" r="3" fill="white" />
              <circle cx="30" cy="16" r="3" fill="white" />
            </svg>
          </div>

          {/* SC status text */}
          <div className="text-center">
            <span className="text-lg font-bold text-yellow-500">
              SC RETURNING
            </span>
            <p className="text-sm text-f1-silver/70 mt-1">Returning to pits</p>
          </div>

          {/* Inactive bar */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-f1-silver/70 mb-1">
              <span>Status</span>
              <span className="text-yellow-500">RETURNING</span>
            </div>
            <div className="h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-yellow-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here but included for safety
  return null;
}