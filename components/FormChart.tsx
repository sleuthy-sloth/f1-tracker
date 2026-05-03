'use client';

interface FormResult {
  position: number | null;
  isDnf?: boolean;
  isDns?: boolean;
  isDsq?: boolean;
  raceName?: string;
}

interface FormChartProps {
  results: FormResult[];
  maxResults?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get color scheme based on finishing position
 */
function getFormColor(result: FormResult): { bg: string; text: string; label: string } {
  if (result.isDsq) return { bg: 'bg-black', text: 'text-white', label: 'DSQ' };
  if (result.isDns) return { bg: 'bg-gray-600', text: 'text-white', label: 'DNS' };
  if (result.isDnf || result.position === null) return { bg: 'bg-red-700', text: 'text-white', label: 'DNF' };
  if (result.position === 1) return { bg: 'bg-[#FFD700]', text: 'text-black', label: '1' };
  if (result.position <= 3) return { bg: 'bg-[#C0C0C0]', text: 'text-black', label: String(result.position) };
  if (result.position <= 5) return { bg: 'bg-green-600', text: 'text-white', label: String(result.position) };
  if (result.position <= 10) return { bg: 'bg-yellow-500', text: 'text-black', label: String(result.position) };
  return { bg: 'bg-orange-600', text: 'text-white', label: String(result.position) };
}

/**
 * Single form block component
 */
function FormBlock({
  result,
  size,
}: {
  result: FormResult | null;
  size: 'sm' | 'md';
}) {
  const isEmpty = result === null;
  const colors = result ? getFormColor(result) : { bg: 'bg-white/10', text: 'text-white/30', label: '' };

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 text-[9px]'
    : 'w-6 h-6 text-[10px]';

  if (isEmpty) {
    return (
      <div
        className={cn(
          'rounded-md flex items-center justify-center border border-white/10',
          sizeClasses
        )}
        title="No result"
      >
        <span className="text-white/20">-</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md flex items-center justify-center font-bold cursor-default',
        colors.bg,
        colors.text,
        sizeClasses
      )}
      title={result.raceName || colors.label}
    >
      {colors.label}
    </div>
  );
}

/**
 * FormChart - Displays last 5 race finishing positions as colored bars/blocks
 */
export default function FormChart({
  results,
  maxResults = 5,
  size = 'md',
  className,
}: FormChartProps) {
  // Handle empty results
  if (!results || results.length === 0) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-[10px] uppercase tracking-wider text-f1-silver">FORM</span>
        <span className="text-xs text-white/40">No recent results</span>
      </div>
    );
  }

  // Pad results to maxResults
  const paddedResults: (FormResult | null)[] = [...results];
  while (paddedResults.length < maxResults) {
    paddedResults.push(null);
  }

  // Take only the first maxResults
  const displayResults = paddedResults.slice(0, maxResults);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-[10px] uppercase tracking-wider text-f1-silver">FORM</span>
      <div className="flex items-center gap-1">
        {displayResults.map((result, index) => (
          <div key={index} className="flex items-center">
            <FormBlock result={result} size={size} />
            {index < displayResults.length - 1 && (
              <div className="w-1 h-1 rounded-full bg-white/20 mx-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}