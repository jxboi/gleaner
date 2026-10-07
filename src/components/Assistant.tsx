import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  CalendarDays,
  Check,
  Copy,
  FileText,
  FolderOpen,
  Leaf,
  Lightbulb,
  Plus,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { TODAY, uid } from "../lib/types";
import type { AppData, Message, WorkspaceProps } from "../lib/types";
import { Modal } from "./Modal";
import "./assistant.css";

interface ContextItem {
  id: string;
  label: string;
  kind: "project" | "note";
  detail: string;
}

const suggestions = [
  { label: "Plan my day", icon: CalendarDays },
  { label: "Help me brainstorm", icon: Lightbulb },
  { label: "Summarize my notes", icon: FileText },
];

function contextOptions(data: AppData): ContextItem[] {
  return [
    ...data.projects
      .filter((project) => !project.archived)
      .map((project) => ({
        id: `project:${project.id}`,
        label: project.name,
        kind: "project" as const,
        detail: project.description || "Project",
      })),
    ...data.notes.map((note) => ({
      id: `note:${note.id}`,
      label: note.title || "Untitled note",
      kind: "note" as const,
      detail:
        note.body.replace(/\s+/g, " ").slice(0, 110) ||
        "A blank page, ready for an idea.",
    })),
  ];
}

function previewReply(prompt: string, data: AppData, context: string[]) {
  const projectIds = context
    .filter((id) => id.startsWith("project:"))
    .map((id) => id.slice(8));
  const noteIds = context
    .filter((id) => id.startsWith("note:"))
    .map((id) => id.slice(5));
  const hasContext = context.length > 0;
  const contextProjectIds = [
    ...projectIds,
    ...data.notes
      .filter((note) => noteIds.includes(note.id))
      .map((note) => note.projectId),
  ].filter(Boolean);
  const tasks = data.tasks.filter(
    (task) =>
      !task.completed &&
      (!hasContext || contextProjectIds.includes(task.projectId)),
  );
  const notes = data.notes.filter(
    (note) =>
      !hasContext ||
      noteIds.includes(note.id) ||
      projectIds.includes(note.projectId),
  );
  const events = data.events.filter(
    (event) =>
      event.date === TODAY &&
      (!hasContext || contextProjectIds.includes(event.projectId)),
  );
  const normalized = prompt.toLowerCase().trim();
  const wantsBrainstorm =
    /\b(brainstorm(?:ing)?|ideas?|think(?:ing)?|explore|creative|creativity)\b/.test(
      normalized,
    );
  const wantsSummary =
    /\b(summari[sz](?:e|ing|ation)|summary|recap|review)\b/.test(normalized) ||
    (!wantsBrainstorm && /\bnotes?\b/.test(normalized));
  const projectName = (id: string) =>
    data.projects.find((project) => project.id === id)?.name;

  if (
    !wantsSummary &&
    !wantsBrainstorm &&
    /\b(plan|today|day|prioriti[sz]e|priorities|to.dos?|tasks?|focus|schedule)\b/.test(
      normalized,
    )
  ) {
    const ordered = [...tasks].sort((a, b) =>
      (a.date || "9999").localeCompare(b.date || "9999"),
    );
    const due = ordered.filter((task) => task.date && task.date <= TODAY);
    const chosen = (due.length ? due : ordered).slice(0, 3);
    if (!chosen.length && !events.length)
      return "There’s some room to breathe. I didn’t find any open to-dos or events for today in this context.\n\nA gentle plan:\n1. Choose one thing that would make today feel worthwhile.\n2. Give it 25 minutes of your full attention.\n3. Leave a little space for a walk, a proper meal, or an unexpected idea.\n\nYou can add your first to-do from My tools whenever you’re ready.";
    const lines = chosen.map(
      (task, index) =>
        `${index + 1}. ${task.title}${projectName(task.projectId) ? ` — ${projectName(task.projectId)}` : ""}${task.date && task.date < TODAY ? " (carried over)" : ""}`,
    );
    return `Let’s give your day a little shape. ${due.length ? `You have ${due.length} open to-do${due.length === 1 ? "" : "s"} due today or earlier${hasContext ? " in this context" : ""}.` : "Nothing is due today, so these could be good next steps."}\n\n${lines.length ? `A small shortlist:\n${lines.join("\n")}\n\n` : ""}${events.length ? `On your calendar today:\n${events.map((event) => `• ${event.time || "Any time"} — ${event.title}`).join("\n")}\n\n` : ""}Start with one task and give it an uninterrupted 25 minutes. A little progress is enough to build on.\n\nThis is a suggested plan; your to-dos and calendar haven’t been changed.`;
  }

  if (wantsSummary) {
    const written = notes.filter((note) => note.body.trim());
    if (!written.length)
      return "There aren’t any written notes in this context yet. When you have a few thoughts down, I can help bring them together here.\n\nA simple place to start:\n• What’s on your mind?\n• What do you already know?\n• What’s the next question worth exploring?\n\nOpen Notes in My tools to capture a first thought.";
    return `Here’s a quick look at ${written.length === 1 ? "your note" : `your ${written.length} notes`}${hasContext ? " in this context" : ""}:\n\n${written
      .slice(0, 5)
      .map((note) => {
        const excerpt = note.body.trim().replace(/\s+/g, " ");
        return `${note.title || "Untitled note"}\n${excerpt.length > 180 ? `${excerpt.slice(0, 177)}…` : excerpt}`;
      })
      .join(
        "\n\n",
      )}${written.length > 5 ? `\n\nPlus ${written.length - 5} more notes in your workspace.` : ""}\n\nA useful next step: pick one thought you want to keep exploring, and turn it into a small to-do. These are excerpts from your saved notes, assembled locally for this preview.`;
  }

  if (wantsBrainstorm) {
    const contextNote = hasContext ? notes[0] : undefined;
    const contextTitle =
      data.projects.find((project) => projectIds.includes(project.id))?.name ||
      contextNote?.title;
    const topic =
      contextTitle ||
      (normalized === "help me brainstorm"
        ? ""
        : prompt.replace(/^(help me |can you |please )/i, "").slice(0, 90));
    const excerpt = contextNote?.body.trim().replace(/\s+/g, " ");
    return `${topic ? `Let’s explore “${topic}”.` : "Let’s make a little room for new ideas."} Start wide, then choose something small enough to try.\n\nThree directions to explore:\n1. Make it simpler. What could you remove and still get the result you want?\n2. Make it more personal. What would make this feel distinctly like you?\n3. Try a tiny version. What could you make, sketch, or test in one afternoon?\n\n${excerpt ? `A starting point from “${contextNote?.title || "Untitled note"}”: “${excerpt.slice(0, 120)}${excerpt.length > 120 ? "…" : ""}”\n\n` : ""}Write down five possibilities without judging them. Then circle the one that makes you curious. Your next step can be an experiment, rather than a commitment.`;
  }

  if (/^(hi|hello|hey|thanks|thank you)[!.\s]*$/i.test(prompt.trim()))
    return `Hello, ${data.name || "there"}. It’s good to have a little space to think.\n\nI can show you a suggested plan from your to-dos, bring together your saved notes, or help you explore an idea. Add a project or note as context to focus the conversation.\n\nWhat would feel useful right now?`;

  return `Let’s start with “${prompt.length > 150 ? `${prompt.slice(0, 147)}…` : prompt}”.\n\nA useful way to work through it:\n1. Name the outcome you’re hoping for in one sentence.\n2. Separate what you know from what you still need to find out.\n3. Choose one small, concrete next step.\n\n${hasContext ? `I have ${projectIds.length ? `${projectIds.length} project${projectIds.length === 1 ? "" : "s"}` : ""}${projectIds.length && noteIds.length ? " and " : ""}${noteIds.length ? `${noteIds.length} note${noteIds.length === 1 ? "" : "s"}` : ""} attached for context. ` : ""}This interface preview uses a few local response patterns. Try “Plan my day”, “Help me brainstorm”, or “Summarize my notes” to explore your workspace. No external actions have been taken.`;
}

export function Assistant({
  data,
  update,
  navigate,
  notify,
  compact = false,
}: WorkspaceProps & { compact?: boolean }) {
  const [draft, setDraft] = useState("");
  const [attached, setAttached] = useState<string[]>([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextDraft, setContextDraft] = useState<string[]>([]);
  const [contextQuery, setContextQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const options = contextOptions(data);
  const attachedOptions = options.filter((option) =>
    attached.includes(option.id),
  );
  const visibleOptions = options.filter((option) =>
    `${option.label} ${option.detail}`
      .toLowerCase()
      .includes(contextQuery.toLowerCase()),
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!compact && data.messages.length)
      end.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [compact, data.messages.length, pendingId]);

  function send(value = draft) {
    const text = value.trim();
    if (!text || pendingRef.current) return;
    const validContext = attachedOptions.map((option) => option.id);
    const user: Message = {
      id: uid(),
      role: "user",
      content: text,
      context: attachedOptions.map(
        (option) =>
          `${option.kind === "project" ? "Project" : "Note"}: ${option.label}`,
      ),
    };
    const answer: Message = {
      id: uid(),
      role: "assistant",
      content: previewReply(text, data, validContext),
    };
    // Save the pair atomically: navigation never drops a reply or leaves a timer-owned message behind.
    update((current) => ({
      ...current,
      messages: [...current.messages, user, answer],
    }));
    setDraft("");
    setAttached([]);
    if (compact) {
      navigate("assistant");
      return;
    }
    pendingRef.current = answer.id;
    setPendingId(answer.id);
    timer.current = setTimeout(() => {
      pendingRef.current = null;
      setPendingId(null);
      timer.current = null;
    }, 700);
    textarea.current?.focus();
  }

  function stopReply() {
    const stoppedId = pendingRef.current;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingRef.current = null;
    setPendingId(null);
    update((current) => ({
      ...current,
      messages: current.messages.filter((message) => message.id !== stoppedId),
    }));
    notify("Reply stopped. Your message is still here.");
    textarea.current?.focus();
  }

  function clearConversation() {
    const previous = data.messages;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingRef.current = null;
    setPendingId(null);
    update((current) => ({ ...current, messages: [] }));
    notify("Conversation cleared.", () =>
      update((current) => ({
        ...current,
        messages: [
          ...previous.filter(
            (message) =>
              !current.messages.some((existing) => existing.id === message.id),
          ),
          ...current.messages,
        ],
      })),
    );
    textarea.current?.focus();
  }

  function openContext() {
    setContextDraft(attachedOptions.map((option) => option.id));
    setContextQuery("");
    setContextOpen(true);
  }

  async function copyReply(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      notify("Reply copied to your clipboard.");
    } catch {
      notify("Clipboard unavailable. Select the reply to copy it.");
    }
  }

  const composer = (
    <form
      className="assistant-composer"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      {attachedOptions.length > 0 && (
        <div className="assistant-context-chips" aria-label="Attached context">
          {attachedOptions.map((option) => (
            <span className="assistant-context-chip" key={option.id}>
              {option.kind === "project" ? (
                <FolderOpen size={13} />
              ) : (
                <FileText size={13} />
              )}
              <span>{option.label}</span>
              <button
                type="button"
                aria-label={`Remove ${option.label} from context`}
                onClick={() =>
                  setAttached((current) =>
                    current.filter((id) => id !== option.id),
                  )
                }
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <textarea
        ref={textarea}
        aria-label="Message Gleaner"
        placeholder={
          compact
            ? `What’s on your mind, ${data.name}?`
            : "Ask Gleaner anything…"
        }
        value={draft}
        rows={compact ? 3 : 2}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            send();
          }
        }}
      />
      <div className="assistant-composer-footer">
        <button
          type="button"
          className="assistant-add-context"
          onClick={openContext}
        >
          <Plus size={17} /> Add context
        </button>
        {!compact && (
          <span className="assistant-key-hint">
            Shift + Enter for a new line
          </span>
        )}
        {pendingId ? (
          <button
            type="button"
            className="assistant-send assistant-stop"
            onClick={stopReply}
            aria-label="Stop reply"
            title="Stop reply"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            className="assistant-send"
            disabled={!draft.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <ArrowUp size={20} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  );

  const prompts = (
    <div className="assistant-suggestions" aria-label="Conversation starters">
      {suggestions.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => send(label)}
          disabled={Boolean(pendingId)}
        >
          <Icon size={17} strokeWidth={1.65} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {compact ? (
        <section className="assistant-card" aria-label="Ask Gleaner">
          {composer}
          {prompts}
        </section>
      ) : (
        <section
          className="assistant-page"
          aria-labelledby="assistant-page-title"
        >
          <header className="assistant-page-header">
            <div>
              <h1 id="assistant-page-title">Your thinking space</h1>
              <p>
                A little help turning what’s on your mind into what comes next.
              </p>
            </div>
            {data.messages.length > 0 && (
              <button
                type="button"
                className="assistant-clear"
                onClick={clearConversation}
              >
                <Trash2 size={15} /> Clear conversation
              </button>
            )}
          </header>
          <div className="assistant-chat">
            <div className="assistant-chat-topline">
              <span>
                <span className="assistant-status-dot" /> Gleaner
              </span>
              <span>Your personal conversation</span>
            </div>
            <div
              className={`assistant-messages${data.messages.length ? "" : " assistant-messages-empty"}`}
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {!data.messages.length ? (
                <div className="assistant-welcome">
                  <div className="assistant-welcome-icon">
                    <Leaf size={30} strokeWidth={1.4} />
                  </div>
                  <h2>A little clarity starts here.</h2>
                  <p>
                    Bring a half-formed idea, a full to-do list,
                    <br />
                    or just yourself. We’ll take it one step at a time.
                  </p>
                  {prompts}
                </div>
              ) : (
                data.messages.map((message) =>
                  message.id === pendingId ? (
                    <div
                      className="assistant-message assistant-message-assistant"
                      key={message.id}
                    >
                      <div className="assistant-avatar">
                        <Leaf size={17} />
                      </div>
                      <div className="assistant-typing" role="status">
                        <span />
                        <span />
                        <span />
                        <span className="assistant-typing-label">
                          Putting a few thoughts together…
                        </span>
                      </div>
                    </div>
                  ) : (
                    <article
                      className={`assistant-message assistant-message-${message.role}`}
                      key={message.id}
                      aria-label={
                        message.role === "user"
                          ? "Your message"
                          : "Gleaner reply"
                      }
                    >
                      <div className="assistant-avatar">
                        {message.role === "assistant" ? (
                          <Leaf size={17} />
                        ) : (
                          data.name.slice(0, 2).toUpperCase() || "ME"
                        )}
                      </div>
                      <div className="assistant-message-body">
                        <div className="assistant-message-name">
                          {message.role === "assistant" ? "Gleaner" : "You"}
                        </div>
                        {message.context && message.context.length > 0 && (
                          <div className="assistant-message-context">
                            {message.context.map((context, index) => (
                              <span key={`${index}-${context}`}>
                                <FileText size={12} />
                                {context}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="assistant-message-text">
                          {message.content}
                        </div>
                        {message.role === "assistant" && (
                          <button
                            className="assistant-copy"
                            type="button"
                            onClick={() => copyReply(message.content)}
                            aria-label="Copy Gleaner reply"
                          >
                            <Copy size={13} />
                            Copy reply
                          </button>
                        )}
                      </div>
                    </article>
                  ),
                )
              )}
              <div ref={end} />
            </div>
            <div className="assistant-chat-compose">
              {composer}
              <p className="assistant-preview-label">
                Interface preview · replies are generated locally
              </p>
            </div>
          </div>
        </section>
      )}
      {contextOpen && (
        <Modal
          title="Give Gleaner a little context"
          onClose={() => setContextOpen(false)}
        >
          <p className="assistant-context-intro">
            Choose a project or note to focus your next message.
          </p>
          <label className="assistant-context-search">
            <Search size={17} />
            <input
              autoFocus
              aria-label="Search context"
              placeholder="Find a project or note…"
              value={contextQuery}
              onChange={(event) => setContextQuery(event.target.value)}
            />
          </label>
          <div className="assistant-context-options">
            {visibleOptions.length ? (
              visibleOptions.map((option) => (
                <button
                  type="button"
                  className={`assistant-context-option${contextDraft.includes(option.id) ? " is-selected" : ""}`}
                  aria-pressed={contextDraft.includes(option.id)}
                  key={option.id}
                  onClick={() =>
                    setContextDraft((current) =>
                      current.includes(option.id)
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id],
                    )
                  }
                >
                  <span
                    className={`assistant-context-kind assistant-context-kind-${option.kind}`}
                  >
                    {option.kind === "project" ? (
                      <FolderOpen size={19} />
                    ) : (
                      <FileText size={19} />
                    )}
                  </span>
                  <span className="assistant-context-option-text">
                    <strong>{option.label}</strong>
                    <span>{option.detail}</span>
                  </span>
                  <span className="assistant-context-check">
                    {contextDraft.includes(option.id) && <Check size={13} />}
                  </span>
                </button>
              ))
            ) : (
              <p className="assistant-context-empty">
                {options.length
                  ? "No matching projects or notes. Try another search."
                  : "Your projects and notes will appear here once you create them."}
              </p>
            )}
          </div>
          <div className="assistant-context-actions">
            <span>
              {contextDraft.length
                ? `${contextDraft.length} selected`
                : "No context selected"}
            </span>
            <button
              className="button"
              type="button"
              onClick={() => {
                setAttached(contextDraft);
                setContextOpen(false);
              }}
            >
              {contextDraft.length ? "Add context" : "Done"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
