-- ===========================================================================
-- CivicAI — PostgreSQL / Supabase-compatible schema
-- ===========================================================================
-- In DEMO_MODE=true the application uses an in-memory store (lib/store.ts)
-- so it runs anywhere with zero external services. This file is the
-- production schema that the demo store's shape mirrors: swapping
-- lib/store.ts for Supabase/Postgres queries against these tables is the
-- only change needed to move from demo to persistent storage.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE issue_category AS ENUM (
  'Pothole', 'Road Damage', 'Streetlight', 'Garbage', 'Drainage',
  'Water Leakage', 'Flooding', 'Traffic Signal', 'Fallen Tree',
  'Unsafe Infrastructure', 'Other'
);

CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE complaint_status AS ENUM (
  'Open', 'Assigned', 'In Progress', 'Resolution Uploaded', 'Resolved', 'Reopened'
);

CREATE TYPE user_role AS ENUM ('admin', 'department', 'citizen');

CREATE TYPE language_code AS ENUM ('English', 'Kannada', 'Hindi');

CREATE TYPE media_type AS ENUM ('before', 'after', 'voice');

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'citizen',
  department_id UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------------
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,          -- e.g. 'dept-road'
  name        TEXT NOT NULL,                 -- e.g. 'Road Maintenance'
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users
  ADD CONSTRAINT users_department_fk
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Geographic areas (DEMO geographic data in the prototype)
-- ---------------------------------------------------------------------------
CREATE TABLE geographic_areas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward           TEXT NOT NULL,              -- e.g. 'Ward 151'
  zone           TEXT NOT NULL,              -- e.g. 'South Zone'
  area_name      TEXT NOT NULL,              -- e.g. 'BTM Layout'
  center_lat     DOUBLE PRECISION NOT NULL,
  center_lng     DOUBLE PRECISION NOT NULL,
  radius_meters  INTEGER NOT NULL DEFAULT 1500,
  is_demo_data   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (ward)
);

-- ---------------------------------------------------------------------------
-- Service teams (one team per department per ward)
-- ---------------------------------------------------------------------------
CREATE TABLE service_teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,               -- e.g. 'Road Team - Ward 151'
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  ward          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, ward)
);

-- ---------------------------------------------------------------------------
-- Department routing table
-- The heart of geographic routing: (category, ward) -> department + team.
-- Configurable per ward so the same issue type can route differently by area.
-- ---------------------------------------------------------------------------
CREATE TABLE department_routing (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_category          issue_category NOT NULL,
  ward                    TEXT NOT NULL,
  zone                    TEXT,
  geographic_area_id      UUID REFERENCES geographic_areas(id) ON DELETE SET NULL,
  responsible_department  UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  responsible_team        UUID NOT NULL REFERENCES service_teams(id) ON DELETE RESTRICT,
  secondary_department    UUID REFERENCES departments(id) ON DELETE SET NULL,
  UNIQUE (issue_category, ward)
);

-- ---------------------------------------------------------------------------
-- Complaints
-- ---------------------------------------------------------------------------
CREATE TABLE complaints (
  id                      TEXT PRIMARY KEY,   -- human-readable 'CIV-1042'
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL,
  original_text           TEXT,               -- pre-translation text/transcript
  category                issue_category NOT NULL,
  secondary_category      issue_category,
  severity                severity_level NOT NULL,
  status                  complaint_status NOT NULL DEFAULT 'Open',
  language                language_code NOT NULL DEFAULT 'English',

  latitude                DOUBLE PRECISION NOT NULL,
  longitude               DOUBLE PRECISION NOT NULL,
  area                    TEXT NOT NULL,
  ward                    TEXT NOT NULL,
  zone                    TEXT NOT NULL,

  department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
  service_team_id         UUID REFERENCES service_teams(id) ON DELETE SET NULL,
  secondary_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  ai_confidence           NUMERIC(4,3),
  routing_reason          TEXT,
  duplicate_of            TEXT REFERENCES complaints(id) ON DELETE SET NULL,

  reporter_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name           TEXT,
  image_url               TEXT,
  is_demo                 BOOLEAN NOT NULL DEFAULT true,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaints_status     ON complaints(status);
CREATE INDEX idx_complaints_category   ON complaints(category);
CREATE INDEX idx_complaints_severity   ON complaints(severity);
CREATE INDEX idx_complaints_ward       ON complaints(ward);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_created    ON complaints(created_at DESC);
-- Geospatial proximity queries for duplicate detection / hotspots.
-- With PostGIS enabled, prefer: CREATE INDEX ... USING GIST (geography(...))
CREATE INDEX idx_complaints_location   ON complaints(latitude, longitude);

-- ---------------------------------------------------------------------------
-- AI analysis results (one row per complaint, full audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE complaint_ai_analysis (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id             TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,

  detected_language        language_code,
  transcript               TEXT,
  normalized_text          TEXT,

  classification_category  issue_category,
  classification_confidence NUMERIC(4,3),
  classification_reason    TEXT,

  severity                 severity_level,
  severity_confidence      NUMERIC(4,3),
  severity_reason          TEXT,
  severity_factors         JSONB,

  privacy_face_detected    BOOLEAN DEFAULT false,
  privacy_plate_detected   BOOLEAN DEFAULT false,
  privacy_other            JSONB,
  privacy_recommendation   TEXT,

  routing_reason           TEXT,
  model_version            TEXT,               -- e.g. 'mock-v1' / 'vision-2026-01'
  is_simulated             BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analysis_complaint ON complaint_ai_analysis(complaint_id);

-- ---------------------------------------------------------------------------
-- Complaint media
-- ---------------------------------------------------------------------------
CREATE TABLE complaint_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  type         media_type NOT NULL,
  url          TEXT NOT NULL,
  is_blurred   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_complaint ON complaint_media(complaint_id);

-- ---------------------------------------------------------------------------
-- Duplicate links
-- ---------------------------------------------------------------------------
CREATE TABLE complaint_duplicates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id         TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  master_complaint_id  TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  similarity           NUMERIC(4,3) NOT NULL,
  distance_meters      INTEGER,
  same_category        BOOLEAN,
  reason               TEXT,
  confirmed_by_user    BOOLEAN,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (complaint_id, master_complaint_id)
);

-- ---------------------------------------------------------------------------
-- Status history / timeline
-- ---------------------------------------------------------------------------
CREATE TABLE complaint_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status       TEXT NOT NULL,
  note         TEXT,
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_complaint ON complaint_status_history(complaint_id, created_at);

-- ---------------------------------------------------------------------------
-- Resolution verification
-- ---------------------------------------------------------------------------
CREATE TABLE resolution_verifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id          TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  before_url            TEXT,
  after_url             TEXT,
  ai_success            BOOLEAN,
  ai_confidence         NUMERIC(4,3),
  ai_reason             TEXT,
  is_simulated          BOOLEAN NOT NULL DEFAULT true,
  citizen_confirmed     BOOLEAN,
  citizen_responded_at  TIMESTAMPTZ,
  verified_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resolution_complaint ON resolution_verifications(complaint_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_set_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
