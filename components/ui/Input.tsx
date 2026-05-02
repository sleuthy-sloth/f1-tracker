import { useId } from "react";

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values (undefined, null, false, empty string)
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  containerClassName?: string;
  size?: "sm" | "md" | "lg";
}

type InputSize = NonNullable<InputProps["size"]>;

const sizeStyles: Record<InputSize, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  md: "px-3 py-2.5 text-sm rounded-lg",
  lg: "px-4 py-3 text-base rounded-xl",
};

const iconOffsetStyles: Record<"left" | "right", string> = {
  left: "pl-9",
  right: "pr-9",
};

/**
 * Input - Reusable input component for the F1 dashboard
 *
 * @example
 * // Basic
 * <Input placeholder="Search sessions..." />
 *
 * // With label and icon
 * <Input
 *   label="Email"
 *   type="email"
 *   icon={<MailIcon />}
 *   placeholder="your@email.com"
 * />
 *
 * // With error
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 *
 * // Small
 * <Input size="sm" placeholder="Small input" />
 *
 * // Full width with icon
 * <Input fullWidth icon={<SearchIcon />} placeholder="Search..." />
 */
export function Input({
  label,
  helperText,
  error,
  icon,
  iconPosition = "left",
  fullWidth = false,
  containerClassName,
  size = "md",
  className,
  id,
  disabled,
  placeholder,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperTextId = `${inputId}-helper`;
  const hasError = Boolean(error);

  const baseInputStyles =
    "w-full bg-surface-dim border border-white/[0.10] text-on-surface font-sans transition-all duration-200 placeholder:text-f1-silver/50 focus:outline-none";

  const focusStyles = hasError
    ? "focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
    : "focus:border-f1-red/50 focus:ring-2 focus:ring-f1-red/20";

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed bg-white/[0.02]"
    : "";

  const errorStyles = hasError
    ? "border-red-500/50"
    : "";

  const sizeStyle = sizeStyles[size];
  const iconOffset = icon ? iconOffsetStyles[iconPosition] : "";

  const inputClassName = cn(
    baseInputStyles,
    sizeStyle,
    focusStyles,
    disabledStyles,
    errorStyles,
    iconOffset,
    className
  );

  const labelClassName = cn(
    "block text-sm font-medium text-on-surface mb-1.5",
    disabled && "opacity-50"
  );

  const helperTextClassName = cn(
    "mt-1.5 text-xs",
    hasError ? "text-red-400" : "text-f1-silver"
  );

  const iconWrapperClassName = cn(
    "absolute top-1/2 -translate-y-1/2 text-f1-silver",
    iconPosition === "left" ? "left-3" : "right-3",
    disabled && "opacity-50"
  );

  return (
    <div className={cn(fullWidth && "w-full", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className={iconWrapperClassName} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={inputClassName}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError || helperText ? helperTextId : undefined}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p id={helperTextId} className={helperTextClassName}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}