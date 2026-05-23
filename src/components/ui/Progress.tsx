import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "accent" | "streak";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colorStyles = {
  primary: "bg-primary",
  success: "bg-success",
  accent: "bg-accent",
  streak: "bg-streak",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = false,
  className,
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-text-muted">Progress</span>
          <span className="text-xs font-semibold text-text">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-sunken overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function XpBadge({ amount, className }: { amount: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 animate-xp-pop",
        className
      )}
    >
      ⚡ +{amount} XP
    </span>
  );
}

export function StreakBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700",
        className
      )}
    >
      🔥 {count} day{count !== 1 ? "s" : ""}
    </span>
  );
}
