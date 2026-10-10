"use client";

import { useState } from "react";
import { LocationInput, LocationMethod } from "@/types";
import {
  DEMO_WARDS,
  GEOGRAPHIC_AREAS,
} from "@/lib/reference-data";
import {
  LocateFixed,
  MapPin,
  Home,
  FlaskConical,
  Loader2,
} from "lucide-react";
import { LocationPickerMapClient } from "@/components/maps/LocationPickerMapClient";

const METHODS: {
  id: LocationMethod;
  label: string;
  icon: typeof LocateFixed;
}[] = [
  {
    id: "gps",
    label: "Use My Location",
    icon: LocateFixed,
  },
  {
    id: "map",
    label: "Select on Map",
    icon: MapPin,
  },
  {
    id: "address",
    label: "Enter Address",
    icon: Home,
  },
  {
    id: "demo",
    label: "Demo Location",
    icon: FlaskConical,
  },
];

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationInput | null;
  onChange: (loc: LocationInput) => void;
}) {
  const [method, setMethod] = useState<LocationMethod>("demo");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState<{
    area: string;
    ward: string;
    address: string;
  }>({
    area: "",
    ward: DEMO_WARDS[0],
    address: "",
  });

  /*
   * ---------------------------------------------------------
   * GPS LOCATION
   * ---------------------------------------------------------
   *
   * GPS gives us the real latitude and longitude.
   * We then use reverse geocoding to determine the real
   * locality/area.
   *
   * Ward and zone are intentionally kept as demo metadata
   * for this prototype.
   */
  const requestMyLocation = () => {
    setError(null);
    setLocating(true);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not available in this browser. Try Select on Map or Demo Location instead."
      );
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const response = await fetch(
            `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Could not determine current area.");
          }

          const data = await response.json();

          /*
           * Use the first demo ward as fallback metadata.
           * The actual GPS coordinates and area remain real.
           */
          const demoArea = GEOGRAPHIC_AREAS[0];

          onChange({
            method: "gps",
            lat: latitude,
            lng: longitude,
            areaName: data.areaName || "Unknown area",
            ward: demoArea.ward,
            zone: demoArea.zone,
          });
        } catch (error) {
          console.error("Location lookup failed:", error);

          setError(
            "Could not determine your current area. Please try again."
          );
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError(
          "Location permission was denied. Try Select on Map or Demo Location instead."
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /*
   * ---------------------------------------------------------
   * MAP LOCATION
   * ---------------------------------------------------------
   *
   * Clicking the map gives us the actual clicked coordinates.
   * We reverse-geocode those coordinates to determine the
   * real locality/area.
   *
   * We do NOT use resolveAreaFromCoordinates() here because
   * that function contains fictional demo geographic data.
   */
  const selectOnMap = async (lat: number, lng: number) => {
    setError(null);
    setLocating(true);

    try {
      const response = await fetch(
        `/api/geocode/reverse?lat=${lat}&lng=${lng}`
      );

      if (!response.ok) {
        throw new Error("Could not determine the selected area.");
      }

      const data = await response.json();

      /*
       * Use demo ward/zone metadata.
       * Latitude, longitude and area are based on the
       * actual point selected on the map.
       */
      const demoArea = GEOGRAPHIC_AREAS[0];

      onChange({
        method: "map",
        lat,
        lng,
        areaName: data.areaName || "Unknown area",
        ward: demoArea.ward,
        zone: demoArea.zone,
      });
    } catch (error) {
      console.error("Map location lookup failed:", error);

      /*
       * Even if reverse geocoding fails, keep the actual
       * coordinates selected by the user.
       */
      const demoArea = GEOGRAPHIC_AREAS[0];

      onChange({
        method: "map",
        lat,
        lng,
        areaName: "Unknown area",
        ward: demoArea.ward,
        zone: demoArea.zone,
      });

      setError(
        "Could not determine the selected area. The selected coordinates were saved."
      );
    } finally {
      setLocating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ADDRESS LOCATION
   * ---------------------------------------------------------
   *
   * This remains demo/reference-data based.
   */
  const submitAddress = () => {
    const area =
      GEOGRAPHIC_AREAS.find(
        (a) => a.ward === addressForm.ward
      ) ?? GEOGRAPHIC_AREAS[0];

    onChange({
      method: "address",
      lat: area.lat,
      lng: area.lng,
      areaName: addressForm.area || area.areaName,
      ward: addressForm.ward,
      zone: area.zone,
      address: addressForm.address,
    });
  };

  /*
   * ---------------------------------------------------------
   * DEMO LOCATION
   * ---------------------------------------------------------
   */
  const selectDemoWard = (ward: string) => {
    const area = GEOGRAPHIC_AREAS.find(
      (a) => a.ward === ward
    );

    if (!area) {
      return;
    }

    onChange({
      method: "demo",
      lat: area.lat,
      lng: area.lng,
      areaName: area.areaName,
      ward: area.ward,
      zone: area.zone,
    });
  };

  return (
    <div>
      {/* LOCATION METHOD BUTTONS */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMethod(m.id);
              setError(null);

              if (m.id === "gps") {
                requestMyLocation();
              }
            }}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center text-[12.5px] font-medium transition ${
              method === m.id
                ? "border-navy-700 bg-navy-50 text-navy-900"
                : "border-border text-ink-600 hover:bg-navy-50/60"
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p className="mt-3 text-[13px] text-critical">
          {error}
        </p>
      )}

      <div className="mt-4">
        {/* =====================================================
            GPS MODE
            ===================================================== */}
        {method === "gps" && (
          <div className="rounded-lg border border-border bg-navy-50/50 p-4 text-[13.5px] text-ink-700">
            {locating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting your location…
              </span>
            ) : value?.method === "gps" ? (
              <LocationSummary value={value} />
            ) : (
              <button
                type="button"
                onClick={requestMyLocation}
                className="font-semibold text-accent-bright hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* =====================================================
            MAP MODE
            ===================================================== */}
        {method === "map" && (
          <div className="space-y-3">
            <LocationPickerMapClient
              lat={value?.lat ?? GEOGRAPHIC_AREAS[0].lat}
              lng={value?.lng ?? GEOGRAPHIC_AREAS[0].lng}
              onSelect={selectOnMap}
            />

            {locating && (
              <div className="flex items-center gap-2 text-[12.5px] text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding selected area…
              </div>
            )}

            {value?.method === "map" && (
              <LocationSummary value={value} />
            )}

            {value?.method !== "map" && !locating && (
              <p className="text-[12.5px] text-ink-500">
                Click anywhere on the map to drop a pin.
              </p>
            )}
          </div>
        )}

        {/* =====================================================
            ADDRESS MODE
            ===================================================== */}
        {method === "address" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12.5px] font-medium text-ink-600">
                  Area / Locality
                </span>

                <input
                  value={addressForm.area}
                  onChange={(e) =>
                    setAddressForm((f) => ({
                      ...f,
                      area: e.target.value,
                    }))
                  }
                  placeholder="e.g. 5th Cross, BTM Layout"
                  className="w-full rounded-md border border-border px-3 py-2 text-[13.5px] focus:border-navy-500 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-medium text-ink-600">
                  Ward (demo)
                </span>

                <select
                  value={addressForm.ward}
                  onChange={(e) =>
                    setAddressForm((f) => ({
                      ...f,
                      ward: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border px-3 py-2 text-[13.5px] focus:border-navy-500 focus:outline-none"
                >
                  {DEMO_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[12.5px] font-medium text-ink-600">
                Full address
              </span>

              <input
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm((f) => ({
                    ...f,
                    address: e.target.value,
                  }))
                }
                placeholder="House / street / landmark"
                className="w-full rounded-md border border-border px-3 py-2 text-[13.5px] focus:border-navy-500 focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={submitAddress}
              className="rounded-lg bg-navy-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-800"
            >
              Use this address
            </button>

            {value?.method === "address" && (
              <LocationSummary value={value} />
            )}
          </div>
        )}

        {/* =====================================================
            DEMO MODE
            ===================================================== */}
        {method === "demo" && (
          <div className="space-y-3">
            <div className="rounded-md border border-dashed border-border-strong bg-navy-50/60 px-3 py-2 text-[12px] font-medium text-ink-500">
              Demo Geographic Data — these wards/areas are fictional
              and created for this prototype only.
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GEOGRAPHIC_AREAS.map((area) => (
                <button
                  key={area.ward}
                  type="button"
                  onClick={() => selectDemoWard(area.ward)}
                  className={`rounded-lg border px-3 py-3 text-left text-[12.5px] transition ${
                    value?.ward === area.ward &&
                    value?.method === "demo"
                      ? "border-navy-700 bg-navy-50"
                      : "border-border hover:bg-navy-50/60"
                  }`}
                >
                  <div className="font-semibold text-ink-900">
                    {area.ward}
                  </div>

                  <div className="text-ink-500">
                    {area.areaName}
                  </div>
                </button>
              ))}
            </div>

            {value?.method === "demo" && (
              <LocationSummary value={value} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * LOCATION SUMMARY
 * =========================================================
 *
 * Shows the four pieces of location information:
 *
 * 1. Latitude  → actual coordinates
 * 2. Longitude → actual coordinates
 * 3. Area      → reverse geocoded locality
 * 4. Ward/Zone → prototype routing metadata
 */
function LocationSummary({
  value,
}: {
  value: LocationInput;
}) {
  return (
    <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] text-ink-700 sm:grid-cols-4">
      <div>
        <span className="text-ink-400">
          Latitude
        </span>
        <br />
        {value.lat.toFixed(5)}
      </div>

      <div>
        <span className="text-ink-400">
          Longitude
        </span>
        <br />
        {value.lng.toFixed(5)}
      </div>

      <div>
        <span className="text-ink-400">
          Area
        </span>
        <br />
        {value.areaName}
      </div>

      <div>
        <span className="text-ink-400">
          Ward
        </span>
        <br />
        {value.ward} · {value.zone}
      </div>
    </div>
  );
}