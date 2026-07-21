import { useId } from "react";

export function Accordion({ title, description, open, onToggle, children }) {
  const panelId = useId();

  return (
    <section className={`accordion${open ? " accordion--open" : ""}`}>
      <h2 className="accordion__heading">
        <button
          type="button"
          className="accordion__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>
            <span className="accordion__title">{title}</span>
            <span className="accordion__description">{description}</span>
          </span>
          <svg className="accordion__chevron" viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </h2>
      {open ? (
        <div id={panelId} className="accordion__panel">
          {children}
        </div>
      ) : null}
    </section>
  );
}
