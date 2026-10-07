import {
  ArrowUpRight,
  CheckSquare,
  FileText,
  CalendarDays,
  Sparkles,
  Plus,
} from "lucide-react";
import type { WorkspaceProps, View, CreateKind } from "../lib/types";

export function Tools({ navigate, create, data }: WorkspaceProps) {
  const tools: {
    title: string;
    description: string;
    detail: string;
    view: View;
    kind?: CreateKind;
    Icon: typeof CheckSquare;
    color: string;
  }[] = [
    {
      title: "Your assistant",
      description:
        "A thinking partner for the big ideas and the everyday things.",
      detail: "A little help goes a long way",
      view: "assistant",
      Icon: Sparkles,
      color: "sage",
    },
    {
      title: "To-dos",
      description: "Get it out of your head. Take it one thing at a time.",
      detail: `${data.tasks.filter((t) => !t.completed).length} things to look forward to finishing`,
      view: "tasks",
      kind: "task",
      Icon: CheckSquare,
      color: "sage",
    },
    {
      title: "Notes",
      description:
        "Keep the good ideas, half-formed thoughts, and useful little details.",
      detail: `${data.notes.length} notes in your collection`,
      view: "notes",
      kind: "note",
      Icon: FileText,
      color: "gold",
    },
    {
      title: "Schedule",
      description: "Make a little room for what’s next.",
      detail: `${data.events.length} plans on the calendar`,
      view: "schedule",
      kind: "event",
      Icon: CalendarDays,
      color: "lavender",
    },
  ];
  return (
    <div className="view-enter">
      <div className="page-heading">
        <div>
          <h1>A few good tools.</h1>
          <p>Everything you need. A little less to think about.</p>
        </div>
      </div>
      <div className="tools-grid">
        {tools.map((tool) => (
          <article className="tool-card" key={tool.view}>
            <button
              className="tool-card-main"
              onClick={() => navigate(tool.view)}
            >
              <span className={`tool-mark ${tool.color}`}>
                <tool.Icon size={27} strokeWidth={1.5} />
              </span>
              <ArrowUpRight className="tool-card-arrow" size={22} />
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              <small>{tool.detail}</small>
            </button>
            <div className="tool-card-footer">
              <button
                className="text-button"
                onClick={() => navigate(tool.view)}
              >
                Open {tool.title.toLowerCase()}
                <ArrowUpRight size={16} />
              </button>
              {tool.kind && (
                <button
                  className="icon-button"
                  aria-label={`Create ${tool.kind}`}
                  onClick={() => create(tool.kind!)}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
