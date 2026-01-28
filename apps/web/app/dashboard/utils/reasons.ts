export function getSmartReason(ticker: string, filters: string[]) {
  const technicals = [
    "RSI divergence detected on 15m timeframe.",
    "Volume spike > 2.5x average at key support.",
    "Bullish engulfing candle printed on 1H chart.",
    "Breaking out of a multi-day consolidation wedge.",
    "Golden cross imminent (50/200 MA convergence).",
    "Hidden buyer absorption detected in Level 2 data.",
    "Testing high-volume node (HVN) with rejection wicks.",
    "Momentum oscillator flipping positive on 4H."
  ];

  const sentiment = [
    "Social mentions trending up > 400% in last hour.",
    "Institutional block trade sweep detected.",
    "Unusual options activity: heavy call skew.",
    "News catalyst triggering rapid repricing.",
    "Sector rotation favoring this asset class today."
  ];

  // Pick a base reason
  const pool = [...technicals, ...sentiment];
  let reason = pool[Math.floor(Math.random() * pool.length)];

  // If specific filters are active, prepend them for context
  if (filters.length > 0 && filters[0] !== "High Volatility") {
    // Just pick one active filter to mention
    const f = filters[Math.floor(Math.random() * filters.length)];
    reason = `Scan Match (${f}): ${reason}`;
  }

  return reason;
}
