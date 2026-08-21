"use client";

import { cn } from "@/shared/utils/cn";

type AuthInputProps = {
  id: string;
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthInput({
  id,
  label,
  hint,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
}: AuthInputProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block font-sans text-[13px] font-medium">
        <span className="text-purple">{label}</span>
        {hint ? (
          <span className="ml-1 font-normal text-navy/45">{hint}</span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          "h-11 w-full rounded-[6px] border bg-white px-5 font-sans text-sm text-navy outline-none transition placeholder:text-navy/35",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-brand/25 focus:border-purple",
          disabled && "cursor-not-allowed opacity-70",
        )}
      />
      {error ? <p className="mt-1.5 font-sans text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
