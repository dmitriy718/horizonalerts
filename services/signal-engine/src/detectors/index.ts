export type Bar = {
  symbol: string;
  venue: string;
  assetType: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: string;
  interval: string;
  delta?: number;    // Aggressive Buy/Sell imbalance
  cvd?: number;      // Cumulative Volume Delta
  hvn_levels?: number[]; // High Volume Nodes from Volume Profile
};

export type Signal = {
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

import { detectVice } from "./vice.js";
import { detectVault } from "./vault.js";
import { detectDivergence } from "./divergence.js";



export function runDetectors(bar: Bar): Signal[] {

  const signals: Signal[] = [];



  // 1. Proprietary: Institutional Vice

  const vice = detectVice(bar);

  if (vice) signals.push(vice);



  // 2. Proprietary: Velocity Vault

  const vault = detectVault(bar);

  if (vault) signals.push(vault);



  // 3. Proprietary: Delta Divergence

  const div = detectDivergence(bar);

  if (div) signals.push(div);



  return signals;

}
