import type { ComponentType, ImgHTMLAttributes, SVGProps } from "react";
import type { ResourceIconType } from "@/features/resources/types/resources";
import { cn } from "@/shared/utils/cn";

type IconProps = SVGProps<SVGSVGElement>;
type ImageIconProps = ImgHTMLAttributes<HTMLImageElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronDownSmallIcon(props: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function FolderResourceIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 7.5C3 6.12 4.12 5 5.5 5H9.2L11 7H18.5C19.88 7 21 8.12 21 9.5V17.5C21 18.88 19.88 20 18.5 20H5.5C4.12 20 3 18.88 3 17.5V7.5Z"
        fill="#F4B740"
      />
    </svg>
  );
}

export function OpenAiResourceIcon({ className, ...props }: ImageIconProps) {
  return (
    <img
      src="/images/openai-icon.svg"
      alt=""
      width={22}
      height={22}
      className={cn("shrink-0 rounded-[5px]", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SparkleResourceIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5l1.4 4.1L17.5 9l-4.1 1.4L12 14.5 10.6 10.4 6.5 9l4.1-1.4L12 3.5Z"
        fill="#4F8CFF"
      />
      <path
        d="M18.5 14.5l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8.8-2.3Z"
        fill="#4F8CFF"
      />
    </svg>
  );
}

export function SearchResourceIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" stroke="#8C52FB" strokeWidth="1.8" />
      <path d="M16.5 16.5L20 20" stroke="#8C52FB" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<ResourceIconType, ComponentType<{ className?: string }>> = {
  folder: FolderResourceIcon,
  openai: OpenAiResourceIcon,
  sparkle: SparkleResourceIcon,
  search: SearchResourceIcon,
};

export function ResourceTypeIcon({ type }: { type: ResourceIconType }) {
  const Icon = ICONS[type];
  return <Icon className="shrink-0" />;
}
