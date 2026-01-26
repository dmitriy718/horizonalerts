# Incident Runbook

## Alert fanout delay
1. Check Redis latency and queue depth.
2. Verify signal engine workers are running.
3. Confirm Postgres write latency.

## Vendor latency spike
1. Pause affected vendor ingestion.
2. Announce data delay banner in app.
3. Resume once latency normalizes.

## Public feed delay
1. Verify `public_feed` schedule job.
2. Ensure server time is accurate (NTP).
3. Backfill missed publishes.
