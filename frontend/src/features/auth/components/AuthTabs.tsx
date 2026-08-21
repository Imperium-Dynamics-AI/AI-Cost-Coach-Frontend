"use client";

import { cn } from "@/shared/utils/cn";
import type { AuthTab } from "@/features/auth/types/auth";

type AuthTabsProps = {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
};

const TABS: Array<{ id: AuthTab; label: string }> = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Sign Up" },
];

export function AuthTabs({ activeTab, onChange }: AuthTabsProps) {
  return (
    <div className="grid w-full grid-cols-2">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={
              isActive
                ? {
                    backgroundColor: "#F3EAF7",
                    borderWidth: "0 1px 1px 1px",
                    borderStyle: "solid",
                    borderColor: "#8C52FB21",
                  }
                : undefined
            }
            className={cn(
              "mx-auto h-[48px] w-[168px] cursor-pointer rounded-t-none rounded-b-[12px] font-sans text-[15px] font-medium transition",
              isActive
                ? "text-navy underline underline-offset-4"
                : "bg-transparent text-navy/40 hover:text-navy/70",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
