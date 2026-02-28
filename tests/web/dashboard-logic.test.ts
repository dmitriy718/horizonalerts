import { describe, it, expect } from "vitest";

/**
 * Dashboard page logic tests.
 * Tests the gamification, formatting, and data transformation functions
 * extracted from the dashboard component.
 */

// ─── Formatters (copied from dashboard for pure logic testing) ──────────────

function fmt(n: number | undefined | null, decimals = 2): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtUsd(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "—";
  const prefix = n >= 0 ? "+$" : "-$";
  return `${prefix}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCompact(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(2);
}

function pnlColor(n: number | undefined | null): string {
  if (n == null) return "text-slate-400";
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

function duration(start: string, end?: string): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

// ─── Gamification Logic ─────────────────────────────────────────────────────

const RANKS = [
  { name: "Recruit", min: 0 },
  { name: "Bronze", min: 2 },
  { name: "Silver", min: 5 },
  { name: "Gold", min: 10 },
  { name: "Platinum", min: 20 },
  { name: "Diamond", min: 35 },
];

function getLevel(totalTrades: number): number {
  return Math.floor(Math.sqrt(totalTrades)) + 1;
}

function getXp(totalTrades: number, wins: number): number {
  return totalTrades * 10 + wins * 25;
}

function getXpForLevel(level: number): number {
  return level * level * 35;
}

function getRank(level: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.min) rank = r;
  }
  return rank;
}

function computeWinStreak(tradeList: any[]): { current: number; best: number } {
  let current = 0;
  let best = 0;
  for (const t of tradeList) {
    const pnl = t.pnl ?? t.realized_pnl ?? 0;
    if (pnl > 0) {
      current++;
      best = Math.max(best, current);
    } else {
      break; // any non-win breaks current streak
    }
  }
  let streak = 0;
  for (const t of [...tradeList].reverse()) {
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

// ─── Formatter Tests ────────────────────────────────────────────────────────

describe("Formatters", () => {
  describe("fmt()", () => {
    it("formats positive numbers", () => {
      expect(fmt(1234.5678)).toContain("1");
      expect(fmt(1234.5678)).toContain("57"); // rounded to 2 decimals
    });

    it("returns dash for null", () => {
      expect(fmt(null)).toBe("—");
    });

    it("returns dash for undefined", () => {
      expect(fmt(undefined)).toBe("—");
    });

    it("returns dash for NaN", () => {
      expect(fmt(NaN)).toBe("—");
    });

    it("respects decimal parameter", () => {
      const result = fmt(1.23456, 4);
      expect(result).toContain("2346"); // 4 decimals
    });

    it("formats zero", () => {
      expect(fmt(0)).toContain("0");
    });
  });

  describe("fmtPct()", () => {
    it("formats positive percentage with +", () => {
      expect(fmtPct(5.25)).toBe("+5.25%");
    });

    it("formats negative percentage without +", () => {
      expect(fmtPct(-3.14)).toBe("-3.14%");
    });

    it("formats zero as positive", () => {
      expect(fmtPct(0)).toBe("+0.00%");
    });

    it("returns dash for null", () => {
      expect(fmtPct(null)).toBe("—");
    });
  });

  describe("fmtUsd()", () => {
    it("formats positive USD with +$", () => {
      expect(fmtUsd(100)).toBe("+$100.00");
    });

    it("formats negative USD with -$", () => {
      expect(fmtUsd(-50)).toBe("-$50.00");
    });

    it("formats zero as +$", () => {
      expect(fmtUsd(0)).toBe("+$0.00");
    });

    it("formats large numbers with commas", () => {
      const result = fmtUsd(1234567.89);
      expect(result).toContain("+$");
      expect(result).toContain("567.89");
    });

    it("returns dash for null", () => {
      expect(fmtUsd(null)).toBe("—");
    });
  });

  describe("fmtCompact()", () => {
    it("formats thousands as k", () => {
      expect(fmtCompact(1000)).toBe("1.0k");
      expect(fmtCompact(2500)).toBe("2.5k");
    });

    it("formats small numbers with 2 decimals", () => {
      expect(fmtCompact(42)).toBe("42.00");
    });

    it("formats negative thousands", () => {
      expect(fmtCompact(-1500)).toBe("-1.5k");
    });

    it("returns dash for null", () => {
      expect(fmtCompact(null)).toBe("—");
    });
  });

  describe("pnlColor()", () => {
    it("returns green for positive", () => {
      expect(pnlColor(100)).toBe("text-emerald-400");
    });

    it("returns red for negative", () => {
      expect(pnlColor(-50)).toBe("text-red-400");
    });

    it("returns green for zero", () => {
      expect(pnlColor(0)).toBe("text-emerald-400");
    });

    it("returns slate for null", () => {
      expect(pnlColor(null)).toBe("text-slate-400");
    });
  });

  describe("duration()", () => {
    it("formats minutes", () => {
      const start = "2026-01-01T10:00:00Z";
      const end = "2026-01-01T10:30:00Z";
      expect(duration(start, end)).toBe("30m");
    });

    it("formats hours and minutes", () => {
      const start = "2026-01-01T10:00:00Z";
      const end = "2026-01-01T12:30:00Z";
      expect(duration(start, end)).toBe("2h 30m");
    });

    it("formats days", () => {
      const start = "2026-01-01T10:00:00Z";
      const end = "2026-01-03T14:00:00Z";
      expect(duration(start, end)).toBe("2d 4h");
    });

    it("formats zero minutes", () => {
      const start = "2026-01-01T10:00:00Z";
      const end = "2026-01-01T10:00:30Z";
      expect(duration(start, end)).toBe("0m");
    });
  });
});

// ─── Gamification Tests ─────────────────────────────────────────────────────

describe("Gamification", () => {
  describe("getLevel()", () => {
    it("level 1 for 0 trades", () => {
      expect(getLevel(0)).toBe(1);
    });

    it("level 2 for 1 trade", () => {
      expect(getLevel(1)).toBe(2);
    });

    it("level 4 for 9 trades", () => {
      expect(getLevel(9)).toBe(4);
    });

    it("level 11 for 100 trades", () => {
      expect(getLevel(100)).toBe(11);
    });

    it("level scales with sqrt", () => {
      expect(getLevel(25)).toBe(6); // sqrt(25) + 1
      expect(getLevel(36)).toBe(7); // sqrt(36) + 1
    });
  });

  describe("getXp()", () => {
    it("0 XP for no trades", () => {
      expect(getXp(0, 0)).toBe(0);
    });

    it("calculates XP correctly", () => {
      // 10 trades, 7 wins = 10*10 + 7*25 = 100 + 175 = 275
      expect(getXp(10, 7)).toBe(275);
    });

    it("wins contribute more than losses", () => {
      const xpAllWins = getXp(10, 10); // 100 + 250 = 350
      const xpNoWins = getXp(10, 0); // 100 + 0 = 100
      expect(xpAllWins).toBeGreaterThan(xpNoWins);
    });
  });

  describe("getXpForLevel()", () => {
    it("level 1 requires 35 XP", () => {
      expect(getXpForLevel(1)).toBe(35);
    });

    it("level 10 requires 3500 XP", () => {
      expect(getXpForLevel(10)).toBe(3500);
    });

    it("increases quadratically", () => {
      const l5 = getXpForLevel(5);
      const l10 = getXpForLevel(10);
      expect(l10).toBe(l5 * 4); // 10^2/5^2 = 4
    });
  });

  describe("getRank()", () => {
    it("Recruit at level 0", () => {
      expect(getRank(0).name).toBe("Recruit");
    });

    it("Recruit at level 1", () => {
      expect(getRank(1).name).toBe("Recruit");
    });

    it("Bronze at level 2", () => {
      expect(getRank(2).name).toBe("Bronze");
    });

    it("Silver at level 5", () => {
      expect(getRank(5).name).toBe("Silver");
    });

    it("Gold at level 10", () => {
      expect(getRank(10).name).toBe("Gold");
    });

    it("Platinum at level 20", () => {
      expect(getRank(20).name).toBe("Platinum");
    });

    it("Diamond at level 35", () => {
      expect(getRank(35).name).toBe("Diamond");
    });

    it("Diamond at very high levels", () => {
      expect(getRank(100).name).toBe("Diamond");
    });
  });

  describe("computeWinStreak()", () => {
    it("returns 0 for empty trades", () => {
      const result = computeWinStreak([]);
      expect(result.current).toBe(0);
      expect(result.best).toBe(0);
    });

    it("counts current win streak from start (newest first)", () => {
      const trades = [
        { pnl: 10 },
        { pnl: 20 },
        { pnl: -5 },
        { pnl: 15 },
      ];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(2); // first 2 are wins
    });

    it("best streak looks through all trades", () => {
      const trades = [
        { pnl: -5 }, // loss breaks current
        { pnl: 10 },
        { pnl: 20 },
        { pnl: 30 },
        { pnl: 40 },
      ];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(0); // starts with loss
      expect(result.best).toBe(4); // 4 consecutive wins in the tail
    });

    it("handles all wins", () => {
      const trades = [{ pnl: 10 }, { pnl: 20 }, { pnl: 30 }];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(3);
      expect(result.best).toBe(3);
    });

    it("handles all losses", () => {
      const trades = [{ pnl: -10 }, { pnl: -20 }, { pnl: -30 }];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(0);
      expect(result.best).toBe(0);
    });

    it("handles realized_pnl field name", () => {
      const trades = [{ realized_pnl: 10 }, { realized_pnl: 20 }];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(2);
    });

    it("zero pnl counts as loss (not win)", () => {
      const trades = [{ pnl: 0 }, { pnl: 10 }];
      const result = computeWinStreak(trades);
      expect(result.current).toBe(0); // 0 is not > 0
    });
  });
});

// ─── Data Normalization Tests ───────────────────────────────────────────────

describe("Data Normalization", () => {
  it("normalizes win rate from decimal to percentage", () => {
    const winRate = 0.65;
    const normalized = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    expect(normalized).toBe(65);
  });

  it("leaves percentage win rates unchanged", () => {
    const winRate = 65;
    const normalized = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    expect(normalized).toBe(65);
  });

  it("handles 0 win rate", () => {
    const winRate = 0;
    const normalized = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    expect(normalized).toBe(0);
  });

  it("handles 100% win rate", () => {
    const winRate = 100;
    const normalized = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    expect(normalized).toBe(100);
  });

  it("handles 1.0 win rate (100%)", () => {
    const winRate = 1;
    const normalized = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    expect(normalized).toBe(1); // Edge case: 1.0 doesn't get multiplied
  });

  it("extracts positions from various response shapes", () => {
    // Array response
    const arr = [{ pair: "BTC/USD" }];
    const fromArr = Array.isArray(arr) ? arr : [];
    expect(fromArr).toHaveLength(1);

    // Object with positions key
    const obj1 = { positions: [{ pair: "ETH/USD" }] };
    const fromObj1 = Array.isArray(obj1) ? obj1 : obj1?.positions || [];
    expect(fromObj1).toHaveLength(1);

    // Object with open_positions key
    const obj2 = { open_positions: [{ pair: "SOL/USD" }] };
    const fromObj2 = Array.isArray(obj2) ? obj2 : obj2?.open_positions || [];
    expect(fromObj2).toHaveLength(1);
  });

  it("extracts trades from various response shapes", () => {
    const arr = [{ trade_id: "t1" }];
    const fromArr = Array.isArray(arr) ? arr : [];
    expect(fromArr).toHaveLength(1);

    const obj = { trades: [{ trade_id: "t2" }] };
    const fromObj = Array.isArray(obj) ? obj : obj?.trades || [];
    expect(fromObj).toHaveLength(1);
  });

  it("normalizes strategy list from various shapes", () => {
    // Array
    const arr = [{ name: "keltner", total_pnl: 100 }];
    expect(Array.isArray(arr)).toBe(true);

    // Object with strategies key
    const obj1 = { strategies: [{ name: "mean_reversion" }] };
    const fromObj1 = obj1.strategies;
    expect(fromObj1).toHaveLength(1);

    // Dictionary keyed by strategy name
    const obj2 = {
      keltner: { total_trades: 5, win_rate: 0.6, total_pnl: 50 },
      mean_reversion: { total_trades: 3, win_rate: 0.67, total_pnl: 30 },
    };
    const fromDict = Object.entries(obj2)
      .filter(([k]) => k !== "overall")
      .map(([name, data]: [string, any]) => ({ name, ...data }));
    expect(fromDict).toHaveLength(2);
    expect(fromDict[0].name).toBe("keltner");
  });
});

// ─── Achievement Condition Tests ────────────────────────────────────────────

describe("Achievement Conditions", () => {
  const conditions = {
    first_trade: (c: any) => c.totalTrades >= 1,
    ten_trades: (c: any) => c.totalTrades >= 10,
    fifty_trades: (c: any) => c.totalTrades >= 50,
    hundred_trades: (c: any) => c.totalTrades >= 100,
    streak_3: (c: any) => c.bestStreak >= 3,
    streak_5: (c: any) => c.bestStreak >= 5,
    streak_10: (c: any) => c.bestStreak >= 10,
    win_rate_60: (c: any) => c.winRate >= 60 && c.totalTrades >= 10,
    win_rate_70: (c: any) => c.winRate >= 70 && c.totalTrades >= 20,
    profit_100: (c: any) => c.totalPnl >= 100,
    profit_1k: (c: any) => c.totalPnl >= 1000,
    multi_strat: (c: any) => c.strategies >= 3,
  };

  const newTrader = { totalTrades: 0, wins: 0, winRate: 0, bestStreak: 0, totalPnl: 0, strategies: 0, positions: 0 };
  const activeTrader = { totalTrades: 50, wins: 35, winRate: 70, bestStreak: 7, totalPnl: 500, strategies: 4, positions: 2 };
  const proTrader = { totalTrades: 150, wins: 110, winRate: 73, bestStreak: 12, totalPnl: 5000, strategies: 6, positions: 5 };

  it("new trader has no achievements", () => {
    const unlocked = Object.values(conditions).filter(fn => fn(newTrader));
    expect(unlocked).toHaveLength(0);
  });

  it("active trader unlocks expected achievements", () => {
    const unlocked = Object.entries(conditions).filter(([, fn]) => fn(activeTrader));
    const names = unlocked.map(([name]) => name);
    expect(names).toContain("first_trade");
    expect(names).toContain("ten_trades");
    expect(names).toContain("fifty_trades");
    expect(names).not.toContain("hundred_trades");
    expect(names).toContain("streak_5");
    expect(names).not.toContain("streak_10");
    expect(names).toContain("win_rate_60");
    expect(names).toContain("win_rate_70");
    expect(names).toContain("profit_100");
    expect(names).not.toContain("profit_1k");
    expect(names).toContain("multi_strat");
  });

  it("pro trader unlocks all achievements", () => {
    const unlocked = Object.values(conditions).filter(fn => fn(proTrader));
    expect(unlocked).toHaveLength(Object.keys(conditions).length);
  });

  it("win_rate_60 requires minimum 10 trades", () => {
    const lowTradeHighWR = { ...newTrader, totalTrades: 5, winRate: 80 };
    expect(conditions.win_rate_60(lowTradeHighWR)).toBe(false);
  });

  it("win_rate_70 requires minimum 20 trades", () => {
    const lowTradeHighWR = { ...newTrader, totalTrades: 15, winRate: 75 };
    expect(conditions.win_rate_70(lowTradeHighWR)).toBe(false);
  });
});
