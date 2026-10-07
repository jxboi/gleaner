import { Leaf, Sun, Pencil, ArrowUpRight } from "lucide-react";
import type { Project, Task } from "../lib/types";

export function ProjectMark({
  color,
  small = false,
}: {
  color: Project["color"];
  small?: boolean;
}) {
  const Icon = color === "gold" ? Sun : color === "lavender" ? Pencil : Leaf;
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
