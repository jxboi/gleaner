import { Leaf, Sun, Pencil, ArrowUpRight, ChevronRight } from "lucide-react";
import type { Project, Task } from "../lib/types";

const projectIcon = (color: Project["color"]) =>
  color === "gold" ? Sun : color === "lavender" ? Pencil : Leaf;

export function ProjectMark({
  color,
  small = false,
}: {
  color: Project["color"];
  small?: boolean;
}) {
  const Icon = projectIcon(color);
  return (
    <span className={`project-mark ${color}${small ? " small" : ""}`}>
      <Icon strokeWidth={1.5} aria-hidden="true" />
    </span>
  );
}

export function ProjectCard({
  project,
  tasks,
  onClick,
}: {
  project: Project;
  tasks: Task[];
  onClick: () => void;
}) {
  const completed = tasks.filter((task) => task.completed).length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  return (
    <button className={`project-card ${project.color}`} onClick={onClick}>
      <span className="project-top">
        <ProjectMark color={project.color} />
        <ArrowUpRight className="project-open-icon" size={18} />
      </span>
      <h3>{project.name}</h3>
      <p>{project.description || "A fresh start for something good."}</p>
      <span className="project-progress">
        <span className="progress-track">
          <span style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="project-count">
        {completed} of {tasks.length} to-dos
      </span>
    </button>
  );
}

/** Compact home-screen row: what the project is, and the one thing to do next. */
export function ProjectRow({
  project,
  tasks,
  onClick,
}: {
  project: Project;
  tasks: Task[];
  onClick: () => void;
}) {
  const Icon = projectIcon(project.color);
  const completed = tasks.filter((task) => task.completed).length;
  const next = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <button className={`project-row ${project.color}`} onClick={onClick}>
      <Icon
        className="project-row-icon"
        size={18}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="project-row-text">
        <strong>{project.name}</strong>
        <span>
          {next
            ? `Next: ${next.title}`
            : tasks.length
              ? "All done. Nice work."
              : "No to-dos yet."}
        </span>
      </span>
      <span className="project-row-progress">
        <span aria-hidden="true">
          {completed}/{tasks.length}
        </span>
        <span className="visually-hidden">
          {completed} of {tasks.length} to-dos done
        </span>
      </span>
      <ChevronRight
        className="project-row-chevron"
        size={18}
        aria-hidden="true"
      />
    </button>
  );
}
