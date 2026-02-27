"use client";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  List,
  History,
  Layers,
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShieldAlert,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";

type Tab = "overview" | "positions" | "trades" | "strategies" | "ai";

function fmt(n: number | undefined | null, decimals = 2): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const apiFetch = useCallback(
    async (path: string) => {
      if (!user) return null;
      const token = await user.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/bot${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    [user]
  );

  // Check connection on mount
  useEffect(() => {
    if (!user) return;
    apiFetch("/connection")
      .then((data) => setConnected(data !== null))
      .catch(() => setConnected(false));
  }, [user, apiFetch]);

  // Polling: fast (5s) for positions/performance/status, slower (15s) for trades/strategies/risk/thoughts
  useEffect(() => {
    if (!user || connected === false || connected === null) return;

    const fetchFast = async () => {
      try {
        const [perf, pos, status] = await Promise.all([
          apiFetch("/performance"),
          apiFetch("/positions"),
          apiFetch("/status"),
        ]);
        if (perf) setPerformance(perf);
        if (pos) setPositions(Array.isArray(pos) ? pos : pos?.positions || pos?.open_positions || []);
        if (status) setBotStatus(status);
        setLastUpdate(new Date());
      } catch (e) {
        console.error("fast poll error", e);
      }
    };

    const fetchSlow = async () => {
      try {
        const [tr, strat, rsk, th] = await Promise.all([
          apiFetch("/trades?limit=100"),
          apiFetch("/strategies"),
          apiFetch("/risk"),
          apiFetch("/thoughts"),
        ]);
        if (tr) setTrades(Array.isArray(tr) ? tr : tr?.trades || []);
        if (strat) setStrategies(strat);
        if (rsk) setRisk(rsk);
        if (th) setThoughts(Array.isArray(th) ? th : th?.thoughts || []);
      } catch (e) {
        console.error("slow poll error", e);
      }
    };

    fetchFast();
    fetchSlow();
    const fast = setInterval(fetchFast, 5000);
    const slow = setInterval(fetchSlow, 15000);
    return () => {
      clearInterval(fast);
      clearInterval(slow);
    };
  }, [user, connected, apiFetch]);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "positions", label: "Positions", icon: List },
    { id: "trades", label: "Trade History", icon: History },
    { id: "strategies", label: "Strategies", icon: Layers },
    { id: "ai", label: "AI Feed", icon: Brain },
  ];

  // --- Not connected state ---
  if (connected === false) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="glass-card rounded-2xl p-12 border border-white/10">
            <WifiOff size={48} className="mx-auto mb-6 text-slate-500" />
            <h2 className="text-2xl font-bold text-white mb-3">No Bot Connected</h2>
            <p className="text-slate-400 mb-8">
              Connect your NovaPulse trading bot to see live performance, positions, and trade history.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 transition-all"
            >
              <Settings size={16} /> Connect in Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (connected === null) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[400px]">
          <RefreshCw size={32} className="animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  // --- Extract performance metrics ---
  const perf = performance || {};
  const totalPnl = perf.total_pnl ?? perf.totalPnl ?? perf.cumulative_pnl;
  const totalPnlPct = perf.total_pnl_pct ?? perf.totalPnlPct ?? perf.cumulative_pnl_pct;
  const winRate = perf.win_rate ?? perf.winRate;
  const sharpe = perf.sharpe ?? perf.sharpe_ratio;
  const maxDrawdown = perf.max_drawdown ?? perf.maxDrawdown;
  const todayPnl = perf.today_pnl ?? perf.todayPnl ?? perf.daily_pnl;
  const equity = perf.equity ?? perf.total_equity ?? perf.balance;
  const totalTrades = perf.total_trades ?? perf.totalTrades ?? perf.trade_count ?? trades.length;

  // Strategy performance data
  const stratList: any[] = strategies
    ? Array.isArray(strategies)
      ? strategies
      : strategies.strategies || Object.entries(strategies).filter(([k]) => k !== "overall").map(([name, data]: [string, any]) => ({ name, ...data }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Nova Dashboard</h1>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Wifi size={14} className="text-emerald-400" />
              Bot connected
              {lastUpdate && (
                <span className="text-slate-600">
                  &middot; updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {botStatus && (
              <span
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border ${
                  botStatus.trading_active || botStatus.is_running
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                <Activity size={16} />
                {botStatus.trading_active || botStatus.is_running ? "Trading Active" : "Paused"}
              </span>
            )}
            <span className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/20">
              <List size={16} /> {positions.length} Open
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-cyan-500 bg-white/5 text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* ===== OVERVIEW ===== */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total P&L</div>
                  <div className={`mt-2 text-2xl font-bold ${pnlColor(totalPnl)}`}>
                    {fmtUsd(totalPnl)}
                  </div>
                  {totalPnlPct != null && (
                    <div className={`text-sm ${pnlColor(totalPnlPct)}`}>{fmtPct(totalPnlPct)}</div>
                  )}
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Win Rate</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {winRate != null ? `${(winRate * (winRate < 1 ? 100 : 1)).toFixed(1)}%` : "—"}
                  </div>
                  <div className="text-sm text-slate-400">{totalTrades} trades</div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sharpe Ratio</div>
                  <div className="mt-2 text-2xl font-bold text-white">{fmt(sharpe)}</div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Max Drawdown</div>
                  <div className="mt-2 text-2xl font-bold text-red-400">
                    {maxDrawdown != null ? `${Math.abs(maxDrawdown).toFixed(2)}%` : "—"}
                  </div>
                </div>
              </div>

              {/* Secondary row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Today P&L</div>
                  <div className={`mt-2 text-xl font-bold ${pnlColor(todayPnl)}`}>{fmtUsd(todayPnl)}</div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Equity</div>
                  <div className="mt-2 text-xl font-bold text-white">${fmt(equity)}</div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Open Positions</div>
                  <div className="mt-2 text-xl font-bold text-white">{positions.length}</div>
                </div>
              </div>

              {/* Strategy Breakdown */}
              {stratList.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Strategy Breakdown</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stratList.map((s: any, i: number) => (
                      <div key={s.name || i} className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white capitalize">{s.name || s.strategy}</span>
                          <span className={`text-xs font-mono ${pnlColor(s.total_pnl ?? s.pnl)}`}>
                            {fmtUsd(s.total_pnl ?? s.pnl)}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>WR: {s.win_rate != null ? `${(s.win_rate * (s.win_rate < 1 ? 100 : 1)).toFixed(0)}%` : "—"}</span>
                          <span>Trades: {s.total_trades ?? s.trade_count ?? s.trades ?? "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Summary */}
              {risk && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-400" /> Risk Overview
                  </h3>
                  <div className="glass-card rounded-2xl p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                      {Object.entries(risk)
                        .filter(([k]) => typeof risk[k] !== "object")
                        .slice(0, 8)
                        .map(([key, val]) => (
                          <div key={key}>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">
                              {key.replace(/_/g, " ")}
                            </div>
                            <div className="mt-1 text-white font-mono">
                              {typeof val === "number" ? fmt(val) : String(val)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== POSITIONS ===== */}
          {activeTab === "positions" && (
            <div>
              {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <List size={48} className="mb-4 opacity-20" />
                  <p>No open positions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                        <th className="pb-3 pr-4">Pair</th>
                        <th className="pb-3 pr-4">Side</th>
                        <th className="pb-3 pr-4">Entry</th>
                        <th className="pb-3 pr-4">Current</th>
                        <th className="pb-3 pr-4">Unrealized P&L</th>
                        <th className="pb-3 pr-4">SL / TP</th>
                        <th className="pb-3 pr-4">Strategy</th>
                        <th className="pb-3 pr-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p: any, i: number) => {
                        const side = p.side || (p.quantity > 0 ? "long" : "short");
                        const unrealizedPnl = p.unrealized_pnl ?? p.pnl ?? p.unrealizedPnl;
                        return (
                          <tr key={p.trade_id || p.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-4 font-bold text-white">{p.pair || p.symbol}</td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                                side === "long" || side === "buy"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}>
                                {side === "long" || side === "buy" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {side.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 pr-4 font-mono text-slate-300">{fmt(p.entry_price ?? p.entry)}</td>
                            <td className="py-3 pr-4 font-mono text-slate-300">{fmt(p.current_price ?? p.mark_price)}</td>
                            <td className={`py-3 pr-4 font-mono font-bold ${pnlColor(unrealizedPnl)}`}>
                              {fmtUsd(unrealizedPnl)}
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                              <span className="text-red-400">{fmt(p.stop_loss ?? p.sl)}</span>
                              {" / "}
                              <span className="text-emerald-400">{fmt(p.take_profit ?? p.tp)}</span>
                            </td>
                            <td className="py-3 pr-4 text-slate-300 capitalize">{p.strategy || "—"}</td>
                            <td className="py-3 pr-4 text-slate-400">{p.entry_time ? duration(p.entry_time) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== TRADE HISTORY ===== */}
          {activeTab === "trades" && (
            <div>
              {trades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <History size={48} className="mb-4 opacity-20" />
                  <p>No completed trades yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                        <th className="pb-3 pr-4">Pair</th>
                        <th className="pb-3 pr-4">Side</th>
                        <th className="pb-3 pr-4">P&L</th>
                        <th className="pb-3 pr-4">P&L %</th>
                        <th className="pb-3 pr-4">Strategy</th>
                        <th className="pb-3 pr-4">Exit Reason</th>
                        <th className="pb-3 pr-4">Duration</th>
                        <th className="pb-3 pr-4">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t: any, i: number) => {
                        const pnl = t.pnl ?? t.realized_pnl;
                        const pnlPct = t.pnl_pct ?? t.pnl_percent;
                        const side = t.side || (t.quantity > 0 ? "long" : "short");
                        return (
                          <tr key={t.trade_id || t.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-4 font-bold text-white">{t.pair || t.symbol}</td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                                side === "long" || side === "buy"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}>
                                {side.toUpperCase()}
                              </span>
                            </td>
                            <td className={`py-3 pr-4 font-mono font-bold ${pnlColor(pnl)}`}>{fmtUsd(pnl)}</td>
                            <td className={`py-3 pr-4 font-mono ${pnlColor(pnlPct)}`}>{fmtPct(pnlPct)}</td>
                            <td className="py-3 pr-4 text-slate-300 capitalize">{t.strategy || "—"}</td>
                            <td className="py-3 pr-4 text-slate-400 capitalize">{t.exit_reason || t.close_reason || "—"}</td>
                            <td className="py-3 pr-4 text-slate-400">
                              {t.entry_time && t.exit_time ? duration(t.entry_time, t.exit_time) : "—"}
                            </td>
                            <td className="py-3 pr-4 text-slate-500 text-xs">
                              {t.exit_time ? new Date(t.exit_time).toLocaleString() : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== STRATEGIES ===== */}
          {activeTab === "strategies" && (
            <div>
              {stratList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Layers size={48} className="mb-4 opacity-20" />
                  <p>No strategy data available yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stratList.map((s: any, i: number) => {
                    const wr = s.win_rate ?? s.winRate;
                    const pnl = s.total_pnl ?? s.pnl ?? s.cumulative_pnl;
                    const count = s.total_trades ?? s.trade_count ?? s.trades;
                    return (
                      <div key={s.name || s.strategy || i} className="glass-card rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white capitalize">{s.name || s.strategy}</h3>
                          {pnl != null && (
                            <span className={`text-sm font-mono font-bold ${pnlColor(pnl)}`}>
                              {fmtUsd(pnl)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Win Rate</span>
                            <span className="text-white font-mono">
                              {wr != null ? `${(wr * (wr < 1 ? 100 : 1)).toFixed(1)}%` : "—"}
                            </span>
                          </div>
                          {wr != null && (
                            <div className="h-1.5 w-full rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                                style={{ width: `${wr * (wr < 1 ? 100 : 1)}%` }}
                              />
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Trades</span>
                            <span className="text-white font-mono">{count ?? "—"}</span>
                          </div>
                          {s.avg_pnl != null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Avg P&L</span>
                              <span className={`font-mono ${pnlColor(s.avg_pnl)}`}>{fmtUsd(s.avg_pnl)}</span>
                            </div>
                          )}
                          {s.sharpe != null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Sharpe</span>
                              <span className="text-white font-mono">{fmt(s.sharpe)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== AI FEED ===== */}
          {activeTab === "ai" && (
            <div>
              {thoughts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Brain size={48} className="mb-4 opacity-20" />
                  <p>No AI thoughts yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  {thoughts.map((t: any, i: number) => (
                    <div key={t.id || i} className="glass-card rounded-xl p-4 border-l-4 border-l-purple-500/50">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-slate-300 leading-relaxed">{t.thought || t.message || t.text}</p>
                        <span className="text-xs text-slate-600 whitespace-nowrap shrink-0">
                          {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : ""}
                        </span>
                      </div>
                      {(t.strategy || t.category) && (
                        <div className="mt-2 flex gap-2">
                          {t.strategy && (
                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                              {t.strategy}
                            </span>
                          )}
                          {t.category && (
                            <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                              {t.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
