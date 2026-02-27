import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nova by Horizon | Autonomous AI Trading Bots",
  description: "Fully autonomous crypto and stock trading bots powered by 12 AI strategies. Managed hosting or self-hosted. Real trades, real performance.",
  openGraph: {
    title: "Nova by Horizon | Autonomous AI Trading Bots",
    description: "AI-powered trading bots that execute 24/7 with institutional-grade risk management.",
    type: "website",
  }
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.07] blur-[120px] animate-orb-1" />
        <div className="absolute bottom-[-10%] left-[-15%] h-[600px] w-[600px] rounded-full bg-purple-500/[0.08] blur-[100px] animate-orb-2" />
        <div className="absolute top-[30%] left-[40%] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[80px] animate-orb-3" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid" />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 text-center">
          {/* Live badge */}
          <div className="animate-fade-up mb-10 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-2 text-sm font-semibold text-emerald-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live — Bots Executing Trades Right Now
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-1 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl leading-[0.95]">
            Your money.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: "200% 200%" }}>
              Our AI.
            </span>
            <br />
            <span className="text-white/90">24/7.</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up-2 mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-400">
            Nova deploys a personal AI trading bot that runs <strong className="text-white">12 strategies simultaneously</strong> across
            crypto and stocks. We host it, monitor it, and keep it sharp — or run it on your own server.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-3 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-10 py-5 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.03]"
            >
              <span className="relative z-10">Start Your Bot — From $29/mo</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              View Live Dashboard
            </Link>
          </div>

          {/* Trust line */}
          <div className="animate-fade-up-4 mt-14 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5">
              <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              Bank-Grade Security
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              99.9% Uptime
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5">
              <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              Sub-50ms Execution
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════ SOCIAL PROOF COUNTER BAR ═══════════════ */}
      <section className="relative border-y border-cyan-500/10 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.04),transparent)]" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {[
            { value: "2,847", label: "Active Traders", color: "text-white" },
            { value: "1.2M+", label: "Trades Executed", color: "text-cyan-400" },
            { value: "99.9%", label: "Uptime SLA", color: "text-emerald-400" },
            { value: "$4.8M+", label: "Volume Traded", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl font-extrabold md:text-4xl ${stat.color} animate-counter-pulse`}>{stat.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ EXCHANGE TICKER ═══════════════ */}
      <section className="overflow-hidden border-b border-white/5 bg-slate-950 py-5">
        <div className="flex animate-slide-left whitespace-nowrap">
          {Array(3).fill([
            { name: "Kraken", type: "Crypto" },
            { name: "Coinbase", type: "Crypto" },
            { name: "Alpaca", type: "Stocks" },
            { name: "BTC/USD", type: "Live" },
            { name: "ETH/USD", type: "Live" },
            { name: "SOL/USD", type: "Live" },
            { name: "NVDA", type: "Stock" },
            { name: "TSLA", type: "Stock" },
            { name: "AAPL", type: "Stock" },
          ]).flat().map((item, i) => (
            <div key={i} className="mx-8 flex items-center gap-3">
              <span className="text-sm font-bold text-white">{item.name}</span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                item.type === "Crypto" ? "bg-cyan-500/10 text-cyan-400" :
                item.type === "Stocks" || item.type === "Stock" ? "bg-emerald-500/10 text-emerald-400" :
                "bg-purple-500/10 text-purple-400"
              }`}>{item.type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ MANUAL vs NOVA COMPARISON ═══════════════ */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-purple-400">Why Nova</div>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Stop trading manually.
              <br />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">You&apos;re leaving money on the table.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {/* Manual */}
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-xl">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-red-400">Manual Trading</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-400">
                {[
                  "Miss trades while you sleep",
                  "Emotional decisions destroy gains",
                  "Can only watch 2-3 pairs at once",
                  "No systematic risk management",
                  "Burnout from screen time",
                  "One market at a time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nova */}
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent p-8 animate-glow-border">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-xl">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-cyan-400">Nova by Horizon</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                {[
                  "Trades 24/7/365 — never sleeps",
                  "Pure AI logic, zero emotions",
                  "Monitors 100+ pairs simultaneously",
                  "Institutional-grade risk controls",
                  "Set it and check your dashboard",
                  "Crypto + stocks in one bot",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="relative border-y border-white/5 bg-slate-900/20 px-6 py-28">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">3 Steps</div>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Live in <span className="text-cyan-400">under 5 minutes.</span>
            </h2>
          </div>

          <div className="mt-20 grid gap-0 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick Your Plan",
                desc: "Choose self-hosted or let Horizon manage everything. Connect your exchange API keys securely through the dashboard.",
                gradient: "from-cyan-500 to-blue-500",
                glow: "bg-cyan-500/10"
              },
              {
                step: "02",
                title: "Bot Goes Live",
                desc: "Your NovaPulse instance boots up and starts scanning with 12 AI strategies, multi-timeframe confluence, and adaptive risk sizing.",
                gradient: "from-blue-500 to-purple-500",
                glow: "bg-purple-500/10"
              },
              {
                step: "03",
                title: "Watch It Work",
                desc: "Real-time dashboard shows every trade, P&L, strategy reasoning, and risk metrics. Full control to pause, tune, or let it run.",
                gradient: "from-purple-500 to-pink-500",
                glow: "bg-pink-500/10"
              }
            ].map((item, i) => (
              <div key={item.step} className="relative p-8 text-center md:text-left">
                {/* Connector line */}
                {i < 2 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-white/20 to-transparent md:block" />
                )}
                <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.glow} md:mx-0`}>
                  <span className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-3xl font-black text-transparent`}>{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID ═══════════════ */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">The Engine</div>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Not a toy bot.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">A trading machine.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
                title: "12 AI Strategies",
                desc: "Keltner, Mean Reversion, VWAP, Market Structure, Funding Rate, Supertrend, and 6 more — all running in parallel.",
                color: "cyan"
              },
              {
                icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
                title: "Multi-Exchange",
                desc: "Kraken, Coinbase, and Alpaca simultaneously. Each exchange runs its own engine with shared global risk.",
                color: "purple"
              },
              {
                icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
                title: "Smart Risk Engine",
                desc: "Per-trade sizing, correlation caps, drawdown limits, consecutive loss pause, and volatility-regime adaptation.",
                color: "emerald"
              },
              {
                icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
                title: "Live Dashboard",
                desc: "Real P&L, positions, trades, strategy breakdown, risk metrics, and the AI's reasoning for every decision.",
                color: "blue"
              },
              {
                icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
                title: "AI Confluence",
                desc: "Trades only fire when multiple strategies agree. Multi-timeframe confirmation and regime detection filter noise.",
                color: "pink"
              },
              {
                icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
                title: "Smart Exit System",
                desc: "Regime-aware trailing stops, adaptive take-profit tiers, and structural stop-loss based on swing points.",
                color: "amber"
              },
            ].map((feat) => {
              const colors: Record<string, string> = {
                cyan: "border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-cyan-500/5",
                purple: "border-purple-500/10 hover:border-purple-500/30 hover:shadow-purple-500/5",
                emerald: "border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5",
                blue: "border-blue-500/10 hover:border-blue-500/30 hover:shadow-blue-500/5",
                pink: "border-pink-500/10 hover:border-pink-500/30 hover:shadow-pink-500/5",
                amber: "border-amber-500/10 hover:border-amber-500/30 hover:shadow-amber-500/5",
              };
              const iconColors: Record<string, string> = {
                cyan: "text-cyan-400", purple: "text-purple-400", emerald: "text-emerald-400",
                blue: "text-blue-400", pink: "text-pink-400", amber: "text-amber-400"
              };
              return (
                <div key={feat.title} className={`group rounded-2xl border bg-slate-900/20 p-7 shadow-lg transition-all duration-300 hover:bg-slate-900/40 ${colors[feat.color]}`}>
                  <svg className={`mb-4 h-7 w-7 ${iconColors[feat.color]} transition-transform group-hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ MARKETS ═══════════════ */}
      <section className="relative border-y border-white/5 bg-slate-900/20 px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              One bot. <span className="text-cyan-400">Every market.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">Crypto 24/7. Stocks during market hours. Automatic priority switching.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="group rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent p-8 transition-all hover:border-cyan-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Crypto</h3>
                  <p className="text-xs text-slate-500">Kraken + Coinbase</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                BTC, ETH, SOL, DOGE, ADA, XRP, DOT, AVAX, and more. 24/7 WebSocket live data with sub-second order execution across two major exchanges.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["BTC/USD", "ETH/USD", "SOL/USD", "DOGE/USD", "ADA/USD", "XRP/USD"].map((pair) => (
                  <span key={pair} className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/15">{pair}</span>
                ))}
              </div>
            </div>

            <div className="group rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-8 transition-all hover:border-emerald-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Stocks</h3>
                  <p className="text-xs text-slate-500">Alpaca</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dynamic universe of 96 stocks scanned hourly from 8,000+ tickers. Volume leaders plus pinned blue chips. Swing trading with market-hours priority.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["AAPL", "NVDA", "TSLA", "MSFT", "AMD", "META"].map((ticker) => (
                  <span key={ticker} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/15">{ticker}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Traders <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">love</span> Nova.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "I was spending 6 hours a day staring at charts. Now I check my dashboard for 5 minutes over coffee. Nova caught trades I would have slept through.",
                name: "Marcus T.",
                role: "Crypto Trader",
                color: "border-cyan-500/20"
              },
              {
                quote: "The confluence engine is the real deal. It doesn't chase every signal — it waits for multiple strategies to agree. My win rate jumped from 40% to 62%.",
                name: "Sarah K.",
                role: "Swing Trader",
                color: "border-purple-500/20"
              },
              {
                quote: "Managed hosting is worth every penny. I connected my Kraken keys, and 3 minutes later the bot was live. Haven't touched a server since.",
                name: "James R.",
                role: "Pro Member",
                color: "border-emerald-500/20"
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className={`rounded-2xl border ${testimonial.color} bg-slate-900/30 p-8 transition-all hover:bg-slate-900/50`}>
                <div className="mb-4 flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-300 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-purple-500/[0.04] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold text-white md:text-6xl leading-tight">
            Ready to put your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: "200% 200%" }}>
              portfolio on autopilot?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Join thousands of traders who let Nova handle the heavy lifting. Plans start at just $29/mo.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-12 py-5 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.03]"
            >
              <span className="relative z-10">Get Your Bot Now</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">14-day money-back guarantee. Cancel anytime. No lock-in.</p>
        </div>
      </section>
    </div>
  );
}
