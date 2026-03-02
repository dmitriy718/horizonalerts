"use client";
import { useState } from "react";
import { getApiBaseUrl } from "../lib/api";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${getApiBaseUrl()}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lists: ["stock_alerts", "weekly_newsletter"], source: "footer" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">Get Free Stock Alerts & Market Insights</h4>
          <p className="text-xs text-slate-500 mt-1">Weekly AI-curated picks and trading strategies. Unsubscribe anytime.</p>
        </div>
        {status === "success" ? (
          <span className="text-sm font-bold text-emerald-400">Subscribed!</span>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none w-[220px]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white hover:shadow-cyan-500/20 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && <span className="text-xs text-red-400">Failed. Try again.</span>}
      </div>
    </div>
  );
}
