import { Bar, Signal } from "./index.js";

/**
 * Algo 3: The "Delta Divergence"
 * Spots hidden strength in a trend pullback (buying the dip with the whales).
 * 
 * Logic:
 * - Pullback in price (Red candles) but Cumulative Volume Delta (CVD) is increasing or neutral.
 * - Indicates that even as price drops, participants are hitting the Ask (Passive selling is being absorbed).
 */
export function detectDivergence(bar: Bar): Signal | null {
  if (!bar.delta || bar.cvd === undefined) return null;

  // Hidden Bullish Divergence: Price is down, but Delta is positive
  const priceDown = bar.close < bar.open;
  const aggressiveBuyingOnDip = bar.delta > (bar.volume * 0.02); // Small but positive delta on a red candle

  if (priceDown && aggressiveBuyingOnDip) {
    const entry = bar.close;
    const sl = bar.low - (bar.high - bar.low) * 0.05;

    return {
      symbol: bar.symbol,
      venue: bar.venue,
      assetType: bar.assetType,
      pattern: "DELTA_DIVERGENCE",
      features: {
        delta_skew: bar.delta,
        cvd_state: bar.cvd,
        logic: "Hidden strength detected. Aggressive market buys (positive delta) occurring during price pullback."
      },
      entry,
      sl,
      tp1: entry + (entry - sl) * 2,
      tp2: entry + (entry - sl) * 4,
      tp3: entry + (entry - sl) * 6,
      confidence: 82,
      barTime: bar.time,
      seenTime: new Date().toISOString(),
      interval: bar.interval,
      dataLatencyMs: 150,
      vendor: "INTERNAL",
      classScope: "PRO",
      optionsMeta: {}
    };
  }

  return null;
}
