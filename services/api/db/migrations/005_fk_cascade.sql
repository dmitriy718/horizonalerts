-- Add ON DELETE CASCADE to foreign keys referencing signals(id)
-- This prevents orphan cleanup failures

ALTER TABLE signal_votes
  DROP CONSTRAINT IF EXISTS signal_votes_signal_id_fkey,
  ADD CONSTRAINT signal_votes_signal_id_fkey
    FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE;

ALTER TABLE signals_live
  DROP CONSTRAINT IF EXISTS signals_live_signal_id_fkey,
  ADD CONSTRAINT signals_live_signal_id_fkey
    FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE;

ALTER TABLE public_feed
  DROP CONSTRAINT IF EXISTS public_feed_signal_id_fkey,
  ADD CONSTRAINT public_feed_signal_id_fkey
    FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE;
