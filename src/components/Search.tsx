import { useId, useState } from "react";
import {
  Search as SearchIcon,
  ArrowRight,
  FileText,
  CheckSquare,
  Folder,
  CalendarDays,
} from "lucide-react";
import { Modal } from "./Modal";
import type { AppData, View } from "../lib/types";

export function Search({
  data,
  navigate,
  onClose,
}: {
  data: AppData;
  navigate: (view: View, id?: string) => void;
  onClose: () => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const all = [
    ...data.projects
      .filter((p) => !p.archived)
      .map((p) => ({
        id: p.id,
        title: p.name,
        detail: p.description,
        kind: "Project",
        view: "project" as View,
        Icon: Folder,
      })),
    ...data.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      detail:
        data.projects.find((p) => p.id === t.projectId)?.name ||
        "Personal to-do",
      kind: "To-do",
      view: "tasks" as View,
      Icon: CheckSquare,
    })),
    ...data.notes.map((n) => ({
      id: n.id,
      title: n.title,
      detail: n.body,
      kind: "Note",
      view: "notes" as View,
      Icon: FileText,
    })),
    ...data.events.map((e) => ({
      id: e.id,
      title: e.title,
      detail: e.date,
      kind: "Event",
      view: "schedule" as View,
      Icon: CalendarDays,
    })),
  ];
  const results = all
    .filter(
      (r) =>
        !query.trim() ||
        `${r.title} ${r.detail}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    )
    .slice(0, 8);
  function choose(index: number) {
    const result = results[index];
    if (result) {
      navigate(result.view, result.id);
      onClose();
    }
  }
  return (
    <Modal title="Find a little clarity" onClose={onClose} wide>
      <div className="search-field">
        <SearchIcon size={21} />
        <input
          autoFocus
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={true}
          aria-controls={listId}
          aria-activedescendant={
            results[selected] ? `${listId}-${selected}` : undefined
          }
          aria-label="Search your workspace"
          placeholder="Search projects, to-dos, notes…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelected((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelected((i) => Math.max(0, i - 1));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              choose(selected);
            }
          }}
        />
      </div>
      <p className="search-label">
        {query.trim()
          ? `${results.length} result${results.length === 1 ? "" : "s"}`
          : "Around your workspace"}
      </p>
      <div
        className="search-results"
        role="listbox"
        id={listId}
        aria-label="Workspace search results"
      >
        {results.map((result, index) => (
          <button
            role="option"
            id={`${listId}-${index}`}
            aria-selected={selected === index}
            key={`${result.kind}-${result.id}`}
            className={`search-result ${selected === index ? "selected" : ""}`}
            onMouseEnter={() => setSelected(index)}
            onClick={() => choose(index)}
          >
            <span className="search-result-icon">
              <result.Icon size={20} />
            </span>
            <span>
              <strong>{result.title || "Untitled note"}</strong>
              <small>
                {result.kind}
                {result.kind === "To-do" ? ` · ${result.detail}` : ""}
              </small>
            </span>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      {!results.length && (
        <div className="empty-state">
          Nothing here just yet.
          <br />
          <span>Try a different word or create something new.</span>
        </div>
      )}
      <div className="search-footer">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> to move
        </span>
        <span>
          <kbd>↵</kbd> to open
        </span>
        <span>
          <kbd>esc</kbd> to close
        </span>
      </div>
    </Modal>
  );
}
