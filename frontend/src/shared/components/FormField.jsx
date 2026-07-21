import { HelpTooltip } from "./HelpTooltip";

export function FormField({ id, label, help, stacked = false, children }) {
  return (
    <div className={`form-field${stacked ? " form-field--stacked" : ""}`}>
      <div className="form-field__label-wrap">
        <label className="form-field__label" htmlFor={id}>
          {label}
        </label>
        {help ? <HelpTooltip label={label}>{help}</HelpTooltip> : null}
      </div>
      <div className="form-field__control">{children}</div>
    </div>
  );
}
