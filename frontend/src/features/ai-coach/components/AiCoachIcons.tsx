import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SendIcon(props: IconProps) {
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
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export function AiCoachAvatarIcon(props: IconProps) {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="18" r="18" fill="#ECE4FF" />
      <rect x="10" y="12" width="16" height="12" rx="4" fill="#8C52FB" />
      <circle cx="14" cy="17" r="1.5" fill="white" />
      <circle cx="22" cy="17" r="1.5" fill="white" />
      <path d="M14 21h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 8v3" stroke="#8C52FB" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="7" r="1.5" fill="#8C52FB" />
    </svg>
  );
}

export function UserChatAvatarIcon(props: IconProps) {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="18" r="18" fill="#F3EAF7" />
      <circle cx="18" cy="14" r="4" fill="#8C52FB" />
      <path
        d="M10 27c1.1-3.4 3.6-5 8-5s6.9 1.6 8 5"
        fill="#8C52FB"
      />
    </svg>
  );
}
