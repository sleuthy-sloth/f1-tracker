/**
 * TrackMap Component
 * Canvas-based track visualization for F1 race replay
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { TrackLayout, DriverPosition, SafetyCarStatus } from '@/lib/types';
import { normalizeTrackCoordinates, getSectorCoordinates } from '@/lib/track-map';

/**
 * TrackMap component props
 */
interface TrackMapProps {
  /** Track layout data with circuit coordinates */
  trackLayout: TrackLayout;
  /** Array of driver positions for current frame */
  driverPositions: DriverPosition[];
  /** Optional: driver number to highlight */
  selectedDriver?: number;
  /** Optional: sector to highlight (1, 2, or 3) */
  activeSector?: 1 | 2 | 3;
  /** Optional: safety car status and position */
  safetyCar?: SafetyCarStatus;
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
 * 
 * Renders an F1 circuit track with driver positions, sector highlighting,
 * and safety car indicator on an HTML Canvas.
 */
export default function TrackMap({
  trackLayout,
  driverPositions,
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

  // Serialize props for change detection
  const serializeProps = useCallback(() => {
    return JSON.stringify({
      trackLayout: trackLayout.coordinates.length,
      driverPositions: driverPositions.map(d => `${d.driver_number}-${d.x}-${d.y}`),
      selectedDriver,
      activeSector,
      safetyCar: safetyCar ? `${safetyCar.status}-${safetyCar.x}-${safetyCar.y}` : null,
      width,
      height,
    });
  }, [trackLayout, driverPositions, selectedDriver, activeSector, safetyCar, width, height]);

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

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);

    // Check for empty track layout
    if (trackLayout.coordinates.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Track layout unavailable', width / 2, height / 2);
      return;
    }

    // Normalize track coordinates
    const normalizedTrack = normalizeTrackCoordinates(
      trackLayout.coordinates,
      width,
      height,
      40
    );

    // Draw the circuit path
    if (normalizedTrack.length > 0) {
      // Draw subtle base track
      ctx.beginPath();
      ctx.moveTo(normalizedTrack[0].x, normalizedTrack[0].y);
      for (let i = 1; i < normalizedTrack.length; i++) {
        ctx.lineTo(normalizedTrack[i].x, normalizedTrack[i].y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw active sector highlight
      if (activeSector) {
        const sectorCoords = getSectorCoordinates(normalizedTrack, activeSector);
        if (sectorCoords.end > sectorCoords.start) {
          ctx.beginPath();
          ctx.moveTo(
            normalizedTrack[sectorCoords.start].x,
            normalizedTrack[sectorCoords.start].y
          );
          for (let i = sectorCoords.start + 1; i < sectorCoords.end; i++) {
            ctx.lineTo(normalizedTrack[i].x, normalizedTrack[i].y);
          }
          ctx.strokeStyle = '#E10600'; // F1 Red
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    // Draw start/finish line
    if (normalizedTrack.length >= 2) {
      const startPoint = normalizedTrack[0];
      const secondPoint = normalizedTrack[1];

      // Calculate perpendicular direction
      const dx = secondPoint.x - startPoint.x;
      const dy = secondPoint.y - startPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // Perpendicular vector (rotated 90 degrees)
        const perpX = -dy / length;
        const perpY = dx / length;
        const lineLength = 8;

        ctx.beginPath();
        ctx.moveTo(
          startPoint.x + perpX * lineLength,
          startPoint.y + perpY * lineLength
        );
        ctx.lineTo(
          startPoint.x - perpX * lineLength,
          startPoint.y - perpY * lineLength
        );
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw driver positions
    if (driverPositions.length > 0) {
      // Normalize driver positions using same transformation
      const normalizedDrivers = normalizeTrackCoordinates(
        driverPositions.map(d => ({ x: d.x, y: d.y })),
        width,
        height,
        40
      );

      for (let i = 0; i < driverPositions.length; i++) {
        const driver = driverPositions[i];
        const pos = normalizedDrivers[i];

        // Draw driver dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw selected driver halo
        if (selectedDriver && driver.driver_number === selectedDriver) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw driver number label
        ctx.fillStyle = 'white';
        ctx.font = '8px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(driver.driver_number.toString(), pos.x, pos.y - 8);
      }
    }

    // Draw safety car
    if (safetyCar && (safetyCar.status === 'deployed' || safetyCar.status === 'returning') && safetyCar.x !== undefined && safetyCar.y !== undefined) {
      // Normalize safety car position
      const normalizedSC = normalizeTrackCoordinates(
        [{ x: safetyCar.x, y: safetyCar.y }],
        width,
        height,
        40
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