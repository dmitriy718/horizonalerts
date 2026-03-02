"use client";
import { useState, useEffect } from "react";
import { X, Mail, TrendingUp, Zap, ChevronRight, Check, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "../lib/api";

const LISTS = [
  {
    id: "stock_alerts" as const,
    label: "Free Stock Play Alerts",
    desc: "Weekly curated stock picks from our AI-powered scanner",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    id: "weekly_newsletter" as const,
    label: "Weekly Trading Newsletter",
    desc: "Market analysis, strategy insights, and performance recaps",
    icon: Mail,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    id: "product_updates" as const,
    label: "Product Updates",
    desc: "New features, improvements, and platform announcements",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const STORAGE_KEY = "nova_newsletter_dismissed";
const SHOW_DELAY_MS = 15_000; // Show after 15 seconds

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set(["stock_alerts", "weekly_newsletter"]));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Don't show if dismissed recently (7 days)
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const toggleList = (id: string) => {
    const next = new Set(selectedLists);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLists(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedLists.size === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${getApiBaseUrl()}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lists: Array.from(selectedLists),
          source: "popup",
        }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      setSuccess(true);
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      // Auto dismiss after 3s
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={dismiss}>
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-500/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6 pt-8">
          {success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You&apos;re in!</h3>
              <p className="text-sm text-slate-400">You&apos;re subscribed! We&apos;ll send you the good stuff.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                  <Mail size={24} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Stay Ahead of the Markets</h3>
                <p className="text-sm text-slate-400">Free alerts, weekly strategies, and trading insights from our AI engine.</p>
              </div>

              {/* List selection */}
              <div className="space-y-2 mb-5">
                {LISTS.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => toggleList(list.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selectedLists.has(list.id) ? `${list.border} ${list.bg}` : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selectedLists.has(list.id) ? list.bg : "bg-slate-800/50"}`}>
                      <list.icon size={16} className={selectedLists.has(list.id) ? list.color : "text-slate-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${selectedLists.has(list.id) ? "text-white" : "text-slate-300"}`}>{list.label}</div>
                      <div className="text-[10px] text-slate-500">{list.desc}</div>
                    </div>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      selectedLists.has(list.id) ? "bg-cyan-500 border-cyan-500" : "border-white/20 bg-transparent"
                    }`}>
                      {selectedLists.has(list.id) && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting || selectedLists.size === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Subscribe Free <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-3 text-center text-[10px] text-slate-600">
                Unsubscribe anytime. We respect your inbox.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
