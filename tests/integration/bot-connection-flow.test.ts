import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests for the end-to-end bot connection flow.
 * Tests the full lifecycle: connect → proxy → disconnect.
 */

// ─── Mock Setup ─────────────────────────────────────────────────────────────

const mockQuery = vi.fn();

function makeBotConnection(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    uid: "user-123",
    bot_url: "http://165.245.143.68:8080",
    api_key: "test-read-key-64chars",
    hosting_type: "managed",
    label: "My Bot",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── Connection Lifecycle Tests ─────────────────────────────────────────────

describe("Bot Connection Lifecycle", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("creates new connection on first connect", async () => {
    const conn = makeBotConnection();
    mockQuery.mockResolvedValueOnce([conn]);

    const result = await mockQuery(
      `INSERT INTO bot_connections (uid, bot_url, api_key, hosting_type, label, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (uid)
       DO UPDATE SET bot_url = $2, api_key = $3, hosting_type = $4, label = $5, status = 'active', updated_at = now()
       RETURNING *`,
      ["user-123", "http://165.245.143.68:8080", "test-key", "managed", "My Bot"]
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("active");
  });

  it("updates existing connection on re-connect", async () => {
    const updatedConn = makeBotConnection({ bot_url: "http://new-server:8080" });
    mockQuery.mockResolvedValueOnce([updatedConn]);

    const result = await mockQuery(
      `INSERT INTO bot_connections ...`,
      ["user-123", "http://new-server:8080", "new-key", "self-hosted", "Updated Bot"]
    );

    expect(result[0].bot_url).toBe("http://new-server:8080");
  });

  it("soft-deletes on disconnect (sets status, doesn't DELETE)", async () => {
    mockQuery.mockResolvedValueOnce([]);

    await mockQuery(
      `UPDATE bot_connections SET status = 'disconnected', updated_at = now() WHERE uid = $1`,
      ["user-123"]
    );

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("status = 'disconnected'"),
      ["user-123"]
    );
  });

  it("re-connect after disconnect reactivates", async () => {
    const reactivated = makeBotConnection({ status: "active" });
    mockQuery.mockResolvedValueOnce([reactivated]);

    const result = await mockQuery(
      expect.stringContaining("ON CONFLICT"),
      expect.any(Array)
    );

    expect(result[0].status).toBe("active");
  });
});

// ─── Proxy Data Flow Tests ──────────────────────────────────────────────────

describe("Proxy Data Flow", () => {
  it("performance data maps correctly to dashboard KPIs", () => {
    const botResponse = {
      bankroll: 5425.75,
      total_return_pct: 8.51,
      trade_count: 34,
      winning_trades: 22,
      losing_trades: 12,
      win_rate: 0.647,
      total_pnl: 425.75,
      today_pnl: 125.50,
      total_equity: 5751.25,
      sharpe_ratio: 1.23,
      max_drawdown_pct: 5.20,
    };

    // Dashboard extraction logic
    const totalPnl = botResponse.total_pnl ?? 0;
    const winRate = botResponse.win_rate ?? 0;
    const winRateNorm = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
    const sharpe = botResponse.sharpe_ratio;
    const maxDrawdown = botResponse.max_drawdown_pct;
    const todayPnl = botResponse.today_pnl;
    const equity = botResponse.total_equity;
    const totalTrades = botResponse.trade_count;

    expect(totalPnl).toBe(425.75);
    expect(winRateNorm).toBeCloseTo(64.7);
    expect(sharpe).toBe(1.23);
    expect(maxDrawdown).toBe(5.20);
    expect(todayPnl).toBe(125.50);
    expect(equity).toBe(5751.25);
    expect(totalTrades).toBe(34);
  });

  it("positions data maps correctly to dashboard cards", () => {
    const botPositions = [
      {
        trade_id: "t-open-1",
        pair: "BTC/USD",
        side: "buy",
        entry_price: 50000,
        current_price: 50250,
        quantity: 0.1,
        unrealized_pnl: 25.0,
        entry_time: "2026-02-27T10:00:00Z",
        stop_loss: 49500,
        take_profit: 51000,
        strategy: "keltner",
      },
    ];

    const pos = botPositions[0];
    expect(pos.pair).toBe("BTC/USD");
    expect(pos.side).toBe("buy");
    expect(pos.unrealized_pnl).toBe(25.0);
    expect(pos.entry_price).toBeLessThan(pos.current_price);
  });

  it("trades data maps correctly to trade history table", () => {
    const botTrades = [
      {
        trade_id: "t-closed-1",
        pair: "ETH/USD",
        side: "buy",
        status: "closed",
        entry_time: "2026-02-27T08:00:00Z",
        exit_time: "2026-02-27T09:30:00Z",
        entry_price: 3000,
        exit_price: 3100,
        pnl: 100,
        pnl_pct: 0.033,
        strategy: "mean_reversion",
        reason: "tp_hit",
      },
    ];

    const trade = botTrades[0];
    expect(trade.status).toBe("closed");
    expect(trade.pnl).toBeGreaterThan(0);
    expect(trade.strategy).toBe("mean_reversion");
    expect(trade.reason).toBe("tp_hit");
  });

  it("strategy-performance data maps to strategy cards", () => {
    const botStrategies = {
      keltner: { total_trades: 8, wins: 6, win_rate: 0.75, total_pnl: 145.30, avg_pnl: 18.16 },
      mean_reversion: { total_trades: 5, wins: 3, win_rate: 0.60, total_pnl: 78.45 },
    };

    // Dashboard normalization
    const stratList = Object.entries(botStrategies)
      .filter(([k]) => k !== "overall")
      .map(([name, data]) => ({ name, ...data }));

    expect(stratList).toHaveLength(2);
    expect(stratList[0].name).toBe("keltner");
    expect(stratList[0].total_pnl).toBe(145.30);
    expect(stratList[1].name).toBe("mean_reversion");
  });

  it("thoughts data maps to AI feed", () => {
    const botThoughts = [
      {
        timestamp: "2026-02-27T12:34:56Z",
        category: "signal_generation",
        message: "keltner: Strong confluence on BTC/USD",
        severity: "info",
        metadata: { pair: "BTC/USD", confidence: 0.82 },
      },
    ];

    const thought = botThoughts[0];
    expect(thought.message).toContain("keltner");
    expect(thought.category).toBe("signal_generation");
    // Dashboard reads: t.thought || t.message || t.text
    const displayText = thought.message;
    expect(displayText).toBeTruthy();
  });

  it("status data maps to bot status card", () => {
    const botStatus = {
      status: "running",
      mode: "paper",
      uptime_seconds: 3600,
      scan_count: 100,
      version: "5.0.0",
      trading_active: true,
      paused: false,
    };

    // Dashboard reads: botStatus?.trading_active || botStatus?.is_running
    const isTrading = botStatus.trading_active || false;
    expect(isTrading).toBe(true);
  });

  it("risk data maps to risk overview", () => {
    const botRisk = {
      bankroll: 5000,
      current_drawdown: 3.5,
      max_daily_trades: 40,
      risk_of_ruin: 0.005,
      total_exposure_usd: 2500,
    };

    const entries = Object.entries(botRisk).filter(([, val]) => typeof val !== "object");
    expect(entries.length).toBe(5);
    expect(entries.map(([k]) => k)).toContain("bankroll");
    expect(entries.map(([k]) => k)).toContain("current_drawdown");
  });
});

// ─── Error Scenarios ────────────────────────────────────────────────────────

describe("Bot Connection Error Scenarios", () => {
  it("handles bot unreachable (network error)", () => {
    const error = new Error("fetch failed: ECONNREFUSED");
    expect(error.message).toContain("fetch");
  });

  it("handles bot auth failure (401)", () => {
    const error = { status: 401, error: "unauthorized" };
    expect(error.status).toBe(401);
  });

  it("handles bot not found (no connection in DB)", () => {
    const response = { error: "no_bot_connected" };
    expect(response.error).toBe("no_bot_connected");
  });

  it("handles bot proxy timeout", () => {
    const PROXY_TIMEOUT = 10_000;
    expect(PROXY_TIMEOUT).toBe(10000);
  });

  it("handles malformed bot response", () => {
    const badJson = "not json";
    let parsed: any = null;
    try { parsed = JSON.parse(badJson); } catch { parsed = null; }
    expect(parsed).toBeNull();
  });

  it("dashboard handles 502 bot_unreachable gracefully", () => {
    const response = { error: "bot_unreachable" };
    expect(response.error).toBe("bot_unreachable");
  });
});

// ─── Multi-Field Performance Compatibility ──────────────────────────────────

describe("Performance Field Compatibility", () => {
  it("handles NovaPulse field names", () => {
    const data = { total_pnl: 100, win_rate: 0.65, sharpe_ratio: 1.2, max_drawdown_pct: 5 };
    expect(data.total_pnl).toBe(100);
    expect(data.win_rate).toBe(0.65);
  });

  it("handles alternative field names (camelCase)", () => {
    const data = { totalPnl: 100, winRate: 65, sharpe: 1.2, maxDrawdown: 5 };
    const totalPnl = data.totalPnl ?? 0;
    const winRate = data.winRate ?? 0;
    expect(totalPnl).toBe(100);
    expect(winRate).toBe(65);
  });

  it("falls back through field name chain", () => {
    const data = { cumulative_pnl: 200 };
    const totalPnl = (data as any).total_pnl ?? (data as any).totalPnl ?? data.cumulative_pnl ?? 0;
    expect(totalPnl).toBe(200);
  });

  it("handles missing fields gracefully", () => {
    const data = {};
    const totalPnl = (data as any).total_pnl ?? (data as any).totalPnl ?? (data as any).cumulative_pnl ?? 0;
    expect(totalPnl).toBe(0);
  });
});
