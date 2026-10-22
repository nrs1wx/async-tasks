import Badge from "./Badge.jsx";
import { formatDate } from "../utils.js";

export default function ItemCard({ item, isSelected, busyKind, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={`card ${isSelected ? "card-selected" : ""}`}
        aria-pressed={isSelected}
        onClick={() => onSelect(item.id)}
      >
        <div className="card-top">
          <h3>{item.name}</h3>
          <Badge kind="status" value={item.status} />
        </div>
        <p className="card-description">{item.description}</p>
        <div className="card-bottom muted">
          <span>{item.assignee || "Unassigned"}</span>
          <span>Due {formatDate(item.dueDate)}</span>
          <Badge kind="priority" value={item.priority} />
        </div>
        {busyKind && <span className="card-busy">{busyKind}…</span>}
      </button>
    </li>
  );
}
