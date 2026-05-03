import type { ReactNode } from "react";

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values (undefined, null, false, empty string)
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  hoverable?: boolean;
  glow?: "cyan" | "red" | "yellow" | "green";
}

type CardVariant = NonNullable<CardProps["variant"]>;
type CardPadding = NonNullable<CardProps["padding"]>;

const variantStyles: Record<CardVariant, string> = {
  default: "bg-[#161a20] border border-white/[0.07]",
  glass: "bg-[#111418] border border-white/[0.07]",
  outlined: "bg-transparent border border-white/[0.1]",
  elevated: "bg-[#161a20] shadow-lg shadow-black/40",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const glowStyles: Record<string, string> = {
  cyan: "shadow-[var(--neon-glow-cyan)]",
  red: "shadow-[var(--neon-glow-red)]",
  yellow: "shadow-[var(--neon-glow-yellow)]",
  green: "shadow-[var(--neon-glow-green)]",
};

const glowHoverStyles: Record<string, string> = {
  cyan: "hover:shadow-[0_0_15px_rgba(0,210,190,0.6),0_0_30px_rgba(0,210,190,0.3)]",
  red: "hover:shadow-[0_0_15px_rgba(225,6,0,0.6),0_0_30px_rgba(225,6,0,0.3)]",
  yellow: "hover:shadow-[0_0_15px_rgba(255,251,0,0.6),0_0_30px_rgba(255,251,0,0.3)]",
  green: "hover:shadow-[0_0_15px_rgba(34,197,94,0.6),0_0_30px_rgba(34,197,94,0.3)]",
};

interface CardWrapperProps {
  className: string;
  children: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

function CardWrapper({
  className,
  children,
  onClick,
  hoverable,
}: CardWrapperProps) {
  if (onClick) {
    return (
      <button
        type="button"
        className={cn(className, "cursor-pointer text-left")}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cn(className, hoverable && "cursor-pointer")}>
      {children}
    </div>
  );
}

/**
 * Card - A reusable glassmorphic card component for the F1 dashboard
 *
 * @example
 * // Default card
 * <Card>Content</Card>
 *
 * // Glass card with hover
 * <Card variant="glass" hoverable>Content</Card>
 *
 * // Clickable card
 * <Card onClick={() => navigate("/detail")}>Content</Card>
 *
 * // Outlined, no padding
 * <Card variant="outlined" padding="none">Content</Card>
 */
export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  onClick,
  hoverable = false,
  glow,
}: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-200 overflow-hidden";
  const variantStyle = variantStyles[variant];
  const paddingStyle = paddingStyles[padding];
  const hoverStyle = hoverable
    ? "hover:bg-white/[0.04] hover:border-white/[0.12] hover:-translate-y-px"
    : "";

  const interactiveStyles = onClick
    ? "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface active:scale-[0.99]"
    : "";

  const glowStyle = glow ? glowStyles[glow] : "";
  const glowHoverStyle = glow ? glowHoverStyles[glow] : "";

  const combinedClassName = cn(
    baseStyles,
    variantStyle,
    paddingStyle,
    hoverStyle,
    interactiveStyles,
    glowStyle,
    glowHoverStyle,
    className
  );

  return (
    <CardWrapper
      className={combinedClassName}
      onClick={onClick}
      hoverable={hoverable}
    >
      {children}
    </CardWrapper>
  );
}

export type { CardProps };