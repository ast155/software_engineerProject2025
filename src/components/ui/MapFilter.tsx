"use client";
import { useState } from "react";

interface MapFilterDropdownProps {
  onChange: (filters: { showEvents: boolean; showFlights: boolean }) => void;
}

export default function MapFilterDropdown({ onChange }: MapFilterDropdownProps) {
  const [showEvents, setShowEvents] = useState(true);
  const [showFlights, setShowFlights] = useState(true);
  const [open, setOpen] = useState(false);

  const toggleEvents = () => {
    setShowEvents(prev => {
      const updated = !prev;
      onChange({ showEvents: updated, showFlights });
      return updated;
    });
  };

  const toggleFlights = () => {
    setShowFlights(prev => {
      const updated = !prev;
      onChange({ showEvents, showFlights: updated });
      return updated;
    });
  };

  return (
    <div className="relative inline-block">
      <button
        className="border px-4 py-2 rounded hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        Filter Map
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
          <div
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={toggleEvents}
          >
            {showEvents ? "✅" : "☑️"} Show Events
          </div>
          <div
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={toggleFlights}
          >
            {showFlights ? "✅" : "☑️"} Show Flights
          </div>
        </div>
      )}
    </div>
  );
}
