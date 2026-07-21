import { HelpTooltip } from "../../../shared/components/HelpTooltip";
import { RESOURCE_OPTIONS } from "../config/calculatorConfig";

export function ResourceSelector({ selected, onToggle, showError }) {
  return (
    <fieldset className="resource-selector">
      <legend>What does your solution need?</legend>
      <p className="resource-selector__intro">
        Select everything you expect to run in Azure. You can change these choices at any time.
      </p>

      <div className="resource-selector__grid">
        {RESOURCE_OPTIONS.map((resource) => {
          const checked = selected[resource.key];

          return (
            <div
              key={resource.key}
              className={`resource-choice${checked ? " resource-choice--selected" : ""}`}
            >
              <label className="resource-choice__label">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(resource.key)}
                />
                <span className="resource-choice__mark" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="m3 8.5 3 3L13 4.75" />
                  </svg>
                </span>
                <span className="resource-choice__copy">
                  <strong>{resource.label}</strong>
                  <small>{resource.technicalName}</small>
                </span>
              </label>
              <HelpTooltip label={resource.label}>{resource.description}</HelpTooltip>
            </div>
          );
        })}
      </div>

      {showError ? (
        <p className="resource-selector__error" role="alert">
          Select at least one part of the solution before requesting an estimate.
        </p>
      ) : null}
    </fieldset>
  );
}
