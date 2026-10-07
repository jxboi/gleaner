import { useId, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import {
  TODAY,
  uid,
  type AppData,
  type CreateKind,
  type ProjectColor,
  type View,
} from "../lib/types";
import { Modal } from "./Modal";

interface CreateDialogProps {
  kind: CreateKind;
  onClose: () => void;
  data: AppData;
  update: (fn: (data: AppData) => AppData) => void;
  notify: (message: string, undo?: () => void) => void;
  navigate: (view: View, id?: string) => void;
  projectId?: string;
  date?: string;
}

const dialogCopy = {
  project: {
    heading: "A home for something new",
    label: "Project name",
    placeholder: "What are you working on?",
    action: "Create project",
  },
  task: {
    heading: "One little next step",
    label: "What needs doing?",
    placeholder: "Give your to-do a name",
    action: "Add to-do",
  },
  note: {
    heading: "A place for your thoughts",
    label: "Note title",
    placeholder: "An idea worth keeping",
    action: "Create note",
  },
  event: {
    heading: "Make a little time",
    label: "Event name",
    placeholder: "What’s coming up?",
    action: "Add event",
  },
};

export function CreateDialog({
  kind,
  onClose,
  data,
  update,
  notify,
  navigate,
  projectId,
  date,
}: CreateDialogProps) {
  const activeProjects = data.projects.filter((project) => !project.archived);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId ?? "");
  const [selectedDate, setSelectedDate] = useState(date ?? TODAY);
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<ProjectColor>("sage");
  const [error, setError] = useState("");
  const fieldId = useId();
  const copy = dialogCopy[kind];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle) {
      setError(`Please add a ${kind === "task" ? "to-do" : kind} name.`);
      return;
    }
    if (kind === "event" && (!selectedDate || !time)) {
      setError("Choose a date and time for this event.");
      return;
    }
    const id = uid();
    const now = new Date().toISOString();
    const activity = {
      id: uid(),
      text: `${kind === "task" ? "Added a to-do" : kind === "event" ? "Scheduled an event" : `Created a ${kind}`}: ${cleanedTitle}`,
      at: now,
      read: false,
    };
    update((current) => {
      const next = {
        ...current,
        activities: [activity, ...current.activities],
      };
      if (kind === "project")
        return {
          ...next,
          projects: [
            ...current.projects,
            { id, name: cleanedTitle, description: description.trim(), color },
          ],
        };
      if (kind === "task")
        return {
          ...next,
          tasks: [
            ...current.tasks,
            {
              id,
              title: cleanedTitle,
              projectId: selectedProject,
              date: selectedDate,
              completed: false,
            },
          ],
        };
      if (kind === "note")
        return {
          ...next,
          notes: [
            {
              id,
              title: cleanedTitle,
              body: description.trim(),
              projectId: selectedProject,
              updatedAt: now,
            },
            ...current.notes,
          ],
        };
      return {
        ...next,
        events: [
          ...current.events,
          {
            id,
            title: cleanedTitle,
            date: selectedDate,
            time,
            projectId: selectedProject,
            description: description.trim(),
          },
        ],
      };
    });
    onClose();
    if (kind === "project") navigate("project", id);
    if (kind === "note") navigate("notes", id);
    notify(
      kind === "task"
        ? "A little next step, added."
        : kind === "event"
          ? "Time set aside."
          : kind === "note"
            ? "Your note is ready."
            : "Your new project is ready.",
    );
  }

  return (
    <Modal title={copy.heading} onClose={onClose}>
      <form className="gleaner-form" onSubmit={submit}>
        <div className="gleaner-form-field">
          <label htmlFor={`${fieldId}-title`}>{copy.label}</label>
          <input
            id={`${fieldId}-title`}
            autoFocus
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            placeholder={copy.placeholder}
            maxLength={kind === "project" ? 60 : 160}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
        </div>

        {kind !== "project" && (
          <div className="gleaner-form-field">
            <label htmlFor={`${fieldId}-project`}>
              Project <span>optional</span>
            </label>
            <select
              id={`${fieldId}-project`}
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
            >
              <option value="">Just for me</option>
              {activeProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(kind === "task" || kind === "event") && (
          <div className="gleaner-form-row">
            <div className="gleaner-form-field">
              <label htmlFor={`${fieldId}-date`}>
                {kind === "task" ? "Due date" : "Date"}{" "}
                {kind === "task" && <span>optional</span>}
              </label>
              <input
                id={`${fieldId}-date`}
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                required={kind === "event"}
              />
            </div>
            {kind === "event" && (
              <div className="gleaner-form-field">
                <label htmlFor={`${fieldId}-time`}>Time</label>
                <input
                  id={`${fieldId}-time`}
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}

        {kind !== "task" && (
          <div className="gleaner-form-field">
            <label htmlFor={`${fieldId}-description`}>
              {kind === "note" ? "Your thoughts" : "A few words about it"}{" "}
              <span>optional</span>
            </label>
            <textarea
              id={`${fieldId}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={kind === "note" ? 5 : 3}
              placeholder={
                kind === "note"
                  ? "Start anywhere…"
                  : kind === "project"
                    ? "What would you like to make room for?"
                    : "Anything you’d like to remember…"
              }
            />
          </div>
        )}

        {kind === "project" && (
          <fieldset className="gleaner-colors">
            <legend>A little color</legend>
            {(["sage", "gold", "lavender"] as ProjectColor[]).map((option) => (
              <label
                className={`gleaner-color gleaner-color--${option}`}
                key={option}
              >
                <input
                  type="radio"
                  name="project-color"
                  value={option}
                  checked={color === option}
                  onChange={() => setColor(option)}
                />
                <span className="gleaner-color-swatch">
                  {color === option && <Check size={15} aria-hidden="true" />}
                </span>
                <span>
                  {option === "sage"
                    ? "Sage"
                    : option === "gold"
                      ? "Honey"
                      : "Lavender"}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {error && (
          <p
            className="gleaner-form-error"
            id={`${fieldId}-error`}
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="gleaner-form-actions">
          <button
            type="button"
            className="gleaner-form-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="gleaner-form-submit">
            {copy.action}
          </button>
        </div>
      </form>
    </Modal>
  );
}
