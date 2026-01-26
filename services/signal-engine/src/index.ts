import "dotenv/config";
import { Pool } from "pg";
import { runDetectors } from "./detectors/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

async function main() {
  // Placeholder loop: pull closed bars from vendor feed and process.
  // This skeleton focuses on non-repainting and immutable inserts.
  const closedBars = [];

  for (const bar of closedBars) {
    const results = runDetectors(bar);
    for (const signal of results) {
      await pool.query(
        `insert into signals (symbol, venue, asset_type, pattern, features, entry, sl, tp1, tp2, tp3,
          confidence, bar_time, seen_time, interval, data_latency_ms, vendor, class_scope, options_meta)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          signal.symbol,
          signal.venue,
          signal.assetType,
          signal.pattern,
          signal.features,
          signal.entry,
          signal.sl,
          signal.tp1,
          signal.tp2,
          signal.tp3,
          signal.confidence,
          signal.barTime,
          signal.seenTime,
          signal.interval,
          signal.dataLatencyMs,
          signal.vendor,
          signal.classScope,
          signal.optionsMeta
        ]
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
