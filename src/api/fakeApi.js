import { API_CONFIG, DATA_KEY } from "./settings.js";
import { initialData } from "./initialData.js";

function randomDelay() {
  const { minDelay, maxDelay } = API_CONFIG;
  return Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
}

function abortError() {
  const error = new Error("Request was cancelled");
  error.name = "AbortError";
  return error;
}

function fakeRequest(operation, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    function onAbort() {
      clearTimeout(timerId);
      reject(abortError());
    }

    const timerId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);

      if (Math.random() < API_CONFIG.errorChance) {
        reject(new Error("Network error: the server did not respond. Please try again."));
        return;
      }

      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, randomDelay());

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function writeData(items) {
  localStorage.setItem(DATA_KEY, JSON.stringify(items));
}

function readData() {
  const raw = localStorage.getItem(DATA_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    } catch {
    }
  }
  writeData(initialData);
  return JSON.parse(JSON.stringify(initialData));
}

function findIndexOrThrow(items, id) {
  const index = items.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    throw new Error(`Item #${id} was not found. It may have been deleted.`);
  }
  return index;
}

function toListItem(item) {
  const { id, name, description, status, priority, assignee, dueDate } = item;
  return { id, name, description, status, priority, assignee, dueDate };
}

function validate(data) {
  if (typeof data.name !== "string" || data.name.trim().length < 3) {
    throw new Error("Name must be at least 3 characters.");
  }
}

export function getItemsList(query = "", options) {
  return fakeRequest(() => {
    const params = new URLSearchParams(query);
    const search = (params.get("search") ?? "").trim().toLowerCase();
    const status = params.get("status") ?? "all";
    const sort = params.get("sort") ?? "newest";
    const limit = Math.max(1, Number(params.get("limit")) || 6);

    let result = readData().filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.assignee.toLowerCase().includes(search);
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesStatus;
    });

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "due-date":
        result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        break;
      default:
        result.sort((a, b) => b.id - a.id);
    }

    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(Math.max(1, Number(params.get("page")) || 1), totalPages);
    const data = result.slice((page - 1) * limit, page * limit).map(toListItem);

    return { data, total, page, totalPages };
  }, options);
}

export function getItem(id, options) {
  return fakeRequest(() => {
    const items = readData();
    return items[findIndexOrThrow(items, id)];
  }, options);
}

export function createItem(data) {
  return fakeRequest(() => {
    validate(data);
    const items = readData();
    const now = new Date().toISOString();
    const status = data.status ?? "todo";

    const newItem = {
      id: items.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      name: data.name.trim(),
      description: data.description ?? "",
      status,
      priority: data.priority ?? "medium",
      assignee: data.assignee ?? "",
      category: data.category ?? "Frontend",
      dueDate: data.dueDate ?? "",
      estimateHours: Number(data.estimateHours) || 0,
      notes: data.notes ?? "",
      createdAt: now,
      updatedAt: now,
      completedAt: status === "done" ? now : null,
    };

    writeData([...items, newItem]);
    return newItem;
  });
}

export function updateItem(id, changes) {
  return fakeRequest(() => {
    const items = readData();
    const index = findIndexOrThrow(items, id);
    const current = items[index];

    const merged = { ...current, ...changes, id: current.id, createdAt: current.createdAt };
    if (changes.name !== undefined) validate(merged);
    if (changes.estimateHours !== undefined) merged.estimateHours = Number(changes.estimateHours) || 0;

    const now = new Date().toISOString();
    merged.updatedAt = now;
    if (merged.status === "done" && current.status !== "done") merged.completedAt = now;
    if (merged.status !== "done") merged.completedAt = null;

    items[index] = merged;
    writeData(items);
    return merged;
  });
}

export function deleteItem(id) {
  return fakeRequest(() => {
    const items = readData();
    const index = findIndexOrThrow(items, id);
    writeData(items.filter((_, i) => i !== index));
    return { success: true, id: Number(id) };
  });
}
