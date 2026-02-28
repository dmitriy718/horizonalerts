"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Camera, Mail, Lock, User, Trophy, Flame, Target, Shield, Zap, Bot,
  Wifi, WifiOff, Loader2, Trash2, CheckCircle2, XCircle, ExternalLink,
  Cloud, Server, HelpCircle, Eye, EyeOff, RefreshCw, ChevronRight,
  ArrowRight, Copy, Check, BarChart3, Activity, Brain,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";
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

  // User data derived from Firebase auth
  const displayName = firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Trader";
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
                  <h2 className="text-xl font-bold text-white">Your Profile</h2>
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
                      <label htmlFor="profile-name" className="text-xs font-bold uppercase text-slate-500">Display Name</label>
                      <input id="profile-name" disabled type="text" value={displayName} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-email" className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                      <input id="profile-email" disabled type="email" value={userEmail} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 text-xs text-slate-500">
                    Profile data is managed through your account. To update your name or email, contact <a href="mailto:support@horizonsvc.com" className="text-cyan-400 hover:underline">support@horizonsvc.com</a>.
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
