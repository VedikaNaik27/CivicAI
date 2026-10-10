import { AILanguageResult, Language } from "@/types";

/**
 * detectLanguage()
 *
 * DEMO / MOCK IMPLEMENTATION.
 * Real implementation would call a language-ID model (e.g. fastText / a
 * multilingual LLM) over the transcribed or typed text.
 *
 * Detects Kannada / Hindi via Unicode script ranges, otherwise assumes
 * English. This is a legitimate lightweight technique in production too —
 * script detection is a real first pass before deeper language ID.
 */
export function detectLanguage(text: string): Language {
  if (/[\u0C80-\u0CFF]/.test(text)) return "Kannada";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  return "English";
}

// Demo voice samples used by the "Start Recording" fallback when the
// browser's SpeechRecognition API is unavailable, or when the user picks a
// language explicitly to demo multilingual routing.
const DEMO_VOICE_SAMPLES: Record<Language, { transcript: string; normalized: string }[]> = {
  Kannada: [
    {
      transcript: "ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ",
      normalized: "There is a large pothole on our road.",
    },
    {
      transcript: "ಬೀದಿ ದೀಪ ಎರಡು ದಿನದಿಂದ ಆಫ್ ಆಗಿದೆ",
      normalized: "The streetlight has been off for two days.",
    },
    {
      transcript: "ಚರಂಡಿ ಬ್ಲಾಕ್ ಆಗಿ ರಸ್ತೆಯಲ್ಲಿ ನೀರು ನಿಂತಿದೆ",
      normalized: "The drain is blocked and water is flooding the road.",
    },
  ],
  Hindi: [
    {
      transcript: "हमारी सड़क पर एक बड़ा गड्ढा है",
      normalized: "There is a large pothole on our road.",
    },
    {
      transcript: "स्ट्रीट लाइट दो दिन से बंद है",
      normalized: "The streetlight has been off for two days.",
    },
    {
      transcript: "नाली बंद होने की वजह से सड़क पर पानी भर गया है",
      normalized: "The drain is blocked and water is flooding the road.",
    },
  ],
  English: [
    { transcript: "There is a large pothole on the main road.", normalized: "There is a large pothole on the main road." },
    { transcript: "The streetlight near the park has stopped working.", normalized: "The streetlight near the park has stopped working." },
  ],
};

export function getDemoVoiceSample(language: Language, seedIndex = 0) {
  const samples = DEMO_VOICE_SAMPLES[language];
  return samples[seedIndex % samples.length];
}

/**
 * normalizeAndDetect()
 *
 * Given raw text (typed or transcribed) in any supported language, returns
 * the detected language plus an English "normalized meaning" used
 * downstream by classification. Real implementation: translation model /
 * multilingual LLM prompt.
 */
export function normalizeAndDetect(rawText: string): AILanguageResult {
  const language = detectLanguage(rawText);
  if (language === "English") {
    return { language, normalizedText: rawText };
  }
  // Demo mode: match against known demo phrases to produce a plausible
  // normalized translation; otherwise fall back to a generic note.
  const sample = DEMO_VOICE_SAMPLES[language].find((s) => s.transcript === rawText.trim());
  return {
    language,
    transcript: rawText,
    normalizedText: sample?.normalized ?? "Citizen reported a civic issue (demo translation unavailable for this exact phrase).",
  };
}
