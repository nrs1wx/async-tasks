export default function StatusMessage({ type, message, hint, actionLabel, onAction }) {
  return (
    <div className={`message message-${type}`} role={type === "error" ? "alert" : "status"}>
      {type === "loading" && <div className="spinner" aria-hidden="true" />}
      <p className="message-text">{message}</p>
      {hint && <p className="muted">{hint}</p>}
      {actionLabel && (
        <button type="button" className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
