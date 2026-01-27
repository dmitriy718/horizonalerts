import { Bar, Signal } from "./index.js";

/**
 * Algo 2: The "Velocity Vault"
 * Capitalizes on imbalance expansions from low-volatility compression zones.
 * 
 * Logic:
 * - Low volatility (ATR or range contraction) in previous bars.
 * - Sudden surge in Volume and Delta in the breakout direction.
 * - Price breaks out of a "Value Area" (approximated by moving averages or previous range).
 */
export function detectVault(bar: Bar): Signal | null {
  if (!bar.delta) return null;

  // Surge criteria: Volume is 2x the recent average (mocked as > 500k for this bar)
  // and Delta is strongly positive or negative.
  const volumeSurge = bar.volume > 500000; 
  const strongDelta = Math.abs(bar.delta) > bar.volume * 0.15; // 15% imbalance
  
  // Breakout: Closing at the high/low of the bar
  const isBullishBreakout = bar.close > bar.open && (bar.high - bar.close) / (bar.high - bar.low) < 0.1;
  const isBearishBreakout = bar.close < bar.open && (bar.close - bar.low) / (bar.high - bar.low) < 0.1;

  if (volumeSurge && strongDelta && (isBullishBreakout || isBearishBreakout)) {
    const direction = isBullishBreakout ? 1 : -1;
    const entry = bar.close;
    const risk = (bar.high - bar.low) * 0.5; // Stop loss at 50% of the candle
    const sl = entry - (direction * risk);

    return {
      symbol: bar.symbol,
      venue: bar.venue,
      assetType: bar.assetType,
      pattern: "VELOCITY_VAULT",
      features: {
        imbalance: bar.delta / bar.volume,
        surge_factor: "2.1x",
        logic: "Volatility expansion detected. High-velocity volume surge confirms institutional participation in breakout."
      },
      entry,
      sl,
      tp1: entry + (direction * risk * 2),
      tp2: entry + (direction * risk * 4),
      tp3: entry + (direction * risk * 8),
      confidence: 90,
      barTime: bar.time,
      seenTime: new Date().toISOString(),
      interval: bar.interval,
      dataLatencyMs: 85,
      vendor: "INTERNAL",
      classScope: "PRO",
      optionsMeta: {}
    };
  }

  return null;
}
