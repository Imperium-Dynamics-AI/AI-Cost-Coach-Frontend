import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[28px] border border-[#8C52FB29] bg-[#FFFFFF80]",
        className,
      )}
    >
      {children}
    </section>
  );
}
