import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/features/resources/components/ResourceIcons";
import { getVisiblePaginationItems } from "@/features/resources/utils/pagination";

type ResourcesPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ResourcesPagination({
  page,
  totalPages,
  onPageChange,
}: ResourcesPaginationProps) {
  const items = getVisiblePaginationItems(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <PaginationNavButton
        label="Back"
        icon={<ChevronLeftIcon className="size-4" />}
        iconPosition="left"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />

      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm font-semibold text-navy"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "min-w-10 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition",
                page === item
                  ? "bg-[#8C52FB] text-white"
                  : "border border-[#E4D7F7] bg-white text-navy hover:bg-[#FAF7FF]",
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <PaginationNavButton
        label="Next"
        icon={<ChevronRightIcon className="size-4" />}
        iconPosition="right"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}

type PaginationNavButtonProps = {
  label: string;
  icon: ReactNode;
  iconPosition: "left" | "right";
  disabled: boolean;
  onClick: () => void;
};

function PaginationNavButton({
  label,
  icon,
  iconPosition,
  disabled,
  onClick,
}: PaginationNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E4D7F7] bg-white px-3 py-2 text-sm font-medium text-navy transition hover:bg-[#FAF7FF] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {iconPosition === "left" ? icon : null}
      <span>{label}</span>
      {iconPosition === "right" ? icon : null}
    </button>
  );
}
