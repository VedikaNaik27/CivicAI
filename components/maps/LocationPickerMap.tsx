"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;border-radius:9999px 9999px 9999px 0;
    background:#1c3a63;transform:rotate(45deg);
    border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPickerMap({
  lat,
  lng,
  onSelect,
  height = "320px",
}: {
  lat: number;
  lng: number;
  onSelect: (lat: number, lng: number) => void;
  height?: string;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-border">
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
