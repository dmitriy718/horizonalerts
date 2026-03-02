CREATE TABLE IF NOT EXISTS bot_connections (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL REFERENCES users(uid),
  bot_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  hosting_type TEXT NOT NULL DEFAULT 'managed',
  label TEXT DEFAULT 'My Bot',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(uid)
);

CREATE INDEX IF NOT EXISTS idx_bot_connections_status ON bot_connections(status);
