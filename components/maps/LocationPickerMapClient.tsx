"use client";

import dynamic from "next/dynamic";

export const LocationPickerMapClient = dynamic(
  () => import("./LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center rounded-lg border border-border bg-navy-50 text-sm text-ink-500">
        Loading map…
      </div>
    ),
  }
);
