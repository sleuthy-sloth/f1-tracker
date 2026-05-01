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
}

type CardVariant = NonNullable<CardProps["variant"]>;
type CardPadding = NonNullable<CardProps["padding"]>;

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface border border-white/[0.05]",
  glass: "bg-white/[0.05] backdrop-blur-xl border border-white/[0.1]",
  outlined: "bg-transparent border border-white/[0.1]",
  elevated: "bg-surface shadow-lg shadow-black/20",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
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
}: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-200 overflow-hidden";
  const variantStyle = variantStyles[variant];
  const paddingStyle = paddingStyles[padding];
  const hoverStyle = hoverable
    ? "hover:bg-white/[0.03] hover:border-white/[0.08]"
    : "";

  const interactiveStyles = onClick
    ? "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface active:scale-[0.99]"
    : "";

  const combinedClassName = cn(
    baseStyles,
    variantStyle,
    paddingStyle,
    hoverStyle,
    interactiveStyles,
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