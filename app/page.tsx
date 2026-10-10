import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Mic,
  Type,
  ShieldCheck,
  Copy,
  Route,
  Languages,
  Gauge,
  MapPinned,
  CheckCircle2,
  Radio,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { label: "Photo / Voice / Text", icon: Camera },
  { label: "AI Understanding", icon: Gauge },
  { label: "Protect & Prioritize", icon: ShieldCheck },
  { label: "Geographic Routing", icon: MapPinned },
  { label: "Civic Action", icon: Route },
  { label: "Resolution Verified", icon: CheckCircle2 },
];

const AI_CAPABILITIES = [
  {
    icon: Languages,
    title: "Multilingual Understanding",
    body: "Citizens report in English, Kannada or Hindi. AI detects the language and normalizes meaning before classification — no manual translation needed.",
  },
  {
    icon: Gauge,
    title: "Issue Classification & Severity",
    body: "Photos, voice and text are classified into a civic category with a confidence score, then scored LOW to CRITICAL based on safety risk.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy Protection",
    body: "Uploaded images are scanned for faces and number plates before anything is shown publicly, with an option to blur sensitive regions.",
  },
  {
    icon: Copy,
    title: "Duplicate Detection",
    body: "New reports are checked against nearby open complaints by location, category and description similarity, so 10 reports become 1 tracked issue.",
  },
  {
    icon: MapPinned,
    title: "Geographic Routing",
    body: "AI decides WHAT the issue is. Ward and zone data decide WHERE it belongs. A routing table decides WHO on the ground handles it.",
  },
  {
    icon: CheckCircle2,
    title: "Resolution Verification",
    body: "Before/after photos are compared to confirm a fix, and the citizen who reported it gets the final say before a ticket closes.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
              <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[17px] font-bold tracking-tight text-ink-900">CivicAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-[13.5px] font-medium text-ink-600 md:flex">
            <a href="#how-it-works" className="hover:text-ink-900">How it Works</a>
            <a href="#ai-capabilities" className="hover:text-ink-900">AI Capabilities</a>
            <a href="#privacy" className="hover:text-ink-900">Privacy by Design</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden text-[13.5px] font-semibold text-ink-700 hover:text-ink-900 sm:block">
              Explore Dashboard
            </Link>
            <Link
              href="/report"
              className="rounded-lg bg-navy-900 px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-navy-800"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-navy-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11.5px] font-medium text-white/70">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI for Good Datathon — Working Proof of Concept
            </span>
            <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[1.08] tracking-tight sm:text-[58px]">
              From Citizen Voice
              <br />
              to Civic Action
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/65">
              AI-powered multilingual civic reporting that understands problems, protects privacy,
              prioritizes risk and routes issues to the right local team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/report"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-navy-950 hover:bg-white/90 sm:w-auto"
              >
                Report an Issue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-[14px] font-semibold text-white hover:bg-white/10 sm:w-auto"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>

          {/* Workflow strip */}
          <div className="mx-auto mt-16 flex max-w-5xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-center sm:px-4">
                  <step.icon className="h-4 w-4 text-emerald-400" />
                  <span className="max-w-[92px] text-[11px] font-medium leading-tight text-white/75">
                    {step.label}
                  </span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-white/25 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input methods */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <span className="text-[12.5px] font-semibold text-accent-bright">How it works</span>
          <h2 className="mt-2 font-display text-[30px] font-bold tracking-tight text-ink-900">
            Citizens don&apos;t need to know the process. They just describe the problem.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: Camera, title: "Photo", body: "Snap the pothole, the overflowing bin, the broken light. AI reads the image for signals of what's wrong." },
            { icon: Mic, title: "Voice", body: "Speak in English, Kannada or Hindi. Speech is transcribed, translated and normalized automatically." },
            { icon: Type, title: "Text", body: "Type a short description. No forms, no dropdowns, no department names to guess." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-[17px] font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI capabilities */}
      <section id="ai-capabilities" className="border-y border-border bg-navy-50/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-[12.5px] font-semibold text-accent-bright">AI for Good</span>
            <h2 className="mt-2 font-display text-[30px] font-bold tracking-tight text-ink-900">
              AI turns citizen voices into actionable civic intelligence — while protecting citizen privacy.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-600">
              This isn&apos;t a complaint form with an AI label bolted on. Every step below runs a real
              (demo) AI service, and the architecture is built to swap in production models later.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <cap.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-[15.5px] font-bold text-ink-900">{cap.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy by design */}
      <section id="privacy" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-[12.5px] font-semibold text-accent-bright">Privacy by Design</span>
            <h2 className="mt-2 font-display text-[28px] font-bold tracking-tight text-ink-900">
              Citizen data should be protected — not just collected.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-600">
              Every uploaded photo runs through a privacy scan before it can appear on a public map or
              dashboard. Faces, vehicle number plates and other sensitive details are flagged, and can
              be blurred before the complaint is shared beyond the responsible department.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Faces detected and flagged automatically",
                "Vehicle number plates detected automatically",
                "One-click blur before public display",
                "Personal identity never required to file a report",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-resolved" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-navy-950 p-8 text-white">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-white/50">
              <ShieldCheck className="h-4 w-4" />
              Privacy AI — Demo Scan
            </div>
            <div className="mt-5 space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span>Face detected</span>
                <span className="rounded bg-high-bg px-2 py-0.5 text-[11px] font-semibold text-high">Flagged</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span>Number plate detected</span>
                <span className="rounded bg-high-bg px-2 py-0.5 text-[11px] font-semibold text-high">Flagged</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span>Recommended action</span>
                <span className="rounded bg-resolved-bg px-2 py-0.5 text-[11px] font-semibold text-resolved">Blur before display</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-navy-900 py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="font-display text-[26px] font-bold tracking-tight">
            See it work end to end in under two minutes.
          </h2>
          <p className="max-w-xl text-[14px] text-white/60">
            Report a demo issue, watch AI classify and route it, then open the command center to see
            the dashboard update live.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/report" className="rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-navy-950 hover:bg-white/90">
              Report an Issue
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-white/25 px-6 py-3 text-[14px] font-semibold hover:bg-white/10">
              Explore the Command Center
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-[12.5px] text-ink-400 sm:flex-row">
          <span>CivicAI — a working proof-of-concept built for an AI for Good datathon.</span>
          <span>All data shown is demo/simulated. Not connected to a real government system.</span>
        </div>
      </footer>
    </div>
  );
}
