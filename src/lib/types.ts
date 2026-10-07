export type ProjectColor = "sage" | "gold" | "lavender";
export interface Project {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  archived?: boolean;
}
export interface Task {
  id: string;
  title: string;
  projectId: string;
  date: string;
  completed: boolean;
}
export interface Note {
  id: string;
  title: string;
  body: string;
  projectId: string;
  updatedAt: string;
}
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  projectId: string;
  description: string;
}
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  context?: string[];
}
export interface Activity {
  id: string;
  text: string;
  at: string;
  read: boolean;
}
export interface AppData {
  version: 1;
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  events: CalendarEvent[];
  messages: Message[];
  activities: Activity[];
  name: string;
}
export type View =
  | "home"
  | "projects"
  | "tools"
  | "tasks"
  | "notes"
  | "schedule"
  | "assistant"
  | "project";
export interface Navigation {
  view: View;
  id?: string;
}
export type CreateKind = "task" | "note" | "project" | "event";
export interface WorkspaceProps {
  data: AppData;
  update: (fn: (data: AppData) => AppData) => void;
  navigate: (view: View, id?: string) => void;
  notify: (message: string, undo?: () => void) => void;
  create: (kind: CreateKind, projectId?: string, date?: string) => void;
  storageError?: string | null;
}
export const WORKSPACE_TIME_ZONE = "Asia/Singapore";

export function getWorkspaceToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WORKSPACE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export const TODAY = getWorkspaceToday();

export function addDays(date: string, offset: number): string {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + offset);
  return next.toISOString().slice(0, 10);
}

export function formatWorkspaceDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  },
): string {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: WORKSPACE_TIME_ZONE,
  }).format(new Date(`${date}T12:00:00Z`));
}

export const uid = () => crypto.randomUUID();
