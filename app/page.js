"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useFreebuffUser,
  SignInWithFreebuff,
  SignOutButton,
} from "@freebuff/auth/react";
import EventForm from "../components/EventForm";
import EventCard from "../components/EventCard";
import styles from "./page.module.css";

const STORAGE_KEY = "campusEvents";

const initialEvents = [
  {
    id: "1",
    title: "Spring Semester Kickoff",
    description:
      "Welcome back celebration with live music, food vendors, and club booths. Meet your classmates and learn about campus organizations.",
    type: "social",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    location: "Student Union Plaza",
    organizer: "Student Activities Office",
    capacity: 500,
    registered: 324,
    tags: ["welcome", "music", "food"],
    tasks: [
      { id: "t1", text: "Set up stage and sound system", completed: false },
      { id: "t2", text: "Arrange vendor tables", completed: true },
      { id: "t3", text: "Prepare welcome packets", completed: false },
    ],
    createdAt: Date.now() - 86400000 * 5,
    userId: null,
  },
  {
    id: "2",
    title: "Calculus II Workshop",
    description:
      "Interactive problem-solving session covering integration techniques and applications. Bring your toughest problems!",
    type: "workshop",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time: "2:00 PM - 4:00 PM",
    location: "Science Building, Room 201",
    organizer: "Math Department",
    capacity: 30,
    registered: 18,
    tags: ["math", "study", "tutoring"],
    tasks: [
      { id: "t4", text: "Prepare practice problems", completed: true },
      { id: "t5", text: "Set up whiteboard", completed: false },
    ],
    createdAt: Date.now() - 86400000 * 3,
    userId: null,
  },
  {
    id: "3",
    title: "Intramural Soccer Championship",
    description:
      "Final match of the fall intramural season. Come cheer for your favorite team!",
    type: "sports",
    date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    time: "3:00 PM",
    location: "Main Athletic Field",
    organizer: "Rec Sports",
    capacity: 200,
    registered: 45,
    tags: ["soccer", "championship", "competition"],
    tasks: [
      { id: "t6", text: "Prepare field and goals", completed: false },
      { id: "t7", text: "Set up spectator seating", completed: false },
      { id: "t8", text: "Arrange referee schedule", completed: true },
    ],
    createdAt: Date.now() - 86400000 * 10,
    userId: null,
  },
  {
    id: "4",
    title: "International Food Festival",
    description:
      "Celebrate cultural diversity with dishes from around the world. Each table represents a different country with authentic cuisine.",
    type: "cultural",
    date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    time: "11:00 AM - 7:00 PM",
    location: "Campus Green",
    organizer: "International Student Association",
    capacity: 800,
    registered: 156,
    tags: ["food", "culture", "diversity"],
    tasks: [
      { id: "t9", text: "Book food vendors", completed: true },
      { id: "t10", text: "Create event map", completed: false },
      { id: "t11", text: "Arrange entertainment", completed: false },
    ],
    createdAt: Date.now() - 86400000 * 14,
    userId: null,
  },
  {
    id: "5",
    title: "Research Symposium 2026",
    description:
      "Annual showcase of undergraduate research projects. Students present their work through posters and short presentations.",
    type: "academic",
    date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    time: "9:00 AM - 5:00 PM",
    location: "Library Conference Center",
    organizer: "Office of Research",
    capacity: 300,
    registered: 278,
    tags: ["research", "posters", "presentations"],
    tasks: [
      { id: "t12", text: "Set up poster boards", completed: true },
      { id: "t13", text: "Prepare presentation schedule", completed: true },
    ],
    createdAt: Date.now() - 86400000 * 30,
    userId: null,
  },
];

export default function Page() {
  const { user, isLoading, refresh } = useFreebuffUser();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const prevUserRef = useRef(null);

  // Load events from localStorage after mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        setEvents(initialEvents);
      }
    } catch (e) {
      setEvents(initialEvents);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, isLoaded]);

  // Re-fetch user when page becomes visible again (e.g., after sign out redirect)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refresh]);

  // Detect user change and re-fetch
  useEffect(() => {
    if (prevUserRef.current !== user) {
      prevUserRef.current = user;
    }
  }, [user]);

  const filterEvents = (tab) => {
    if (!isLoaded) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events
      .filter((e) => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);

        if (tab === "past") return eventDate < now;
        if (tab === "ongoing") {
          const eventEnd = new Date(eventDate);
          eventEnd.setHours(23, 59, 59, 999);
          return eventDate <= now && eventEnd >= now;
        }
        return eventDate >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const displayedEvents = filterEvents(activeTab);

  const getCounts = () => {
    if (!isLoaded) return { upcoming: 0, ongoing: 0, past: 0 };
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let upcoming = 0,
      ongoing = 0,
      past = 0;

    events.forEach((e) => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < now) past++;
      else if (eventDate.toDateString() === now.toDateString()) ongoing++;
      else upcoming++;
    });

    return { upcoming, ongoing, past };
  };

  const counts = getCounts();

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      registered: 0,
      tasks: [],
      createdAt: Date.now(),
      userId: user?.sub || null,
    };
    setEvents([newEvent, ...events]);
    setShowForm(false);
  };

  const handleEditEvent = (eventData) => {
    setEvents(
      events.map((e) =>
        e.id === editingEvent.id ? { ...e, ...eventData } : e
      )
    );
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Delete this event? This cannot be undone.")) {
      setEvents(events.filter((e) => e.id !== id));
      setSelectedEvent(null);
    }
  };

  const handleToggleTask = (eventId, taskId) => {
    setEvents(
      events.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          tasks: e.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  };

  const handleAddTask = (eventId, text) => {
    const newTask = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setEvents(
      events.map((e) => {
        if (e.id !== eventId) return e;
        return { ...e, tasks: [...e.tasks, newTask] };
      })
    );
  };

  const handleDeleteTask = (eventId, taskId) => {
    setEvents(
      events.map((e) => {
        if (e.id !== eventId) return e;
        return { ...e, tasks: e.tasks.filter((t) => t.id !== taskId) };
      })
    );
  };

  const handleRegister = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    if (event.registered >= event.capacity) {
      alert("This event is at full capacity!");
      return;
    }

    setEvents(
      events.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          registered: e.registered + 1,
        };
      })
    );
    setSelectedEvent(null);
  };

  const handleUnregister = (eventId) => {
    setEvents(
      events.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          registered: Math.max(0, e.registered - 1),
        };
      })
    );
    setSelectedEvent(null);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  if (!isLoaded) {
    return (
      <div className="app-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>🎓 Campus Event Manager</h1>
          <p>Organize, discover, and manage campus events</p>
        </div>
        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <SignOutButton>
                <button className="btn-outline btn-small">Sign Out</button>
              </SignOutButton>
            </div>
          ) : (
            <SignInWithFreebuff>
              <button className="btn-primary">Sign In / Sign Up</button>
            </SignInWithFreebuff>
          )}
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 Upcoming
          {counts.upcoming > 0 && (
            <span className="count">{counts.upcoming}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === "ongoing" ? "active" : ""}`}
          onClick={() => setActiveTab("ongoing")}
        >
          🔥 Ongoing Today
          {counts.ongoing > 0 && (
            <span className="count">{counts.ongoing}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          ✅ Past Events
          {counts.past > 0 && <span className="count">{counts.past}</span>}
        </button>
        <button
          className="tab-btn"
          onClick={() => {
            if (!user) {
              setShowAuthModal(true);
              return;
            }
            setEditingEvent(null);
            setShowForm(true);
          }}
          style={{ marginLeft: "auto" }}
        >
          + New Event
        </button>
      </div>

      {displayedEvents.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No events found</h3>
          <p>
            {activeTab === "upcoming"
              ? "There are no upcoming events. Create one!"
              : activeTab === "ongoing"
              ? "No events are happening today."
              : "No past events to show."}
          </p>
          {activeTab === "upcoming" && user && (
            <button
              className="btn-primary"
              onClick={() => {
                setEditingEvent(null);
                setShowForm(true);
              }}
            >
              Create Your First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {displayedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedEvent?.id === event.id}
              onClick={() => setSelectedEvent(event)}
              onEdit={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                openEditModal(event);
              }}
              onDelete={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                handleDeleteEvent(event.id);
              }}
              onToggleTask={(taskId) =>
                handleToggleTask(event.id, taskId)
              }
              onAddTask={(text) => handleAddTask(event.id, text)}
              onDeleteTask={(taskId) =>
                handleDeleteTask(event.id, taskId)
              }
              onRegister={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                handleRegister(event.id);
              }}
              onUnregister={() => handleUnregister(event.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <EventForm
          event={editingEvent}
          onSave={editingEvent ? handleEditEvent : handleAddEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {selectedEvent && (
        <div
          className="modal"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Event Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            <EventCard
              event={selectedEvent}
              isSelected={true}
              onClick={() => {}}
              onEdit={() => {
                setSelectedEvent(null);
                openEditModal(selectedEvent);
              }}
              onDelete={() => handleDeleteEvent(selectedEvent.id)}
              onToggleTask={(taskId) =>
                handleToggleTask(selectedEvent.id, taskId)
              }
              onAddTask={(text) => handleAddTask(selectedEvent.id, text)}
              onDeleteTask={(taskId) =>
                handleDeleteTask(selectedEvent.id, taskId)
              }
              onRegister={() => handleRegister(selectedEvent.id)}
              onUnregister={() => handleUnregister(selectedEvent.id)}
              isDetailMode={true}
            />
          </div>
        </div>
      )}

      {showAuthModal && (
        <div
          className="modal"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="modal-content auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Sign In Required</h2>
              <button
                className="close-btn"
                onClick={() => setShowAuthModal(false)}
              >
                ×
              </button>
            </div>
            <div className="auth-content">
              <p>
                Please sign in to create, edit, or register for events.
              </p>
              <SignInWithFreebuff>
                <button className="btn-primary">
                  Continue with Freebuff
                </button>
              </SignInWithFreebuff>
              <button
                className="btn-outline"
                style={{ marginTop: "8px" }}
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
