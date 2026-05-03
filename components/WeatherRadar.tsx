'use client';

import type { ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * WeatherRadarProps
 */
interface WeatherRadarProps {
  currentFrame: ReplayFrame | null;
  className?: string;
}

/**
 * Get precipitation color based on rainfall value
 */
function getPrecipitationColor(rainfall: number): string {
  if (rainfall === 0) return '#4ade80'; // green - dry
  if (rainfall < 20) return '#60a5fa'; // light blue - light rain
  if (rainfall < 50) return '#3b82f6'; // blue - moderate rain
  return '#1e40af'; // dark blue - heavy rain
}

/**
 * Format wind direction to cardinal direction
 */
function formatWindDirection(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined) return '—';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * WeatherRadar - Glassmorphic side panel showing weather conditions for race replay
 * Displays current weather data from OpenF1 API with visual radar precipitation indicator
 *
 * @example
 * <WeatherRadar currentFrame={frame} className="mt-4" />
 */
export default function WeatherRadar({ currentFrame, className }: WeatherRadarProps) {
  // Empty state - no race data
  if (currentFrame === null) {
    return (
      <div className={cn('w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4', className)}>
        <div className="text-f1-silver text-sm text-center py-8">
          No race data
        </div>
      </div>
    );
  }

  const weather = currentFrame.weather;

  // Weather data not available
  if (!weather) {
    return (
      <div className={cn('w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4', className)}>
        <div className="text-f1-silver text-sm text-center py-8">
          Weather data not available
        </div>
      </div>
    );
  }

  const rainfall = weather.rainfall ?? 0;
  const precipitationColor = getPrecipitationColor(rainfall);
  const precipitationLabel = rainfall === 0 ? 'DRY' : `PRECIPITATION: ${rainfall}%`;

  return (
    <div className={cn('w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4', className)}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[10px] uppercase tracking-widest text-f1-silver font-medium">
          WEATHER
        </h2>
      </div>

      {/* Conditions Grid - Row 1 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Track Temperature */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">TRACK</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {weather.track_temperature ?? '—'}°
          </div>
        </div>

        {/* Air Temperature */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">AIR</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {weather.air_temperature ?? '—'}°
          </div>
        </div>

        {/* Humidity */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">HUMID</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {weather.humidity ?? '—'}%
          </div>
        </div>
      </div>

      {/* Conditions Grid - Row 2 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Rainfall */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">RAIN</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {rainfall}%
          </div>
        </div>

        {/* Wind Speed */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">WIND</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {weather.wind_speed ?? '—'}
          </div>
        </div>

        {/* Wind Direction */}
        <div className="text-center">
          <div className="text-[10px] uppercase text-f1-silver mb-1">DIR</div>
          <div className="font-mono font-bold text-f1-white text-sm">
            {formatWindDirection(weather.wind_direction)}
          </div>
        </div>
      </div>

      {/* Radar Visualization */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-[120px] h-[120px]">
          {/* Radar background circles */}
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full"
          >
            {/* Outer ring */}
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            {/* Middle ring */}
            <circle
              cx="60"
              cy="60"
              r="38"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
            {/* Inner ring */}
            <circle
              cx="60"
              cy="60"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            {/* Center dot */}
            <circle
              cx="60"
              cy="60"
              r="3"
              fill="rgba(255,255,255,0.3)"
            />
            {/* Cross lines */}
            <line x1="60" y1="5" x2="60" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="60" y1="95" x2="60" y2="115" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="5" y1="60" x2="25" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="95" y1="60" x2="115" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* Sweep line - simple pulse effect */}
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="10"
              stroke={precipitationColor}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Color overlay in center based on rainfall */}
            <circle
              cx="60"
              cy="60"
              r="15"
              fill={precipitationColor}
              opacity="0.4"
            />
          </svg>
        </div>
        {/* Precipitation label */}
        <div className="mt-2 text-[10px] uppercase text-f1-silver">
          {precipitationLabel}
        </div>
      </div>

      {/* Mini stats row - Pressure */}
      {weather.pressure !== null && weather.pressure !== undefined && (
        <div className="text-center pt-2 border-t border-white/[0.1]">
          <span className="text-[10px] uppercase text-f1-silver">PRESSURE: </span>
          <span className="font-mono text-f1-white text-xs">{weather.pressure} hPa</span>
        </div>
      )}
    </div>
  );
}