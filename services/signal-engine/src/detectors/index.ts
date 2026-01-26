type Bar = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: string;
};

type Signal = {
  symbol: string;
  venue: string;
  assetType: string;
  pattern: string;
  features: Record<string, unknown>;
  entry: number;
  sl: number;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  confidence: number;
  barTime: string;
  seenTime: string;
  interval: string;
  dataLatencyMs: number;
  vendor: string;
  classScope: string;
  optionsMeta: Record<string, unknown>;
};

export function runDetectors(_bar: Bar): Signal[] {
  // Placeholder. Real implementation should add detectors:
  // bullish/bearish flag, breakout/breakdown, RSI divergence, etc.
  return [];
}
