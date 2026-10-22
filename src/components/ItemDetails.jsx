import Badge from "./Badge.jsx";
import StatusMessage from "./StatusMessage.jsx";
import { formatDate, formatDateTime } from "../utils.js";

export default function ItemDetails({
  details,
  status,
  error,
  busyKind,
  onRetry,
  onComplete,
  onEdit,
  onDelete,
}) {
  if (status === "loading") {
    return <StatusMessage type="loading" message="Loading details…" />;
  }

  if (status === "error") {
    return <StatusMessage type="error" message={error} actionLabel="Try again" onAction={onRetry} />;
  }

  if (status !== "success" || !details) return null;

  const isDone = details.status === "done";
  const isBusy = Boolean(busyKind);

  let completeLabel = "Mark as complete";
  if (busyKind === "completing") completeLabel = "Completing…";
  else if (isDone) completeLabel = "Completed ✓";

  return (
    <article className="details">
      <div className="details-head">
        <h2>{details.name}</h2>
        <div className="badges">
          <Badge kind="status" value={details.status} />
          <Badge kind="priority" value={details.priority} />
        </div>
      </div>

      <p className="details-description">{details.description || "No description."}</p>

      <dl className="fields">
        <div>
          <dt>Assignee</dt>
          <dd>{details.assignee || "—"}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{details.category}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>{formatDate(details.dueDate)}</dd>
        </div>
        <div>
          <dt>Estimate</dt>
          <dd>{details.estimateHours} h</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(details.createdAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(details.updatedAt)}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{formatDateTime(details.completedAt)}</dd>
        </div>
      </dl>

      <div className="notes">
        <h3>Notes</h3>
        <p>{details.notes || "No notes."}</p>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onComplete}
          disabled={isDone || isBusy}
        >
          {completeLabel}
        </button>
        <button type="button" className="btn" onClick={onEdit} disabled={isBusy}>
          Edit
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isBusy}>
          {busyKind === "deleting" ? "Deleting…" : "Delete"}
        </button>
      </div>
      {isBusy && (
        <p className="muted" role="status">
          Waiting for the server… other actions for this task are disabled.
        </p>
      )}
    </article>
  );
}
