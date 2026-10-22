export default function Notice({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className={`notice notice-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
      <span>{notice.text}</span>
      <button type="button" className="notice-close" onClick={onClose} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
