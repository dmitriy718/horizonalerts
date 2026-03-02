CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  list_name TEXT NOT NULL CHECK (list_name IN ('stock_alerts', 'weekly_newsletter', 'product_updates')),
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email, list_name)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_list ON newsletter_subscribers(list_name);
