"use client";

import { useEffect, useState } from "react";

type SavedEvent = {
  id: string;
  eventId: string;
  name: string;
  date: string | null;
  venue: string | null;
  imageUrl: string | null;
  url?: string | null; // Ticketmaster link
};

export default function PlannerPage() {
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved events
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/saved-events?userId=demo-user");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to load planner:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  // Remove event
  async function handleUnsave(eventId: string) {
    try {
      await fetch("/api/saved-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId: "demo-user" }),
      });

      setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
    } catch (err) {
      console.error("Error unsaving:", err);
    }
  }

  if (loading)
    return <p className="text-center mt-10 text-neutral-300">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Your Saved Events</h1>

      {events.length === 0 && (
        <p className="text-neutral-400 text-center mt-10">
          You don’t have saved events yet.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((ev) => (
          <a
            key={ev.id}
            href={ev.url || "#"} // Ticketmaster link
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl shadow-md bg-white/10 backdrop-blur-lg p-4 border border-white/20 hover:scale-105 transition-transform"
          >
            <img
              src={ev.imageUrl || "/placeholder.png"}
              alt={ev.name}
              className="rounded-lg w-full h-40 object-cover mb-3"
            />

            <h3 className="text-lg font-semibold text-white">{ev.name}</h3>

            <p className="text-neutral-300 text-sm">
              {ev.date || "No date"} • {ev.venue || "No venue"}
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleUnsave(ev.eventId);
              }}
              className="mt-3 px-4 py-2 rounded-lg w-full text-sm bg-red-600 text-white hover:bg-red-700"
            >
              Unsave
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}

