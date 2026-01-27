import { Bar, Signal } from "./index.js";

/**
 * Algo 1: The "Institutional Vice"
 * Detects passive absorption by institutional players against aggressive retail momentum.
 * 
 * Logic: 
 * - Price is near a High Volume Node (HVN) or Key Level.
 * - Negative Delta is high (Retail is selling aggressively).
 * - Price refuses to drop (Institutional Absorption).
 * - Trigger on a small reversal or "wick" showing the trap is set.
 */
export function detectVice(bar: Bar): Signal | null {
  if (!bar.delta || !bar.hvn_levels) return null;

  const isNearHVN = bar.hvn_levels.some(level => Math.abs(bar.low - level) / level < 0.002);
  const highAggressiveSelling = bar.delta < -(bar.volume * 0.05); // More than 5% of volume is aggressive selling
  const priceAbsorption = bar.close > bar.low + (bar.high - bar.low) * 0.3; // Price closed in upper 70% of range despite selling

  if (isNearHVN && highAggressiveSelling && priceAbsorption) {
    const entry = bar.close;
    const sl = bar.low - (bar.high - bar.low) * 0.1; // Tight stop below the trap
    
    return {
      symbol: bar.symbol,
      venue: bar.venue,
      assetType: bar.assetType,
      pattern: "INSTITUTIONAL_VICE",
      features: {
        absorption_delta: bar.delta,
        hvn_distance: "minimal",
        logic: "Passive absorption detected at HVN level. Retail aggressive selling failed to push price lower."
      },
      entry,
      sl,
      tp1: entry + (entry - sl) * 1.5,
      tp2: entry + (entry - sl) * 3,
      tp3: entry + (entry - sl) * 5,
      confidence: 85,
      barTime: bar.time,
      seenTime: new Date().toISOString(),
      interval: bar.interval,
      dataLatencyMs: 120,
      vendor: "INTERNAL",
      classScope: "PRO",
      optionsMeta: {}
    };
  }

  return null;
}
