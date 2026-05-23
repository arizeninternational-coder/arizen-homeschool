import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-primary text-white hover:bg-primary-dark active:scale-[0.98]",
  secondary: "bg-surface-sunken text-text hover:bg-border active:scale-[0.98]",
  accent: "bg-accent text-white hover:bg-amber-600 active:scale-[0.98]",
  ghost: "bg-transparent text-text-muted hover:bg-surface-sunken hover:text-text",
  danger: "bg-danger/10 text-danger hover:bg-danger/20 active:scale-[0.98]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
