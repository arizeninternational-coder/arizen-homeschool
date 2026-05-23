import { cn } from "@/lib/utils/cn";
import { Search, Inbox, BookOpen, Trophy, User, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: "search" | "inbox" | "book" | "trophy" | "user" | "alert" | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap = {
  search: Search,
  inbox: Inbox,
  book: BookOpen,
  trophy: Trophy,
  user: User,
  alert: AlertCircle,
};

export function EmptyState({ icon = "inbox", title, description, action, className }: EmptyStateProps) {
  const renderIcon = () => {
    if (typeof icon !== "string") return icon;
    const Icon = iconMap[icon];
    return <Icon className="w-10 h-10 text-text-muted" />;
  };

  return (
    <div className={cn("text-center py-12 px-6", className)}>
      <div className="flex justify-center mb-4 opacity-40">{renderIcon()}</div>
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(
        "bg-surface-sunken animate-pulse",
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-2xl border border-border p-4 space-y-3">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-2 w-full mt-2" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="bg-surface-raised rounded-2xl border border-border p-4 flex items-center gap-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
