import Image from "next/image";
import { cn } from "@/shared/utils/cn";

type ImperiumLogoProps = {
  className?: string;
};

export function ImperiumLogo({ className }: ImperiumLogoProps) {
  return (
    <Image
      src="/images/imperium-logo.png"
      alt="Imperium Dynamics"
      width={220}
      height={48}
      priority
      className={cn("h-10 w-auto", className)}
    />
  );
}
