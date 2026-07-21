import { useId } from "react";

export function HelpTooltip({ label, children }) {
  const tooltipId = useId();

  return (
    <span className="help-tooltip">
      <button
        type="button"
        className="help-tooltip__trigger"
        aria-label={`Help for ${label}`}
        aria-describedby={tooltipId}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" />
          <path d="M8.8 7.25a1.7 1.7 0 0 1 3.23.77c0 1.5-2.03 1.62-2.03 3.04" />
          <path d="M10 13.9h.01" />
        </svg>
      </button>
      <span id={tooltipId} role="tooltip" className="help-tooltip__content">
        {children}
      </span>
    </span>
  );
}
