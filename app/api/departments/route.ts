import { NextResponse } from "next/server";
import { getAllComplaints } from "@/lib/store";
import { computeDepartmentWorkload } from "@/lib/aggregate";
import { DEPARTMENTS } from "@/lib/reference-data";

export async function GET() {
  const complaints = getAllComplaints();
  const workload = computeDepartmentWorkload(complaints);
  return NextResponse.json({ departments: DEPARTMENTS, workload });
}
