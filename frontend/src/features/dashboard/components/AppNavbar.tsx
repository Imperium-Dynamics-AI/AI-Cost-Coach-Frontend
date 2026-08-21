"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  GridGlyphIcon,
  MenuIcon,
  ProfileAvatarIcon,
  ScanHealthIcon,
} from "@/features/dashboard/components/icons";
import { ImperiumLogo } from "@/features/auth/components/ImperiumLogo";
import type { User } from "@/features/auth/types/auth";

type AppNavbarProps = {
  breadcrumb: [string, string];
  user: User | null;
  onMenuClick: () => void;
};

export function AppNavbar({ breadcrumb, user, onMenuClick }: AppNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [section, page] = breadcrumb;

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center bg-white">
      <div className="flex h-full items-center gap-2 px-4 md:w-60 md:shrink-0 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="cursor-pointer rounded-lg p-2 text-navy md:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
        <ImperiumLogo className="h-8 w-auto sm:h-9" />
      </div>

      <div className="flex h-full min-w-0 flex-1 items-center justify-between px-4 md:px-8">
        <div className="hidden items-center gap-2 text-base md:flex">
          <GridGlyphIcon className="text-brand" />
          <span className="text-[#9AA0B8]">{section}</span>
          <span className="text-[#9AA0B8]">/</span>
          <span className="font-semibold text-navy">{page}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-4 rounded-lg border border-[#F3D6FF40] bg-[#F7FAFF] px-4 py-1.5 text-sm font-semibold text-navy"
          >
            <ScanHealthIcon className="size-8 shrink-0 text-brand" />
            <span className="hidden sm:inline">Scan Health</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex cursor-pointer items-center gap-4 rounded-lg border border-[#F3D6FF40] bg-[#F7FAFF] px-4 py-1.5"
            >
              <ProfileAvatarIcon className="size-8 shrink-0" />
              <span className="hidden text-sm font-semibold text-navy sm:inline">
                {user?.role ?? "Admin"}
              </span>
              <ChevronDownIcon className="text-navy/50" />
            </button>
            {isMenuOpen ? (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#E4D7F7] bg-white p-3 text-sm shadow-lg">
                <p className="font-medium text-navy">
                  {user ? `${user.firstName} ${user.lastName}` : "Admin"}
                </p>
                <p className="mt-1 truncate text-navy/50">{user?.email}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
