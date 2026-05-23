import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "purple" | "xp" | "streak";
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-surface-sunken text-text-muted",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  purple: "bg-badge/10 text-badge",
  xp: "bg-amber-100 text-amber-700",
  streak: "bg-orange-100 text-orange-700",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({
  variant = "default",
  children,
  className,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
