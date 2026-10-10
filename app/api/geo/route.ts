import { NextRequest, NextResponse } from "next/server";
import { DEMO_WARDS, GEOGRAPHIC_AREAS, resolveAreaFromCoordinates } from "@/lib/reference-data";

// Location intelligence is intentionally NOT an AI service — it's a
// deterministic lookup against the demo geographic dataset. Kept as its
// own endpoint/module so it's obviously separate from AI understanding.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { wards: DEMO_WARDS, areas: GEOGRAPHIC_AREAS },
      { status: 200 }
    );
  }

  const area = resolveAreaFromCoordinates(lat, lng);
  return NextResponse.json({ area, wards: DEMO_WARDS, areas: GEOGRAPHIC_AREAS });
}
