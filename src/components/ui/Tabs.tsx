"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({ tabs, defaultTab, onChange, className, variant = "default" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    onChange?.(tabId);
  }

  const variantStyles = {
    default: {
      container: "bg-surface-sunken rounded-xl p-1 flex gap-1",
      tab: "px-4 py-2 rounded-lg text-sm font-medium transition-all",
      active: "bg-surface-raised text-text shadow-sm",
      inactive: "text-text-muted hover:text-text",
    },
    pills: {
      container: "flex gap-2 flex-wrap",
      tab: "px-4 py-2 rounded-full text-sm font-medium transition-all",
      active: "bg-primary text-white",
      inactive: "bg-surface-sunken text-text-muted hover:text-text",
    },
    underline: {
      container: "flex gap-0 border-b border-border",
      tab: "px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
      active: "border-primary text-primary",
      inactive: "border-transparent text-text-muted hover:text-text",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            styles.tab,
            activeTab === tab.id ? styles.active : styles.inactive,
            "inline-flex items-center gap-1.5"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-xs font-bold rounded-full px-1.5 min-w-[20px] text-center",
              activeTab === tab.id
                ? variant === "pills" ? "bg-white/20" : "bg-primary/10 text-primary"
                : "bg-surface-raised text-text-muted"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function TabPanel({ tabs, defaultTab, onChange, children, className }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    onChange?.(tabId);
  }

  return (
    <div className={className}>
      <Tabs tabs={tabs} defaultTab={defaultTab} onChange={handleTabChange} />
      <div className="mt-4">{children(activeTab)}</div>
    </div>
  );
}
