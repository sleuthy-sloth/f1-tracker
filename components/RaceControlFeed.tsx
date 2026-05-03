'use client';

import type { ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * RaceControlFeedProps
 */
interface RaceControlFeedProps {
  currentFrame: ReplayFrame | null;
  maxMessages?: number;
  className?: string;
}

/**
 * Get color for flag based on flag type and category
 */
function getFlagColor(flag: string | null, category: string): string {
  const f = (flag || '').toUpperCase();
  const c = (category || '').toUpperCase();
  if (f.includes('YELLOW') || f === 'YELLOW') return '#EAB308';
  if (f.includes('RED') || f === 'RED') return '#DC2626';
  if (f.includes('GREEN') || f === 'GREEN') return '#22C55E';
  if (f.includes('BLUE') || f === 'BLUE') return '#3B82F6';
  if (f === 'SCD' || c.includes('SAFETY CAR')) return '#F97316';
  if (f === 'SCR') return '#EAB308';
  if (c.includes('SESSION')) return '#9B9B9B';
  return '#6B7280';
}

/**
 * Format timestamp for display
 */
function formatTimestamp(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--:--';
  }
}

/**
 * RaceControlFeed - Glassmorphic side panel showing race control messages
 */
export default function RaceControlFeed({
  currentFrame,
  maxMessages = 50,
  className,
}: RaceControlFeedProps) {
  // Empty state: no race data
  if (!currentFrame) {
    return (
      <div
        className={cn(
          'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h2 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          RACE CONTROL
        </h2>
        <div className="flex items-center justify-center h-24 text-f1-silver text-sm">
          No race data
        </div>
      </div>
    );
  }

  // Empty state: no messages
  const messages = currentFrame.race_control_messages;
  if (!messages || messages.length === 0) {
    return (
      <div
        className={cn(
          'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h2 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          RACE CONTROL
        </h2>
        <div className="flex items-center justify-center h-24 text-f1-silver text-sm">
          No race control messages
        </div>
      </div>
    );
  }

  // Sort messages newest first and limit to maxMessages
  const sortedMessages = [...messages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxMessages);

  return (
    <div
      className={cn(
        'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
        className
      )}
    >
      <h2 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
        RACE CONTROL
      </h2>
      <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {sortedMessages.map((message, index) => {
          const flagColor = getFlagColor(message.flag, message.category);
          return (
            <div
              key={`${message.date}-${index}`}
              className="py-2 border-b border-white/[0.05] last:border-b-0"
            >
              <div className="flex items-start gap-2">
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: flagColor }}
                />
                <div className="flex-1 min-w-0">
                  {/* Message text */}
                  <p className="text-xs text-f1-white font-medium leading-snug">
                    {message.message}
                  </p>
                  {/* Meta info */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Category badge */}
                    <span className="text-[8px] uppercase text-f1-silver bg-white/[0.05] px-1.5 py-0.5 rounded">
                      {message.category}
                    </span>
                    {/* Lap number badge */}
                    {message.lap_number && (
                      <span className="text-[10px] text-f1-silver">
                        Lap {message.lap_number}
                      </span>
                    )}
                    {/* Timestamp */}
                    <span className="text-[10px] text-f1-silver">
                      {formatTimestamp(message.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 6, 0, 0.8);
        }
      `}</style>
    </div>
  );
}