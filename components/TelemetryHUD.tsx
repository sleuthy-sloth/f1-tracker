'use client';
import { useMemo, memo } from 'react';

import type { Driver, DriverPosition, ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * TelemetryHUDProps
 */
interface TelemetryHUDProps {
  drivers: Driver[];
  currentFrame: ReplayFrame | null;
  selectedDriverNumber: number | null;
  onClose?: () => void;
  className?: string;
}

/**
 * Get driver info by number
 */
function getDriverByNumber(
  drivers: Driver[],
  driverNumber: number
): Driver | undefined {
  return drivers.find((d) => d.driver_number === driverNumber);
}

/**
 * Get telemetry data for selected driver from current frame
 */
function getDriverTelemetry(
  currentFrame: ReplayFrame | null,
  selectedDriverNumber: number | null
): DriverPosition | undefined {
  if (!currentFrame || selectedDriverNumber === null) return undefined;
  return currentFrame.driver_positions.find(
    (dp) => dp.driver_number === selectedDriverNumber
  );
}

/**
 * Format RPM with commas
 */
function formatRpm(rpm: number): string {
  if (isNaN(rpm) || rpm === 0) return '0';
  return Math.round(rpm).toLocaleString();
}

/**
 * Get RPM bar color based on RPM value
 */
function getRpmColor(rpm: number): string {
  if (isNaN(rpm) || rpm <= 0) return 'bg-white/30';
  if (rpm <= 10000) return 'bg-green-500';
  if (rpm <= 13000) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get RPM bar width percentage
 */
function getRpmWidth(rpm: number): string {
  if (isNaN(rpm) || rpm <= 0) return '0%';
  const percentage = Math.min((rpm / 15000) * 100, 100);
  return `${percentage}%`;
}

/**
 * Get DRS status display
 */
function getDrsStatus(drs: number): { label: string; bgClass: string; textClass: string } {
  if (drs >= 10) {
    return { label: 'ON', bgClass: 'bg-green-500/20', textClass: 'text-green-400' };
  }
  if (drs === 8) {
    return { label: 'DET', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' };
  }
  return { label: 'OFF', bgClass: 'bg-white/10', textClass: 'text-f1-silver' };
}

/**
 * Get brake status display
 */
function getBrakeStatus(brake: number): { isOn: boolean; percentage: number } {
  const isOn = !isNaN(brake) && brake > 0;
  const percentage = isNaN(brake) ? 0 : Math.round(brake);
  return { isOn, percentage };
}

/**
 * Get team color with fallback
 */
function getTeamColor(teamColor: string): string {
  if (!teamColor || teamColor === '') return '888888';
  return teamColor.startsWith('#') ? teamColor.slice(1) : teamColor;
}

/**
 * TelemetryHUD - Floating telemetry panel for selected driver during race replay
 */
export const TelemetryHUD = memo(function TelemetryHUD({
  drivers,
  currentFrame,
  selectedDriverNumber,
  onClose,
  className,
}: TelemetryHUDProps) {
  // Get driver info and telemetry data (declared before any conditional returns
  // to comply with React hooks ordering rules — hooks must be called in the
  // same order on every render).
  const driver = useMemo(() => getDriverByNumber(drivers, selectedDriverNumber ?? 0), [drivers, selectedDriverNumber]);
  const telemetry = useMemo(() => getDriverTelemetry(currentFrame, selectedDriverNumber), [currentFrame, selectedDriverNumber]);

  // State 1: No driver selected — don't render anything to avoid covering the map.
  if (selectedDriverNumber === null) {
    return null;
  }

  // State 2: Loading or no telemetry data (retired/off track)
  if (!currentFrame || !telemetry) {
    return (
      <div className={cn(
        'w-full md:w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4',
        className
      )}>
        {driver && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: `#${getTeamColor(driver.team_colour)}` }}
            />
            <span className="font-heading font-bold text-f1-white">
              {driver.name_acronym}
            </span>
          </div>
        )}
        <div className="text-f1-silver text-sm text-center py-4">
          No telemetry data
        </div>
      </div>
    );
  }

  // State 4: Full telemetry display
  const teamColor = driver ? getTeamColor(driver.team_colour) : '888888';
  const speed = isNaN(telemetry.speed) ? 0 : telemetry.speed;
  const gear = isNaN(telemetry.gear) ? 0 : telemetry.gear;
  const rpm = isNaN(telemetry.rpm) ? 0 : telemetry.rpm;
  const throttle = isNaN(telemetry.throttle) ? 0 : telemetry.throttle;
  const drsStatus = getDrsStatus(telemetry.drs);
  const brakeStatus = getBrakeStatus(telemetry.brake);

  return (
    <div className={cn(
      'w-full md:w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4',
      className
    )}>
      {/* Header with close button */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: `#${teamColor}` }}
        />
        <div className="flex-1 min-w-0">
          <span className="font-heading font-bold text-f1-white">
            {driver?.name_acronym || selectedDriverNumber}
          </span>
          {driver && (
            <div className="text-[10px] text-f1-silver truncate">
              {driver.full_name}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-md transition-colors pointer-events-auto text-f1-silver hover:text-f1-white flex-shrink-0"
            aria-label="Close telemetry panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Speed - Full Width */}
        <div className="col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
            SPEED
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-heading font-bold text-f1-white">
              {speed}
            </span>
            <span className="text-sm text-f1-silver">km/h</span>
          </div>
        </div>

        {/* Gear */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
            GEAR
          </div>
          <div className="bg-white/[0.10] px-3 py-2 rounded-lg">
            <span className="text-2xl font-heading font-bold text-f1-white">
              {gear === 0 ? 'N' : gear}
            </span>
          </div>
        </div>

        {/* DRS */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
            DRS
          </div>
          <div className={cn(
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
            drsStatus.bgClass,
            drsStatus.textClass
          )}>
            {drsStatus.label}
          </div>
        </div>

        {/* RPM Bar - Full Width */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-f1-silver">
              RPM
            </div>
            <div className="font-mono text-sm text-f1-white">
              {formatRpm(rpm)}
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getRpmColor(rpm))}
              style={{ width: getRpmWidth(rpm) }}
            />
          </div>
        </div>

        {/* Throttle */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
            THROTTLE
          </div>
          <div className="font-mono text-sm text-f1-white mb-1">
            {Math.round(throttle)}%
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(throttle, 100)}%` }}
            />
          </div>
        </div>

        {/* Brake */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
            BRAKE
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
              brakeStatus.isOn ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-f1-silver'
            )}>
              {brakeStatus.isOn ? 'ON' : 'OFF'}
            </div>
            {brakeStatus.isOn && (
              <span className="font-mono text-xs text-f1-silver">
                {brakeStatus.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TelemetryHUD;