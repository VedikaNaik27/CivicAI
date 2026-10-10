import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 }
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      "https://nominatim.openstreetmap.org/reverse"
    );

    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("accept-language", "en");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CivicAI-Datathon/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();

    const address = data.address ?? {};

    const area =
      address.neighbourhood ||
      address.suburb ||
      address.quarter ||
      address.village ||
      address.town ||
      address.city_district ||
      address.city ||
      "Unknown area";

    return NextResponse.json({
      areaName: area,
      address,
      displayName: data.display_name ?? "",
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Reverse geocoding failed:", error);

    return NextResponse.json(
      { error: "Could not determine the current area." },
      { status: 502 }
    );
  }
}