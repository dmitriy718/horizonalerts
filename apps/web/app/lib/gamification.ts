import {
  Trophy, Flame, Star, Zap, Target, Award, Crown, Gem, Shield,
  Eye, Crosshair, DollarSign, Layers, Activity,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Trophy;
  color: string;
  condition: (ctx: AchievementCtx) => boolean;
};

export type AchievementCtx = {
  totalTrades: number;
  wins: number;
  winRate: number;
  bestStreak: number;
  totalPnl: number;
  strategies: number;
  positions?: number;
};

export type Rank = {
  name: string;
  min: number;
  icon: typeof Shield;
  color: string;
  bg: string;
  border: string;
};

// ─── Ranks ──────────────────────────────────────────────────────────────────

export const RANKS: Rank[] = [
  { name: "Recruit", min: 0, icon: Shield, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Bronze", min: 2, icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" },
  { name: "Silver", min: 5, icon: Star, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20" },
  { name: "Gold", min: 10, icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { name: "Platinum", min: 20, icon: Gem, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  { name: "Diamond", min: 35, icon: Crown, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
];

// ─── Functions ──────────────────────────────────────────────────────────────

export function getLevel(totalTrades: number): number {
  return Math.floor(Math.sqrt(totalTrades)) + 1;
}

export function getXp(totalTrades: number, wins: number): number {
  return totalTrades * 10 + wins * 25;
}

export function getXpForLevel(level: number): number {
  return level * level * 35;
}

export function getRank(level: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.min) rank = r;
  }
  return rank;
}

export function computeWinStreak(tradeList: any[]): { current: number; best: number } {
  if (!tradeList.length) return { current: 0, best: 0 };

  // Sort newest-first by exit_time
  const sorted = [...tradeList].sort((a, b) => {
    const ta = a.exit_time ? new Date(a.exit_time).getTime() : 0;
    const tb = b.exit_time ? new Date(b.exit_time).getTime() : 0;
    return tb - ta;
  });

  // Current streak from most recent trades
  let current = 0;
  for (const t of sorted) {
    const pnl = t.pnl ?? t.realized_pnl ?? 0;
    if (pnl > 0) current++;
    else break;
  }

  // Best streak through all trades (oldest-first)
  let best = current;
  let streak = 0;
  for (const t of [...sorted].reverse()) {
    const pnl = t.pnl ?? t.realized_pnl ?? 0;
    if (pnl > 0) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }
  return { current, best };
}

// ─── Achievements ───────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_trade", name: "First Blood", desc: "Execute your first trade", icon: Crosshair, color: "text-cyan-400", condition: (c) => c.totalTrades >= 1 },
  { id: "ten_trades", name: "Getting Warmed Up", desc: "Complete 10 trades", icon: Activity, color: "text-blue-400", condition: (c) => c.totalTrades >= 10 },
  { id: "fifty_trades", name: "Battle-Tested", desc: "Complete 50 trades", icon: Shield, color: "text-purple-400", condition: (c) => c.totalTrades >= 50 },
  { id: "hundred_trades", name: "Centurion", desc: "Complete 100 trades", icon: Crown, color: "text-amber-400", condition: (c) => c.totalTrades >= 100 },
  { id: "streak_3", name: "Hot Hand", desc: "Win 3 trades in a row", icon: Flame, color: "text-orange-400", condition: (c) => c.bestStreak >= 3 },
  { id: "streak_5", name: "On Fire", desc: "Win 5 trades in a row", icon: Zap, color: "text-amber-400", condition: (c) => c.bestStreak >= 5 },
  { id: "streak_10", name: "Untouchable", desc: "Win 10 trades in a row", icon: Star, color: "text-yellow-400", condition: (c) => c.bestStreak >= 10 },
  { id: "win_rate_60", name: "Sharp Shooter", desc: "Reach 60% win rate", icon: Target, color: "text-emerald-400", condition: (c) => c.winRate >= 60 && c.totalTrades >= 10 },
  { id: "win_rate_70", name: "Sniper", desc: "Reach 70% win rate", icon: Eye, color: "text-cyan-400", condition: (c) => c.winRate >= 70 && c.totalTrades >= 20 },
  { id: "profit_100", name: "First Bag", desc: "Earn $100+ total profit", icon: DollarSign, color: "text-emerald-400", condition: (c) => c.totalPnl >= 100 },
  { id: "profit_1k", name: "Comma Club", desc: "Earn $1,000+ total profit", icon: Trophy, color: "text-amber-400", condition: (c) => c.totalPnl >= 1000 },
  { id: "multi_strat", name: "Diversified", desc: "Profit from 3+ strategies", icon: Layers, color: "text-purple-400", condition: (c) => c.strategies >= 3 },
];
