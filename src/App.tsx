import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Search as SearchIcon,
  Leaf,
  X,
  Check,
  Plus,
  CheckSquare,
  FileText,
  Folder,
  CalendarDays,
  ArrowLeft,
  Download,
  Sprout,
} from "lucide-react";
import { useWorkspace } from "./lib/store";
import type { CreateKind, Navigation, View, WorkspaceProps } from "./lib/types";
import { Modal } from "./components/Modal";
import { CreateDialog } from "./components/CreateDialog";
import { Search } from "./components/Search";
import { Assistant } from "./components/Assistant";
import { Home } from "./views/Home";
import { Projects, ProjectDetail } from "./views/Projects";
import { Tools } from "./views/Tools";
import { TasksView } from "./views/TasksView";
import { NotesView } from "./views/NotesView";
import { ScheduleView } from "./views/ScheduleView";

const validViews: View[] = [
  "home",
  "projects",
  "project",
  "tools",
  "tasks",
  "notes",
  "schedule",
  "assistant",
];
function readLocation(): Navigation {
  const [view, id] = location.hash.replace("#/", "").split("/");
  return {
    view: validViews.includes(view as View) ? (view as View) : "home",
    id: id ? safeDecode(id) : undefined,
  };
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function App() {
  const { data, update, storageError } = useWorkspace();
  const [navigation, setNavigation] = useState<Navigation>(readLocation);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [creation, setCreation] = useState<{
    kind: CreateKind;
    projectId?: string;
    date?: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const navigate = useCallback((view: View, id?: string) => {
    const hash = `#/${view}${id ? `/${encodeURIComponent(id)}` : ""}`;
    if (location.hash !== hash) location.hash = hash;
    setNavigation({ view, id });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const notify = useCallback((message: string, undo?: () => void) => {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 9000 : 4200);
  }, []);
  const create = useCallback(
    (kind: CreateKind, projectId?: string, date?: string) => {
      setQuickOpen(false);
      setCreation({ kind, projectId, date });
    },
    [],
  );
  useEffect(() => {
    const onHash = () => setNavigation(readLocation());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    document.title =
      navigation.view === "home"
        ? "Gleaner — a little clarity"
        : `${({ projects: "Your projects", project: data.projects.find((p) => p.id === navigation.id)?.name || "Project", tools: "Your tools", tasks: "To-dos", notes: "Notes", schedule: "Schedule", assistant: "Your assistant" } as Record<string, string>)[navigation.view]} · Gleaner`;
  }, [navigation, data.projects]);
  const props: WorkspaceProps = {
    data,
    update,
    navigate,
    notify,
    create,
    storageError,
  };
  const unread = data.activities.filter((a) => !a.read).length;
  const activeNav =
    navigation.view === "home"
      ? "home"
      : ["project", "projects"].includes(navigation.view)
        ? "projects"
        : "tools";
  function exportWorkspace() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gleaner-workspace.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Your workspace has been downloaded.");
  }
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <div className="header-inner">
          <button
            className="brand"
            aria-label="Gleaner home"
            onClick={() => navigate("home")}
          >
            <Leaf size={34} strokeWidth={1.35} />
            <span>gleaner</span>
          </button>
          <nav className="main-nav" aria-label="Main navigation">
            {(
              [
                { id: "home", label: "Home" },
                { id: "projects", label: "My projects" },
                { id: "tools", label: "My tools" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                className={activeNav === item.id ? "active" : ""}
                aria-current={activeNav === item.id ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="search-trigger"
              aria-label="Search workspace"
              title="Search (⌘ K)"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon size={21} strokeWidth={1.6} />
            </button>
            <button
              className="icon-button"
              aria-label="Quick add"
              title="Quick add"
              onClick={() => setQuickOpen(true)}
            >
              <Plus size={22} strokeWidth={1.6} />
            </button>
            <button
              className="icon-button notification-trigger"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              title="Notifications"
              onClick={() => setActivityOpen(true)}
            >
              <Bell size={22} strokeWidth={1.6} />
              {unread > 0 && <span className="unread-dot" />}
            </button>
            <button
              className="avatar"
              aria-label="Your workspace settings"
              onClick={() => setProfileOpen(true)}
            >
              {data.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>
      </header>
      {storageError && (
        <div className="storage-error" role="alert">
          {storageError}{" "}
          <button onClick={exportWorkspace}>Download a backup</button>
        </div>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className={`app-main ${navigation.view === "home" ? "" : "inner-page"}`}
      >
        {!["home", "projects", "project", "tools"].includes(
          navigation.view,
        ) && (
          <button
            className="text-button back-link"
            onClick={() => navigate("tools")}
          >
            <ArrowLeft size={16} />
            My tools
          </button>
        )}
        {navigation.view === "home" && <Home {...props} />}
        {navigation.view === "projects" && <Projects {...props} />}
        {navigation.view === "project" && (
          <ProjectDetail key={navigation.id} {...props} id={navigation.id} />
        )}
        {navigation.view === "tools" && <Tools {...props} />}
        {navigation.view === "tasks" && (
          <TasksView {...props} selectedId={navigation.id} />
        )}
        {navigation.view === "notes" && (
          <NotesView {...props} selectedId={navigation.id} />
        )}
        {navigation.view === "schedule" && (
          <ScheduleView {...props} selectedId={navigation.id} />
        )}
        {navigation.view === "assistant" && <Assistant {...props} />}
      </main>
      {searchOpen && (
        <Search
          data={data}
          navigate={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {creation && (
        <CreateDialog
          {...props}
          {...creation}
          onClose={() => setCreation(null)}
        />
      )}
      {quickOpen && (
        <Modal
          title="Make a little space for something new."
          onClose={() => setQuickOpen(false)}
        >
          <p className="modal-intro">
            Capture it now. Come back to it when you’re ready.
          </p>
          <div className="quick-options">
            {(
              [
                {
                  kind: "task",
                  label: "A to-do",
                  description: "One less thing to keep in your head.",
                  Icon: CheckSquare,
                },
                {
                  kind: "note",
                  label: "A note",
                  description: "A good idea, or just a passing thought.",
                  Icon: FileText,
                },
                {
                  kind: "event",
                  label: "An event",
                  description: "Something to make time for.",
                  Icon: CalendarDays,
                },
                {
                  kind: "project",
                  label: "A project",
                  description: "A home for your next little adventure.",
                  Icon: Folder,
                },
              ] as const
            ).map((option) => (
              <button key={option.kind} onClick={() => create(option.kind)}>
                <span className={`quick-option-icon ${option.kind}`}>
                  <option.Icon size={22} strokeWidth={1.5} />
                </span>
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <Plus size={18} />
              </button>
            ))}
          </div>
        </Modal>
      )}
      {activityOpen && (
        <Modal title="A little update" onClose={() => setActivityOpen(false)}>
          <div className="activity-toolbar">
            <span className="muted">What’s happening in your workspace.</span>
            {unread > 0 && (
              <button
                className="text-button"
                onClick={() =>
                  update((d) => ({
                    ...d,
                    activities: d.activities.map((a) => ({ ...a, read: true })),
                  }))
                }
              >
                <Check size={15} />
                Mark all read
              </button>
            )}
          </div>
          <div className="activity-list">
            {data.activities.map((activity) => (
              <button
                key={activity.id}
                className={`activity-item ${!activity.read ? "unread" : ""}`}
                onClick={() =>
                  update((d) => ({
                    ...d,
                    activities: d.activities.map((a) =>
                      a.id === activity.id ? { ...a, read: true } : a,
                    ),
                  }))
                }
              >
                <span className="activity-icon">
                  <Sprout size={20} />
                </span>
                <span>
                  {activity.text}
                  <small>
                    {new Date(activity.at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </span>
                {!activity.read && <span className="activity-dot" />}
              </button>
            ))}
          </div>
          {!data.activities.length && (
            <div className="empty-state">
              All quiet here. Your next steps will show up as you go.
            </div>
          )}
        </Modal>
      )}
      {profileOpen && (
        <Modal title="Your little corner" onClose={() => setProfileOpen(false)}>
          <ProfileSettings {...props} exportWorkspace={exportWorkspace} />
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Check size={17} />
          </span>
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              className="toast-undo"
              onClick={() => {
                toast.undo?.();
                setToast(null);
                clearTimeout(toastTimer.current);
              }}
            >
              Undo
            </button>
          )}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

function ProfileSettings({
  data,
  update,
  notify,
  exportWorkspace,
}: WorkspaceProps & { exportWorkspace: () => void }) {
  const [name, setName] = useState(data.name);
  return (
    <div className="profile-settings">
      <div className="profile-card">
        <span className="avatar large">
          {data.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <strong>Your personal workspace</strong>
          <p>A little more you, a little less noise.</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          update((d) => ({ ...d, name: name.trim() }));
          notify("Looking good. Your name is saved.");
        }}
      >
        <label htmlFor="display-name">What should we call you?</label>
        <div className="profile-name-row">
          <input
            id="display-name"
            autoComplete="given-name"
            maxLength={24}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="button primary"
            disabled={!name.trim() || name.trim() === data.name}
          >
            Save
          </button>
        </div>
      </form>
      <div className="profile-local">
        <h3>Right here, on this device.</h3>
        <p>
          Your projects, notes, and plans are saved in this browser. Download a
          copy whenever you like.
        </p>
        <button className="button" onClick={exportWorkspace}>
          <Download size={17} />
          Download your workspace
        </button>
      </div>
      <p className="profile-preview">
        Gleaner · Interface preview
        <br />
        AI replies are simulated locally. No accounts or cloud sync yet.
      </p>
    </div>
  );
}
