import "dotenv/config";
import { Pool } from "pg";
import { runDetectors } from "./detectors/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

/**
 * Signal Engine Main Loop
 * In a production environment, this would be a WebSocket consumer or a high-frequency poller
 * for market data. For now, we scaffold the processing logic.
 */
async function main() {
  console.log("🚀 Signal Engine started. Monitoring for closed bars...");

  // Mocking a data stream for initial verification of Algo 1
  const mockStream = async function* () {
    while (true) {
      await new Promise(r => setTimeout(r, 10000)); // Every 10s
      yield {
        symbol: "AAPL",
        venue: "NASDAQ",
        assetType: "STOCK",
        open: 190.0,
        high: 192.5,
        low: 189.5,
        close: 191.0,
        volume: 1000000,
        time: new Date().toISOString(),
        interval: "1h",
        // Enhanced data for proprietary algos
        delta: -50000, // Heavy aggressive selling
        cvd: -200000,
        hvn_levels: [189.0, 190.5, 195.0]
      };
    }
  };

  for await (const bar of mockStream()) {
    const signals = runDetectors(bar);
    
    for (const signal of signals) {
      try {
        const res = await pool.query(
          `insert into signals (
            symbol, venue, asset_type, pattern, features, entry, sl, tp1, tp2, tp3,
            confidence, bar_time, seen_time, interval, data_latency_ms, vendor, class_scope, options_meta
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
          returning id`,
          [
            signal.symbol, signal.venue, signal.assetType, signal.pattern,
            signal.features, signal.entry, signal.sl, signal.tp1, signal.tp2, signal.tp3,
            signal.confidence, signal.barTime, signal.seenTime, signal.interval,
            signal.dataLatencyMs, signal.vendor, signal.classScope, signal.optionsMeta
          ]
        );

        const signalId = res.rows[0].id;
        console.log(`✅ Signal Generated: ${signal.pattern} for ${signal.symbol} (${signalId})`);

        // Promote to Live Feed
        await pool.query(
          `insert into signals_live (signal_id, status, first_seen, last_seen, dedupe_hash)
           values ($1, 'active', now(), now(), $2)
           on conflict (dedupe_hash) do nothing`,
          [signalId, `${signal.symbol}-${signal.pattern}-${signal.barTime}`]
        );

        // Schedule Public Feed (15m delay)
        await pool.query(
          `insert into public_feed (signal_id, published_at, delay_minutes)
           values ($1, now() + interval '15 minutes', 15)`,
          [signalId]
        );

      } catch (err) {
        console.error("❌ Failed to save signal:", err);
      }
    }
  }
}

main().catch(console.error);