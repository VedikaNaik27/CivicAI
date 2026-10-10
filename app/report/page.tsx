"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ImageUpload } from "@/components/complaints/ImageUpload";
import { VoiceRecorder } from "@/components/complaints/VoiceRecorder";
import { LocationPicker } from "@/components/complaints/LocationPicker";
import { AIProcessingScreen } from "@/components/complaints/AIProcessingScreen";
import { AIAnalysisResult } from "@/components/complaints/AIAnalysisResult";
import { Complaint, AIAnalysisBundle, Language, LocationInput } from "@/types";
import { Camera, Mic, Type, Sparkles, AlertCircle } from "lucide-react";

type InputTab = "photo" | "voice" | "text";

export default function ReportPage() {
  const [tab, setTab] = useState<InputTab>("photo");
  const [image, setImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const [text, setText] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState<{ raw: string; normalized: string } | null>(null);
  const [language, setLanguage] = useState<Language>("English");
  const [location, setLocation] = useState<LocationInput | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [result, setResult] = useState<{ complaint: Complaint; analysis: AIAnalysisBundle } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!location && (!!image || !!text.trim() || !!voiceTranscript);

  const handleSubmit = async () => {
    if (!location) {
      setError("Please select a location before submitting.");
      return;
    }
    if (!image && !text.trim() && !voiceTranscript) {
      setError("Please provide a photo, a voice recording or a text description.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setApiDone(false);
    setResult(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim() || undefined,
          transcript: voiceTranscript?.raw,
          language,
          imageName: image?.name,
          imageDataUrl: image?.dataUrl,
          lat: location.lat,
          lng: location.lng,
          areaName: location.areaName,
          ward: location.ward,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong while analyzing this complaint.");
        setSubmitting(false);
        return;
      }
      setApiDone(true);
      // small delay so the checklist can visibly finish before showing results
      setTimeout(() => {
        setResult(data);
        setSubmitting(false);
      }, 900);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const reset = () => {
    setImage(null);
    setText("");
    setVoiceTranscript(null);
    setLocation(null);
    setResult(null);
    setError(null);
    setApiDone(false);
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl">
        {submitting && !result && (
          <div className="py-10">
            <AIProcessingScreen done={apiDone} />
          </div>
        )}

        {result && (
          <div className="py-6">
            <AIAnalysisResult complaint={result.complaint} analysis={result.analysis} />
            <div className="mt-6 text-center">
              <button onClick={reset} className="text-[13px] font-semibold text-accent-bright hover:underline">
                Report another issue
              </button>
            </div>
          </div>
        )}

        {!submitting && !result && (
          <>
            <div className="mb-6">
              <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Report a Civic Issue</h1>
              <p className="mt-1 text-[13.5px] text-ink-500">
                Use a photo, your voice, or plain text. You can combine more than one — AI figures out the rest.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex gap-1.5 rounded-lg bg-navy-50 p-1">
                {[
                  { id: "photo" as const, label: "Photo", icon: Camera },
                  { id: "voice" as const, label: "Voice", icon: Mic },
                  { id: "text" as const, label: "Text", icon: Type },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-semibold transition ${
                      tab === t.id ? "bg-white text-navy-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "photo" && <ImageUpload onImage={setImage} />}
              {tab === "voice" && (
                <VoiceRecorder
                  language={language}
                  onLanguageChange={setLanguage}
                  onTranscript={(raw, normalized) => setVoiceTranscript({ raw, normalized })}
                />
              )}
              {tab === "text" && (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the civic issue…"
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border px-3.5 py-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-navy-500 focus:outline-none"
                />
              )}

              {/* Show any input already captured from another tab, so multi-input is visible */}
              <div className="mt-3 flex flex-wrap gap-2">
                {image && tab !== "photo" && (
                  <span className="rounded-full border border-border bg-navy-50 px-2.5 py-1 text-[11.5px] font-medium text-ink-600">
                    📷 {image.name}
                  </span>
                )}
                {text.trim() && tab !== "text" && (
                  <span className="rounded-full border border-border bg-navy-50 px-2.5 py-1 text-[11.5px] font-medium text-ink-600">
                    📝 “{text.trim().slice(0, 40)}{text.length > 40 ? "…" : ""}”
                  </span>
                )}
                {voiceTranscript && tab !== "voice" && (
                  <span className="rounded-full border border-border bg-navy-50 px-2.5 py-1 text-[11.5px] font-medium text-ink-600">
                    🎙️ “{voiceTranscript.raw.slice(0, 30)}…”
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-1 font-display text-[16px] font-bold text-ink-900">Location</h2>
              <p className="mb-4 text-[12.5px] text-ink-500">
                Location intelligence is separate from AI — it determines the ward/zone your issue falls under.
              </p>
              <LocationPicker value={location} onChange={setLocation} />
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-critical/30 bg-critical-bg px-4 py-3 text-[13px] text-critical">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-3.5 text-[14px] font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Analyze &amp; Submit
            </button>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
