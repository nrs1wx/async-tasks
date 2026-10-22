import { useState } from "react";
import { CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS } from "../constants.js";

const EMPTY_VALUES = {
  name: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  category: "Frontend",
  dueDate: "",
  estimateHours: "1",
  notes: "",
};

export default function ItemForm({ mode, initialValues, saving, error, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => (initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES));
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const found = {};
    if (values.name.trim().length < 3) found.name = "Name must be at least 3 characters.";
    if (values.assignee.trim().length < 2) found.assignee = "Enter the assignee name.";
    if (!values.dueDate) found.dueDate = "Choose a due date.";
    const hours = Number(values.estimateHours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 200) {
      found.estimateHours = "Estimate must be between 1 and 200 hours.";
    }
    return found;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
      assignee: values.assignee.trim(),
      category: values.category,
      dueDate: values.dueDate,
      estimateHours: Number(values.estimateHours),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{mode === "edit" ? "Edit task" : "New task"}</h2>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <label>
        Name
        <input name="name" value={values.name} onChange={handleChange} disabled={saving} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label>
        Description
        <input name="description" value={values.description} onChange={handleChange} disabled={saving} />
      </label>

      <div className="form-row">
        <label>
          Status
          <select name="status" value={values.status} onChange={handleChange} disabled={saving}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select name="priority" value={values.priority} onChange={handleChange} disabled={saving}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select name="category" value={values.category} onChange={handleChange} disabled={saving}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Assignee
          <input name="assignee" value={values.assignee} onChange={handleChange} disabled={saving} />
          {errors.assignee && <span className="field-error">{errors.assignee}</span>}
        </label>

        <label>
          Due date
          <input type="date" name="dueDate" value={values.dueDate} onChange={handleChange} disabled={saving} />
          {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
        </label>

        <label>
          Estimate (hours)
          <input
            type="number"
            name="estimateHours"
            min="1"
            max="200"
            value={values.estimateHours}
            onChange={handleChange}
            disabled={saving}
          />
          {errors.estimateHours && <span className="field-error">{errors.estimateHours}</span>}
        </label>
      </div>

      <label>
        Notes
        <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} disabled={saving} />
      </label>

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create task"}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
