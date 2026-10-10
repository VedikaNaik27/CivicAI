"use client";

import dynamic from "next/dynamic";

export const ComplaintMapClient = dynamic(
  () => import("./ComplaintMap").then((m) => m.ComplaintMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-lg bg-navy-50 text-sm text-ink-500">
        Loading map…
      </div>
    ),
  }
);
