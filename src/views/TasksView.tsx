import { useId, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { Modal } from "../components/Modal";
import {
  TODAY,
  addDays,
  uid,
  type Task,
  type WorkspaceProps,
} from "../lib/types";
import "./tools.css";

type Filter = "all" | "today" | "upcoming" | "completed";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All to-dos" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

function dateLabel(date: string) {
  if (!date) return "No date";
  if (date === TODAY) return "Today";
  if (date === addDays(TODAY, 1)) return "Tomorrow";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function TasksView({
  data,
  update,
  notify,
  create,
  projectId,
  selectedId,
}: WorkspaceProps & { projectId?: string; selectedId?: string }) {
  const [filter, setFilter] = useState<Filter>("today");
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState<Task | null>(
    () => data.tasks.find((task) => task.id === selectedId) || null,
  );
  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId);
    setEditing(data.tasks.find((task) => task.id === selectedId) || null);
  }
  const formId = useId();
  const tasks = data.tasks.filter(
    (task) => !projectId || task.projectId === projectId,
  );
  const visible = tasks
    .filter((task) =>
      filter === "all"
        ? true
        : filter === "completed"
          ? task.completed
          : !task.completed &&
            (filter === "today"
              ? Boolean(task.date) && task.date <= TODAY
              : task.date > TODAY),
    )
    .sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) ||
        (a.date || "9999").localeCompare(b.date || "9999"),
    );
  const unfinished = tasks.filter((task) => !task.completed).length;
  const finished = tasks.length - unfinished;
  const project = data.projects.find((item) => item.id === projectId);

  function toggleTask(task: Task) {
    update((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const task: Task = {
      id: uid(),
      title: newTitle.trim(),
      completed: false,
      date: filter === "upcoming" ? addDays(TODAY, 1) : TODAY,
      projectId: projectId || "",
    };
    update((current) => ({ ...current, tasks: [...current.tasks, task] }));
    setNewTitle("");
    if (filter === "completed") setFilter("all");
    notify("A new to-do, a little more clarity.");
  }

  function saveTask(event: FormEvent) {
    event.preventDefault();
    if (!editing?.title.trim()) return;
    const saved = { ...editing, title: editing.title.trim() };
    update((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === saved.id ? saved : task)),
    }));
    setEditing(null);
    notify("To-do updated.");
  }

  function removeTask(task: Task) {
    update((current) => ({
      ...current,
      tasks: current.tasks.filter((item) => item.id !== task.id),
    }));
    setEditing(null);
    notify("To-do deleted.", () =>
      update((current) => ({
        ...current,
        tasks: current.tasks.some((item) => item.id === task.id)
          ? current.tasks
          : [...current.tasks, task],
      })),
    );
  }

  return (
    <section className="tool-view tasks-view" aria-labelledby="tasks-heading">
      <header className="page-heading tool-heading">
        <div>
          <h1 id="tasks-heading">Your to-dos</h1>
          <p className="muted">
            {project
              ? `Next steps for ${project.name}.`
              : "Make a little room for what matters."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => create("task", projectId)}
        >
          <Plus size={17} /> New to-do
        </button>
      </header>

      <div className="tasks-summary">
        <span>{unfinished} remaining</span>
        <span>{finished} completed</span>
      </div>

      <div className="tools-paper">
        <div className="tools-tabs" aria-label="Filter to-dos">
          {filters.map((item) => (
            <button
              key={item.id}
              className={filter === item.id ? "is-active" : ""}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              {item.id === "today" && (
                <span>
                  {
                    tasks.filter(
                      (task) =>
                        task.date && task.date <= TODAY && !task.completed,
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="tasks-column-labels">
          <span>TO-DO</span>
          <span>DUE DATE</span>
        </div>
        <div className="tasks-list">
          {visible.map((task) => {
            const taskProject = data.projects.find(
              (item) => item.id === task.projectId,
            );
            return (
              <div
                className={`tasks-row${task.completed ? " is-completed" : ""}`}
                key={task.id}
              >
                <button
                  className="tasks-check"
                  role="checkbox"
                  aria-checked={task.completed}
                  aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
                  onClick={() => toggleTask(task)}
                >
                  {task.completed && <Check size={14} strokeWidth={2.7} />}
                </button>
                <button
                  className="tasks-row-main"
                  onClick={() => setEditing({ ...task })}
                >
                  <span className="tasks-row-title">{task.title}</span>
                  {taskProject && (
                    <span className="tasks-project">
                      <span
                        className={`tools-project-dot ${taskProject.color}`}
                      />
                      {taskProject.name}
                    </span>
                  )}
                </button>
                <button
                  className={`tasks-date${task.date === TODAY && !task.completed ? " is-today" : ""}${task.date && task.date < TODAY && !task.completed ? " is-overdue" : ""}`}
                  onClick={() => setEditing({ ...task })}
                  aria-label={`Edit due date for ${task.title}: ${dateLabel(task.date)}`}
                >
                  <CalendarDays size={14} />
                  <span>{dateLabel(task.date)}</span>
                </button>
                <button
                  className="icon-button tasks-edit"
                  onClick={() => setEditing({ ...task })}
                  aria-label={`Edit ${task.title}`}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            );
          })}
          {!visible.length && (
            <div className="empty-state tools-empty">
              <CircleCheck size={34} strokeWidth={1.3} />
              <h2>
                {filter === "completed"
                  ? "No completed to-dos yet."
                  : filter === "today"
                    ? "You’re all caught up."
                    : "No to-dos here yet."}
              </h2>
              <p>
                {filter === "completed"
                  ? "Your finished to-dos will appear here."
                  : "Add a to-do whenever you’re ready."}
              </p>
            </div>
          )}
        </div>
        <form className="tasks-add" onSubmit={addTask}>
          <Plus size={18} />
          <input
            aria-label="New to-do title"
            placeholder="Add a little next step…"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            maxLength={180}
          />
          <button className="button" type="submit" disabled={!newTitle.trim()}>
            Add to-do <span aria-hidden="true">↵</span>
          </button>
        </form>
      </div>

      {editing && (
        <Modal title="A little next step" onClose={() => setEditing(null)}>
          <form className="tools-form form-stack" onSubmit={saveTask}>
            <label className="form-field" htmlFor={`${formId}-title`}>
              To-do
              <input
                id={`${formId}-title`}
                autoFocus
                required
                maxLength={180}
                value={editing.title}
                onChange={(event) =>
                  setEditing({ ...editing, title: event.target.value })
                }
              />
            </label>
            <label className="form-field" htmlFor={`${formId}-date`}>
              Due date
              <input
                id={`${formId}-date`}
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={editing.date}
                onChange={(event) =>
                  setEditing({ ...editing, date: event.target.value })
                }
              />
            </label>
            <label className="form-field" htmlFor={`${formId}-project`}>
              Project
              <select
                id={`${formId}-project`}
                value={editing.projectId}
                onChange={(event) =>
                  setEditing({ ...editing, projectId: event.target.value })
                }
              >
                <option value="">Just for me</option>
                {data.projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="tools-checkbox-label">
              <input
                type="checkbox"
                checked={editing.completed}
                onChange={(event) =>
                  setEditing({ ...editing, completed: event.target.checked })
                }
              />
              This one’s done
            </label>
            <div className="tools-modal-actions">
              <button
                className="text-button tools-danger"
                type="button"
                onClick={() => removeTask(editing)}
              >
                <Trash2 size={15} /> Delete
              </button>
              <div>
                <button
                  className="button"
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  type="submit"
                  disabled={!editing.title.trim()}
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
