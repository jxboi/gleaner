import { useCallback, useEffect, useState } from "react";
import { TODAY, addDays, type AppData, type ProjectColor } from "./types";

const STORAGE_KEY = "gleaner.workspace.v1";
const WRITE_ERROR =
  "Your changes are available in this tab, but your browser could not save them. Please keep this tab open.";
type StoredWorkspace = {
  data: AppData;
  storageError: string | null;
  pendingRecovery: { raw: string; key: string } | null;
  storageBlocked: boolean;
};

function seedWorkspace(): AppData {
  const now = new Date().toISOString();
  return {
    version: 1,
    name: "JX",
    projects: [
      {
        id: "everyday",
        name: "A calmer everyday",
        description: "Small habits, more headspace.",
        color: "sage",
      },
      {
        id: "japan",
        name: "Japan, here I come",
        description: "A little adventure in the making.",
        color: "gold",
      },
      {
        id: "chapter",
        name: "My next chapter",
        description: "Ideas for what comes next.",
        color: "lavender",
      },
    ],
    tasks: [
      {
        id: "task-homepage",
        title: "Sketch out the homepage",
        projectId: "chapter",
        date: TODAY,
        completed: false,
      },
      {
        id: "task-kyoto",
        title: "Book the little Kyoto stay",
        projectId: "japan",
        date: TODAY,
        completed: false,
      },
      {
        id: "task-lunch",
        title: "Take a proper lunch break",
        projectId: "everyday",
        date: TODAY,
        completed: false,
      },
      {
        id: "task-walk",
        title: "Make time for an evening walk",
        projectId: "everyday",
        date: addDays(TODAY, 1),
        completed: false,
      },
      {
        id: "task-meals",
        title: "Plan a few easy meals",
        projectId: "everyday",
        date: addDays(TODAY, 3),
        completed: false,
      },
      {
        id: "task-desk",
        title: "Give the desk a fresh start",
        projectId: "everyday",
        date: addDays(TODAY, 4),
        completed: false,
      },
      {
        id: "task-book",
        title: "Spend half an hour with a book",
        projectId: "everyday",
        date: addDays(TODAY, 5),
        completed: false,
      },
      {
        id: "task-morning",
        title: "Find a gentler morning routine",
        projectId: "everyday",
        date: addDays(TODAY, -2),
        completed: true,
      },
      {
        id: "task-plants",
        title: "Water the little green things",
        projectId: "everyday",
        date: addDays(TODAY, -1),
        completed: true,
      },
      {
        id: "task-inbox",
        title: "Clear a little space in the inbox",
        projectId: "everyday",
        date: addDays(TODAY, -1),
        completed: true,
      },
      {
        id: "task-friend",
        title: "Catch up with an old friend",
        projectId: "everyday",
        date: TODAY,
        completed: true,
      },
      {
        id: "task-tokyo",
        title: "Pick a Tokyo neighborhood to explore",
        projectId: "japan",
        date: addDays(TODAY, 1),
        completed: false,
      },
      {
        id: "task-train",
        title: "Look into the train journey to Kyoto",
        projectId: "japan",
        date: addDays(TODAY, 2),
        completed: false,
      },
      {
        id: "task-food",
        title: "Save a few places to eat",
        projectId: "japan",
        date: addDays(TODAY, 4),
        completed: false,
      },
      {
        id: "task-pack",
        title: "Start a light packing list",
        projectId: "japan",
        date: addDays(TODAY, 6),
        completed: false,
      },
      {
        id: "task-dates",
        title: "Set aside dates for the adventure",
        projectId: "japan",
        date: addDays(TODAY, -3),
        completed: true,
      },
      {
        id: "task-wishlist",
        title: "Make a Japan wishlist",
        projectId: "japan",
        date: addDays(TODAY, -1),
        completed: true,
      },
      {
        id: "task-intro",
        title: "Write a short introduction",
        projectId: "chapter",
        date: addDays(TODAY, 3),
        completed: false,
      },
      {
        id: "task-ideas",
        title: "Gather ideas for what comes next",
        projectId: "chapter",
        date: addDays(TODAY, -4),
        completed: true,
      },
      {
        id: "task-inspiration",
        title: "Collect a little visual inspiration",
        projectId: "chapter",
        date: addDays(TODAY, -2),
        completed: true,
      },
      {
        id: "task-focus",
        title: "Choose one thing to start with",
        projectId: "chapter",
        date: addDays(TODAY, -1),
        completed: true,
      },
    ],
    notes: [
      {
        id: "saved",
        title: "A few things worth saving",
        body: "Good things grow a little at a time.\n\nA place for little discoveries, good ideas, and reminders to come back to.\n\n• Make a little room for the things that matter.\n• Start small. Keep going.\n• A proper lunch break counts as progress, too.",
        projectId: "everyday",
        updatedAt: now,
      },
      {
        id: "japan-wishlist",
        title: "The Japan wishlist",
        body: "A little adventure in the making.\n\nKyoto\nA quiet morning walk along the Philosopher’s Path. A small guesthouse. Tea somewhere lovely.\n\nTokyo\nBookshops, neighborhood cafés, and a day with no particular plan.\n\nLeave some room for getting pleasantly lost.",
        projectId: "japan",
        updatedAt: now,
      },
    ],
    events: [
      {
        id: "reset",
        title: "A little weekly reset",
        date: addDays(TODAY, 2),
        time: "16:00",
        projectId: "everyday",
        description:
          "A little time to clear the loose ends, reflect on the week, and make room for what’s next.",
      },
    ],
    messages: [],
    activities: [
      {
        id: "welcome",
        text: "Welcome to your little corner of Gleaner. Make yourself at home.",
        at: now,
        read: false,
      },
      {
        id: "preview",
        text: "This is your interface preview. Your projects, tasks, notes, and events are saved in this browser; assistant replies are simulated.",
        at: now,
        read: false,
      },
    ],
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const hasStrings = (value: Record<string, unknown>, fields: string[]) =>
  fields.every((field) => isString(value[field]));
const isDate = (value: unknown) => {
  if (!isString(value)) return false;
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};
const hasId = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && isString(value.id) && value.id.length > 0;
const isList = (value: unknown, valid: (item: unknown) => boolean) =>
  Array.isArray(value) &&
  value.every(valid) &&
  new Set(value.map((item) => item.id)).size === value.length;

function isWorkspace(value: unknown): value is AppData {
  if (!isRecord(value) || value.version !== 1 || !isString(value.name))
    return false;
  return (
    isList(
      value.projects,
      (project) =>
        hasId(project) &&
        hasStrings(project, ["name", "description"]) &&
        ["sage", "gold", "lavender"].includes(project.color as ProjectColor) &&
        (project.archived === undefined ||
          typeof project.archived === "boolean"),
    ) &&
    isList(
      value.tasks,
      (task) =>
        hasId(task) &&
        hasStrings(task, ["title", "projectId"]) &&
        isDate(task.date) &&
        typeof task.completed === "boolean",
    ) &&
    isList(
      value.notes,
      (note) =>
        hasId(note) &&
        hasStrings(note, ["title", "body", "projectId", "updatedAt"]) &&
        Number.isFinite(Date.parse(note.updatedAt as string)),
    ) &&
    isList(
      value.events,
      (event) =>
        hasId(event) &&
        hasStrings(event, ["title", "projectId", "description", "time"]) &&
        isDate(event.date) &&
        event.date !== "" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time as string),
    ) &&
    isList(
      value.messages,
      (message) =>
        hasId(message) &&
        hasStrings(message, ["content"]) &&
        ["user", "assistant"].includes(message.role as string) &&
        (message.context === undefined ||
          (Array.isArray(message.context) && message.context.every(isString))),
    ) &&
    isList(
      value.activities,
      (activity) =>
        hasId(activity) &&
        hasStrings(activity, ["text", "at"]) &&
        Number.isFinite(Date.parse(activity.at as string)) &&
        typeof activity.read === "boolean",
    )
  );
}

function readWorkspace(): StoredWorkspace {
  let saved: string | null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // A failed read must never be followed by writing the seed over unknown saved data.
    return {
      data: seedWorkspace(),
      storageError:
        "Browser storage could not be read. Your saved data has been left untouched; this preview is only available in this tab. Reload to retry.",
      pendingRecovery: null,
      storageBlocked: true,
    };
  }
  const cleanState = {
    storageError: null,
    pendingRecovery: null,
    storageBlocked: false,
  };
  if (!saved) return { data: seedWorkspace(), ...cleanState };
  try {
    const parsed: unknown = JSON.parse(saved);
    if (isWorkspace(parsed)) return { data: parsed, ...cleanState };
  } catch {
    // Malformed JSON follows the same recovery path as an unsupported schema.
  }
  return {
    data: seedWorkspace(),
    storageError:
      "The saved workspace could not be read. Your previous data will be preserved before saving this fresh preview.",
    pendingRecovery: {
      raw: saved,
      key: `${STORAGE_KEY}.recovery.${Date.now()}`,
    },
    storageBlocked: false,
  };
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<StoredWorkspace>(readWorkspace);
  const update = useCallback((updater: (data: AppData) => AppData) => {
    setWorkspace((current) => ({ ...current, data: updater(current.data) }));
  }, []);

  useEffect(() => {
    if (workspace.storageBlocked) return;
    try {
      // Keep the original bytes recoverable. If the backup fails, leave the main key alone.
      if (workspace.pendingRecovery)
        localStorage.setItem(
          workspace.pendingRecovery.key,
          workspace.pendingRecovery.raw,
        );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace.data));
      setWorkspace((current) =>
        current.storageError || current.pendingRecovery
          ? { ...current, storageError: null, pendingRecovery: null }
          : current,
      );
    } catch {
      setWorkspace((current) =>
        current.storageError === WRITE_ERROR
          ? current
          : { ...current, storageError: WRITE_ERROR },
      );
    }
  }, [workspace.data, workspace.pendingRecovery, workspace.storageBlocked]);

  return { data: workspace.data, update, storageError: workspace.storageError };
}
