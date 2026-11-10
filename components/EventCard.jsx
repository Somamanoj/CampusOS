import { useState } from "react";

const EVENT_TYPES = [
  { value: "academic", label: "Academic", icon: "📚" },
  { value: "social", label: "Social", icon: "🎉" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "cultural", label: "Cultural", icon: "🌍" },
  { value: "workshop", label: "Workshop", icon: "🔧" },
];

export default function EventCard({
  event,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onRegister,
  onUnregister,
  isDetailMode = false,
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const isPast = new Date(event.date) < new Date(new Date().toDateString());
  const isOngoing = new Date(event.date).toDateString() === new Date().toDateString();
  const isFull = event.registered >= event.capacity;

  const getStatus = () => {
    if (isPast) return { label: "Concluded", className: "concluded" };
    if (isOngoing) return { label: "Ongoing Today", className: "ongoing" };
    return { label: "Upcoming", className: "upcoming" };
  };

  const status = getStatus();

  const handleRegisterClick = () => {
    if (isFull) {
      alert("This event is at full capacity!");
      return;
    }
    onRegister();
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText("");
      setShowAddTask(false);
    }
  };

  if (isDetailMode) {
    return (
      <div>
        <div className="event-details">
          <h3>{event.title}</h3>
          <span className={`event-type-badge ${event.type}`}>
            {EVENT_TYPES.find((t) => t.value === event.type)?.icon} {event.type}
          </span>
        </div>

        <div style={{ marginTop: "16px" }}>
          <span className={`event-status ${status.className}`}>{status.label}</span>
        </div>

        <div className="event-meta" style={{ marginTop: "20px" }}>
          <div className="event-meta-item">
            <span>📅</span>
            <span>
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="event-meta-item">
            <span>🕐</span>
            <span>{event.time}</span>
          </div>

          <div className="event-meta-item">
            <span>📍</span>
            <span>{event.location}</span>
          </div>

          <div className="event-meta-item">
            <span>👤</span>
            <span>{event.organizer}</span>
          </div>

          <div className="event-meta-item">
            <span>👥</span>
            <span>{event.registered} / {event.capacity} registered</span>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            {event.description}
          </p>

          {event.tags && event.tags.length > 0 && (
            <div className="event-tags">
              {event.tags.map((tag) => (
                <span key={tag} className="event-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {event.tasks && event.tasks.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ marginBottom: "10px", fontWeight: 600 }}>✅ Tasks</h4>
            <div className="task-list">
              {event.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                  />
                  <span className="task-text">{task.text}</span>
                  <button
                    className="delete-task"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddTask && (
          <form
            onSubmit={handleAddTaskSubmit}
            style={{ marginBottom: "16px" }}
          >
            <div
              className="form-group"
              style={{ marginBottom: "8px" }}
            >
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary btn-small">
                Add Task
              </button>
              <button
                type="button"
                className="btn-outline btn-small"
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskText("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="event-actions">
          <button
            className="btn-primary btn-full"
            onClick={handleRegisterClick}
          >
            {isFull ? "Event Full" : "Register for Event"}
          </button>
          <button className="btn-outline" onClick={onEdit}>
            Edit Event
          </button>
          <button className="btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`event-card ${isPast ? "past" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <span className={`event-type-badge ${event.type}`}>
        {EVENT_TYPES.find((t) => t.value === event.type)?.icon} {event.type}
      </span>
      <h3 className="event-title">{event.title}</h3>

      <div className="event-meta">
        <div className="event-meta-item">
          <span>📅</span>
          <span>
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="event-meta-item">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
      </div>

      <div className="event-tags">
        {event.tags &&
          event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="event-tag">
              #{tag}
            </span>
          ))}
      </div>

      <div
        style={{
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          {event.registered}/{event.capacity} registered
        </span>
        <span className={`event-status ${status.className}`}>{status.label}</span>
      </div>

      <div className="event-actions">
        <button
          className="btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleRegisterClick();
          }}
        >
          {isFull ? "Full" : "Register"}
        </button>
        <button
          className="btn-outline btn-small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
