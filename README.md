# Task Board — Async React (Practice 4)

A task board that works with a **simulated asynchronous API**: Promises, random delays
(0.5–3 s), random errors (5%) and data stored in `localStorage`.
Built with React 18 + Vite. Only `useState` and `useEffect` are used.

**Live demo:** _add your Vercel link here_

## What the app does
- **List** of tasks loaded with `useEffect`: search (on submit), status filter, sorting, pagination
- **Details** of the selected task are loaded separately (more fields than in the list)
- **Create**, **Edit** and **Delete** tasks (controlled form with validation)
- **Complete** action — updates the selected task through the API
- **Reload** button to refresh the list
- Loading, error (with "Try again"), empty and success states for the list and for the details
- Responsive layout: two columns on desktop, list **or** details on a phone

## Requirements checklist
| Requirement | Where |
|---|---|
| Simulated API (Promises, delays, errors, `localStorage`) | `src/api/fakeApi.js`, `src/api/settings.js` |
| 7+ meaningful detail fields | assignee, category, due date, estimate, created, last updated, completed (+ description, notes, status, priority) — `ItemDetails.jsx` |
| List loaded with `useEffect` | effect 1 in `App.jsx` |
| Create / Edit / Remove | `handleCreate`, `handleUpdate`, `handleDelete` in `App.jsx`, `ItemForm.jsx` |
| Select item → load details asynchronously | effect 2 in `App.jsx` |
| Action that updates the item (complete) | `handleComplete` in `App.jsx` |
| Loading / error / empty / success | `StatusMessage.jsx`, `ItemList.jsx`, `ItemDetails.jsx` |
| Reload button | `Header.jsx` → `handleReload` |
| Correct dependencies and cleanup | all three effects in `App.jsx` |
| No race conditions when switching items | effect 2: `ignore` flag + `AbortController` |
| Stale closures handled | `handleComplete`, `handleDelete`: id captured at the start, functional state updates |
| Prevent conflicting actions | `busy` map: buttons of an item are disabled while its request is running |

## Restrictions respected
- only `useState` and `useEffect` (no `useMemo`, `useRef`, `useCallback`, router hooks…)
- no custom hooks, no debouncing (search is applied on submit)
- no fetching libraries
- components never touch `localStorage` — only `src/api/fakeApi.js` does

## How the async part works
1. **List effect** — deps `[page, search, statusFilter, sort, listReloadKey]`. Any change starts a new request;
   the cleanup of the previous run sets `ignore = true` and aborts the old request.
2. **Details effect** — deps `[selectedId, detailsReloadKey]`. Selecting A → B → C quickly starts three requests,
   but the cleanup cancels the first two, so only the answer for the selected item can reach the screen.
   Cancelled requests are logged in the browser console as `[details] ...`.
3. **Notice effect** — hides the message after 5 s; the cleanup clears the timer.
4. **Complete / Edit / Delete** capture the item id at the start of the action and update the correct item
   even if the user selects another item while the request is still running.

## How to see delays and errors clearly
Open `src/api/settings.js`:
```js
export const API_CONFIG = { minDelay: 3000, maxDelay: 3000, errorChance: 0 };  // slow, no errors
export const API_CONFIG = { minDelay: 500, maxDelay: 3000, errorChance: 1 };   // always fails
```
To reset the data, clear the `async-tasks-data` key in DevTools → Application → Local Storage.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Structure
```
src/
  api/          fakeApi.js, settings.js, initialData.js   (the simulated server)
  components/   Header, Controls, ItemList, ItemCard, ItemDetails, ItemForm,
                Pagination, StatusMessage, Badge, Notice
  App.jsx       all state and all effects
  constants.js, utils.js, index.css, main.jsx
```
