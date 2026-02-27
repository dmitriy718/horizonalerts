import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nova by Horizon | Autonomous AI Trading Bots",
  description: "Fully autonomous crypto and stock trading bots powered by AI confluence engines. Managed hosting or self-hosted. Real performance, real trades.",
  openGraph: {
    title: "Nova by Horizon | Autonomous AI Trading Bots",
    description: "AI-powered trading bots that execute 24/7 with institutional-grade risk management.",
    type: "website",
  }
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Bots Trading Live 24/7
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl leading-[1.1]">
            Your AI trading bot.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Always on. Always sharp.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
            Nova runs autonomous trading bots powered by 12 AI strategies, multi-exchange support,
            and institutional-grade risk management. We host it for you, or run it yourself.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              View Plans
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-medium uppercase tracking-widest text-slate-500">
            <span>Crypto + Stocks</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Kraken &middot; Coinbase &middot; Alpaca</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>12 AI Strategies</span>
          </div>
        </div>
      </section>

      {/* LIVE STATS TICKER */}
      <section className="border-y border-slate-800/50 bg-slate-900/30 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-10 px-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">12</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">AI Strategies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Exchanges</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">&lt;50ms</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Execution</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Automated</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">How Nova Works</h2>
            <p className="mt-4 text-slate-400">From signup to live trading in minutes.</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a Plan",
                desc: "Choose managed hosting (we run everything) or self-hosted (your server, your keys). Connect your exchange API keys in the dashboard."
              },
              {
                step: "02",
                title: "Bot Goes Live",
                desc: "Your personal NovaPulse instance starts scanning markets 24/7 using 12 AI strategies with multi-timeframe confluence and adaptive risk management."
              },
              {
                step: "03",
                title: "Monitor & Earn",
                desc: "Watch live performance, open positions, trade history, and AI reasoning in your dashboard. Adjust settings anytime."
              }
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-white/5 bg-slate-900/30 p-8">
                <div className="mb-4 text-4xl font-black text-cyan-500/20">{item.step}</div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-white/5 bg-slate-900/20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Built for Serious Traders</h2>
            <p className="mt-4 text-slate-400">Everything you need for autonomous, intelligent trading.</p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "12 AI Strategies", desc: "Keltner, Mean Reversion, VWAP, Market Structure, Funding Rate, and 7 more — all running in parallel with confluence scoring." },
              { title: "Multi-Exchange", desc: "Trade on Kraken, Coinbase, and Alpaca (stocks) simultaneously. Each exchange runs its own engine with shared risk management." },
              { title: "Smart Exit System", desc: "Regime-aware trailing stops, adaptive take-profit tiers, and structural stop-loss placement based on market swing points." },
              { title: "Real-Time Dashboard", desc: "Live P&L, open positions, trade history, strategy breakdown, risk metrics, and AI thought feed — all in your browser." },
              { title: "Risk Management", desc: "Per-trade sizing, correlation-based exposure caps, global drawdown limits, and automatic pause on consecutive losses." },
              { title: "AI Confluence Engine", desc: "Trades only fire when multiple strategies agree. Multi-timeframe analysis, regime detection, and volatility-adjusted confidence." },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-all hover:border-cyan-500/20 hover:bg-slate-900/50">
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORTED ASSETS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Trade Crypto & Stocks</h2>
          <p className="mt-4 text-slate-400">One bot, multiple markets. The bot automatically manages priority between sessions.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 text-left">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-cyan-400">Crypto</div>
              <p className="text-sm text-slate-400">
                BTC, ETH, SOL, DOGE, ADA, XRP, DOT, AVAX, and more across Kraken and Coinbase.
                24/7 automated trading with WebSocket live data and sub-second execution.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["BTC/USD", "ETH/USD", "SOL/USD", "DOGE/USD"].map((pair) => (
                  <span key={pair} className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/20">{pair}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 text-left">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-emerald-400">Stocks</div>
              <p className="text-sm text-slate-400">
                Dynamic universe of 96 stocks scanned hourly from 8,000+ tickers. Top volume leaders
                plus pinned blue chips: AAPL, MSFT, NVDA, TSLA. Swing trading via Alpaca.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["AAPL", "NVDA", "TSLA", "MSFT"].map((ticker) => (
                  <span key={ticker} className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/20">{ticker}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent p-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Start trading on autopilot.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Pick a plan, connect your exchange, and let Nova handle the rest.
            Your bot starts trading within minutes of signup.
          </p>
          <div className="mt-8">
            <Link
              href="/pricing"
              className="inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              Get Your Bot
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
