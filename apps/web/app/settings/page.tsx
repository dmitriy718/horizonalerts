"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Camera, Mail, Lock, User, Trophy, Flame, Target, Shield, Zap, Bot,
  Wifi, WifiOff, Loader2, Trash2, CheckCircle2, XCircle, ExternalLink,
  Cloud, Server, HelpCircle, Eye, EyeOff, RefreshCw, ChevronRight,
  ArrowRight, Copy, Check, BarChart3, Activity, Brain,
  Bell, BellOff, AlertTriangle, TrendingUp, Megaphone, ShieldAlert,
  Star, Award, Crown, Gem, Crosshair, DollarSign, Layers,
  MessageSquare, Send, Clock, Plus,
  Smartphone, Key, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";
import {
  RANKS, ACHIEVEMENTS, getLevel, getXp, getXpForLevel, getRank,
  type AchievementCtx as AchCtx,
} from "../lib/gamification";
import Link from "next/link";

export default function SettingsPage() {
  const { user: firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Bot connection state
  const [botConnection, setBotConnection] = useState<any>(null);
  const [botLoading, setBotLoading] = useState(true);
  const [botForm, setBotForm] = useState({ bot_url: "", api_key: "", label: "My Bot", hosting_type: "managed" as "managed" | "self-hosted" });
  const [botSaving, setBotSaving] = useState(false);
  const [botError, setBotError] = useState("");
  const [botSuccess, setBotSuccess] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0); // 0=choose type, 1=enter details, 2=testing
  const [testResult, setTestResult] = useState<"idle" | "testing" | "success" | "fail">("idle");

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<any>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifDirty, setNotifDirty] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");

  // Profile editing state
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Support tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({ department: "tech_support", subject: "", message: "", priority: "normal" });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketReply, setTicketReply] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");

  // Gamification state
  const [gamifData, setGamifData] = useState<any>(null);
  const [gamifLoading, setGamifLoading] = useState(false);

  // User data derived from Firebase auth
  const displayName = profileData?.firstName
    ? `${profileData.firstName}${profileData.lastName ? ` ${profileData.lastName}` : ""}`
    : firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Trader";
  const userEmail = firebaseUser?.email || "";

  const apiFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      if (!firebaseUser) return null;
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/bot${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
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

  /** Generic API fetch (not bot-scoped) */
  const apiRequest = useCallback(
    async (path: string, options?: RequestInit) => {
      if (!firebaseUser) return null;
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
          ...(options?.headers || {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `Error ${res.status}`);
      }
      return res.json();
    },
    [firebaseUser]
  );

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
    setTestResult("testing");
    try {
      const result = await apiFetch("/connection", {
        method: "PUT",
        body: JSON.stringify({
          bot_url: botForm.bot_url.replace(/\/+$/, ""),
          api_key: botForm.api_key,
          hosting_type: botForm.hosting_type,
          label: botForm.label || "My Bot",
        }),
      });
      setTestResult("success");
      setBotConnection(result?.connection || result);
      setBotSuccess("Bot connected successfully! Your dashboard is now live.");
      setBotForm({ bot_url: "", api_key: "", label: "My Bot", hosting_type: "managed" });
    } catch (err: any) {
      setTestResult("fail");
      const msg = err.message || "Failed to connect bot";
      if (msg.includes("unreachable") || msg.includes("fetch")) {
        setBotError("Could not reach your bot. Make sure the URL is correct and the bot is running. Check that port 8080 is open in your firewall.");
      } else if (msg.includes("status 401") || msg.includes("status 403")) {
        setBotError("Authentication failed. Double-check your API key. It should be the read key or admin key from your bot's dashboard.");
      } else if (msg.includes("status 4")) {
        setBotError(`Bot returned an error (${msg}). Make sure the bot is running the latest version of NovaPulse.`);
      } else {
        setBotError(msg);
      }
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
      setConnectionStep(0);
      setTestResult("idle");
    } catch (err: any) {
      setBotError(err.message || "Failed to disconnect");
    } finally {
      setBotSaving(false);
    }
  };

  const maskUrl = (url: string) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}:${u.port || "443"}`;
    } catch {
      return "***";
    }
  };

  // Fetch profile data
  useEffect(() => {
    if (!firebaseUser || profileData) return;
    setProfileLoading(true);
    apiRequest("/me/profile")
      .then((data) => {
        if (data) {
          setProfileData(data);
          setProfileFirstName(data.firstName || "");
          setProfileLastName(data.lastName || "");
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [firebaseUser, apiRequest, profileData]);

  // Fetch notification preferences when tab is active
  useEffect(() => {
    if (activeTab !== "notifications" || !firebaseUser || notifPrefs) return;
    setNotifLoading(true);
    apiRequest("/me/preferences")
      .then((data) => { setNotifPrefs(data); setNotifDirty(false); })
      .catch(() => setNotifError("Failed to load preferences"))
      .finally(() => setNotifLoading(false));
  }, [activeTab, firebaseUser, apiRequest, notifPrefs]);

  // Fetch tickets when support tab is active
  useEffect(() => {
    if (activeTab !== "support" || !firebaseUser) return;
    setTicketsLoading(true);
    apiRequest("/me/tickets")
      .then((data) => { if (data) setTickets(data); })
      .catch(() => setTicketError("Failed to load tickets"))
      .finally(() => setTicketsLoading(false));
  }, [activeTab, firebaseUser, apiRequest]);

  // Fetch gamification data when tab is active
  useEffect(() => {
    if (activeTab !== "gamification" || !firebaseUser || gamifData) return;
    setGamifLoading(true);
    const fetchGamif = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const [perf, trades] = await Promise.all([
          fetch(`${getApiBaseUrl()}/bot/performance`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
          fetch(`${getApiBaseUrl()}/bot/trades?limit=200`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
        ]);
        setGamifData({ perf, trades: Array.isArray(trades) ? trades : trades?.trades || [] });
      } catch { /* silently fail */ }
      setGamifLoading(false);
    };
    fetchGamif();
  }, [activeTab, firebaseUser, gamifData]);

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const result = await apiRequest("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ firstName: profileFirstName, lastName: profileLastName }),
      });
      // Use server response data instead of local input values (optimistic update fix)
      if (result) {
        setProfileData(result);
        setProfileFirstName(result.firstName || "");
        setProfileLastName(result.lastName || "");
      }
      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const submitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setTicketError("Subject and message are required.");
      return;
    }
    setTicketSubmitting(true);
    setTicketError("");
    setTicketSuccess("");
    try {
      await apiRequest("/me/tickets", {
        method: "POST",
        body: JSON.stringify(newTicket),
      });
      setTicketSuccess("Ticket submitted! We'll respond within 24 hours.");
      setNewTicket({ department: "tech_support", subject: "", message: "", priority: "normal" });
      setShowNewTicket(false);
      // Refresh ticket list
      const data = await apiRequest("/me/tickets");
      if (data) setTickets(data);
    } catch (err: any) {
      setTicketError(err.message || "Failed to submit ticket");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const viewTicket = async (id: number) => {
    setTicketError("");
    try {
      const data = await apiRequest(`/me/tickets/${id}`);
      if (data) setActiveTicket(data);
    } catch (err: any) {
      setTicketError(err.message || "Failed to load ticket details");
    }
  };

  const sendTicketReply = async () => {
    if (!activeTicket || !ticketReply.trim()) return;
    try {
      await apiRequest(`/me/tickets/${activeTicket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: ticketReply }),
      });
      setTicketReply("");
      // Refresh ticket
      const data = await apiRequest(`/me/tickets/${activeTicket.id}`);
      if (data) setActiveTicket(data);
    } catch {}
  };

  // Gamification computed values
  const gamifPerf = gamifData?.perf || {};
  const gamifTrades = gamifData?.trades || [];
  const gTotalTrades = gamifPerf.total_trades ?? gamifPerf.totalTrades ?? gamifTrades.length;
  const gWinRate = (() => { const wr = gamifPerf.win_rate ?? gamifPerf.winRate ?? 0; return wr < 1 && wr > 0 ? wr * 100 : wr; })();
  const gWins = Math.round(gTotalTrades * (gWinRate / 100));
  const gTotalPnl = gamifPerf.total_pnl ?? gamifPerf.totalPnl ?? 0;
  const gLevel = getLevel(gTotalTrades);
  const gXp = getXp(gTotalTrades, gWins);
  const gXpForCurrent = getXpForLevel(gLevel);
  const gXpForNext = getXpForLevel(gLevel + 1);
  const gXpRange = gXpForNext - gXpForCurrent;
  const gXpProgress = gXpRange > 0 ? Math.min(Math.max(((gXp - gXpForCurrent) / gXpRange) * 100, 0), 100) : 0;
  const gRank = getRank(gLevel);
  const GRankIcon = gRank.icon;
  const gBestStreak = useMemo(() => {
    if (!gamifTrades.length) return 0;
    const sorted = [...gamifTrades].sort((a: any, b: any) => {
      const ta = a.exit_time ? new Date(a.exit_time).getTime() : 0;
      const tb = b.exit_time ? new Date(b.exit_time).getTime() : 0;
      return tb - ta;
    });
    let best = 0, streak = 0;
    for (const t of [...sorted].reverse()) {
      const pnl = t.pnl ?? t.realized_pnl ?? 0;
      if (pnl > 0) { streak++; best = Math.max(best, streak); } else { streak = 0; }
    }
    return best;
  }, [gamifTrades]);
  const gStrategies = useMemo(() => {
    const set = new Set<string>();
    gamifTrades.forEach((t: any) => {
      if (t.strategy && (t.pnl ?? t.realized_pnl ?? 0) > 0) set.add(t.strategy);
    });
    return set.size;
  }, [gamifTrades]);
  const gAchCtx: AchCtx = { totalTrades: gTotalTrades, wins: gWins, winRate: gWinRate, bestStreak: gBestStreak, totalPnl: gTotalPnl, strategies: gStrategies };
  const gUnlocked = ACHIEVEMENTS.filter(a => a.condition(gAchCtx));
  const gLocked = ACHIEVEMENTS.filter(a => !a.condition(gAchCtx));

  const toggleNotifPref = (category: string, key: string) => {
    if (!notifPrefs) return;
    const updated = JSON.parse(JSON.stringify(notifPrefs));
    const current = updated.notifications[category]?.[key]?.email;
    if (current === undefined) return;
    updated.notifications[category][key].email = !current;
    setNotifPrefs(updated);
    setNotifDirty(true);
    setNotifSuccess("");
  };

  const handleGlobalUnsubscribe = () => {
    if (!notifPrefs) return;
    const updated = { ...notifPrefs, global_unsubscribe: !notifPrefs.global_unsubscribe };
    setNotifPrefs(updated);
    setNotifDirty(true);
    setNotifSuccess("");
  };

  const saveNotifPrefs = async () => {
    if (!notifPrefs) return;
    setNotifSaving(true);
    setNotifError("");
    setNotifSuccess("");
    try {
      const result = await apiRequest("/me/preferences", {
        method: "PUT",
        body: JSON.stringify(notifPrefs),
      });
      setNotifPrefs(result);
      setNotifDirty(false);
      setNotifSuccess("Preferences saved.");
    } catch (err: any) {
      setNotifError(err.message || "Failed to save preferences");
    } finally {
      setNotifSaving(false);
    }
  };

  const NotifToggle = ({ enabled, locked, onChange }: { enabled: boolean; locked?: boolean; onChange: () => void }) => (
    <button
      type="button"
      disabled={locked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${enabled ? "bg-cyan-500" : "bg-slate-600"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  const NotifRow = ({ label, description, enabled, locked, onChange }: { label: string; description?: string; enabled: boolean; locked?: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <NotifToggle enabled={enabled} locked={locked} onChange={onChange} />
    </div>
  );

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
              { id: "support", label: "Support", icon: MessageSquare },
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
                {item.id === "bot" && botConnection && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                )}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Account Overview Header */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><User size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Account</div>
                <div className="mt-2 text-xl font-bold text-white truncate">{displayName}</div>
                <div className="text-xs text-slate-400 mt-1 truncate">{userEmail}</div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Status</div>
                <div className="mt-2 text-xl font-bold flex items-center gap-2">
                  {firebaseUser?.emailVerified ? (
                    <span className="text-emerald-400">Verified</span>
                  ) : (
                    <span className="text-amber-400">Unverified</span>
                  )}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Bot Status</div>
                <div className="mt-2 text-xl font-bold flex items-center gap-2">
                  {botConnection ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
                      Connected
                    </span>
                  ) : (
                    <span className="text-slate-400">Not Connected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">

              {/* ===== PROFILE TAB ===== */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Your Profile</h2>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setIsEditing(false); setProfileFirstName(profileData?.firstName || ""); setProfileLastName(profileData?.lastName || ""); }} className="text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={saveProfile} disabled={profileSaving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50">
                          {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                        </button>
                      </div>
                    )}
                  </div>

                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2 size={16} /> {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <XCircle size={16} /> {profileError}
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-slate-800 text-3xl font-black text-cyan-400">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{displayName}</h3>
                      <p className="text-sm text-slate-400">{userEmail}</p>
                      <div className="flex gap-2 mt-2">
                        {firebaseUser?.emailVerified && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">VERIFIED</span>
                        )}
                        {botConnection && (
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">BOT CONNECTED</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="profile-fname" className="text-xs font-bold uppercase text-slate-500">First Name</label>
                      <input
                        id="profile-fname"
                        type="text"
                        disabled={!isEditing}
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        className={`w-full rounded-xl bg-black/20 border px-4 py-3 text-white focus:outline-none transition-all ${isEditing ? "border-cyan-500/30 focus:border-cyan-500" : "border-white/10 opacity-60"}`}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-lname" className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                      <input
                        id="profile-lname"
                        type="text"
                        disabled={!isEditing}
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        className={`w-full rounded-xl bg-black/20 border px-4 py-3 text-white focus:outline-none transition-all ${isEditing ? "border-cyan-500/30 focus:border-cyan-500" : "border-white/10 opacity-60"}`}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-email" className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                        Email Address <Lock size={10} className="text-slate-600" />
                      </label>
                      <input id="profile-email" disabled type="email" value={userEmail} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none opacity-60" />
                      <p className="text-[10px] text-slate-600">
                        To change your email, contact <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a>.
                      </p>
                    </div>
                    {profileData?.createdAt && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Member Since</label>
                        <div className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white opacity-60">
                          {new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== TRADING BOT TAB ===== */}
              {activeTab === "bot" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Trading Bot Connection</h2>
                    <p className="text-sm text-slate-400 mt-1">Connect your NovaPulse bot to see live stats, trades, and AI activity on your dashboard.</p>
                  </div>

                  {/* Status messages */}
                  {botError && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
                      <XCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold mb-1">Connection Failed</div>
                        <div className="text-red-400/80 leading-relaxed">{botError}</div>
                      </div>
                    </div>
                  )}
                  {botSuccess && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-400">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">{botSuccess}</div>
                        {testResult === "success" && (
                          <Link href="/dashboard" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                            Go to Dashboard <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {botLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={32} className="animate-spin text-cyan-400" />
                      <p className="text-sm text-slate-400">Checking connection...</p>
                    </div>
                  ) : botConnection ? (
                    /* ── Connected State ── */
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <Wifi size={26} className="text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                              </span>
                              <span className="text-base font-bold text-emerald-400">Connected & Live</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">{botConnection.label || "My Bot"}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            Open Dashboard <ArrowRight size={14} />
                          </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 border-t border-emerald-500/10 pt-5">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Bot URL</div>
                            <div className="text-sm font-mono text-slate-300 mt-1">{maskUrl(botConnection.bot_url)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Hosting</div>
                            <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                              botConnection.hosting_type === "managed"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {botConnection.hosting_type === "managed" ? "Hosted by Horizon" : "Self-Hosted"}
                            </span>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Connected Since</div>
                            <div className="text-sm text-slate-300 mt-1">
                              {botConnection.created_at ? new Date(botConnection.created_at).toLocaleDateString() : "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* What the dashboard shows */}
                      <div className="rounded-xl border border-white/5 bg-slate-900/30 p-5">
                        <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Your dashboard now shows</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { icon: BarChart3, label: "Live P&L", color: "text-emerald-400" },
                            { icon: Activity, label: "Open Positions", color: "text-cyan-400" },
                            { icon: Target, label: "Strategy Stats", color: "text-purple-400" },
                            { icon: Brain, label: "AI Reasoning", color: "text-amber-400" },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
                              <item.icon size={14} className={item.color} />
                              <span className="text-xs text-slate-400">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
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
                    /* ── Not Connected — Guided Setup ── */
                    <div className="space-y-6">

                      {/* Step 1: Choose hosting type */}
                      {connectionStep === 0 && (
                        <div className="space-y-5">
                          <div className="text-sm font-bold text-white">How is your bot hosted?</div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <button
                              onClick={() => { setBotForm({ ...botForm, hosting_type: "managed" }); setConnectionStep(1); setBotError(""); }}
                              className="group rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6 text-left transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.06]"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                                  <Cloud size={22} className="text-cyan-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">Hosted by Horizon</div>
                                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-400">RECOMMENDED</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                We gave you a bot URL and API key when you subscribed. Enter them on the next screen.
                              </p>
                              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:gap-2 transition-all">
                                Select <ChevronRight size={12} />
                              </div>
                            </button>

                            <button
                              onClick={() => { setBotForm({ ...botForm, hosting_type: "self-hosted" }); setConnectionStep(1); setBotError(""); }}
                              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                                  <Server size={22} className="text-slate-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">Self-Hosted</div>
                                  <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-slate-500">ADVANCED</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                You run the NovaPulse Docker container on your own server.
                              </p>
                              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white group-hover:gap-2 transition-all">
                                Select <ChevronRight size={12} />
                              </div>
                            </button>
                          </div>

                          <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4">
                            <div className="flex items-start gap-3">
                              <HelpCircle size={16} className="shrink-0 text-slate-500 mt-0.5" />
                              <div className="text-xs text-slate-500 leading-relaxed">
                                <strong className="text-slate-400">Not sure?</strong> If you purchased a Horizon-hosted plan, we emailed your bot URL and API key to your registered email. Check your inbox or contact{" "}
                                <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a>.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Enter details */}
                      {connectionStep === 1 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <button onClick={() => { setConnectionStep(0); setBotError(""); }} className="text-xs text-slate-500 hover:text-white transition-colors">&larr; Back</button>
                            <div className="text-sm font-bold text-white">
                              {botForm.hosting_type === "managed" ? "Enter Your Horizon Bot Credentials" : "Enter Your Self-Hosted Bot Details"}
                            </div>
                          </div>

                          {/* Contextual help box */}
                          {botForm.hosting_type === "managed" ? (
                            <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.02] p-5">
                              <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                                <Cloud size={12} /> Horizon-Hosted Setup
                              </div>
                              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                                <p>When you subscribed, we sent you an email with:</p>
                                <div className="grid gap-2 sm:grid-cols-2 mt-2">
                                  <div className="rounded-lg bg-slate-900/50 border border-white/5 p-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Bot URL</div>
                                    <div className="text-xs text-slate-300 font-mono mt-1">http://165.x.x.x:8080</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Your dedicated bot address</div>
                                  </div>
                                  <div className="rounded-lg bg-slate-900/50 border border-white/5 p-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">API Key</div>
                                    <div className="text-xs text-slate-300 font-mono mt-1">3f61fc43188f...</div>
                                    <div className="text-[10px] text-slate-500 mt-1">64-character hex string</div>
                                  </div>
                                </div>
                                <p className="mt-2">
                                  Can&apos;t find the email? Check spam or contact{" "}
                                  <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a>.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-white/5 bg-slate-900/30 p-5">
                              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                                <Server size={12} /> Self-Hosted Setup
                              </div>
                              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                                <p>You need two things from your NovaPulse bot:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-1">
                                  <li>
                                    <strong className="text-slate-300">Bot URL</strong> — Your server&apos;s IP or domain + port 8080.
                                    <br />
                                    <span className="text-slate-500">Example: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">http://123.45.67.89:8080</code></span>
                                  </li>
                                  <li>
                                    <strong className="text-slate-300">API Key</strong> — Found in your bot&apos;s dashboard (port 8090) under the key icon, or in your <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">.secrets/env</code> file.
                                  </li>
                                </ol>
                                <p className="mt-2 text-slate-500">
                                  Make sure port 8080 is open in your firewall and the bot is running.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Connection Form */}
                          <form onSubmit={handleBotConnect} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                                Bot Name <span className="text-slate-600 font-normal normal-case">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={botForm.label}
                                onChange={(e) => setBotForm({ ...botForm, label: e.target.value })}
                                placeholder="My Trading Bot"
                                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                                Bot URL <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="url"
                                required
                                value={botForm.bot_url}
                                onChange={(e) => setBotForm({ ...botForm, bot_url: e.target.value })}
                                placeholder={botForm.hosting_type === "managed" ? "http://165.245.143.68:8080" : "http://your-server-ip:8080"}
                                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                              />
                              <p className="text-[10px] text-slate-600">
                                The full URL including http:// and port number. Example: http://123.45.67.89:8080
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                                API Key <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showApiKey ? "text" : "password"}
                                  required
                                  value={botForm.api_key}
                                  onChange={(e) => setBotForm({ ...botForm, api_key: e.target.value })}
                                  placeholder="Paste your API key here"
                                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 pr-12 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-600">
                                {botForm.hosting_type === "managed"
                                  ? "The 64-character key from your welcome email. Read or admin key both work."
                                  : "Found in your bot's dashboard settings or .secrets/env file on your server."}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <button
                                type="submit"
                                disabled={botSaving}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
                              >
                                {botSaving ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Testing Connection...
                                  </>
                                ) : (
                                  <>
                                    <Wifi size={16} />
                                    Test & Connect
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setConnectionStep(0); setBotError(""); }}
                                className="text-sm text-slate-500 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>

                          {/* What happens next */}
                          <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4">
                            <div className="text-xs font-bold text-slate-400 mb-2">What happens when you click &quot;Test &amp; Connect&quot;</div>
                            <ol className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
                              <li className="flex items-start gap-2">
                                <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-white/5 text-[9px] font-bold text-slate-400 mt-0.5">1</span>
                                We securely reach out to your bot at the URL you provided
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-white/5 text-[9px] font-bold text-slate-400 mt-0.5">2</span>
                                We verify the API key is valid by calling the bot&apos;s status endpoint
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-white/5 text-[9px] font-bold text-slate-400 mt-0.5">3</span>
                                If successful, your dashboard instantly starts showing live bot data
                              </li>
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== ACCOUNT TAB ===== */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white">Security Settings</h2>

                  {/* Password section */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10"><Lock size={18} className="text-cyan-400" /></div>
                      <div>
                        <div className="text-sm font-bold text-white">Password</div>
                        <p className="text-xs text-slate-500">Managed through Firebase Authentication</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      Your password is managed by Firebase. To reset it, use the &quot;Forgot Password&quot; option on the login page.
                    </p>
                    <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all">
                      <Lock size={14} /> Go to Login Page
                    </Link>
                  </div>

                  {/* 2FA section */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10"><ShieldCheck size={18} className="text-purple-400" /></div>
                      <div>
                        <div className="text-sm font-bold text-white">Two-Factor Authentication</div>
                        <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                      <span className="ml-auto rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/20">Coming Soon</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { icon: Smartphone, label: "Authenticator App", desc: "Google Authenticator, Authy, etc.", available: false },
                        { icon: Key, label: "Hardware Security Key", desc: "FIDO2/WebAuthn (YubiKey, etc.)", available: false },
                        { icon: MessageSquare, label: "SMS Verification", desc: "Receive codes via text message", available: false },
                        { icon: Mail, label: "Email Verification", desc: "Receive codes via email", available: false },
                      ].map((method) => (
                        <div key={method.label} className={`rounded-xl border p-4 ${method.available ? "border-white/10 bg-slate-900/30 cursor-pointer hover:border-cyan-500/20" : "border-white/5 bg-slate-900/20 opacity-50"}`}>
                          <div className="flex items-center gap-3">
                            <method.icon size={18} className="text-slate-400" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{method.label}</div>
                              <div className="text-[10px] text-slate-500">{method.desc}</div>
                            </div>
                            {!method.available && <span className="text-[9px] font-bold text-slate-600 uppercase">Soon</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                    <div className="flex items-start gap-4">
                      <Zap className="text-red-400 shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-200 mt-1">
                          Deleting your account is irreversible. All your gamification stats and trading history will be lost.
                        </p>
                        <button disabled className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400/50 cursor-not-allowed" title="Contact support@horizonsvc.com to delete your account">
                          Delete Account
                        </button>
                        <p className="mt-2 text-xs text-slate-500">Contact <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a> to request account deletion.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== GAMIFICATION / TRADER STATS TAB ===== */}
              {activeTab === "gamification" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white">Trader Stats & Achievements</h2>
                  <p className="text-sm text-slate-400">Track your trading journey with XP, ranks, and achievements.</p>

                  {gamifLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={32} className="animate-spin text-cyan-400" />
                      <p className="text-sm text-slate-400">Loading your stats...</p>
                    </div>
                  ) : !botConnection ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <WifiOff size={36} className="mb-4 opacity-30" />
                      <p className="text-lg font-semibold text-slate-400 mb-2">Connect your bot first</p>
                      <p className="text-sm text-slate-500 mb-4">Trader stats require an active bot connection.</p>
                      <button onClick={() => setActiveTab("bot")} className="flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20">
                        <Wifi size={14} /> Connect Bot
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Rank & Level Card */}
                      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-5"><GRankIcon size={120} /></div>
                        <div className="flex items-center gap-5 mb-6">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${gRank.bg} border ${gRank.border}`}>
                            <GRankIcon size={32} className={gRank.color} />
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Current Rank</div>
                            <div className={`text-2xl font-black ${gRank.color}`}>{gRank.name}</div>
                            <div className="text-xs text-slate-400">Level {gLevel}</div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total XP</div>
                            <div className="text-2xl font-black text-white tabular-nums">{gXp.toLocaleString()}</div>
                          </div>
                        </div>
                        {/* XP Progress bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-500">Level {gLevel}</span>
                            <span className="text-slate-400 font-mono">{Math.round(gXpProgress)}%</span>
                            <span className="text-slate-500">Level {gLevel + 1}</span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-1000" style={{ width: `${gXpProgress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                            <span>{gXpForCurrent} XP</span>
                            <span>{gXpForNext} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid gap-4 sm:grid-cols-4">
                        {[
                          { label: "Total Trades", value: gTotalTrades, icon: Activity, color: "text-cyan-400" },
                          { label: "Win Rate", value: `${gWinRate.toFixed(1)}%`, icon: Target, color: "text-emerald-400" },
                          { label: "Total P&L", value: `${gTotalPnl >= 0 ? "+" : ""}$${Math.abs(gTotalPnl).toFixed(2)}`, icon: DollarSign, color: gTotalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
                          { label: "Best Streak", value: `${gBestStreak} wins`, icon: Flame, color: "text-orange-400" },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <stat.icon size={14} className={stat.color} />
                              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{stat.label}</span>
                            </div>
                            <div className={`text-xl font-black tabular-nums ${stat.color}`}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Achievements */}
                      <div>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <Trophy size={16} className="text-amber-400" />
                          Achievements
                          <span className="text-xs text-slate-500 font-normal">{gUnlocked.length}/{ACHIEVEMENTS.length} unlocked</span>
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {gUnlocked.map((a) => (
                            <div key={a.id} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                                <a.icon size={20} className={a.color} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{a.name}</div>
                                <div className="text-[10px] text-slate-500">{a.desc}</div>
                              </div>
                              <Check size={16} className="ml-auto text-amber-400 shrink-0" />
                            </div>
                          ))}
                          {gLocked.map((a) => (
                            <div key={a.id} className="rounded-xl border border-white/5 bg-slate-900/30 p-4 flex items-center gap-3 opacity-40">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/50">
                                <a.icon size={20} className="text-slate-600" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-400">{a.name}</div>
                                <div className="text-[10px] text-slate-600">{a.desc}</div>
                              </div>
                              <Lock size={14} className="ml-auto text-slate-700 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rank progression */}
                      <div>
                        <h3 className="text-sm font-bold text-white mb-4">Rank Progression</h3>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {RANKS.map((r, i) => {
                            const RIcon = r.icon;
                            const isActive = gRank.name === r.name;
                            const isUnlocked = gLevel >= r.min;
                            return (
                              <div key={r.name} className="flex items-center gap-2">
                                <div className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 min-w-[80px] transition-all ${
                                  isActive ? `${r.border} ${r.bg}` : isUnlocked ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-slate-900/30 opacity-40"
                                }`}>
                                  <RIcon size={20} className={isUnlocked ? r.color : "text-slate-600"} />
                                  <span className={`text-[10px] font-bold ${isActive ? r.color : isUnlocked ? "text-slate-300" : "text-slate-600"}`}>{r.name}</span>
                                  <span className="text-[9px] text-slate-600">Lv. {r.min}</span>
                                </div>
                                {i < RANKS.length - 1 && <ChevronRight size={14} className="text-slate-700 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== SUPPORT TAB ===== */}
              {activeTab === "support" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Support</h2>
                      <p className="text-sm text-slate-400 mt-1">Submit tickets and track responses from our team.</p>
                    </div>
                    <button
                      onClick={() => { setShowNewTicket(!showNewTicket); setActiveTicket(null); }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                    >
                      <Plus size={14} /> New Ticket
                    </button>
                  </div>

                  {ticketSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2 size={16} /> {ticketSuccess}
                    </div>
                  )}
                  {ticketError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <XCircle size={16} /> {ticketError}
                    </div>
                  )}

                  {/* New Ticket Form */}
                  {showNewTicket && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.02] p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white">Create a New Ticket</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Department</label>
                          <select
                            value={newTicket.department}
                            onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none text-sm"
                          >
                            <option value="tech_support">Tech Support</option>
                            <option value="billing">Billing</option>
                            <option value="customer_service">Customer Service</option>
                            <option value="referrals">Referrals</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Priority</label>
                          <select
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Subject</label>
                        <input
                          type="text"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                          placeholder="Brief description of your issue"
                          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                          maxLength={200}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Message</label>
                        <textarea
                          value={newTicket.message}
                          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                          placeholder="Describe your issue in detail..."
                          rows={5}
                          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none text-sm resize-none"
                          maxLength={5000}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={submitTicket}
                          disabled={ticketSubmitting}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                        >
                          {ticketSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Submit Ticket
                        </button>
                        <button onClick={() => setShowNewTicket(false)} className="text-sm text-slate-400 hover:text-white">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Active Ticket Detail */}
                  {activeTicket && !showNewTicket && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{activeTicket.subject}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="capitalize">{activeTicket.department.replace("_", " ")}</span>
                            <span>|</span>
                            <span className={`font-bold ${activeTicket.status === "open" ? "text-cyan-400" : activeTicket.status === "resolved" ? "text-emerald-400" : "text-amber-400"}`}>
                              {activeTicket.status}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => setActiveTicket(null)} className="text-xs text-slate-400 hover:text-white">Back to list</button>
                      </div>
                      <div className="p-5 space-y-4">
                        {/* Original message */}
                        <div className="rounded-lg bg-slate-900/50 p-4 border-l-4 border-l-cyan-500/40">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-cyan-400">You</span>
                            <span className="text-[10px] text-slate-600">{new Date(activeTicket.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{activeTicket.message}</p>
                        </div>
                        {/* Replies */}
                        {activeTicket.replies?.map((r: any) => (
                          <div key={r.id} className={`rounded-lg p-4 border-l-4 ${r.authorType === "staff" ? "bg-purple-500/5 border-l-purple-500/40" : "bg-slate-900/50 border-l-cyan-500/40"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold ${r.authorType === "staff" ? "text-purple-400" : "text-cyan-400"}`}>
                                {r.authorType === "staff" ? `${r.authorName || "Support"}` : "You"}
                              </span>
                              <span className="text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{r.message}</p>
                          </div>
                        ))}
                        {/* Reply form */}
                        {activeTicket.status !== "closed" && (
                          <div className="flex gap-3 pt-2">
                            <input
                              type="text"
                              value={ticketReply}
                              onChange={(e) => setTicketReply(e.target.value)}
                              placeholder="Type a reply..."
                              className="flex-1 rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTicketReply(); } }}
                            />
                            <button
                              onClick={sendTicketReply}
                              disabled={!ticketReply.trim()}
                              className="flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-30"
                            >
                              <Send size={14} /> Send
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ticket List */}
                  {!showNewTicket && !activeTicket && (
                    <div>
                      {ticketsLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                          <Loader2 size={32} className="animate-spin text-cyan-400" />
                          <p className="text-sm text-slate-400">Loading tickets...</p>
                        </div>
                      ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
                            <MessageSquare size={36} className="opacity-30" />
                          </div>
                          <p className="text-lg font-semibold text-slate-400 mb-2">No tickets yet</p>
                          <p className="text-sm text-slate-500 mb-4">Create a ticket to get help from our support team.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tickets.map((t: any) => (
                            <button
                              key={t.id}
                              onClick={() => viewTicket(t.id)}
                              className="w-full rounded-xl border border-white/5 bg-slate-900/30 p-4 text-left hover:bg-slate-900/50 hover:border-white/10 transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-white truncate">{t.subject}</span>
                                <span className={`shrink-0 ml-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  t.status === "open" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                                  t.status === "in_progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  t.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                }`}>{t.status.replace("_", " ")}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                <span className="capitalize">{t.department.replace("_", " ")}</span>
                                <span>|</span>
                                <span>{t.replyCount} {t.replyCount === 1 ? "reply" : "replies"}</span>
                                <span>|</span>
                                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4">
                    <div className="text-xs font-bold text-slate-400 mb-2">Need immediate help?</div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <a href="mailto:support@horizonsvc.com" className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                        <Mail size={12} /> support@horizonsvc.com
                      </a>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={12} /> Response time: under 15 minutes during business hours
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== NOTIFICATIONS TAB ===== */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                      <p className="text-sm text-slate-400 mt-1">Choose which emails you receive from Nova by Horizon.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {notifDirty && (
                        <span className="text-xs text-amber-400 font-medium">Unsaved changes</span>
                      )}
                      <button
                        onClick={saveNotifPrefs}
                        disabled={notifSaving || !notifDirty}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {notifSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Status messages */}
                  {notifSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2 size={16} /> {notifSuccess}
                    </div>
                  )}
                  {notifError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <XCircle size={16} /> {notifError}
                    </div>
                  )}

                  {notifLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={32} className="animate-spin text-cyan-400" />
                      <p className="text-sm text-slate-400">Loading preferences...</p>
                    </div>
                  ) : notifPrefs ? (
                    <div className="space-y-6">
                      {/* Account & Security */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                            <ShieldAlert size={16} className="text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white">Account & Security</div>
                          </div>
                          <span className="flex items-center gap-1.5 rounded-full bg-slate-800 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                            <Lock size={10} /> Always on
                          </span>
                        </div>
                        <div className="px-5 py-1">
                          <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2 my-3">
                            <p className="text-[11px] text-amber-400/80">These notifications cannot be disabled for your protection.</p>
                          </div>
                          <NotifRow label="Password Changed" description="When your password is updated" enabled={true} locked onChange={() => {}} />
                          <NotifRow label="Failed Login Attempts" description="When suspicious login attempts are detected" enabled={true} locked onChange={() => {}} />
                          <NotifRow label="Account Locked" description="When your account is temporarily locked" enabled={true} locked onChange={() => {}} />
                          <NotifRow label="Personal Info Changed" description="When your account details are modified" enabled={true} locked onChange={() => {}} />
                        </div>
                      </div>

                      {/* Trading Alerts */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                            <AlertTriangle size={16} className="text-amber-400" />
                          </div>
                          <div className="text-sm font-bold text-white">Trading Alerts</div>
                        </div>
                        <div className="px-5 py-1">
                          <NotifRow label="Daily Loss Limit" description="When approaching or hitting daily loss limits" enabled={notifPrefs.notifications.trading_alerts.daily_loss_limit.email} onChange={() => toggleNotifPref("trading_alerts", "daily_loss_limit")} />
                          <NotifRow label="Max Exposure" description="When portfolio exposure nears its cap" enabled={notifPrefs.notifications.trading_alerts.max_exposure.email} onChange={() => toggleNotifPref("trading_alerts", "max_exposure")} />
                          <NotifRow label="Risk of Ruin" description="When risk-of-ruin probability is elevated" enabled={notifPrefs.notifications.trading_alerts.risk_of_ruin.email} onChange={() => toggleNotifPref("trading_alerts", "risk_of_ruin")} />
                          <NotifRow label="Consecutive Losses" description="When your bot hits a losing streak" enabled={notifPrefs.notifications.trading_alerts.consecutive_losses.email} onChange={() => toggleNotifPref("trading_alerts", "consecutive_losses")} />
                          <NotifRow label="Anomaly / Circuit Breaker" description="When unusual market conditions trigger a pause" enabled={notifPrefs.notifications.trading_alerts.anomaly_circuit_breaker.email} onChange={() => toggleNotifPref("trading_alerts", "anomaly_circuit_breaker")} />
                          <NotifRow label="Macro Event Blackout" description="When FOMC, CPI, or NFP events pause trading" enabled={notifPrefs.notifications.trading_alerts.macro_event_blackout.email} onChange={() => toggleNotifPref("trading_alerts", "macro_event_blackout")} />

                          <div className="mt-3 mb-2">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Individual Trades</div>
                            <p className="text-[11px] text-slate-600 mt-0.5">These can generate a high volume of emails.</p>
                          </div>
                          <NotifRow label="Trade Executed" description="When a new position is opened" enabled={notifPrefs.notifications.trading_alerts.trade_executed.email} onChange={() => toggleNotifPref("trading_alerts", "trade_executed")} />
                          <NotifRow label="Trade Closed" description="When a position is closed with P&L" enabled={notifPrefs.notifications.trading_alerts.trade_closed.email} onChange={() => toggleNotifPref("trading_alerts", "trade_closed")} />
                        </div>
                      </div>

                      {/* Performance Reports */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                            <TrendingUp size={16} className="text-emerald-400" />
                          </div>
                          <div className="text-sm font-bold text-white">Performance Reports</div>
                        </div>
                        <div className="px-5 py-1">
                          <NotifRow label="Daily Summary" description="End-of-day P&L, trades, and key stats" enabled={notifPrefs.notifications.performance_reports.daily_summary.email} onChange={() => toggleNotifPref("performance_reports", "daily_summary")} />
                          <NotifRow label="Weekly Digest" description="Week-over-week performance comparison" enabled={notifPrefs.notifications.performance_reports.weekly_digest.email} onChange={() => toggleNotifPref("performance_reports", "weekly_digest")} />
                          <NotifRow label="Monthly Report" description="Full month stats with strategy breakdown" enabled={notifPrefs.notifications.performance_reports.monthly_report.email} onChange={() => toggleNotifPref("performance_reports", "monthly_report")} />
                          <NotifRow label="Milestone Achievements" description="When you hit trading milestones" enabled={notifPrefs.notifications.performance_reports.milestone_achievements.email} onChange={() => toggleNotifPref("performance_reports", "milestone_achievements")} />
                        </div>
                      </div>

                      {/* Marketing */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                            <Megaphone size={16} className="text-purple-400" />
                          </div>
                          <div className="text-sm font-bold text-white">Marketing & Engagement</div>
                        </div>
                        <div className="px-5 py-1">
                          <NotifRow label="Newsletter" description="Market insights and platform updates" enabled={notifPrefs.notifications.marketing.newsletter.email} onChange={() => toggleNotifPref("marketing", "newsletter")} />
                          <NotifRow label="Feature Announcements" description="New feature and product launches" enabled={notifPrefs.notifications.marketing.feature_announcements.email} onChange={() => toggleNotifPref("marketing", "feature_announcements")} />
                          <NotifRow label="Inactivity Reminders" description="Friendly nudges when you haven't logged in" enabled={notifPrefs.notifications.marketing.inactivity_reminders.email} onChange={() => toggleNotifPref("marketing", "inactivity_reminders")} />
                        </div>
                      </div>

                      {/* Danger Zone: Global Unsubscribe */}
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                        <div className="flex items-start gap-4">
                          <BellOff className="text-red-400 shrink-0 mt-0.5" size={20} />
                          <div className="flex-1">
                            <h3 className="font-bold text-red-400">Unsubscribe from All</h3>
                            <p className="text-sm text-red-200/70 mt-1 leading-relaxed">
                              This will disable all non-security email notifications. You will still receive critical account security alerts (password changes, failed logins, account locks).
                            </p>
                            <button
                              onClick={handleGlobalUnsubscribe}
                              className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                                notifPrefs.global_unsubscribe
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                              }`}
                            >
                              {notifPrefs.global_unsubscribe ? (
                                <><Bell size={14} /> Re-enable All Notifications</>
                              ) : (
                                <><BellOff size={14} /> Unsubscribe from All Non-Security Emails</>
                              )}
                            </button>
                            {notifPrefs.global_unsubscribe && (
                              <p className="mt-2 text-xs text-amber-400">
                                All non-security emails are currently disabled. Click &quot;Save Changes&quot; to confirm.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
