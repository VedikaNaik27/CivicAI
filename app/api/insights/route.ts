import { NextResponse } from "next/server";
import { getAllComplaints } from "@/lib/store";
import { generateInsights, detectHotspots } from "@/services/ai/insights";

export async function GET() {
  const complaints = getAllComplaints();
  const insights = generateInsights(complaints);
  const hotspots = detectHotspots(complaints, 3);
  return NextResponse.json({ insights, hotspots });
}
