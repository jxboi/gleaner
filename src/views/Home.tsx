import { ArrowRight, Plus } from "lucide-react";
import { Assistant } from "../components/Assistant";
import { ProjectCard } from "../components/ProjectCard";
import type { WorkspaceProps } from "../lib/types";
import { TODAY, formatWorkspaceDate } from "../lib/types";

export function Home(props: WorkspaceProps) {
  const { data, navigate, create } = props;
  return (
    <div className="home-view view-enter">
      <section className="welcome-row">
        <div>
          <p className="welcome-date">{formatWorkspaceDate(TODAY)}</p>
          <h1>A little clarity for your day, {data.name}.</h1>
          <p className="welcome-description">
            Your ideas, plans, and next steps. All in one place.
          </p>
        </div>
      </section>
      <div className="home-layout">
        <div className="home-main">
          <Assistant {...props} compact />
          <section className="projects-section">
            <div className="section-heading">
              <h2>Your projects</h2>
              <button className="text-button" onClick={() => create("project")}>
                <Plus size={17} />
                New project
              </button>
            </div>
            <div className="project-grid">
              {data.projects
                .filter((p) => !p.archived)
                .slice(0, 3)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={data.tasks.filter((t) => t.projectId === project.id)}
                    onClick={() => navigate("project", project.id)}
                  />
                ))}
            </div>
            {data.projects.filter((p) => !p.archived).length > 3 && (
              <button
                className="text-button more-projects"
                onClick={() => navigate("projects")}
              >
                See all projects <ArrowRight size={16} />
              </button>
            )}
            {!data.projects.filter((p) => !p.archived).length && (
              <button
                className="empty-state empty-button"
                onClick={() => create("project")}
              >
                A little room for your next idea. Create a project{" "}
                <Plus size={18} />
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
