"use client";

import { useRef, useState } from "react";
import { Mic, Square, Languages } from "lucide-react";
import { Language } from "@/types";
import { getDemoVoiceSample } from "@/services/ai/language";

interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const LANGUAGE_LOCALE: Record<Language, string> = {
  English: "en-IN",
  Kannada: "kn-IN",
  Hindi: "hi-IN",
};

export function VoiceRecorder({
  language,
  onLanguageChange,
  onTranscript,
}: {
  language: Language;
  onLanguageChange: (l: Language) => void;
  onTranscript: (transcript: string, normalized: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const getRecognition = (): SpeechRecognitionLike | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    return Ctor ? new Ctor() : null;
  };

  const start = () => {
    setTranscript("");
    setUsedFallback(false);
    const recognition = getRecognition();

    if (!recognition) {
      // Demo fallback: no browser speech recognition available.
      setRecording(true);
      setUsedFallback(true);
      setTimeout(() => {
        const sample = getDemoVoiceSample(language, Math.floor(Math.random() * 3));
        setTranscript(sample.transcript);
        onTranscript(sample.transcript, sample.normalized);
        setRecording(false);
      }, 1400);
      return;
    }

    recognition.lang = LANGUAGE_LOCALE[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      onTranscript(text, text);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => {
      // Fall back to a demo sample if the browser API errors (e.g. no mic permission)
      const sample = getDemoVoiceSample(language, 0);
      setTranscript(sample.transcript);
      setUsedFallback(true);
      onTranscript(sample.transcript, sample.normalized);
      setRecording(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Languages className="h-3.5 w-3.5 text-ink-400" />
        <span className="text-[12.5px] font-medium text-ink-600">Speak in</span>
        <div className="flex gap-1.5">
          {(["English", "Kannada", "Hindi"] as Language[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLanguageChange(l)}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${
                language === l ? "border-navy-700 bg-navy-50 text-navy-900" : "border-border text-ink-500"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-800"
          >
            <Mic className="h-4 w-4" /> Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-2 rounded-lg bg-critical px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            <Square className="h-3.5 w-3.5" /> Stop Recording
          </button>
        )}
        {recording && (
          <span className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
            <span className="status-dot h-2 w-2 rounded-full bg-critical" />
            Listening…
          </span>
        )}
      </div>

      {transcript && (
        <div className="rounded-lg border border-border bg-navy-50/50 p-3.5 text-[13.5px]">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-ink-900">Language: {language}</span>
            {usedFallback && (
              <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy-700">
                Demo fallback
              </span>
            )}
          </div>
          <p className="text-ink-700">Transcription: “{transcript}”</p>
        </div>
      )}
    </div>
  );
}
