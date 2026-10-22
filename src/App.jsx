import { useEffect, useState } from "react";
import { createItem, deleteItem, getItem, getItemsList, updateItem } from "./api/fakeApi.js";
import { PAGE_SIZE } from "./constants.js";
import { toListItem } from "./utils.js";
import Header from "./components/Header.jsx";
import Controls from "./components/Controls.jsx";
import ItemList from "./components/ItemList.jsx";
import ItemDetails from "./components/ItemDetails.jsx";
import ItemForm from "./components/ItemForm.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import Notice from "./components/Notice.jsx";

export default function App() {
  const [items, setItems] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");
  const [total, setTotal] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [listReloadKey, setListReloadKey] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState("idle");
  const [detailsError, setDetailsError] = useState("");
  const [detailsReloadKey, setDetailsReloadKey] = useState(0);

  const [formMode, setFormMode] = useState(null);
  const [formError, setFormError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState({});
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setListStatus("loading");
    setListError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      status: statusFilter,
      sort,
    });
    if (search) params.set("search", search);

    getItemsList(`?${params}`, { signal: controller.signal })
      .then((result) => {
        if (ignore) return;
        setItems(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setListStatus("success");
        if (result.page !== page) setPage(result.page);
      })
      .catch((error) => {
        if (ignore || error.name === "AbortError") return;
        setListError(error.message);
        setListStatus("error");
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [page, search, statusFilter, sort, listReloadKey]);

  useEffect(() => {
    if (selectedId === null) {
      setDetails(null);
      setDetailsStatus("idle");
      return;
    }

    const id = selectedId;
    let ignore = false;
    const controller = new AbortController();

    setDetails(null);
    setDetailsStatus("loading");
    setDetailsError("");

    getItem(id, { signal: controller.signal })
      .then((item) => {
        if (ignore) {
          console.log(`[details] ignored outdated answer for #${id}`);
          return;
        }
        setDetails(item);
        setDetailsStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log(`[details] request for #${id} was cancelled (another item was selected)`);
          return;
        }
        if (ignore) return;
        setDetailsError(error.message);
        setDetailsStatus("error");
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [selectedId, detailsReloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timerId = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timerId);
  }, [notice]);

  function showNotice(type, text) {
    setNotice({ type, text });
  }

  function startBusy(id, kind) {
    setBusy((prev) => ({ ...prev, [id]: kind }));
  }

  function endBusy(id) {
    setBusy((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function applyUpdated(id, updated) {
    setItems((prev) => prev.map((item) => (item.id === id ? toListItem(updated) : item)));
    setDetails((prev) => (prev && prev.id === id ? updated : prev));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchText.trim());
    setPage(1);
  }

  function handleSearchClear() {
    setSearchText("");
    setSearch("");
    setPage(1);
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleSortChange(value) {
    setSort(value);
    setPage(1);
  }

  function handleResetFilters() {
    setSearchText("");
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  function handleReload() {
    setListReloadKey((key) => key + 1);
  }

  function handleSelect(id) {
    setSelectedId(id);
    setFormMode(null);
  }

  function handleBack() {
    setSelectedId(null);
    setFormMode(null);
  }

  function handleOpenCreate() {
    setFormMode({ type: "create" });
    setFormError(null);
  }

  async function handleCreate(values) {
    if (creating) return;
    setCreating(true);
    setFormError(null);

    try {
      const created = await createItem(values);
      setFormMode((prev) => (prev && prev.type === "create" ? null : prev));
      setPage(1);
      setListReloadKey((key) => key + 1);
      showNotice("success", `Task "${created.name}" was created.`);
    } catch (error) {
      setFormError({ target: "create", message: error.message });
    } finally {
      setCreating(false);
    }
  }

  function handleOpenEdit() {
    if (!details) return;
    setFormMode({ type: "edit", id: details.id });
    setFormError(null);
  }

  async function handleUpdate(values) {
    const id = formMode?.id;
    if (id === undefined || busy[id]) return;

    startBusy(id, "saving");
    setFormError(null);

    try {
      const updated = await updateItem(id, values);
      applyUpdated(id, updated);
      setFormMode((prev) => (prev && prev.id === id ? null : prev));
      showNotice("success", `Changes to "${updated.name}" were saved.`);
    } catch (error) {
      setFormError({ target: `edit-${id}`, message: error.message });
    } finally {
      endBusy(id);
    }
  }

  async function handleComplete() {
    if (!details) return;
    const id = details.id;
    const name = details.name;
    if (busy[id]) return;

    startBusy(id, "completing");
    try {
      const updated = await updateItem(id, { status: "done" });
      applyUpdated(id, updated);
      showNotice("success", `"${name}" is complete.`);
    } catch (error) {
      showNotice("error", `Could not complete "${name}": ${error.message}`);
    } finally {
      endBusy(id);
    }
  }

  async function handleDelete() {
    if (!details) return;
    const id = details.id;
    const name = details.name;
    if (busy[id]) return;
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    startBusy(id, "deleting");
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
      setFormMode((prev) => (prev && prev.id === id ? null : prev));
      setListReloadKey((key) => key + 1);
      showNotice("success", `"${name}" was deleted.`);
    } catch (error) {
      showNotice("error", `Could not delete "${name}": ${error.message}`);
    } finally {
      endBusy(id);
    }
  }

  const formTarget = formMode ? (formMode.type === "edit" ? `edit-${formMode.id}` : "create") : null;
  const currentFormError = formError && formError.target === formTarget ? formError.message : "";
  const panelOpen = formMode !== null || selectedId !== null;

  let panel;
  if (formMode && formMode.type === "create") {
    panel = (
      <ItemForm
        key="create"
        mode="create"
        initialValues={null}
        saving={creating}
        error={currentFormError}
        onSubmit={handleCreate}
        onCancel={() => setFormMode(null)}
      />
    );
  } else if (formMode && details && details.id === formMode.id) {
    panel = (
      <ItemForm
        key={`edit-${formMode.id}`}
        mode="edit"
        initialValues={details}
        saving={Boolean(busy[formMode.id])}
        error={currentFormError}
        onSubmit={handleUpdate}
        onCancel={() => setFormMode(null)}
      />
    );
  } else if (selectedId === null) {
    panel = (
      <StatusMessage
        type="idle"
        message="Select a task to see its details."
        hint="Details are loaded from the server when you select a task."
      />
    );
  } else {
    panel = (
      <ItemDetails
        details={details}
        status={detailsStatus}
        error={detailsError}
        busyKind={busy[selectedId]}
        onRetry={() => setDetailsReloadKey((key) => key + 1)}
        onComplete={handleComplete}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    );
  }

  const hasFilters = search !== "" || statusFilter !== "all";

  return (
    <div className="app">
      <Header
        total={total}
        isLoading={listStatus === "loading"}
        onReload={handleReload}
        onCreate={handleOpenCreate}
      />

      <main className={`container layout ${panelOpen ? "panel-open" : ""}`}>
        <section className="list-pane" aria-label="Task list">
          <Controls
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchSubmit={handleSearchSubmit}
            appliedSearch={search}
            onSearchClear={handleSearchClear}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            sort={sort}
            onSortChange={handleSortChange}
          />
          <ItemList
            items={items}
            status={listStatus}
            error={listError}
            selectedId={selectedId}
            busy={busy}
            page={page}
            totalPages={totalPages}
            hasFilters={hasFilters}
            onSelect={handleSelect}
            onRetry={handleReload}
            onPageChange={setPage}
            onResetFilters={handleResetFilters}
          />
        </section>

        <section className="detail-pane" aria-label="Task details">
          <button type="button" className="btn back-btn" onClick={handleBack}>
            ← Back to list
          </button>
          {panel}
        </section>
      </main>

      <Notice notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
