export function NumberInput({
  id,
  name,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  prefix,
}) {
  return (
    <div className="number-input">
      {prefix ? <span className="number-input__adornment">{prefix}</span> : null}
      <input
        id={id}
        name={name}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        onChange={(event) =>
          onChange(event.target.value === "" ? 0 : Number(event.target.value))
        }
      />
      {unit ? <span className="number-input__adornment">{unit}</span> : null}
    </div>
  );
}
