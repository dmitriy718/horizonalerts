"use client";
import { useState, useEffect, useCallback } from "react";
import { Camera, Mail, Lock, User, Trophy, Flame, Target, Shield, Zap, Bot, Wifi, WifiOff, Loader2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";

export default function SettingsPage() {
  const { user: firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Bot connection state
  const [botConnection, setBotConnection] = useState<any>(null);
  const [botLoading, setBotLoading] = useState(true);
  const [botForm, setBotForm] = useState({ bot_url: "", api_key: "", label: "My Bot" });
  const [botSaving, setBotSaving] = useState(false);
  const [botError, setBotError] = useState("");
  const [botSuccess, setBotSuccess] = useState("");

  // Mock User State
  const [user, setUser] = useState({
    displayName: "CryptoKing99",
    email: "trader@example.com",
    bio: "Swing trader looking for high beta plays. Not financial advice.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing99",
    favStocks: ["NVDA", "MSTR", "COIN"],
    watching: ["TSLA", "AMD"],
    stats: {
      diamondHands: 87,
      winStreak: 12,
      riskLevel: "Degen",
      sectorBadge: "Tech Titan",
      reputation: 450,
      pipsCaptured: 12400
    }
  });

  const apiFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      if (!firebaseUser) return null;
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/bot${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `Error ${res.status}`);
      }
      return res.json();
    },
    [firebaseUser]
  );

  // Load bot connection on mount
  useEffect(() => {
    if (!firebaseUser) return;
    setBotLoading(true);
    apiFetch("/connection")
      .then((data) => setBotConnection(data))
      .catch(() => setBotConnection(null))
      .finally(() => setBotLoading(false));
  }, [firebaseUser, apiFetch]);

  const handleBotConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBotError("");
    setBotSuccess("");
    setBotSaving(true);
    try {
      const result = await apiFetch("/connection", {
        method: "PUT",
        body: JSON.stringify({
          bot_url: botForm.bot_url,
          api_key: botForm.api_key,
          hosting_type: "self-hosted",
          label: botForm.label || "My Bot",
        }),
      });
      setBotConnection(result?.connection || result);
      setBotSuccess("Bot connected successfully!");
      setBotForm({ bot_url: "", api_key: "", label: "My Bot" });
    } catch (err: any) {
      setBotError(err.message || "Failed to connect bot");
    } finally {
      setBotSaving(false);
    }
  };

  const handleBotDisconnect = async () => {
    setBotError("");
    setBotSuccess("");
    setBotSaving(true);
    try {
      await apiFetch("/connection", { method: "DELETE" });
      setBotConnection(null);
      setBotSuccess("Bot disconnected.");
    } catch (err: any) {
      setBotError(err.message || "Failed to disconnect");
    } finally {
      setBotSaving(false);
    }
  };

  const maskUrl = (url: string) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname.slice(0, 4)}***:${u.port || "443"}`;
    } catch {
      return "***";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Account Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-2">
            {[
              { id: "profile", label: "Public Profile", icon: User },
              { id: "bot", label: "Trading Bot", icon: Bot },
              { id: "account", label: "Account Security", icon: Lock },
              { id: "gamification", label: "Trader Stats", icon: Trophy },
              { id: "notifications", label: "Notifications", icon: Mail },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="space-y-6">

            {/* Gamification Header (Always Visible) */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Win Streak</div>
                <div className="mt-2 text-3xl font-bold text-white flex items-center gap-2">
                  {user.stats.winStreak} <span className="text-lg text-orange-500">Days</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Hands Score</div>
                <div className="mt-2 text-3xl font-bold text-white flex items-center gap-2">
                  {user.stats.diamondHands} <span className="text-lg text-cyan-400">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{ width: `${user.stats.diamondHands}%` }} />
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sector Rank</div>
                <div className="mt-2 text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {user.stats.sectorBadge}
                </div>
                <div className="text-xs text-slate-400 mt-1">Top 5% in Technology</div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Public Profile</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                      <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full border-4 border-slate-800 bg-slate-800" />
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 rounded-full bg-cyan-500 p-2 text-black shadow-lg hover:bg-cyan-400">
                          <Camera size={16} />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{user.displayName}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                          PRO MEMBER
                        </span>
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                          {user.stats.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Display Name</label>
                      <input
                        disabled={!isEditing}
                        type="text"
                        value={user.displayName}
                        onChange={(e) => setUser({...user, displayName: e.target.value})}
                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                      <input
                        disabled={!isEditing}
                        type="email"
                        value={user.email}
                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Bio</label>
                    <textarea
                      disabled={!isEditing}
                      rows={3}
                      value={user.bio}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold uppercase text-slate-500">Watchlist & Favorites</label>
                    <div className="flex flex-wrap gap-2">
                      {user.favStocks.map(ticker => (
                        <span key={ticker} className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                          {ticker}
                          {isEditing && <button className="hover:text-emerald-200">x</button>}
                        </span>
                      ))}
                      {user.watching.map(ticker => (
                        <span key={ticker} className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 border border-blue-500/20">
                          {ticker}
                          {isEditing && <button className="hover:text-blue-200">x</button>}
                        </span>
                      ))}
                      {isEditing && (
                        <button className="rounded-full border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-500 hover:text-white hover:border-white transition-colors">
                          + Add Ticker
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TRADING BOT TAB ===== */}
              {activeTab === "bot" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Trading Bot Connection</h2>
                  </div>

                  {/* Status messages */}
                  {botError && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <XCircle size={16} className="shrink-0" />
                      {botError}
                    </div>
                  )}
                  {botSuccess && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2 size={16} className="shrink-0" />
                      {botSuccess}
                    </div>
                  )}

                  {botLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={32} className="animate-spin text-cyan-400" />
                    </div>
                  ) : botConnection ? (
                    /* Connected state */
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                          <Wifi size={24} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                            <span className="text-sm font-bold text-emerald-400">Connected</span>
                          </div>
                          <p className="text-sm text-slate-400">{botConnection.label || "My Bot"}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-xs font-bold uppercase text-slate-500">Bot URL</div>
                          <div className="text-sm font-mono text-slate-300">{maskUrl(botConnection.bot_url)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold uppercase text-slate-500">Hosting</div>
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            botConnection.hosting_type === "managed"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {botConnection.hosting_type === "managed" ? "Managed" : "Self-Hosted"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-6">
                        <button
                          onClick={handleBotDisconnect}
                          disabled={botSaving}
                          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {botSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          Disconnect Bot
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Not connected — connection form */
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                          <WifiOff size={24} className="text-slate-500" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-400">Not Connected</span>
                          <p className="text-xs text-slate-500">Enter your NovaPulse bot URL and API key below.</p>
                        </div>
                      </div>

                      <form onSubmit={handleBotConnect} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Bot Label</label>
                          <input
                            type="text"
                            value={botForm.label}
                            onChange={(e) => setBotForm({ ...botForm, label: e.target.value })}
                            placeholder="My Bot"
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Bot URL</label>
                          <input
                            type="url"
                            required
                            value={botForm.bot_url}
                            onChange={(e) => setBotForm({ ...botForm, bot_url: e.target.value })}
                            placeholder="http://your-bot-ip:8080"
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">API Key</label>
                          <input
                            type="password"
                            required
                            value={botForm.api_key}
                            onChange={(e) => setBotForm({ ...botForm, api_key: e.target.value })}
                            placeholder="Your bot read or admin API key"
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={botSaving}
                          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 transition-all disabled:opacity-50"
                        >
                          {botSaving ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                          Test & Connect
                        </button>
                      </form>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500 leading-relaxed">
                        <p className="font-bold text-slate-400 mb-1">How it works</p>
                        <p>
                          We&apos;ll test the connection by calling your bot&apos;s status endpoint. If successful,
                          the dashboard will display live performance data, positions, trades, and AI thoughts
                          from your NovaPulse bot.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white">Security Settings</h2>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                    <div className="flex items-start gap-4">
                      <Zap className="text-red-400 shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-200 mt-1">
                          Deleting your account is irreversible. All your gamification stats and trading history will be lost.
                        </p>
                        <button className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
