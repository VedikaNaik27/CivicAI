# CivicAI

**From Citizen Voice to Civic Action**

An AI-powered multilingual civic-issue reporting, intelligent routing and resolution-tracking platform. Built as a working proof-of-concept for an AI for Good datathon.

> **Honesty note:** This is a working prototype, not a deployed government system. All AI services in this build are clearly-labeled **mock/deterministic implementations**, all complaint data is **seeded demo data**, and all wards/areas are **fictional demo geographic data**. The architecture is designed so each mock service can be swapped for a production model without changing any calling code — see [Replacing the mock AI](#replacing-the-mock-ai).

---

## Table of contents

- [Problem](#problem)
- [Solution](#solution)
- [Why this is AI for Good](#why-this-is-ai-for-good)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [AI architecture](#ai-architecture)
- [Geographic routing](#geographic-routing)
- [Demo mode](#demo-mode)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Demo accounts](#demo-accounts)
- [Demo data](#demo-data)
- [Database schema](#database-schema)
- [Judge demo flow](#judge-demo-flow)
- [How the mock AI works](#how-the-mock-ai-works)
- [Replacing the mock AI](#replacing-the-mock-ai)
- [Future government API integration](#future-government-api-integration)
- [Testing](#testing)
- [Project structure](#project-structure)

---

## Problem

Citizens constantly encounter civic problems — potholes, broken streetlights, garbage overflow, blocked drains, water leakage, flooding, faulty traffic signals, fallen trees, unsafe infrastructure.

But reporting them is harder than it should be. A citizen usually doesn't know:

- what category their problem officially belongs to
- which department is responsible for it
- which local team actually does the work
- how serious the problem is relative to everything else in the queue
- whether someone has already reported the same thing
- whether the issue was genuinely fixed

The result is under-reporting, misrouted complaints, duplicated effort, and issues that sit unresolved because nobody clearly owned them.

## Solution

CivicAI lets a citizen report an issue the way they'd naturally describe it — **a photo, their voice, or plain text, in English, Kannada or Hindi** — and does the rest:

```
CITIZEN
   ↓
PHOTO / VOICE / TEXT
   ↓
AI UNDERSTANDING
   ├── language detection + normalization
   ├── issue classification
   ├── severity assessment
   ├── privacy scan (faces, number plates)
   └── duplicate detection
   ↓
LOCATION INTELLIGENCE          (deliberately NOT AI)
   GPS / map pin / address / demo ward
   ↓ ward → zone → service area
   ↓
GEOGRAPHIC ROUTING
   AI category + ward → routing table
   ↓
RESPONSIBLE DEPARTMENT + LOCAL SERVICE TEAM
   ↓
CIVIC ACTION → RESOLUTION
   ↓
AI VERIFICATION + CITIZEN CONFIRMATION
```

The core message: **AI turns citizen voices into actionable civic intelligence while protecting citizen privacy.**

## Why this is AI for Good

AI is not decoration here — it's load-bearing at seven distinct points in the workflow:

| Capability | Civic impact |
|---|---|
| **Multilingual understanding** | Removes the language barrier. A Kannada or Hindi speaker gets the same service quality as an English speaker, with no manual translation step. |
| **Image & text classification** | Citizens don't need to learn a government taxonomy. A photo is enough. |
| **Severity intelligence** | Dangerous issues surface first instead of waiting in a first-come queue. |
| **Privacy protection** | Bystanders' faces and vehicle plates are detected *before* an image reaches any public view. Privacy is a default, not an afterthought. |
| **Duplicate detection** | Turns 12 reports about one pothole into 1 tracked, correctly-prioritized issue — saving redundant dispatches. |
| **Smart geographic routing** | Eliminates manual triage and gets issues to the team that can actually fix them. |
| **Resolution verification** | Independent before/after checking plus citizen sign-off, rather than staff self-reporting closure. |

## Features

**Citizen reporting**
- Photo upload with preview, type/size validation, drag-and-drop
- Voice input via browser Speech Recognition, with a clean demo fallback
- Free-text description
- Any combination of the three inputs at once
- Language selection (English / Kannada / Hindi)
- Four location methods: GPS, click-on-map, typed address, demo ward
- Live AI processing screen with a step-by-step checklist
- Full AI analysis result with an explainable routing decision

**Command center (`/dashboard`)**
- Six live KPI cards (all computed from real data in the store, clearly labeled as demo)
- AI insights panel generated from the current dataset
- Interactive Leaflet map with severity-colored markers
- Department workload table with progress indicators
- Recent AI-routed complaints table with confidence scores
- Live activity timeline

**Other pages**
- `/map` — full-screen civic map with category / severity / status / ward filters and live counts
- `/dashboard/issues` — searchable, filterable complaint table
- `/dashboard/analytics` — Recharts visualizations (category, severity, over-time, resolution trend, language distribution, AI confidence metrics)
- `/dashboard/departments` — per-department workload and drill-down issue lists
- `/dashboard/ai-insights` — what each AI capability does, its input/output, and its civic impact + live hotspot detection
- `/dashboard/settings` — environment info, demo account switching
- `/complaint/[id]` — full detail: image, description, original-language text, location map, AI classification, routing explanation, privacy scan, duplicate links, timeline, status actions, resolution flow
- `/login` — demo role picker
- `/` — landing page explaining the project

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with a custom design-token system |
| Icons | Lucide React |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet + OpenStreetMap |
| Fonts | Inter + Manrope, self-hosted via `@fontsource` (no external font CDN needed) |
| Backend | Next.js API routes |
| Storage (demo) | In-memory store, HMR-safe |
| Storage (prod-ready) | PostgreSQL / Supabase schema in `database/schema.sql` |
| AI | Mock deterministic services behind clean interfaces |

Runs entirely offline after `npm install`. **No paid APIs. No API keys. No external services.**

## Architecture

```
app/
├── page.tsx                      Landing page
├── login/                        Demo authentication
├── report/                       Citizen reporting flow
├── map/                          Full civic map
├── complaint/[id]/               Complaint detail + lifecycle
├── dashboard/
│   ├── page.tsx                  Command center
│   ├── issues/  analytics/  departments/  ai-insights/  settings/
└── api/
    ├── complaints/               GET (list+filter) · POST (full AI pipeline)
    ├── complaints/[id]/          GET · PATCH (status / resolution / confirm)
    ├── departments/              Workload aggregation
    ├── geo/                      Coordinate → ward/zone resolution
    └── insights/                 AI insights + hotspots

services/ai/                      All AI logic, one concern per file
├── language.ts       detectLanguage()  normalizeAndDetect()
├── classification.ts classifyComplaint()
├── severity.ts       analyzeSeverity()
├── privacy.ts        detectPersonalInformation()
├── duplicate.ts      detectDuplicate()
├── routing.ts        assignDepartment()
├── resolution.ts     verifyResolution()
└── insights.ts       generateInsights()  detectHotspots()

lib/
├── reference-data.ts  Departments, teams, wards, routing table, haversine
├── store.ts           Demo data store (swap this for Supabase)
├── seed.ts            44+ deterministic demo complaints
├── aggregate.ts       KPI / chart / workload computation
├── auth.tsx           Demo auth via useSyncExternalStore
├── deterministic.ts   Seeded hashing + text similarity
└── format.ts          Date / number formatting

components/
├── layout/       Sidebar · Topbar · DashboardShell
├── dashboard/    KpiCard · AIInsightsPanel · tables · timeline · status bar
├── complaints/   ImageUpload · VoiceRecorder · LocationPicker ·
│                 AIProcessingScreen · AIAnalysisResult · Timeline ·
│                 ResolutionPanel · Badges
└── maps/         ComplaintMap · LocationPickerMap (+ SSR-safe wrappers)

database/schema.sql   Full Postgres/Supabase schema (12 tables)
types/index.ts        Shared domain types
```

**Design principle:** no giant components, no AI logic inside UI. Every AI service is a pure function with a typed input and a typed output, callable from anywhere and independently replaceable.

## AI architecture

Each service has a stable interface. The mock implementation and a future real implementation produce the **same output shape**, so nothing downstream changes.

```ts
classifyComplaint({ text, transcript, normalizedText, imageName })
  → { category, confidence, reason, secondaryCategory?, secondaryReason? }

analyzeSeverity({ category, text })
  → { severity, confidence, reason, factors[] }

detectPersonalInformation({ imageName, hasImage })
  → { faceDetected, numberPlateDetected, otherSensitiveInfo[], recommendation, scanned }

detectDuplicate({ category, description, lat, lng, imageName }, existingComplaints)
  → { isDuplicate, matches: [{ complaintId, similarity, distanceMeters, reason }] }

assignDepartment({ category, ward, areaName })
  → { ward, zone, primaryDepartmentName, primaryTeamName, secondaryDepartmentName?, reason }

verifyResolution({ beforeUrl, afterUrl })
  → { success, confidence, reason }

normalizeAndDetect(rawText)
  → { language, transcript?, normalizedText }
```

## Geographic routing

**This is the most important feature, and it is deliberately not "assign to the nearest department."**

The system separates three questions:

| Question | Answered by |
|---|---|
| **WHAT** is the problem? | AI classification |
| **WHERE** does it belong? | Location intelligence (GPS → ward → zone). *Not AI* — a deterministic geographic lookup. |
| **WHO** should handle it? | A configurable routing table keyed by `(category, ward)` |

```
Pothole  + Ward 151  →  Road Maintenance  →  Road Team - Ward 151
Pothole  + Ward 152  →  Road Maintenance  →  Road Team - Ward 152
Streetlight + Ward 151 → Street Lighting  →  Lighting Team - Ward 151
Garbage  + Ward 151  →  Waste Management  →  Waste Team - Ward 151
Drainage + Ward 151  →  Drainage (primary) + Road Maintenance (secondary)
```

The routing table is materialized for every `(category × ward)` pair in `lib/reference-data.ts`, so every routing decision is inspectable and configurable rather than hidden in logic.

**Multi-department issues** get exactly one primary owner plus an optional collaborating department — never two independent tickets. This keeps ownership unambiguous while allowing collaboration.

**Every routing decision is explained.** Each complaint stores a human-readable `routingReason`, e.g.:

> "AI classified the issue as *Flooding*, which primarily falls under Drainage with Road Maintenance collaborating. The submitted location (BTM Layout) falls within Ward 151's (South Zone) service area, so it was routed to Drainage Team - Ward 151."

## Demo mode

`DEMO_MODE=true` is the default and the app is fully functional in it.

A **"Demo Mode Active"** indicator is permanently visible in the sidebar, and demo data is labeled throughout the UI (`Demo Data`, `Demo AI`, `Demo Metrics`, `Demo Geographic Data`).

In demo mode you can:

- upload any civic-issue image from your device
- type any description
- record voice (or use the automatic fallback)
- pick a location four different ways
- change ward / latitude / longitude freely
- re-test the same image against different wards
- trigger duplicate detection, privacy detection, severity escalation
- run the complete status lifecycle including resolution verification

**Tip for steering the demo classifier:** the mock vision heuristic reads the image *filename*. Naming a test photo `pothole.jpg`, `garbage_overflow.png` or `streetlight_broken.jpg` will steer classification. Naming one `pothole_with_car.jpg` will trigger a simulated number-plate privacy detection. You can also just upload any photo and let the text description drive classification.

## Installation

Requires Node.js 18.18+ (Node 20+ recommended).

```bash
cd civicai
npm install
cp .env.example .env.local
```

## Environment variables

Only one variable matters to run the app:

```bash
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
```

All other variables in `.env.example` (Supabase, AI providers, geocoding) are **optional and commented out** — they're placeholders for future real integrations. No real API keys are hardcoded anywhere in this project, and `.env*` is gitignored.

## Running locally

```bash
npm run dev      # development server → http://localhost:3000
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

## Demo accounts

Demo authentication only — **no passwords are checked and no credentials are stored.** Switch accounts from the topbar avatar menu, `/dashboard/settings`, or `/login`.

| Email | Role |
|---|---|
| `admin@civicai.demo` | Admin |
| `roads@civicai.demo` | Department staff — Road Maintenance |
| `lighting@civicai.demo` | Department staff — Street Lighting |
| `waste@civicai.demo` | Department staff — Waste Management |
| `drainage@civicai.demo` | Department staff — Drainage |
| `citizen@civicai.demo` | Citizen |

## Demo data

**47 fictional complaints** are seeded at startup covering:

- all 11 issue categories
- all 4 severity levels
- all 6 statuses
- all 3 languages
- all 4 demo wards
- all 7 departments and their per-ward teams
- an intentional duplicate cluster (3 near-identical pothole reports in Ward 151) so duplicate detection always has something to find

The seed data is generated by running the **same mock AI services** the live submission flow uses, so every dashboard number is internally consistent rather than hardcoded. No real personal information appears anywhere.

Wards (`Ward 151–154`) and areas (`BTM Layout`, `Jayanagar`, `Indiranagar`, `Whitefield`) are **fictional demo geographic mappings created for this prototype** and are explicitly labeled as such in the UI. They are not official government ward boundaries.

## Database schema

`database/schema.sql` contains a complete PostgreSQL / Supabase-compatible schema with 12 tables:

`users` · `departments` · `service_teams` · `geographic_areas` · `department_routing` · `complaints` · `complaint_ai_analysis` · `complaint_media` · `complaint_duplicates` · `complaint_status_history` · `resolution_verifications` · `notifications`

It includes enums, foreign keys, indexes (including geospatial-ready location indexing) and an `updated_at` trigger. The in-memory demo store mirrors this shape, so moving to real persistence means reimplementing `lib/store.ts` against these tables — nothing else changes.

## Judge demo flow

### Demo 1 — end-to-end workflow (~2 minutes)

1. Open `/dashboard` — the command center loads with KPIs, AI insights, live map, department workload, recent complaints, activity feed.
2. Click **+ Report Issue**.
3. On the **Photo** tab, upload any pothole image from your computer.
4. Switch to the **Text** tab and enter: *"There is a large pothole on the road."*
5. Under Location choose **Demo Location** → **Ward 151**.
6. Click **Analyze & Submit**.
7. Watch the AI processing checklist: language detected → issue identified → severity assessed → privacy scan → duplicate check → geographic area → department → team.
8. Review the result: **Pothole**, high confidence, **HIGH** severity, Ward 151, **Road Maintenance**, **Road Team - Ward 151**, plus a written routing explanation.
9. A new `CIV-XXXX` ID is created. Return to the dashboard — it appears immediately in recent complaints, the map, department workload, KPIs and the activity timeline.
10. Open the complaint → **Mark as In Progress**.
11. Upload an after-resolution photo → **Run AI Resolution Verification**.
12. See *"Resolution appears successful"* with a demo confidence score.
13. Citizen confirmation: click **Yes**.
14. Dashboard updates: open issues down, resolved up, workload shifts, map marker turns green, timeline records every step.

### Demo 2 — geographic routing (the key differentiator)

Submit the **same image and same description** twice, changing **only the ward**:

| Location | Category | Department | Responsible team |
|---|---|---|---|
| Ward 151 | Pothole | Road Maintenance | **Road Team - Ward 151** |
| Ward 152 | Pothole | Road Maintenance | **Road Team - Ward 152** |

*Verified working.* The AI answer stays identical; the responsible team changes purely because of geography. This demonstrates the separation: **AI determines WHAT, location determines WHERE, routing rules determine WHO.**

### Demo 3 — multi-department issue

Submit: *"Road is flooded because the drain is blocked."*

*Verified working:*
- Primary category: **Flooding**, secondary: **Drainage**
- Severity: **CRITICAL**
- **Primary owner:** Drainage → Drainage Team - Ward 151
- **Collaborating department:** Road Maintenance

One ticket, one clear owner, one collaborator — not two competing complaints.

### Demo 4 — multilingual

Use the **Voice** tab, select **Kannada**, and record (or let the fallback fire).

*Verified working:*
- Detected language: **Kannada**
- Transcript: ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ
- Normalized English: *"There is a large pothole on our road."*
- Classified as **Pothole** and routed to the correct ward team

## How the mock AI works

Every mock service is **deterministic** — the same input always produces the same output — so a judge can re-run a test case and get a consistent result, while different inputs still vary sensibly. `lib/deterministic.ts` provides seeded hashing so "confidence scores" look realistic without being random noise.

| Service | Mock technique |
|---|---|
| **Language detection** | Unicode script-range detection for Kannada (`\u0C80–\u0CFF`) and Devanagari (`\u0900–\u097F`). *This technique is legitimate in production too* — script detection is a real first pass. |
| **Translation** | Lookup against known demo phrases. |
| **Classification** | Keyword-signal scoring over the description, plus filename-based signals as an honest stand-in for a vision model. Confidence derives from signal strength + a seeded jitter. |
| **Severity** | Per-category baseline risk profile, escalated by keyword rules (large/deep, injury, blocking, school/hospital, night, contamination). Returns the contributing factors. |
| **Privacy** | Filename cues (`car`, `person`, `plate`…) plus seeded probability, so both branches are reliably testable. |
| **Duplicate detection** | **Genuinely real logic** — haversine geographic distance + category match + Jaccard word-overlap text similarity, combined into a weighted score with a proximity threshold. Only the embedding model is missing. |
| **Routing** | **Genuinely real logic** — an actual lookup against a materialized `(category × ward)` routing table. Not simulated at all. |
| **Resolution verification** | Presence of an after-photo plus seeded confidence. |
| **Insights & hotspots** | **Genuinely real logic** — live aggregation and `(category, ward)` clustering over the actual dataset. Nothing hardcoded. |

Duplicate detection, routing, insights and hotspot clustering are **real working algorithms**, not simulations. Classification, severity, privacy and resolution verification are the four services that stand in for ML models.

## Replacing the mock AI

Each service is a single file exporting one function. To go real, reimplement the function body — signatures and return types stay identical, so no calling code changes.

```
PHOTO  → vision model (CLIP / fine-tuned classifier / multimodal LLM)
           → services/ai/classification.ts

VOICE  → speech-to-text (Whisper / Google STT)
           → services/ai/language.ts
       → translation / multilingual LLM
           → services/ai/language.ts

TEXT   → NLP classifier or LLM classification prompt
           → services/ai/classification.ts

SEVERITY → vision damage assessment + risk classifier
           → services/ai/severity.ts

PRIVACY  → face detector + license-plate OCR over image bytes
           → services/ai/privacy.ts

DUPLICATE → sentence embeddings + vector DB (pgvector / Pinecone),
            combined with the existing geospatial scoring
           → services/ai/duplicate.ts

ROUTING   → already real; back the routing table with the DB table
            `department_routing` instead of the in-file constant
           → services/ai/routing.ts

RESOLUTION → vision change-detection / segmentation diff
           → services/ai/resolution.ts

HOTSPOTS  → proper spatial clustering (DBSCAN / H3 hex-binning)
           → services/ai/insights.ts
```

The `complaint_ai_analysis` table already carries `model_version` and `is_simulated` columns, so real and simulated inferences can coexist and be audited during a phased rollout.

## Future government API integration

- **Geocoding** — replace the demo `resolveAreaFromCoordinates()` nearest-centroid lookup with a real reverse-geocoding API and official ward-boundary polygons (point-in-polygon rather than nearest-centroid).
- **Ward boundaries** — load real municipal GeoJSON into `geographic_areas` with PostGIS.
- **Department systems** — push routed complaints into existing municipal work-order systems and sync status back.
- **Citizen identity** — optional verified login for follow-up notifications, while keeping anonymous reporting available.
- **Notifications** — SMS / WhatsApp / push via the existing `notifications` table.
- **Open data** — publish anonymized, privacy-scrubbed resolution statistics for public accountability.

## Testing

Verified in this build:

- `npm run build` — passes with zero TypeScript errors (17 routes)
- `npm run lint` — passes with zero errors and zero warnings
- All 11 pages return HTTP 200
- `GET /api/complaints` returns the seeded dataset
- `POST /api/complaints` runs the full pipeline and creates a complaint
- Geographic routing verified: same input, Ward 151 vs Ward 152 → different teams
- Multi-department routing verified: flooding + blocked drain → Drainage primary, Road Maintenance secondary
- Multilingual verified: Kannada transcript → detected, normalized, classified, routed
- Full lifecycle verified: `Assigned → In Progress → Resolution Uploaded → Resolved`, with a 6-entry timeline
- AI resolution verification returns success + confidence
- Citizen confirmation closes the ticket
- Error handling verified: unknown complaint ID returns 404; missing location returns a friendly validation message

Error states, loading skeletons, empty states and a mobile-responsive layout (collapsible sidebar, scrollable tables, responsive charts) are implemented throughout.

## Project structure

See [Architecture](#architecture) above for the annotated tree.

---

**CivicAI** — a working proof-of-concept demonstrating how AI-assisted civic issue routing could work. Not connected to any real government system. All data shown is demo data.
