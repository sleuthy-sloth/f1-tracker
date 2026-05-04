import type { ReactNode } from "react";

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values (undefined, null, false, empty string)
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Spinner - Simple inline CSS spinner for loading state
 */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "cyan" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: ReactNode;
}

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
type ButtonSize = NonNullable<ButtonProps["size"]>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-f1-red text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/30",
  secondary: "bg-white/[0.10] text-f1-white hover:bg-white/[0.15]",
  ghost: "bg-transparent text-f1-silver hover:text-f1-white hover:bg-white/[0.05]",
  outline:
    "bg-transparent border border-white/[0.20] text-f1-white hover:bg-white/[0.05] hover:border-white/[0.30]",
  cyan:
    "bg-accent text-white hover:bg-accent/90 shadow-[var(--glow-accent)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.2)]",
  accent:
    "bg-accent text-white hover:bg-accent/90 shadow-[var(--glow-accent)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.2)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

const spinnerSizeStyles: Record<ButtonSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

/**
 * Button - Reusable button component for the F1 dashboard
 *
 * @example
 * // Primary button with icon
 * <Button variant="primary" size="lg" icon={<Icon />}>Browse Sessions</Button>
 *
 * // Ghost button with loading state
 * <Button variant="ghost" loading>Loading...</Button>
 *
 * // Full width outline button
 * <Button variant="outline" fullWidth disabled>Submit</Button>
 *
 * // Secondary small button
 * <Button variant="secondary" size="sm">Cancel</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium font-sans transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-f1-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

  const stateStyles = isDisabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer active:scale-[0.98]";

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const spinnerColorClass =
    variant === "primary" || variant === "secondary" || variant === "cyan" || variant === "accent"
      ? "text-white"
      : "text-f1-red";

  const combinedClassName = cn(
    baseStyles,
    variantStyle,
    sizeStyle,
    stateStyles,
    fullWidth && "w-full",
    className
  );

  return (
    <button
      type={props.type ?? "button"}
      className={combinedClassName}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Spinner className={cn(spinnerSizeStyles[size], spinnerColorClass)} />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
