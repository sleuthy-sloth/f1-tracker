"use client";

export interface SeasonSelectorProps {
  years: number[];
  selectedYear: number;
  onYearChange?: (year: number) => void;
  hrefBase?: string;
  className?: string;
}

export function SeasonSelector({
  years,
  selectedYear,
  onYearChange,
  hrefBase,
  className = "",
}: SeasonSelectorProps) {
  return (
    <div className={`flex gap-1.5 flex-wrap ${className}`}>
      {years.map((year) => {
        const isSelected = year === selectedYear;

        if (hrefBase) {
          return (
            <a
              key={year}
              href={`${hrefBase}${year}`}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-accent text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  : "bg-white/[0.06] text-f1-silver hover:text-f1-white hover:bg-white/[0.1]"
              }`}
              aria-current={isSelected ? "page" : undefined}
            >
              {year}
            </a>
          );
        }

        return (
          <button
            key={year}
            onClick={() => onYearChange?.(year)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isSelected
                ? "bg-accent text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                : "bg-white/[0.06] text-f1-silver hover:text-f1-white hover:bg-white/[0.1]"
            }`}
            aria-current={isSelected ? "page" : undefined}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}