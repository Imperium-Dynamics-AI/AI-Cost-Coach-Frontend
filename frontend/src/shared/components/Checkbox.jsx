export function Checkbox({ id, name, label, checked, onChange }) {
  return (
    <label className={`checkbox${checked ? " checkbox--checked" : ""}`} htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox__mark" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="m3 8.5 3 3L13 4.75" />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
}
