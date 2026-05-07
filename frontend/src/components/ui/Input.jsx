export default function Input({ label, id, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      ) : null}
      <input id={id} className="input" {...props} />
    </div>
  );
}
