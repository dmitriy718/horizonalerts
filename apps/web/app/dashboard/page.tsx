"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Cloud,
  Server,
  HelpCircle,
  EyeOff,
  Mail,
  Trophy,
  Flame,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Gem,
  Shield,
  Eye,
  Pause,
  Play,
  ChevronRight,
  Clock,
  BarChart3,
  DollarSign,
  Percent,
  Crosshair,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "overview" | "positions" | "trades" | "strategies" | "ai";

type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Trophy;
  color: string;
  condition: (ctx: AchievementCtx) => boolean;
};

type AchievementCtx = {
  totalTrades: number;
  wins: number;
  winRate: number;
  bestStreak: number;
  totalPnl: number;
  strategies: number;
  positions: number;
};

// ─── Formatters ──────────────────────────────────────────────────────────────

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

function pnlBg(n: number | undefined | null): string {
  if (n == null) return "bg-slate-500/10";
  return n >= 0 ? "bg-emerald-500/10" : "bg-red-500/10";
}

function duration(start: string, end?: string): string {
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  if (isNaN(startMs) || isNaN(endMs)) return "—";
  const ms = endMs - startMs;
  if (ms < 0) return "—";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

// ─── Gamification Logic ──────────────────────────────────────────────────────

const RANKS = [
  { name: "Recruit", min: 0, icon: Shield, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Bronze", min: 2, icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" },
  { name: "Silver", min: 5, icon: Star, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20" },
  { name: "Gold", min: 10, icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { name: "Platinum", min: 20, icon: Gem, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  { name: "Diamond", min: 35, icon: Crown, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
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

const ACHIEVEMENTS: Achievement[] = [
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

// ─── Component ───────────────────────────────────────────────────────────────

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

  // Inline bot connection state
  const [setupStep, setSetupStep] = useState(0); // 0=choice, 1=form
  const [setupHosting, setSetupHosting] = useState<"managed" | "self-hosted">("managed");
  const [setupUrl, setSetupUrl] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [setupLabel, setSetupLabel] = useState("My Bot");
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [showSetupKey, setShowSetupKey] = useState(false);

  const router = useRouter();

  const apiFetch = useCallback(
    async (path: string) => {
      if (!user) return null;
      const token = await user.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/bot${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (res.status === 401) {
        router.replace("/login");
        return null;
      }
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    [user, router]
  );

  useEffect(() => {
    if (!user) return;
    apiFetch("/connection")
      .then((data) => setConnected(data !== null))
      .catch(() => setConnected(false));
  }, [user, apiFetch]);

  const handleInlineConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");
    setSetupSaving(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/bot/connection`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${await user!.getIdToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot_url: setupUrl.replace(/\/+$/, ""),
          api_key: setupKey,
          hosting_type: setupHosting,
          label: setupLabel || "My Bot",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.message || body.error || `Error ${res.status}`;
        if (msg.includes("unreachable") || msg.includes("fetch")) {
          throw new Error("Could not reach your bot. Check the URL and make sure port 8080 is open.");
        } else if (msg.includes("401") || msg.includes("403")) {
          throw new Error("Authentication failed. Double-check your API key.");
        }
        throw new Error(msg);
      }
      setConnected(true);
    } catch (err: any) {
      setSetupError(err.message || "Connection failed");
    } finally {
      setSetupSaving(false);
    }
  };

  const failCountRef = useRef(0);

  useEffect(() => {
    if (!user || connected === false || connected === null) return;

    let fastTimer: ReturnType<typeof setTimeout>;
    let slowTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const getBackoffMs = (baseMs: number) => {
      if (failCountRef.current === 0) return baseMs;
      return Math.min(baseMs * Math.pow(2, failCountRef.current), 60000);
    };

    const fetchFast = async () => {
      if (cancelled) return;
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
        failCountRef.current = 0;
      } catch (e) {
        failCountRef.current = Math.min(failCountRef.current + 1, 5);
        console.error("fast poll error", e);
      }
      if (!cancelled) fastTimer = setTimeout(fetchFast, getBackoffMs(5000));
    };

    const fetchSlow = async () => {
      if (cancelled) return;
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
      if (!cancelled) slowTimer = setTimeout(fetchSlow, getBackoffMs(15000));
    };

    fetchFast();
    fetchSlow();
    return () => {
      cancelled = true;
      clearTimeout(fastTimer);
      clearTimeout(slowTimer);
    };
  }, [user, connected, apiFetch]);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const perf = performance || {};
  const totalPnl = perf.total_pnl ?? perf.totalPnl ?? perf.cumulative_pnl ?? 0;
  const totalPnlPct = perf.total_pnl_pct ?? perf.totalPnlPct ?? perf.cumulative_pnl_pct;
  const winRate = perf.win_rate ?? perf.winRate ?? 0;
  const winRateNorm = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
  const sharpe = perf.sharpe ?? perf.sharpe_ratio;
  const maxDrawdown = perf.max_drawdown ?? perf.maxDrawdown;
  const todayPnl = perf.today_pnl ?? perf.todayPnl ?? perf.daily_pnl;
  const equity = perf.equity ?? perf.total_equity ?? perf.balance;
  const totalTrades = perf.total_trades ?? perf.totalTrades ?? perf.trade_count ?? trades.length;
  const wins = Math.round(totalTrades * (winRateNorm / 100));

  const stratList: any[] = useMemo(() => {
    if (!strategies) return [];
    if (Array.isArray(strategies)) return strategies;
    if (strategies.strategies) return strategies.strategies;
    return Object.entries(strategies)
      .filter(([k]) => k !== "overall")
      .map(([name, data]: [string, any]) => ({ name, ...data }));
  }, [strategies]);

  const profitableStrategies = stratList.filter(
    (s) => (s.total_pnl ?? s.pnl ?? s.cumulative_pnl ?? 0) > 0
  ).length;

  const streaks = useMemo(() => computeWinStreak(trades), [trades]);
  const level = getLevel(totalTrades);
  const xp = getXp(totalTrades, wins);
  const xpForCurrent = getXpForLevel(level);
  const xpForNext = getXpForLevel(level + 1);
  const xpProgress = Math.min(((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100, 100);
  const rank = getRank(level);
  const RankIcon = rank.icon;

  const achievementCtx: AchievementCtx = {
    totalTrades,
    wins,
    winRate: winRateNorm,
    bestStreak: streaks.best,
    totalPnl,
    strategies: profitableStrategies,
    positions: positions.length,
  };

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.condition(achievementCtx));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.condition(achievementCtx));

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "positions", label: "Positions", icon: List, badge: positions.length > 0 ? `${positions.length}` : undefined },
    { id: "trades", label: "Trades", icon: History, badge: trades.length > 0 ? `${trades.length}` : undefined },
    { id: "strategies", label: "Strategies", icon: Layers },
    { id: "ai", label: "AI Feed", icon: Brain },
  ];

  const isTrading = botStatus?.trading_active || botStatus?.is_running;

  // ─── Not connected ─────────────────────────────────────────────────────────

  if (connected === false) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-purple-500/[0.03]" />

            <div className="relative p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/80 border border-white/10">
                  <WifiOff size={36} className="text-slate-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-3">Connect Your Trading Bot</h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                  Link your NovaPulse bot to unlock live performance, gamified stats, AI reasoning, and full trade visibility.
                </p>
              </div>

              {/* Feature preview */}
              <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: BarChart3, label: "Live P&L Tracking", color: "text-emerald-400" },
                  { icon: Trophy, label: "Rank & Achievements", color: "text-amber-400" },
                  { icon: Brain, label: "AI Reasoning Feed", color: "text-purple-400" },
                  { icon: Activity, label: "Open Positions", color: "text-cyan-400" },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
                    <f.icon size={18} className={`mx-auto mb-1.5 ${f.color}`} />
                    <div className="text-[10px] font-semibold text-slate-500">{f.label}</div>
                  </div>
                ))}
              </div>

              {/* Inline Setup Wizard */}
              {setupStep === 0 ? (
                <div className="space-y-5">
                  <div className="text-center text-sm font-bold text-white">How is your bot hosted?</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => { setSetupHosting("managed"); setSetupStep(1); setSetupError(""); }}
                      className="group rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5 text-left transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.06]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                          <Cloud size={20} className="text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Hosted by Horizon</div>
                          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-400">RECOMMENDED</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        We emailed your bot URL and API key when you subscribed.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:gap-2 transition-all">
                        Select <ChevronRight size={12} />
                      </div>
                    </button>

                    <button
                      onClick={() => { setSetupHosting("self-hosted"); setSetupStep(1); setSetupError(""); }}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                          <Server size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Self-Hosted</div>
                          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-slate-500">ADVANCED</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        You run NovaPulse on your own server or VPS.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white group-hover:gap-2 transition-all">
                        Select <ChevronRight size={12} />
                      </div>
                    </button>
                  </div>

                  <div className="text-center">
                    <Link href="/settings" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                      or set up in Settings with detailed instructions &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => { setSetupStep(0); setSetupError(""); }} className="text-xs text-slate-500 hover:text-white transition-colors">&larr; Back</button>
                    <div className="text-sm font-bold text-white">
                      {setupHosting === "managed" ? "Enter Your Horizon Credentials" : "Enter Your Bot Details"}
                    </div>
                  </div>

                  {/* Contextual help */}
                  <div className={`rounded-xl border p-4 ${setupHosting === "managed" ? "border-cyan-500/10 bg-cyan-500/[0.02]" : "border-white/5 bg-slate-900/30"}`}>
                    {setupHosting === "managed" ? (
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5"><Mail size={12} /> Check your email</div>
                        We sent your <strong className="text-slate-300">Bot URL</strong> (like <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 text-[11px]">http://165.x.x.x:8080</code>) and <strong className="text-slate-300">API Key</strong> (64-char string) when you subscribed.
                        Can&apos;t find it? Check spam or email <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a>.
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5"><Server size={12} /> Self-Hosted Setup</div>
                        Enter your server&apos;s IP + port 8080, and the API key from your bot&apos;s <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 text-[11px]">.secrets/env</code> file or dashboard settings. Make sure port 8080 is open.
                      </div>
                    )}
                  </div>

                  {setupError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <WifiOff size={16} className="shrink-0 mt-0.5" />
                      <span>{setupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleInlineConnect} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Bot URL <span className="text-red-400">*</span></label>
                        <input
                          type="url"
                          required
                          value={setupUrl}
                          onChange={(e) => setSetupUrl(e.target.value)}
                          placeholder={setupHosting === "managed" ? "http://165.245.143.68:8080" : "http://your-ip:8080"}
                          className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-500">API Key <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <input
                            type={showSetupKey ? "text" : "password"}
                            required
                            value={setupKey}
                            onChange={(e) => setSetupKey(e.target.value)}
                            placeholder="Paste your API key"
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 pr-10 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                          />
                          <button type="button" onClick={() => setShowSetupKey(!showSetupKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            {showSetupKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={setupSaving}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
                      >
                        {setupSaving ? (
                          <><RefreshCw size={16} className="animate-spin" /> Testing Connection...</>
                        ) : (
                          <><Wifi size={16} /> Test &amp; Connect</>
                        )}
                      </button>
                      <button type="button" onClick={() => { setSetupStep(0); setSetupError(""); }} className="text-sm text-slate-500 hover:text-white transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>

                  <div className="text-center pt-2">
                    <Link href="/settings" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                      Need more help? Go to Settings for detailed instructions &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (connected === null) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw size={32} className="animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">Connecting to your bot...</p>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* ═══════════════ TOP BAR: Trader Profile + Bot Status ═══════════════ */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          {/* Trader Profile Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5 sm:flex-row sm:items-center sm:gap-6">
            {/* Rank Badge */}
            <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${rank.bg} border ${rank.border}`}>
              <RankIcon size={28} className={rank.color} />
              <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border border-white/10 text-xs font-black text-white">
                {level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-white truncate">
                  {user?.email?.split("@")[0] || "Trader"}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rank.bg} ${rank.color} border ${rank.border}`}>
                  {rank.name}
                </span>
              </div>

              {/* XP Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 shrink-0">
                  {xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
                </span>
              </div>

              {/* Quick Stats Row */}
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <Trophy size={12} className="text-amber-400" />
                  <span className="text-slate-400">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                </div>
                {streaks.current > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-orange-400 font-bold">{streaks.current} win streak</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <BarChart3 size={12} className="text-cyan-400" />
                  <span className="text-slate-400">{totalTrades} trades</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Target size={12} className="text-emerald-400" />
                  <span className="text-slate-400">{winRateNorm.toFixed(0)}% win rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Status Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5 min-w-[240px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isTrading ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isTrading ? "bg-emerald-500" : "bg-amber-500"}`} />
                </span>
                <span className={`text-sm font-bold ${isTrading ? "text-emerald-400" : "text-amber-400"}`}>
                  {isTrading ? "Trading Active" : "Paused"}
                </span>
              </div>
              <Wifi size={14} className="text-emerald-400" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{positions.length} open position{positions.length !== 1 ? "s" : ""}</span>
              {lastUpdate && (
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock size={10} />
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className={`rounded-xl ${pnlBg(totalPnl)} p-3 text-center`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total P&L</div>
              <div className={`text-xl font-extrabold ${pnlColor(totalPnl)}`}>{fmtUsd(totalPnl)}</div>
            </div>
          </div>
        </div>

        {/* ═══════════════ TAB NAV ═══════════════ */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-white/5 bg-slate-900/30 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge && (
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════ TAB CONTENT ═══════════════ */}
        <div className="min-h-[500px]">

          {/* ══════ OVERVIEW ══════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Total P&L",
                    value: fmtUsd(totalPnl),
                    sub: totalPnlPct != null ? fmtPct(totalPnlPct) : undefined,
                    color: pnlColor(totalPnl),
                    icon: DollarSign,
                    iconColor: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
                  },
                  {
                    label: "Win Rate",
                    value: `${winRateNorm.toFixed(1)}%`,
                    sub: `${totalTrades} trades`,
                    color: "text-white",
                    icon: Target,
                    iconColor: "text-cyan-400",
                    bar: winRateNorm,
                  },
                  {
                    label: "Today P&L",
                    value: fmtUsd(todayPnl),
                    color: pnlColor(todayPnl),
                    icon: TrendingUp,
                    iconColor: "text-blue-400",
                  },
                  {
                    label: "Equity",
                    value: equity ? `$${fmt(equity)}` : "—",
                    color: "text-white",
                    icon: BarChart3,
                    iconColor: "text-purple-400",
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="group rounded-2xl border border-white/5 bg-slate-900/30 p-5 transition-all hover:border-white/10 hover:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {kpi.label}
                      </span>
                      <kpi.icon size={16} className={`${kpi.iconColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <div className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
                    {kpi.sub && <div className={`text-xs mt-1 ${pnlColor(totalPnlPct)}`}>{kpi.sub}</div>}
                    {kpi.bar != null && (
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-1000"
                          style={{ width: `${Math.min(kpi.bar, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Secondary KPIs */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Sharpe Ratio</div>
                  <div className="text-xl font-bold text-white">{fmt(sharpe)}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Max Drawdown</div>
                  <div className="text-xl font-bold text-red-400">
                    {maxDrawdown != null ? `${Math.abs(maxDrawdown).toFixed(2)}%` : "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Open Positions</div>
                  <div className="text-xl font-bold text-white">{positions.length}</div>
                </div>
              </div>

              {/* Two-Column: Strategies + Achievements */}
              <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                {/* Strategy Breakdown */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400" /> Strategy Performance
                  </h3>
                  {stratList.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-8 text-center text-sm text-slate-500">
                      Strategy data will appear after the bot executes trades.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stratList.map((s: any, i: number) => {
                        const wr = s.win_rate ?? s.winRate ?? 0;
                        const wrNorm = wr < 1 && wr > 0 ? wr * 100 : wr;
                        const pnl = s.total_pnl ?? s.pnl ?? s.cumulative_pnl ?? 0;
                        const count = s.total_trades ?? s.trade_count ?? s.trades ?? 0;
                        return (
                          <div
                            key={s.name || s.strategy || i}
                            className="group flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/20 px-5 py-3.5 transition-all hover:border-white/10 hover:bg-slate-900/40"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-white capitalize truncate">{s.name || s.strategy}</span>
                                <span className={`text-sm font-mono font-bold ${pnlColor(pnl)}`}>{fmtUsd(pnl)}</span>
                              </div>
                              <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${pnl >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(wrNorm, 100)}%` }}
                                />
                              </div>
                              <div className="flex gap-4 mt-1.5 text-[10px] text-slate-500">
                                <span>WR: {wrNorm.toFixed(0)}%</span>
                                <span>Trades: {count}</span>
                                {s.sharpe != null && <span>Sharpe: {fmt(s.sharpe)}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Achievements Panel */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Trophy size={14} className="text-amber-400" /> Achievements
                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {unlockedAchievements.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 transition-all"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color === "text-amber-400" ? "bg-amber-400/10" : a.color === "text-emerald-400" ? "bg-emerald-400/10" : a.color === "text-cyan-400" ? "bg-cyan-400/10" : a.color === "text-purple-400" ? "bg-purple-400/10" : a.color === "text-orange-400" ? "bg-orange-400/10" : a.color === "text-blue-400" ? "bg-blue-400/10" : a.color === "text-yellow-400" ? "bg-yellow-400/10" : "bg-white/5"}`}>
                          <a.icon size={16} className={a.color} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white">{a.name}</div>
                          <div className="text-[10px] text-slate-500">{a.desc}</div>
                        </div>
                        <Check size={14} className="shrink-0 text-emerald-400 ml-auto" />
                      </div>
                    ))}
                    {lockedAchievements.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/20 px-4 py-3 opacity-40"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                          <a.icon size={16} className="text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-500">{a.name}</div>
                          <div className="text-[10px] text-slate-600">{a.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Overview */}
              {risk && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-400" /> Risk Overview
                  </h3>
                  <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                      {Object.entries(risk)
                        .filter(([, val]) => typeof val !== "object")
                        .slice(0, 8)
                        .map(([key, val]) => (
                          <div key={key}>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{key.replace(/_/g, " ")}</div>
                            <div className="mt-1 text-white font-mono">{typeof val === "number" ? fmt(val as number) : String(val)}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ POSITIONS ══════ */}
          {activeTab === "positions" && (
            <div>
              {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
                    <List size={36} className="opacity-30" />
                  </div>
                  <p className="text-lg font-semibold text-slate-400 mb-2">No open positions</p>
                  <p className="text-sm text-slate-500">Your bot is scanning for opportunities. Positions will appear here when trades are executed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.map((p: any, i: number) => {
                    const side = p.side || (p.quantity > 0 ? "long" : "short");
                    const unrealizedPnl = p.unrealized_pnl ?? p.pnl ?? p.unrealizedPnl ?? 0;
                    const isLong = side === "long" || side === "buy";
                    return (
                      <div
                        key={p.trade_id || p.id || i}
                        className="rounded-2xl border border-white/5 bg-slate-900/30 p-5 transition-all hover:border-white/10"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Left: Pair + Side */}
                          <div className="flex items-center gap-4">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isLong ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                              {isLong ? <ArrowUpRight size={20} className="text-emerald-400" /> : <ArrowDownRight size={20} className="text-red-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-white">{p.pair || p.symbol}</span>
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                  {side}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 capitalize">{p.strategy || "—"}</div>
                            </div>
                          </div>

                          {/* Center: Price info */}
                          <div className="flex gap-6 text-sm">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">Entry</div>
                              <div className="font-mono text-slate-300">{fmt(p.entry_price ?? p.entry)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">Current</div>
                              <div className="font-mono text-slate-300">{fmt(p.current_price ?? p.mark_price)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">SL / TP</div>
                              <div className="font-mono">
                                <span className="text-red-400">{fmt(p.stop_loss ?? p.sl)}</span>
                                <span className="text-slate-600"> / </span>
                                <span className="text-emerald-400">{fmt(p.take_profit ?? p.tp)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: P&L + Duration */}
                          <div className="text-right">
                            <div className={`text-lg font-extrabold ${pnlColor(unrealizedPnl)}`}>{fmtUsd(unrealizedPnl)}</div>
                            {p.entry_time && (
                              <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                <Clock size={10} /> {duration(p.entry_time)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════ TRADES ══════ */}
          {activeTab === "trades" && (
            <div>
              {trades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
                    <History size={36} className="opacity-30" />
                  </div>
                  <p className="text-lg font-semibold text-slate-400 mb-2">No completed trades yet</p>
                  <p className="text-sm text-slate-500">Completed trades will appear here with full details and P&L breakdowns.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Win/Loss Streak Header */}
                  <div className="flex items-center gap-4 mb-4">
                    {streaks.current > 0 && (
                      <div className="flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-2">
                        <Flame size={16} className="text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">{streaks.current} Win Streak</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2">
                      <Star size={16} className="text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">Best: {streaks.best}</span>
                    </div>
                    <div className="text-xs text-slate-500 ml-auto">
                      Showing last {trades.length} trades
                    </div>
                  </div>

                  {/* Trade List */}
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                          <th className="px-5 py-3.5">Pair</th>
                          <th className="px-5 py-3.5">Side</th>
                          <th className="px-5 py-3.5">P&L</th>
                          <th className="px-5 py-3.5">P&L %</th>
                          <th className="px-5 py-3.5">Strategy</th>
                          <th className="px-5 py-3.5">Exit</th>
                          <th className="px-5 py-3.5">Duration</th>
                          <th className="px-5 py-3.5">Closed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((t: any, i: number) => {
                          const pnl = t.pnl ?? t.realized_pnl;
                          const pnlPctVal = t.pnl_pct ?? t.pnl_percent;
                          const side = t.side || (t.quantity > 0 ? "long" : "short");
                          const isWin = (pnl ?? 0) > 0;
                          return (
                            <tr
                              key={t.trade_id || t.id || i}
                              className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${isWin ? "" : ""}`}
                            >
                              <td className="px-5 py-3 font-bold text-white">{t.pair || t.symbol}</td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  side === "long" || side === "buy"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}>
                                  {side}
                                </span>
                              </td>
                              <td className={`px-5 py-3 font-mono font-bold ${pnlColor(pnl)}`}>{fmtUsd(pnl)}</td>
                              <td className={`px-5 py-3 font-mono ${pnlColor(pnlPctVal)}`}>{fmtPct(pnlPctVal)}</td>
                              <td className="px-5 py-3 text-slate-300 capitalize">{t.strategy || "—"}</td>
                              <td className="px-5 py-3 text-slate-400 capitalize text-xs">{t.exit_reason || t.close_reason || "—"}</td>
                              <td className="px-5 py-3 text-slate-400 text-xs">
                                {t.entry_time && t.exit_time ? duration(t.entry_time, t.exit_time) : "—"}
                              </td>
                              <td className="px-5 py-3 text-slate-500 text-xs">
                                {t.exit_time ? new Date(t.exit_time).toLocaleDateString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ STRATEGIES ══════ */}
          {activeTab === "strategies" && (
            <div>
              {stratList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
                    <Layers size={36} className="opacity-30" />
                  </div>
                  <p className="text-lg font-semibold text-slate-400 mb-2">No strategy data yet</p>
                  <p className="text-sm text-slate-500">Strategy performance will populate as your bot executes trades.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stratList.map((s: any, i: number) => {
                    const wr = s.win_rate ?? s.winRate ?? 0;
                    const wrNorm = wr < 1 && wr > 0 ? wr * 100 : wr;
                    const pnl = s.total_pnl ?? s.pnl ?? s.cumulative_pnl ?? 0;
                    const count = s.total_trades ?? s.trade_count ?? s.trades ?? 0;
                    const isProfit = pnl >= 0;
                    return (
                      <div
                        key={s.name || s.strategy || i}
                        className={`group rounded-2xl border p-6 transition-all hover:bg-slate-900/50 ${
                          isProfit ? "border-emerald-500/10 bg-slate-900/30 hover:border-emerald-500/20" : "border-red-500/10 bg-slate-900/30 hover:border-red-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-bold text-white capitalize">{s.name || s.strategy}</h3>
                          <div className={`rounded-lg px-3 py-1 text-xs font-bold ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {fmtUsd(pnl)}
                          </div>
                        </div>

                        {/* Win rate meter */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-500">Win Rate</span>
                            <span className="font-mono font-bold text-white">{wrNorm.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isProfit ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"}`}
                              style={{ width: `${Math.min(wrNorm, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                            <div className="text-slate-500">Trades</div>
                            <div className="font-mono font-bold text-white mt-0.5">{count}</div>
                          </div>
                          {s.avg_pnl != null && (
                            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                              <div className="text-slate-500">Avg P&L</div>
                              <div className={`font-mono font-bold mt-0.5 ${pnlColor(s.avg_pnl)}`}>{fmtUsd(s.avg_pnl)}</div>
                            </div>
                          )}
                          {s.sharpe != null && (
                            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                              <div className="text-slate-500">Sharpe</div>
                              <div className="font-mono font-bold text-white mt-0.5">{fmt(s.sharpe)}</div>
                            </div>
                          )}
                          {s.max_drawdown != null && (
                            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                              <div className="text-slate-500">Drawdown</div>
                              <div className="font-mono font-bold text-red-400 mt-0.5">{Math.abs(s.max_drawdown).toFixed(2)}%</div>
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

          {/* ══════ AI FEED ══════ */}
          {activeTab === "ai" && (
            <div>
              {thoughts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
                    <Brain size={36} className="opacity-30" />
                  </div>
                  <p className="text-lg font-semibold text-slate-400 mb-2">No AI thoughts yet</p>
                  <p className="text-sm text-slate-500">The AI reasoning feed will populate as your bot analyzes markets.</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={16} className="text-purple-400" />
                    <span className="text-sm font-bold text-slate-400">Live Reasoning Feed</span>
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
                    </span>
                  </div>
                  {thoughts.map((t: any, i: number) => (
                    <div
                      key={t.id || i}
                      className="rounded-xl border border-white/5 bg-slate-900/30 p-4 border-l-4 border-l-purple-500/40 transition-all hover:bg-slate-900/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {t.thought || t.message || t.text}
                        </p>
                        <span className="text-[10px] text-slate-600 whitespace-nowrap shrink-0">
                          {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : ""}
                        </span>
                      </div>
                      {(t.strategy || t.category) && (
                        <div className="mt-2.5 flex gap-2">
                          {t.strategy && (
                            <span className="rounded-md bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                              {t.strategy}
                            </span>
                          )}
                          {t.category && (
                            <span className="rounded-md bg-slate-700/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 border border-white/5">
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

