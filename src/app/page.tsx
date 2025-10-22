"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MapFilter from "@/components/ui/MapFilter";

const MapView = dynamic(() => import("@/lib/MapView"), { ssr: false });

export default function Home() {
  const [ticketmasterData, setTicketmasterData] = useState<any>(null);
  const [flightData, setFlightData] = useState<any[]>([]);
  const [showEvents, setShowEvents] = useState(true);
  const [showFlights, setShowFlights] = useState(true);

  // Fetch Ticketmaster
  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/ticketmaster");
      const data = await res.json();
      setTicketmasterData(data);
    }
    fetchEvents();
  }, []);

  // Fetch Flights
  useEffect(() => {
    async function fetchFlights() {
      const res = await fetch("/api/flights");
      const data = await res.json();
      setFlightData(data);
    }
    fetchFlights();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">Events & Flights Map</h1>

      <MapFilter
        onChange={({ showEvents, showFlights }) => {
          setShowEvents(showEvents);
          setShowFlights(showFlights);
        }}
      />

      <div className="mt-4">
        <MapView
          ticketmasterData={ticketmasterData}
          flightData={flightData}
          showEvents={showEvents}
          showFlights={showFlights}
        />
      </div>
    </main>
  );
}
