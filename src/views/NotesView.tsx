import { useId, useState } from "react";
import {
  Check,
  ChevronLeft,
  CircleAlert,
  FileText,
  NotebookPen,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { Note, WorkspaceProps } from "../lib/types";
import "./tools.css";

export function NotesView({
  data,
  update,
  navigate,
  notify,
  create,
  storageError,
  projectId,
  selectedId,
}: WorkspaceProps & { projectId?: string; selectedId?: string }) {
  const [search, setSearch] = useState("");
  const [mobileEditor, setMobileEditor] = useState(Boolean(selectedId));
  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId);
    setMobileEditor(Boolean(selectedId));
  }
  const projectSelectId = useId();
  const allNotes = data.notes.filter(
    (note) => !projectId || note.projectId === projectId,
  );
  const notes = allNotes.filter((note) =>
    `${note.title} ${note.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = allNotes.find((note) => note.id === selectedId) || notes[0];
  const project = data.projects.find((item) => item.id === projectId);

  function editNote(patch: Partial<Note>) {
    if (!selected) return;
    update((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === selected.id
          ? { ...note, ...patch, updatedAt: new Date().toISOString() }
          : note,
      ),
    }));
  }

  function removeNote(note: Note) {
    update((current) => ({
      ...current,
      notes: current.notes.filter((item) => item.id !== note.id),
    }));
    if (!projectId) navigate("notes");
    setMobileEditor(false);
    notify("Note deleted.", () =>
      update((current) => ({
        ...current,
        notes: current.notes.some((item) => item.id === note.id)
          ? current.notes
          : [...current.notes, note],
      })),
    );
  }

  function selectNote(note: Note) {
    navigate("notes", note.id);
    setMobileEditor(true);
  }

  return (
    <section className="tool-view notes-view" aria-labelledby="notes-heading">
      <header className="page-heading tool-heading">
        <div>
          <h1 id="notes-heading">Your notes</h1>
          <p className="muted">
            {project
              ? `Ideas and things to remember for ${project.name}.`
              : "A place for ideas and things to remember."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => create("note", projectId)}
        >
          <Plus size={17} /> New note
        </button>
      </header>

      <div
        className={`notes-workspace tools-paper${mobileEditor ? " show-editor" : ""}`}
      >
        <aside className="notes-sidebar" aria-label="Your notes">
          <div className="notes-search">
            <Search size={16} />
            <input
              aria-label="Search notes"
              placeholder="Find a note…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="notes-list-label">
            <span>{search ? "MATCHING NOTES" : "ALL NOTES"}</span>
            <span>{notes.length}</span>
          </div>
          <div className="notes-list">
            {notes.map((note) => (
              <button
                className={`notes-list-item${selected?.id === note.id ? " is-selected" : ""}`}
                key={note.id}
                onClick={() => selectNote(note)}
                aria-current={selected?.id === note.id ? "true" : undefined}
              >
                <span className="notes-list-title">
                  <FileText size={16} />
                  <strong>{note.title || "Untitled note"}</strong>
                </span>
                <span className="notes-list-excerpt">
                  {note.body.trim() || "A fresh page for a new thought…"}
                </span>
                <span className="notes-list-meta">
                  {data.projects.find((item) => item.id === note.projectId)
                    ?.name || "Just for me"}
                </span>
              </button>
            ))}
          </div>
          {!notes.length && (
            <div className="notes-list-empty">
              <FileText size={25} />
              <p>
                {search
                  ? "No notes match that thought."
                  : "Your first thought starts here."}
              </p>
              {search ? (
                <button className="text-button" onClick={() => setSearch("")}>
                  Clear search
                </button>
              ) : (
                <button
                  className="text-button"
                  onClick={() => create("note", projectId)}
                >
                  Write a note
                </button>
              )}
            </div>
          )}
        </aside>

        {selected ? (
          <article
            className="notes-editor"
            key={selected.id}
            aria-label="Note editor"
          >
            <div className="notes-editor-toolbar">
              <button
                className="text-button notes-mobile-back"
                onClick={() => setMobileEditor(false)}
              >
                <ChevronLeft size={16} /> Notes
              </button>
              <span
                className={`notes-save-status${storageError ? " is-unsaved" : ""}`}
                role="status"
              >
                {storageError ? <CircleAlert size={14} /> : <Check size={14} />}
                {storageError ? "Changes in this tab" : "All changes saved"}
              </span>
              <button
                className="icon-button tools-danger"
                onClick={() => removeNote(selected)}
                aria-label={`Delete ${selected.title || "untitled note"}`}
                title="Delete note"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="notes-editor-content">
              <input
                className="notes-title-input"
                aria-label="Note title"
                placeholder="Untitled note"
                value={selected.title}
                onChange={(event) => editNote({ title: event.target.value })}
                onBlur={() => {
                  if (!selected.title.trim())
                    editNote({ title: "Untitled note" });
                }}
                maxLength={180}
              />
              <div className="notes-context">
                <label htmlFor={projectSelectId}>IN</label>
                <select
                  id={projectSelectId}
                  aria-label="Note project"
                  value={selected.projectId}
                  onChange={(event) =>
                    editNote({ projectId: event.target.value })
                  }
                >
                  <option value="">Just for me</option>
                  {data.projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="notes-body-input"
                aria-label="Note content"
                placeholder="Let your thoughts land here…"
                value={selected.body}
                onChange={(event) => editNote({ body: event.target.value })}
                spellCheck
              />
            </div>
            <footer className="notes-editor-footer">
              <span>
                {selected.body.trim()
                  ? selected.body.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </span>
              <span>
                {storageError
                  ? "Not saved to this device"
                  : "Saved on this device"}
              </span>
            </footer>
          </article>
        ) : (
          <div className="empty-state notes-editor-empty">
            <NotebookPen size={42} strokeWidth={1.1} />
            <h2>No notes here yet.</h2>
            <p>Write something you’d like to keep.</p>
            <button
              className="button"
              onClick={() => create("note", projectId)}
            >
              <Plus size={16} /> Write your first note
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
