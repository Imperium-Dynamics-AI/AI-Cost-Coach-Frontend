"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppNavbar } from "@/features/dashboard/components/AppNavbar";
import { AppSidebar } from "@/features/dashboard/components/AppSidebar";
import { breadcrumbForPath } from "@/features/dashboard/data/dashboardDummyData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSidebar } from "@/features/dashboard/hooks/useSidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOpen, toggle, close } = useSidebar();

  async function onLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar
        breadcrumb={breadcrumbForPath(pathname)}
        user={user}
        onMenuClick={toggle}
      />

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={close}
          className="fixed inset-0 z-30 bg-navy/30 md:hidden"
        />
      ) : null}

      <AppSidebar
        pathname={pathname}
        isOpen={isOpen}
        onClose={close}
        onLogout={() => void onLogout()}
      />

      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat pt-16 md:pl-60"
        style={{ backgroundImage: "url('/images/app-bg.png')" }}
      >
        <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
