import { SORT_OPTIONS, STATUS_OPTIONS } from "../constants.js";

export default function Controls({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  appliedSearch,
  onSearchClear,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="controls">
      <form className="search-form" onSubmit={onSearchSubmit} role="search">
        <input
          type="search"
          placeholder="Search by name, description or assignee…"
          aria-label="Search tasks"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
        />
        <button type="submit" className="btn">
          Search
        </button>
        {appliedSearch && (
          <button type="button" className="btn" onClick={onSearchClear}>
            Clear
          </button>
        )}
      </form>

      <div className="filters">
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select aria-label="Sort" value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
