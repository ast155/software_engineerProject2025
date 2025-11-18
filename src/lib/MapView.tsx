"use client";

import type { MapGeoJSONFeature } from "maplibre-gl";
import type { Point } from "geojson";
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function formatEventList(events: any[]) {
  const shown = events.slice(0, 5);
  const items = shown.map((e: any) => {
    const name = e?.name ?? "Event";
    const date = e?.dates?.start?.localDate ?? "";
    const time = e?.dates?.start?.localTime ?? "";
    const when = [date, time].filter(Boolean).join(" ");
    return `<li><a href="${e.url}" target="_blank" rel="noreferrer">${name}</a>${
      when ? ` — ${when}` : ""
    }</li>`;
  });
  return `<ul>${items.join("")}</ul>`;
}

export default function MapView({ ticketmasterData }: any) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const events = ticketmasterData?._embedded?.events || [];
    if (!events.length) return;

    // Find first event with valid coordinates
    const validEvent = events.find((ev: any) => {
      const v = ev?._embedded?.venues?.[0];
      return v?.location?.latitude && v?.location?.longitude;
    });

    // Default USA view
    let centerLng = -98.5795;
    let centerLat = 39.8283;
    let zoomLevel = 4;

    // If we found a valid event → zoom to that city
    if (validEvent) {
      const v = validEvent._embedded.venues[0].location;
      centerLat = parseFloat(v.latitude);
      centerLng = parseFloat(v.longitude);
      zoomLevel = 10;
    }

    // Group events by venue for popup grouping
    const buckets = new Map();
    for (const ev of events) {
      for (const venue of ev?._embedded?.venues ?? []) {
        const loc = venue?.location;
        if (!loc) continue;

        const key = venue.id || `${loc.longitude},${loc.latitude}`;
        if (!buckets.has(key)) buckets.set(key, { venue, events: [] });
        buckets.get(key).events.push(ev);
      }
    }

    // Build features
    const features = Array.from(buckets.values()).map(({ venue, events }) => ({
      type: "Feature",
      properties: { description: formatEventList(events) },
      geometry: {
        type: "Point",
        coordinates: [
          Number(venue.location.longitude),
          Number(venue.location.latitude),
        ],
      },
    }));

    // Init map
    const map = new maplibregl.Map({
      container: mapContainerRef.current as HTMLDivElement,
      style:
        "https://api.maptiler.com/maps/streets/style.json?key=7o03ssUQYlzGmehxkpai",
      center: [centerLng, centerLat],
      zoom: zoomLevel,
    });

    map.on("load", () => {
      // Add features
      map.addSource("places", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      map.addLayer({
        id: "places",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": 7,
          "circle-color": "#00aaff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Popups
      map.on("click", "places", (e) => {
        const f = e.features?.[0] as MapGeoJSONFeature;
        const coords = (f.geometry as Point).coordinates;

        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(f.properties?.description)
          .addTo(map);
      });

      // Cursor pointer on hover
      map.on("mouseenter", "places", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "places", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, [ticketmasterData]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-96 rounded-lg overflow-hidden shadow-xl"
    />
  );
}

