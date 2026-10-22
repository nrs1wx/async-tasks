import ItemCard from "./ItemCard.jsx";
import Pagination from "./Pagination.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function ItemList({
  items,
  status,
  error,
  selectedId,
  busy,
  page,
  totalPages,
  hasFilters,
  onSelect,
  onRetry,
  onPageChange,
  onResetFilters,
}) {
  if (status === "loading" && items.length === 0) {
    return <StatusMessage type="loading" message="Loading tasks…" hint="The server can answer in up to 3 seconds." />;
  }

  if (status === "error") {
    return (
      <StatusMessage
        type="error"
        message={error}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <StatusMessage
        type="empty"
        message={hasFilters ? "No tasks match your search or filter." : "There are no tasks yet."}
        hint={hasFilters ? undefined : 'Press "+ New task" to add the first one.'}
        actionLabel={hasFilters ? "Reset search and filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  const isRefreshing = status === "loading";

  return (
    <div className={isRefreshing ? "list-wrap refreshing" : "list-wrap"} aria-busy={isRefreshing}>
      {isRefreshing && <p className="muted refreshing-label">Updating…</p>}
      <ul className="card-list">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            busyKind={busy[item.id]}
            onSelect={onSelect}
          />
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
