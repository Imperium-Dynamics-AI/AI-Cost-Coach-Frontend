"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { NAV_ICONS } from "@/features/dashboard/components/icons";
import type { NavItem } from "@/features/dashboard/types/dashboard";

type SidebarNavItemProps = {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  item,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  const Icon = NAV_ICONS[item.id];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition",
        isActive
          ? "bg-brand text-white shadow-[0_8px_18px_rgba(140,82,251,0.28)]"
          : "text-[#7A7F9A] hover:bg-[#F6F1FF] hover:text-navy",
      )}
    >
      <Icon className={isActive ? "text-white" : "text-brand"} />
      {item.label}
    </Link>
  );
}
