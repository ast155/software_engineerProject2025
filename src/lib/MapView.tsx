"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Flight {
  flight_date: string;
  flight_status: string;
  departure: { airport: string; gate?: string };
  arrival: { airport: string; gate?: string };
  flight: { number: string };
  live?: { latitude?: number; longitude?: number };
}

interface MapViewProps {
  ticketmasterData?: any;
  flightData?: Flight[];
  showEvents: boolean;
  showFlights: boolean;
}

export default function MapView({
  ticketmasterData,
  flightData,
  showEvents,
  showFlights,
}: MapViewProps) {
  const eventIcon = L.icon({
    iconUrl: "/event-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const flightIcon = L.icon({
    iconUrl: "/plane-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const events = ticketmasterData?._embedded?.events ?? [];
  const flights = flightData ?? [];

  return (
    <MapContainer center={[39.95, -75.17]} zoom={4} className="w-full h-[70vh]">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Events */}
      {showEvents &&
        events.map((ev: any, idx: number) => {
          const v = ev._embedded?.venues?.[0];
          const lat = v?.location?.latitude ? parseFloat(v.location.latitude) : null;
          const lng = v?.location?.longitude ? parseFloat(v.location.longitude) : null;
          if (lat == null || lng == null) return null;

          return (
            <Marker key={`event-${idx}`} position={[lat, lng]} icon={eventIcon}>
              <Popup>
                <strong>{ev.name}</strong>
                <br />
                {v.name}, {v.city?.name}, {v.state?.stateCode || v.state?.name}
              </Popup>
            </Marker>
          );
        })}

      {/* Flights */}
      {showFlights &&
        flights.map((f, idx) => {
          const lat = f.live?.latitude;
          const lng = f.live?.longitude;
          if (lat == null || lng == null) return null;

          return (
            <Marker key={`flight-${idx}`} position={[lat, lng]} icon={flightIcon}>
              <Popup>
                <strong>{f.flight.number}</strong>
                <br />
                {f.departure.airport} → {f.arrival.airport}
                {f.departure.gate && <> <br />Departure Gate: {f.departure.gate}</>}
                {f.arrival.gate && <> <br />Arrival Gate: {f.arrival.gate}</>}
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
