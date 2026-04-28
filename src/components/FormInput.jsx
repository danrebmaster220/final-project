/**
 * FormInput — Reusable labeled input field.
 */

export default function FormInput({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  optional = false,
  autoComplete,
  maxLength,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
      />
    </div>
  );
}
