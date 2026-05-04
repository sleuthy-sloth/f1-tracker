/**
 * TrackMap Component
 * Canvas-based track visualization for F1 race replay
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { TrackLayout, DriverPosition, SafetyCarStatus } from '@/lib/types';
import { normalizeTrackCoordinates, getSectorCoordinates, getCircuitBounds } from '@/lib/track-map';

/**
 * TrackMap component props
 */
interface TrackMapProps {
  /** Track layout data with circuit coordinates */
  trackLayout: TrackLayout;
  /** Array of driver metadata (acronyms, colors) */
  drivers?: Driver[];
  /** Optional: additional CSS classes */
  className?: string;
  /** Canvas width in pixels (default: 800) */
  width?: number;
  /** Canvas height in pixels (default: 600) */
  height?: number;
}

/**
 * Simple className utility for merging classes
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * TrackMap - Canvas-based track visualization component
 */
export default function TrackMap({
  trackLayout,
  driverPositions,
  drivers = [],
  selectedDriver,
  activeSector,
  safetyCar,
  className,
  width = 800,
  height = 600,
}: TrackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPropsRef = useRef<string>('');

  // Build driver lookup map
  const driverLookup = useCallback(() => {
    const lookup: Record<number, { teamColour: string; nameAcronym: string }> = {};
    for (const d of drivers) {
      lookup[d.driver_number] = {
        teamColour: d.team_colour ? (d.team_colour.startsWith('#') ? d.team_colour : `#${d.team_colour}`) : '#ffffff',
        nameAcronym: d.name_acronym || String(d.driver_number),
      };
    }
    return lookup;
  }, [drivers]);

  // Serialize props for change detection
  const serializeProps = useCallback(() => {
    return JSON.stringify({
      trackLayout: `${trackLayout.circuit_name || 'unknown'}-${trackLayout.coordinates.length}`,
      driverPositions: driverPositions.map(d => `${d.driver_number}-${d.x}-${d.y}`),
      selectedDriver,
      activeSector,
      safetyCar: safetyCar ? `${safetyCar.status}-${safetyCar.x}-${safetyCar.y}` : null,
      width,
      height,
      driverCount: drivers.length
    });
  }, [trackLayout, driverPositions, selectedDriver, activeSector, safetyCar, width, height, drivers]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle zero dimensions
    if (width <= 0 || height <= 0) return;

    // Set canvas size with devicePixelRatio for sharp rendering
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (trackLayout.coordinates.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Track layout unavailable', width / 2, height / 2);
      return;
    }

    const trackBounds = getCircuitBounds(trackLayout.coordinates);
    const normalizedTrack = normalizeTrackCoordinates(
      trackLayout.coordinates,
      width,
      height,
      40,
      trackBounds
    );

    if (normalizedTrack.length > 0) {
      ctx.beginPath();
      ctx.moveTo(normalizedTrack[0].x, normalizedTrack[0].y);
      for (let i = 1; i < normalizedTrack.length; i++) {
        ctx.lineTo(normalizedTrack[i].x, normalizedTrack[i].y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      if (activeSector) {
        const sectorCoords = getSectorCoordinates(normalizedTrack, activeSector);
        if (sectorCoords.end > sectorCoords.start) {
          ctx.beginPath();
          ctx.moveTo(normalizedTrack[sectorCoords.start].x, normalizedTrack[sectorCoords.start].y);
          for (let i = sectorCoords.start + 1; i < sectorCoords.end; i++) {
            ctx.lineTo(normalizedTrack[i].x, normalizedTrack[i].y);
          }
          ctx.strokeStyle = '#E10600';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    }

    const lookup = driverLookup();

    // Draw driver positions
    if (driverPositions.length > 0) {
      const normalizedDrivers = normalizeTrackCoordinates(
        driverPositions.map(d => ({ x: d.x, y: d.y })),
        width,
        height,
        40,
        trackBounds
      );

      for (let i = 0; i < driverPositions.length; i++) {
        const dp = driverPositions[i];
        const pos = normalizedDrivers[i];
        const info = lookup[dp.driver_number] || { teamColour: '#ffffff', nameAcronym: String(dp.driver_number) };

        // Draw selected driver halo
        if (selectedDriver && dp.driver_number === selectedDriver) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = '#00F5FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw driver dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = info.teamColour;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw driver acronym label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 9px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(info.nameAcronym, pos.x, pos.y - 10);
        ctx.shadowBlur = 0;
      }
    }

    // Draw safety car
    if (safetyCar && (safetyCar.status === 'deployed' || safetyCar.status === 'returning') && safetyCar.x !== undefined && safetyCar.y !== undefined) {
      // Normalize safety car position using track bounds to avoid degenerate single-point case
      const normalizedSC = normalizeTrackCoordinates(
        [{ x: safetyCar.x, y: safetyCar.y }],
        width,
        height,
        40,
        trackBounds
      );

      if (normalizedSC.length > 0) {
        const scPos = normalizedSC[0];
        const scWidth = 16;
        const scHeight = 10;

        ctx.fillStyle = '#FFB300'; // Safety car orange
        ctx.fillRect(scPos.x - scWidth / 2, scPos.y - scHeight / 2, scWidth, scHeight);
      }
    }
  }, [trackLayout, driverPositions, selectedDriver, activeSector, safetyCar, width, height]);

  // Render on prop changes
  useEffect(() => {
    const serialized = serializeProps();
    if (previousPropsRef.current !== serialized) {
      previousPropsRef.current = serialized;
      render();
    }
  }, [serializeProps, render]);

  // Resize observer for container-based responsiveness
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [render]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ width: width || '100%', height: height || '100%' }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        aria-label={`Track map for ${trackLayout.circuit_name || 'F1 Circuit'}`}
      />
    </div>
  );
}