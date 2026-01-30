import "dotenv/config";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import Alpaca from "@alpacahq/alpaca-trade-api";
import { runDetectors, Bar } from "./detectors/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true,
});

const FALLBACK_TICKERS = ["NVDA", "AMD", "TSLA", "BTC/USD", "ETH/USD", "COIN", "MSTR"];

const getWatchlist = () => {
  try {
    const contentDir = "/app/content";
    const day = JSON.parse(fs.readFileSync(path.join(contentDir, "day_candidates.json"), "utf-8"));
    const swing = JSON.parse(fs.readFileSync(path.join(contentDir, "swing_candidates.json"), "utf-8"));
    const invest = JSON.parse(fs.readFileSync(path.join(contentDir, "invest_candidates.json"), "utf-8"));
    
    let combined = [...new Set([...day, ...swing, ...invest])];
    
    // Fix Crypto Symbols for Alpaca (BTC-USD -> BTC/USD)
    combined = combined.map(s => s.replace("-", "/"));
    
    if (combined.length > 0) return combined;
    return FALLBACK_TICKERS;
  } catch {
    return FALLBACK_TICKERS;
  }
};

async function getRealBar(symbol: string): Promise<Bar | null> {
  try {
    // Normalize symbol for check
    const isCrypto = symbol.includes("/") || symbol.includes("BTC") || symbol.includes("ETH");
    
    // Alpaca expects BTC/USD for crypto
    
    const bars = alpaca.getBarsV2(
      symbol,
      {
        start: new Date(Date.now() - 30 * 60000).toISOString(), // Last 30 mins
        timeframe: "5Min",
        limit: 1,
      }
    );
    
    for await (const bObj of bars) {
      const b = bObj as any;
      return {
        symbol,
        venue: isCrypto ? "CRYPTO" : "NASDAQ",
        assetType: isCrypto ? "CRYPTO" : "STOCK",
        open: b.Open || b.o,
        high: b.High || b.h,
        low: b.Low || b.l,
        close: b.Close || b.c,
        volume: b.Volume || b.v,
        time: b.Timestamp || b.t,
        interval: "5m",
        delta: 0, 
        cvd: 0,
        hvn_levels: []
      };
    }
  } catch (err) {
    // Log less verbosely
    // console.error(`Alpaca Error for ${symbol}:`, err);
  }
  return null;
}

async function main() {
  console.log("🚀 Signal Engine (REAL DATA) started...");

  while (true) {
    const watchlist = getWatchlist();
    console.log(`Scanning ${watchlist.length} assets...`);

    for (const ticker of watchlist) {
      const bar = await getRealBar(ticker);
      
      if (bar) {
        const signals = runDetectors(bar);
        
        for (const signal of signals) {
          try {
            const res = await pool.query(
              `insert into signals (
                symbol, venue, asset_type, pattern, features, entry, sl, tp1, tp2, tp3,
                confidence, bar_time, seen_time, interval, data_latency_ms, vendor, class_scope, options_meta
              ) values (,$2,$3,$4,$5,$6,$7,$8,$9,0,1,2,3,4,5,6,7,8)
              returning id`,
              [
                signal.symbol, signal.venue, signal.assetType, signal.pattern,
                signal.features, signal.entry, signal.sl, signal.tp1, signal.tp2, signal.tp3,
                signal.confidence, signal.barTime, signal.seenTime, signal.interval,
                signal.dataLatencyMs, signal.vendor, signal.classScope, signal.optionsMeta
              ]
            );

            const signalId = res.rows[0].id;
            console.log(`✅ REAL Signal: ${signal.pattern} on ${signal.symbol} @ ${signal.entry}`);

            await pool.query(
              `insert into signals_live (signal_id, status, first_seen, last_seen, dedupe_hash)
               values (, 'active', now(), now(), $2)
               on conflict (dedupe_hash) do nothing`,
              [signalId, `${signal.symbol}-${signal.pattern}-${signal.barTime}`]
            );

            await pool.query(
              `insert into public_feed (signal_id, published_at, delay_minutes)
               values (, now(), 0)`, // Publish immediately for Real Data mode
              [signalId]
            );

          } catch (err) {
            // Ignore dupe errors
          }
        }
      }
      
      await new Promise(r => setTimeout(r, 200)); // 200ms delay between API calls
    }
    
    console.log("Scan complete. Sleeping 60s...");
    await new Promise(r => setTimeout(r, 60000));
  }
}

main().catch(console.error);