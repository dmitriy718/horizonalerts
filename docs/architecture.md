# Architecture

## Overview
Horizon Services is split into web, API, and signal engine services. The API
acts as a gateway and enforces entitlements, rate limits, and compliance.

## Non-repainting rule
- Only closed bars are processed.
- Signals are immutable rows; revisions are new rows.
- Public feed is delayed by 15 minutes.

## Data flow
1. Vendor bars arrive and are normalized into closed-bar events.
2. Signal engine runs detectors, builds confidence, and writes to Postgres.
3. Consensus/dedupe generates live alerts and schedules public feed.
4. API returns alerts to clients with audit metadata.
