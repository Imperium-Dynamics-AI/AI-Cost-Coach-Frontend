"use client";

import { useEffect, useRef, useState } from "react";
import type { ResourceFilterOption } from "@/features/resources/types/resources";
import { ChevronDownSmallIcon, SearchIcon } from "@/features/resources/components/ResourceIcons";
import { cn } from "@/shared/utils/cn";

type ResourcesToolbarProps = {
  search: string;
  resourceGroup: string;
  resourceType: string;
  resourceGroups: ResourceFilterOption[];
  resourceTypes: ResourceFilterOption[];
  onSearchChange: (value: string) => void;
  onResourceGroupChange: (value: string) => void;
  onResourceTypeChange: (value: string) => void;
};

export function ResourcesToolbar({
  search,
  resourceGroup,
  resourceType,
  resourceGroups,
  resourceTypes,
  onSearchChange,
  onResourceGroupChange,
  onResourceTypeChange,
}: ResourcesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="relative flex-1">
        <span className="pointer-events-none absolute top-1/2 left-0 flex h-11 -translate-y-1/2 items-center border-r border-[#8C52FB80] px-4">
          <SearchIcon className="text-brand" />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-[#E4D7F7] bg-white py-3 pr-4 pl-16 text-sm text-navy outline-none transition focus:border-brand"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <FilterDropdown
          value={resourceGroup}
          options={resourceGroups}
          onChange={onResourceGroupChange}
        />
        <FilterDropdown
          value={resourceType}
          options={resourceTypes}
          onChange={onResourceTypeChange}
        />
      </div>
    </div>
  );
}

type FilterDropdownProps = {
  value: string;
  options: ResourceFilterOption[];
  onChange: (value: string) => void;
};

function FilterDropdown({ value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-[180px]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition",
          isOpen
            ? "border-[#8C52FB] bg-[#8C52FB] text-white"
            : "border-[#E4D7F7] bg-white text-brand hover:bg-[#FAF7FF]",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownSmallIcon
          className={cn("shrink-0 transition", isOpen && "rotate-180")}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#E4D7F7] bg-white p-1.5 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm transition",
                value === option.value
                  ? "bg-[#F6F1FF] font-semibold text-brand"
                  : "text-navy hover:bg-[#FAF7FF]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
