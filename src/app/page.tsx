"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { PersistedInput as UserInput } from "@/components/ui/inputHomePage";
import ChromaGrid from "@/components/ui/ChromaGrid";
import WeatherCard from "@/components/ui/WeatherCard";

const MapView = dynamic(() => import("@/lib/MapView"), { ssr: false });

export default function Home() {
  const [ticketmasterData, setTicketmasterData] = useState<any | null>(null);
  const [chromaItems, setChromaItems] = useState<any[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [weather, setWeather] = useState<any | null>(null);

  const handleResults = useCallback(async (data: any) => {
    setTicketmasterData(data);

    const events = data?._embedded?.events || [];

    const items = events.map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      date: ev?.dates?.start?.localDate ?? "",
      time: ev?.dates?.start?.localTime ?? "",
      image: ev?.images?.[0]?.url ?? "",
      url: ev.url ?? "",
      venue: ev?._embedded?.venues?.[0]?.name ?? "",
    }));

    setChromaItems(items);

    const firstEvent = events[0];
    const venue = firstEvent?._embedded?.venues?.[0];
    const city = venue?.city?.name ?? null;

    if (city) {
      try {
        const res = await fetch(`/api/weather?city=${city}`);
        const weatherData = await res.json();
        setWeather(weatherData);
      } catch {
        setWeather(null);
      }
    } else {
      setWeather(null);
    }
  }, []);

  const handleSaveToggle = (eventId: string) => {
    setSavedEventIds((prev) => {
      const updated = new Set(prev);
      updated.has(eventId) ? updated.delete(eventId) : updated.add(eventId);
      return updated;
    });
  };

  return (
    <main className="scroll-smooth">
      <div className="max-w-5xl mx-auto mt-10 flex flex-col gap-6">
        <UserInput onResults={handleResults} />
      </div>

      {weather && (
        <WeatherCard
          city={weather.city}
          temp={weather.temp}
          desc={weather.desc}
          icon={weather.icon}
          humidity={weather.humidity}
          wind={weather.wind}
          feels={weather.feels}
          min={weather.min}
          max={weather.max}
        />
      )}

      {ticketmasterData && (
        <div className="mt-8">
          <MapView ticketmasterData={ticketmasterData} />
        </div>
      )}

      <ChromaGrid
        items={chromaItems}
        savedEventIds={savedEventIds}
        onToggleSave={handleSaveToggle}
      />
    </main>
  );
}

