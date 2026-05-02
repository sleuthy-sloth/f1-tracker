import type { ReactNode } from "react";

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values (undefined, null, false, empty string)
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface ChipProps {
  label: string;
  variant?: "tyre" | "status" | "default";
  color?: "soft" | "medium" | "hard" | "intermediate" | "wet" | "red" | "green" | "yellow" | "blue" | "gray" | "white";
  size?: "sm" | "md";
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

type ChipSize = NonNullable<ChipProps["size"]>;

// Tyre colors (FIA compound colors)
const tyreColorStyles: Record<"soft" | "medium" | "hard" | "intermediate" | "wet", string> = {
  soft: "bg-[#e10600] text-white",
  medium: "bg-[#ffd700] text-black",
  hard: "bg-[#e5e2e1] text-black",
  intermediate: "bg-[#00d2be] text-black",
  wet: "bg-[#3671C6] text-white",
};

// Status colors (semantic)
const statusColorStyles: Record<"red" | "green" | "yellow" | "blue" | "gray" | "white", string> = {
  red: "bg-red-900/60 text-red-300",
  green: "bg-green-900/60 text-green-300",
  yellow: "bg-yellow-900/60 text-yellow-300",
  blue: "bg-blue-900/60 text-blue-300",
  gray: "bg-white/10 text-f1-silver",
  white: "bg-white/15 text-f1-white",
};

const sizeStyles: Record<ChipSize, string> = {
  sm: "px-2 py-0.5 text-[10px] leading-4",
  md: "px-2.5 py-1 text-xs leading-4",
};

// Helper type guard for tyre colors
function isTyreColor(color: string): color is "soft" | "medium" | "hard" | "intermediate" | "wet" {
  return color in tyreColorStyles;
}

// Helper type guard for status colors
function isStatusColor(color: string): color is "red" | "green" | "yellow" | "blue" | "gray" | "white" {
  return color in statusColorStyles;
}

/**
 * Chip - A reusable pill-shaped badge component for tyre compounds and status indicators
 *
 * @example
 * // Tyre compound (using tyre variant)
 * <Chip variant="tyre" color="soft" label="SOFT" />
 * <Chip variant="tyre" color="medium" label="MEDIUM" />
 * <Chip variant="tyre" color="wet" label="WET" />
 *
 * // Status (using status variant)
 * <Chip variant="status" color="red" label="DNF" />
 * <Chip variant="status" color="green" label="PIT" />
 * <Chip variant="status" color="yellow" label="PENALTY" />
 *
 * // Dismissible
 * <Chip variant="status" color="blue" label="NEW" dismissible onDismiss={() => {}} />
 *
 * // With icon
 * <Chip variant="default" label="Info" icon={<Icon />} />
 *
 * // Default
 * <Chip variant="default" label="Default" />
 */
export function Chip({
  label,
  variant = "default",
  color,
  size = "md",
  icon,
  dismissible = false,
  onDismiss,
  className,
}: ChipProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150";

  let variantStyle = "";

  if (variant === "tyre" && color && isTyreColor(color)) {
    variantStyle = tyreColorStyles[color];
  } else if (variant === "status" && color) {
    if (isTyreColor(color)) {
      variantStyle = tyreColorStyles[color];
    } else if (isStatusColor(color)) {
      variantStyle = statusColorStyles[color];
    }
  } else if (variant === "default" || !variant) {
    variantStyle = "bg-white/10 text-f1-silver";
  }

  if (!variantStyle) {
    variantStyle = "bg-white/10 text-f1-silver";
  }

  const sizeStyle = sizeStyles[size];

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDismiss?.();
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyle,
        sizeStyle,
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            "ml-1 rounded-full p-0.5",
            "focus:outline-none focus:ring-1 focus:ring-primary/50",
            "hover:bg-white/20",
            "transition-colors duration-150"
          )}
          aria-label={`Dismiss ${label}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

