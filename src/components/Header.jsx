import { API_CONFIG } from "../api/settings.js";

export default function Header({ total, isLoading, onReload, onCreate }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div>
          <h1>Task Board</h1>
          <p className="muted">
            {total !== null ? `${total} tasks · ` : ""}
            simulated API: {API_CONFIG.minDelay / 1000}–{API_CONFIG.maxDelay / 1000} s delay,{" "}
            {Math.round(API_CONFIG.errorChance * 100)}% random errors
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={onReload} disabled={isLoading}>
            {isLoading ? "Loading…" : "↻ Reload"}
          </button>
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            + New task
          </button>
        </div>
      </div>
    </header>
  );
}
