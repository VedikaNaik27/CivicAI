"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Complaint, Severity } from "@/types";
import { departmentById, teamById } from "@/lib/reference-data";
import { StatusBadge } from "@/components/complaints/Badges";
import Link from "next/link";
import { useEffect } from "react";

const MARKER_COLORS: Record<string, string> = {
  CRITICAL: "#c62828",
  HIGH: "#c2560c",
  MEDIUM: "#b8860b",
  LOW: "#2f6fed",
  RESOLVED: "#158a5f",
};

function markerIcon(severity: Severity, resolved: boolean) {
  const color = resolved ? MARKER_COLORS.RESOLVED : MARKER_COLORS[severity];
  const html = `
    <div style="
      width:16px;height:16px;border-radius:9999px;
      background:${color};border:2.5px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></div>`;
  return L.divIcon({ html, className: "", iconSize: [16, 16], iconAnchor: [8, 8] });
}

function FitBounds({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length === 0) return;
    const bounds = L.latLngBounds(complaints.map((c) => [c.lat, c.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [complaints, map]);
  return null;
}

export function ComplaintMap({
  complaints,
  height = "480px",
  fitToData = true,
}: {
  complaints: Complaint[];
  height?: string;
  fitToData?: boolean;
}) {
  const center: [number, number] =
    complaints.length > 0 ? [complaints[0].lat, complaints[0].lng] : [12.9352, 77.6245];

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg">
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fitToData && <FitBounds complaints={complaints} />}
        {complaints.map((c) => {
          const dept = departmentById(c.departmentId);
          const team = teamById(c.serviceTeamId);
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={markerIcon(c.severity, c.status === "Resolved")}
            >
              <Popup minWidth={220}>
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-navy-700">{c.id}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="font-semibold text-ink-900">{c.category}</div>
                  <div className="text-ink-600">
                    {c.areaName} · {c.ward}
                  </div>
                  <div className="text-ink-500">
                    {dept?.name} — {team?.name}
                  </div>
                  <Link
                    href={`/complaint/${c.id}`}
                    className="mt-1.5 inline-block text-[12.5px] font-semibold text-accent-bright hover:underline"
                  >
                    View Complaint →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
