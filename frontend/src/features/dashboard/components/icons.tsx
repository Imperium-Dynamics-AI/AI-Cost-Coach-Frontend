import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="7" height="7" rx="1.4" />
      <rect x="14" y="3" width="7" height="7" rx="1.4" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" />
      <rect x="14" y="14" width="7" height="7" rx="1.4" />
    </svg>
  );
}

export function ResourcesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="6.5" cy="7" r="2.2" />
      <circle cx="17.5" cy="7" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <path d="M8.3 8.4 10.4 15.2M15.7 8.4 13.6 15.2M8.7 7h6.6" />
    </svg>
  );
}

export function OpportunitiesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="8.5" r="2.4" />
      <path d="M4 19c.4-3.2 2.8-5 5-5s4.6 1.8 5 5" />
      <path d="M13.2 14.2c1.4-.7 3.3-.6 4.8 1.1.6.7 1 1.7 1.2 2.7" />
    </svg>
  );
}

export function PlannerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </svg>
  );
}

export function AiCoachIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 13.6 8.4 18.5 10 13.6 11.6 12 16.5 10.4 11.6 5.5 10 10.4 8.4z" />
      <path d="M18 15.5 18.7 17.3 20.5 18 18.7 18.7 18 20.5 17.3 18.7 15.5 18 17.3 17.3z" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.2v1.8M12 18v1.8M4.2 12h1.8M18 12h1.8M6.4 6.4l1.3 1.3M16.3 16.3l1.3 1.3M17.6 6.4l-1.3 1.3M7.7 16.3l-1.3 1.3" />
    </svg>
  );
}

export function HeartScanIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 19s-6.5-4.1-8.2-8.1C2.6 8.2 4.1 5.5 7 5.5c1.7 0 3.1.9 4 2.2.9-1.3 2.3-2.2 4-2.2 2.9 0 4.4 2.7 3.2 5.4C18.5 14.9 12 19 12 19z" />
    </svg>
  );
}

export function UserGlyphIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.7 })}>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5 19c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
    </svg>
  );
}

export function ScanHealthIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4.5 8V5.75C4.5 4.99 5.12 4.38 5.88 4.38H8.13"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M11.87 4.38h2.25c.76 0 1.38.61 1.38 1.37V8"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M15.5 12v2.25c0 .76-.62 1.37-1.38 1.37H12.87"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M8.13 15.62H5.88c-.76 0-1.38-.61-1.38-1.37V12"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="10" cy="8.75" r="1.85" fill="currentColor" />
      <path
        d="M7.1 13.85c.55-1.95 1.6-2.85 2.9-2.85s2.35.9 2.9 2.85H7.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProfileAvatarIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="10" fill="#F3EAF7" />
      <circle cx="10" cy="7.5" r="2.75" fill="#8C52FB" />
      <path
        d="M5.5 16.25c.75-2.55 2.35-3.75 4.5-3.75s3.75 1.2 4.5 3.75H5.5z"
        fill="#8C52FB"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 16, height: 16, viewBox: "0 0 24 24" })}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function GridGlyphIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 18, height: 18 })}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export const NAV_ICONS = {
  dashboard: DashboardIcon,
  resources: ResourcesIcon,
  opportunities: OpportunitiesIcon,
  planner: PlannerIcon,
  "ai-coach": AiCoachIcon,
  settings: SettingsIcon,
} as const;
