-- 006_login_security.sql
-- Tracks failed login attempts and supports account locking.

CREATE TABLE IF NOT EXISTS login_attempts (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  ip_address  TEXT NOT NULL,
  user_agent  TEXT,
  success     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created
  ON login_attempts (email, created_at DESC);

ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INT DEFAULT 0;
