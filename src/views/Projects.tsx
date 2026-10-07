import { useState } from "react";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Archive,
  Pencil,
  CheckSquare,
  FileText,
  CalendarDays,
  Check,
  RotateCcw,
} from "lucide-react";
import { ProjectCard, ProjectMark } from "../components/ProjectCard";
import { Modal } from "../components/Modal";
import type { WorkspaceProps, Project, ProjectColor } from "../lib/types";

export function Projects(props: WorkspaceProps) {
  const { data, create, navigate, update, notify } = props;
  const [archived, setArchived] = useState(false);
  const projects = data.projects.filter((p) => !!p.archived === archived);
  return (
    <div className="view-enter">
      <div className="page-heading">
        <div>
          <h1>Your projects</h1>
          <p>A little structure for the things that matter.</p>
        </div>
        <button className="button primary" onClick={() => create("project")}>
          <Plus size={18} />
          New project
        </button>
      </div>
      <div className="segmented-control">
        <button
          className={!archived ? "active" : ""}
          onClick={() => setArchived(false)}
        >
          In progress{" "}
          <span>{data.projects.filter((p) => !p.archived).length}</span>
        </button>
        <button
          className={archived ? "active" : ""}
          onClick={() => setArchived(true)}
        >
          Archived
        </button>
      </div>
      <div className="all-projects-grid">
        {projects.map((project) => (
          <div key={project.id}>
            <ProjectCard
              project={project}
              tasks={data.tasks.filter((t) => t.projectId === project.id)}
              onClick={() => navigate("project", project.id)}
            />
            {archived && (
              <button
                className="text-button restore-project"
                onClick={() => {
                  update((d) => ({
                    ...d,
                    projects: d.projects.map((p) =>
                      p.id === project.id ? { ...p, archived: false } : p,
                    ),
                  }));
                  notify("Project brought back to your workspace.");
                }}
              >
                <RotateCcw size={16} />
                Restore project
              </button>
            )}
          </div>
        ))}
      </div>
      {!projects.length && (
        <div className="empty-state">
          <Archive size={30} />
          <h3>
            {archived
              ? "Nothing tucked away yet."
              : "What would you like to make room for?"}
          </h3>
          <p>
            {archived
              ? "Archived projects stay here until you need them."
              : "Give your ideas a home with your first project."}
          </p>
          {!archived && (
            <button
              className="button primary"
              onClick={() => create("project")}
            >
              Create a project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectDetail(props: WorkspaceProps & { id?: string }) {
  const { data, update, navigate, create, notify } = props;
  const project = data.projects.find((p) => p.id === props.id);
  const [editing, setEditing] = useState(false);
  if (!project)
    return (
      <div className="empty-state">
        <h2>This project isn’t here.</h2>
        <button className="button" onClick={() => navigate("projects")}>
          Back to projects
        </button>
      </div>
    );
  const tasks = data.tasks.filter((t) => t.projectId === project.id);
  const notes = data.notes.filter((n) => n.projectId === project.id);
  const events = data.events
    .filter((e) => e.projectId === project.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  function archive() {
    const previous = project!;
    update((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === previous.id ? { ...p, archived: !p.archived } : p,
      ),
    }));
    navigate("projects");
    notify(
      previous.archived
        ? "Project restored."
        : "Project tucked away. Everything is saved.",
      () =>
        update((d) => ({
          ...d,
          projects: d.projects.map((p) =>
            p.id === previous.id ? previous : p,
          ),
        })),
    );
  }
  return (
    <div className="view-enter">
      <button
        className="text-button back-link"
        onClick={() => navigate("projects")}
      >
        <ArrowLeft size={17} />
        Your projects
      </button>
      <div className="project-detail-heading">
        <ProjectMark color={project.color} />
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="project-actions">
          <button
            className="icon-button"
            aria-label="Edit project"
            title="Edit project"
            onClick={() => setEditing(true)}
          >
            <Pencil size={18} />
          </button>
          <button
            className="icon-button"
            aria-label={
              project.archived ? "Restore project" : "Archive project"
            }
            title={project.archived ? "Restore project" : "Archive project"}
            onClick={archive}
          >
            <Archive size={19} />
          </button>
        </div>
      </div>
      <div className="project-detail-grid">
        <section className="project-tool-panel">
          <div className="section-heading">
            <h2>
              <CheckSquare size={21} />
              To-dos{" "}
              <span className="count-badge">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </h2>
            <button
              className="icon-button"
              aria-label="Add project to-do"
              onClick={() => create("task", project.id)}
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="project-task-list">
            {[...tasks]
              .sort((a, b) => Number(a.completed) - Number(b.completed))
              .map((task) => (
                <div
                  className={`project-task ${task.completed ? "completed" : ""}`}
                  key={task.id}
                >
                  <button
                    className={`task-checkbox ${task.completed ? "checked" : ""}`}
                    aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        tasks: d.tasks.map((t) =>
                          t.id === task.id
                            ? { ...t, completed: !t.completed }
                            : t,
                        ),
                      }))
                    }
                  >
                    <Check size={15} />
                  </button>
                  <span>{task.title}</span>
                </div>
              ))}
          </div>
          <button
            className="text-button"
            onClick={() => create("task", project.id)}
          >
            <Plus size={17} />
            Add a to-do
          </button>
        </section>
        <div className="project-secondary">
          <section className="project-tool-panel">
            <div className="section-heading">
              <h2>
                <FileText size={20} />
                Notes
              </h2>
              <button
                className="icon-button"
                aria-label="Add project note"
                onClick={() => create("note", project.id)}
              >
                <Plus size={20} />
              </button>
            </div>
            {notes.map((note) => (
              <button
                className="project-note-link"
                key={note.id}
                onClick={() => navigate("notes", note.id)}
              >
                <FileText size={20} />
                <span>{note.title || "Untitled note"}</span>
                <ArrowRight size={17} />
              </button>
            ))}
            {!notes.length && (
              <p className="muted">A place for the ideas you want to keep.</p>
            )}
            <button
              className="text-button"
              onClick={() => create("note", project.id)}
            >
              <Plus size={17} />
              Write a note
            </button>
          </section>
          <section className="project-tool-panel">
            <div className="section-heading">
              <h2>
                <CalendarDays size={20} />
                Schedule
              </h2>
              <button
                className="icon-button"
                aria-label="Add project event"
                onClick={() => create("event", project.id)}
              >
                <Plus size={20} />
              </button>
            </div>
            {events.map((event) => (
              <button
                className="project-event-link"
                key={event.id}
                onClick={() => navigate("schedule", event.id)}
              >
                <span>
                  <strong>{event.title}</strong>
                  <small>
                    {new Date(event.date + "T12:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}{" "}
                    · {event.time}
                  </small>
                </span>
                <ArrowRight size={17} />
              </button>
            ))}
            {!events.length && (
              <p className="muted">A little space to plan ahead.</p>
            )}
            <button
              className="text-button"
              onClick={() => create("event", project.id)}
            >
              <Plus size={17} />
              Add an event
            </button>
          </section>
        </div>
      </div>
      {editing && (
        <EditProject
          project={project}
          update={update}
          notify={notify}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function EditProject({
  project,
  update,
  notify,
  onClose,
}: Pick<WorkspaceProps, "update" | "notify"> & {
  project: Project;
  onClose: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [color, setColor] = useState<ProjectColor>(project.color);
  return (
    <Modal title="A little project refresh" onClose={onClose}>
      <form
        className="edit-project-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          update((d) => ({
            ...d,
            projects: d.projects.map((p) =>
              p.id === project.id
                ? {
                    ...p,
                    name: name.trim(),
                    description: description.trim(),
                    color,
                  }
                : p,
            ),
          }));
          notify("Project updated.");
          onClose();
        }}
      >
        <label>
          Project name
          <input
            autoFocus
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          A short description
          <input
            maxLength={100}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <fieldset className="color-field">
          <legend>Make it yours</legend>
          {(["sage", "gold", "lavender"] as const).map((c) => (
            <button
              type="button"
              key={c}
              className={`color-swatch ${c} ${color === c ? "selected" : ""}`}
              aria-label={c}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
            >
              <ProjectMark color={c} small />
            </button>
          ))}
        </fieldset>
        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={!name.trim()}>
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
