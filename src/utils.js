export function labelOf(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function toListItem(item) {
  const { id, name, description, status, priority, assignee, dueDate } = item;
  return { id, name, description, status, priority, assignee, dueDate };
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
