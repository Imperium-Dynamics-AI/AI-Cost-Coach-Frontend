"use client";

import { SidebarNavItem } from "@/features/dashboard/components/SidebarNavItem";
import { DASHBOARD_NAV } from "@/features/dashboard/data/dashboardDummyData";
import { cn } from "@/shared/utils/cn";

type AppSidebarProps = {
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function AppSidebar({
  pathname,
  isOpen,
  onClose,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-16 bottom-0 left-0 z-40 flex w-60 flex-col bg-white transition-transform duration-200 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <nav className="flex flex-1 flex-col gap-3 px-4 pt-6">
        {DASHBOARD_NAV.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={pathname.startsWith(item.href)}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full cursor-pointer rounded-xl border border-brand py-2.5 text-sm font-medium text-brand transition hover:bg-[#F6F1FF]"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
