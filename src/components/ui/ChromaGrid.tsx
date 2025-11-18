"use client";

type EventItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  image: string;
  url: string;     // Ticketmaster link
  venue?: string;
};

type Props = {
  items: EventItem[];
  savedEventIds: Set<string>;
  onToggleSave: (id: string) => void;
};

export default function ChromaGrid({ items, savedEventIds, onToggleSave }: Props) {
  async function handleSave(item: EventItem) {
    try {
      await fetch("/api/saved-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          eventId: item.id,
          name: item.name,
          date: item.date,
          venue: item.venue || "",
          imageUrl: item.image,
          url: item.url
        }),
      });
      onToggleSave(item.id);
    } catch (err) {
      console.error("Save error:", err);
    }
  }

  async function handleUnsave(eventId: string) {
    try {
      await fetch("/api/saved-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          eventId,
        }),
      });
      onToggleSave(eventId);
    } catch (err) {
      console.error("Unsave error:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
      {items.map((item) => {
        const isSaved = savedEventIds.has(item.id);

        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl shadow-md bg-white/10 backdrop-blur-lg p-4 border border-white/20 hover:scale-105 transition-transform"
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.name}
              className="rounded-lg w-full h-40 object-cover mb-3"
            />

            <h3 className="text-lg font-semibold text-white">{item.name}</h3>

            <p className="text-neutral-300 text-sm">
              {item.date} • {item.time}
            </p>

            {/* Save / Unsave */}
            <button
              onClick={(e) => {
                e.preventDefault(); // prevent link from firing
                isSaved ? handleUnsave(item.id) : handleSave(item);
              }}
              className={`mt-3 px-4 py-2 rounded-lg w-full text-sm ${
                isSaved ? "bg-green-600" : "bg-blue-600"
              } text-white`}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </button>
          </a>
        );
      })}
    </div>
  );
}

