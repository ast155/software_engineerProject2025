"use client";
import type { MapGeoJSONFeature } from "maplibre-gl";
import type { Point } from "geojson";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Weather from "../lib/weatherEndpoint";

// Format a short event list for the popup (name + date, link if available)
function formatEventList(events: any[]) {
  const shown = events.slice(0, 5);
  const items = shown.map((e: any) => {
    const name = e?.name ?? "Event";
    const date = e?.dates?.start?.localDate ?? "";
    const time = e?.dates?.start?.localTime ?? "";
    const when = [date, time].filter(Boolean).join(" ");
    const linkOpen = e?.url ? `<a href="${e.url}" target="_blank" rel="noreferrer">` : "";
    const linkClose = e?.url ? `</a>` : "";
    return `<li>${linkOpen}${name}${linkClose}${when ? ` — <span>${when}</span>` : ""}</li>`;
  });

  const more = events.length > shown.length ? `<li>+${events.length - shown.length} more…</li>` : "";
  return `<ul style="margin:0; padding-left:1rem;">${items.join("")}${more}</ul>`;
}

export default function MapView({ ticketmasterData }: any) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const eventsTicketmaster: Array<any> = ticketmasterData?._embedded?.events ?? [];
    const buckets = new Map<string, { venue: any; events: any[] }>();

    // Group events by venue
    for (const event of eventsTicketmaster) {
      const venues = event?._embedded?.venues ?? [];
      for (const venue of venues) {
        const loc = venue?.location;
        if (!loc?.latitude || !loc?.longitude) continue;
        const vid = venue.id || `${loc.longitude},${loc.latitude}`;
        const bucket = buckets.get(vid) ?? { venue, events: [] };
        bucket.events.push(event);
        buckets.set(vid, bucket);
      }
    }

    // Fetch weather for each venue
    const fetchWeather = async () => {
      const weatherMap: Record<string, any> = {};
      await Promise.all(
        Array.from(buckets.values()).map(async ({ venue }) => {
          const loc = venue?.location;
          if (!loc?.latitude || !loc?.longitude) return;
          try {
            const data = await Weather(Number(loc.latitude), Number(loc.longitude));
            const vid = venue.id || `${loc.longitude},${loc.latitude}`;
            weatherMap[vid] = data;
          } catch (err) {
            console.error("Weather fetch failed for", venue.name, err);
          }
        })
      );
      return weatherMap;
    };

    fetchWeather().then((weatherMap) => {
      // Build GeoJSON features
      const features = Array.from(buckets.values()).map(({ venue, events }) => {
        const vid = venue.id || `${venue.location?.longitude},${venue.location?.latitude}`;
        const weather = weatherMap[vid];
        const weatherHTML = weather
          ? `<p>Weather: ${weather.main.temp}°C — ${weather.weather[0].description}</p>
             <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" width="50"/>`
          : `<p>Weather unavailable</p>`;

        return {
          type: "Feature" as const,
          properties: {
            description:
              `<strong>${venue.name ?? "Venue"}</strong>
               <p>${events.length} event(s) here</p>
               ${formatEventList(events)}
               ${weatherHTML}`,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [Number(venue.location?.longitude), Number(venue.location?.latitude)],
          },
        };
      }) as import("geojson").Feature<Point, Record<string, any>>[];

      const [lng, lat] = (features[0]?.geometry?.coordinates as [number, number]) || [0, 0];

      const map = new maplibregl.Map({
        container: mapContainerRef.current as HTMLDivElement,
        style: "https://api.maptiler.com/maps/streets/style.json?key=7o03ssUQYlzGmehxkpai",
        center: [lng, lat],
        zoom: 11.15,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      map.on("load", () => {
        map.addSource("places", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features,
          },
        });

        map.addLayer({
          id: "places",
          type: "circle",
          source: "places",
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
          },
        });

        // Popup on click
        map.on("click", "places", (e) => {
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          if (!f || f.geometry.type !== "Point") return;

          const coords = (f.geometry as Point).coordinates.slice() as [number, number];
          const props = f.properties as { description?: string };

          const popup = new maplibregl.Popup();
          popup
            .setLngLat(coords)
            .setHTML(props.description ?? "")
            .addTo(map);

          popup.getElement().classList.add("tm-popup");
        });

        // Smooth cursor hover
        map.on("mousemove", "places", (e) => {
          map.getCanvas().style.cursor = e.features && e.features.length > 0 ? "pointer" : "";
        });
      });

      // Cleanup on unmount
      return () => map.remove();
    });
  }, [ticketmasterData]);

  return <div ref={mapContainerRef} className="w-full h-96 rounded-lg overflow-hidden" />;
}
