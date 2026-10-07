import { useId, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { TODAY, type CalendarEvent, type WorkspaceProps } from "../lib/types";
import "./tools.css";

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function prettyTime(time: string) {
  if (!time) return "All day";
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ScheduleView({
  data,
  update,
  notify,
  create,
  projectId,
  selectedId,
}: WorkspaceProps & { projectId?: string; selectedId?: string }) {
  const linkedEvent = data.events.find((event) => event.id === selectedId);
  const [month, setMonth] = useState(
    () => new Date(`${linkedEvent?.date || TODAY}T12:00:00`),
  );
  const [selectedDate, setSelectedDate] = useState(linkedEvent?.date || TODAY);
  const [editing, setEditing] = useState<CalendarEvent | null>(
    () => linkedEvent || null,
  );
  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId);
    setEditing(linkedEvent || null);
    if (linkedEvent) {
      setSelectedDate(linkedEvent.date);
      setMonth(new Date(`${linkedEvent.date}T12:00:00`));
    }
  }
  const formId = useId();
  const events = data.events.filter(
    (event) => !projectId || event.projectId === projectId,
  );
  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(1 - ((monthStart.getDay() + 6) % 7));
  const numberOfDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const gridLength =
    Math.ceil((((monthStart.getDay() + 6) % 7) + numberOfDays) / 7) * 7;
  const days = Array.from({ length: gridLength }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });
  const selected = new Date(`${selectedDate}T12:00:00`);
  const project = data.projects.find((item) => item.id === projectId);

  function changeMonth(direction: number) {
    const next = new Date(
      month.getFullYear(),
      month.getMonth() + direction,
      1,
      12,
    );
    setMonth(next);
    setSelectedDate(dateString(next));
  }

  function saveEvent(event: FormEvent) {
    event.preventDefault();
    if (!editing?.title.trim() || !editing.date || !editing.time) return;
    const saved = { ...editing, title: editing.title.trim() };
    update((current) => ({
      ...current,
      events: current.events.map((item) =>
        item.id === saved.id ? saved : item,
      ),
    }));
    setSelectedDate(saved.date);
    setMonth(new Date(`${saved.date}T12:00:00`));
    setEditing(null);
    notify("Your plans are updated.");
  }

  function removeEvent(event: CalendarEvent) {
    update((current) => ({
      ...current,
      events: current.events.filter((item) => item.id !== event.id),
    }));
    setEditing(null);
    notify("Event deleted.", () =>
      update((current) => ({
        ...current,
        events: current.events.some((item) => item.id === event.id)
          ? current.events
          : [...current.events, event],
      })),
    );
  }

  return (
    <section
      className="tool-view schedule-view"
      aria-labelledby="schedule-heading"
    >
      <header className="page-heading tool-heading">
        <div>
          <h1 id="schedule-heading">Your schedule</h1>
          <p className="muted">
            {project
              ? `What’s coming up for ${project.name}.`
              : "A home for your plans, with room to breathe."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => create("event", projectId, selectedDate)}
        >
          <Plus size={17} /> New event
        </button>
      </header>
      <div className="schedule-workspace">
        <div className="schedule-calendar tools-paper">
          <div className="schedule-calendar-header">
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div>
              <button
                className="button schedule-today-button"
                onClick={() => {
                  setMonth(new Date(`${TODAY}T12:00:00`));
                  setSelectedDate(TODAY);
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="icon-button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
          <div className="schedule-weekdays" aria-hidden="true">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div
            className="schedule-grid"
            aria-label={`${month.toLocaleDateString("en-US", { month: "long", year: "numeric" })} calendar`}
          >
            {days.map((day) => {
              const date = dateString(day);
              const dayEvents = events
                .filter((event) => event.date === date)
                .sort((a, b) => a.time.localeCompare(b.time));
              return (
                <button
                  className={`schedule-day${day.getMonth() !== month.getMonth() ? " is-outside" : ""}${date === selectedDate ? " is-selected" : ""}${date === TODAY ? " is-today" : ""}`}
                  key={date}
                  aria-label={`${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                  aria-pressed={date === selectedDate}
                  onClick={() => {
                    setSelectedDate(date);
                    if (day.getMonth() !== month.getMonth())
                      setMonth(new Date(day));
                  }}
                >
                  <span className="schedule-day-number">{day.getDate()}</span>
                  <span className="schedule-day-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <span
                        className={`schedule-event-tag ${data.projects.find((item) => item.id === event.projectId)?.color || "sage"}`}
                        key={event.id}
                      >
                        <span />
                        {event.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="schedule-more">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="schedule-mobile-dot" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="schedule-calendar-footer">
            <span className="schedule-today-key">
              <span /> Today
            </span>
            <span>Select a day to see your plans</span>
          </div>
        </div>
        <aside className="schedule-agenda" aria-label="Events on selected day">
          <div className="schedule-agenda-heading">
            <span className="tool-eyebrow">
              {selectedDate === TODAY
                ? "TODAY"
                : selected
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .toUpperCase()}
            </span>
            <h2>
              {selected.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </h2>
            <p className="muted">
              {selectedEvents.length
                ? `${selectedEvents.length} thing${selectedEvents.length === 1 ? "" : "s"} to look forward to.`
                : "A little space in your day."}
            </p>
          </div>
          <div className="schedule-agenda-list">
            {selectedEvents.map((event) => {
              const eventProject = data.projects.find(
                (item) => item.id === event.projectId,
              );
              return (
                <button
                  className="schedule-agenda-event"
                  key={event.id}
                  onClick={() => setEditing({ ...event })}
                >
                  <span className="schedule-event-time">
                    <Clock3 size={13} />
                    {prettyTime(event.time)}
                  </span>
                  <strong>{event.title}</strong>
                  {event.description && (
                    <span className="schedule-event-description">
                      {event.description}
                    </span>
                  )}
                  <span className="schedule-event-project">
                    <span
                      className={`tools-project-dot ${eventProject?.color || "sage"}`}
                    />
                    {eventProject?.name || "Just for me"}
                  </span>
                  <ChevronRight size={16} className="schedule-event-arrow" />
                </button>
              );
            })}
          </div>
          {!selectedEvents.length && (
            <div className="schedule-free-day">
              <Sun size={38} strokeWidth={1.2} />
              <p>No events planned for this day.</p>
            </div>
          )}
          <button
            className="text-button schedule-add-event"
            onClick={() => create("event", projectId, selectedDate)}
          >
            <Plus size={16} /> Add something to this day
          </button>
        </aside>
      </div>

      {editing && (
        <Modal title="Make a little time" onClose={() => setEditing(null)}>
          <form className="tools-form form-stack" onSubmit={saveEvent}>
            <label className="form-field" htmlFor={`${formId}-title`}>
              Event name
              <input
                id={`${formId}-title`}
                autoFocus
                required
                maxLength={180}
                value={editing.title}
                onChange={(event) =>
                  setEditing({ ...editing, title: event.target.value })
                }
              />
            </label>
            <div className="tools-form-row">
              <label className="form-field" htmlFor={`${formId}-date`}>
                Date
                <input
                  id={`${formId}-date`}
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  required
                  value={editing.date}
                  onChange={(event) =>
                    setEditing({ ...editing, date: event.target.value })
                  }
                />
              </label>
              <label className="form-field" htmlFor={`${formId}-time`}>
                Time
                <input
                  id={`${formId}-time`}
                  type="time"
                  required
                  value={editing.time}
                  onChange={(event) =>
                    setEditing({ ...editing, time: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="form-field" htmlFor={`${formId}-project`}>
              Project
              <select
                id={`${formId}-project`}
                value={editing.projectId}
                onChange={(event) =>
                  setEditing({ ...editing, projectId: event.target.value })
                }
              >
                <option value="">Just for me</option>
                {data.projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field" htmlFor={`${formId}-description`}>
              <span>
                A few details <span className="muted">(optional)</span>
              </span>
              <textarea
                id={`${formId}-description`}
                rows={3}
                placeholder="Anything you’d like to remember…"
                value={editing.description}
                onChange={(event) =>
                  setEditing({ ...editing, description: event.target.value })
                }
              />
            </label>
            <div className="tools-modal-actions">
              <button
                className="text-button tools-danger"
                type="button"
                onClick={() => removeEvent(editing)}
              >
                <Trash2 size={15} /> Delete
              </button>
              <div>
                <button
                  className="button"
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  type="submit"
                  disabled={
                    !editing.title.trim() || !editing.date || !editing.time
                  }
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
