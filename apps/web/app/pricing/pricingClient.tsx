"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Check,
  Shield,
  Server,
  Cloud,
  Zap,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  Headphones,
  BarChart3,
  Bot,
  ArrowRight,
  Star,
  TrendingUp,
  Activity,
  Globe,
  Cpu,
  RefreshCw,
  Layers,
} from "lucide-react";

type Tier = {
  name: string;
  id: string;
  selfPrice: string;
  hostedPrice: string;
  tagline: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    id: "starter",
    selfPrice: "49.99",
    hostedPrice: "99.99",
    tagline: "Full Power. One Bot.",
    description:
      "Perfect for traders getting started with automated trading. Full access to the NovaPulse engine with all 12 AI strategies, multi-exchange support, and a real-time dashboard to monitor every trade.",
    features: [
      "Full NovaPulse bot access",
      "All 12 AI trading strategies",
      "Multi-exchange (Kraken, Coinbase, Alpaca)",
      "Crypto + US stock trading",
      "Real-time performance dashboard",
      "Multi-timeframe confluence engine",
      "Adaptive risk sizing",
      "Smart exit system with trailing stops",
      "Email support (< 24hr response)",
    ],
    highlighted: false,
    cta: "Start Trading",
  },
  {
    name: "Pro",
    id: "pro",
    selfPrice: "99.99",
    hostedPrice: "149.99",
    tagline: "Serious Traders. Serious Edge.",
    description:
      "For traders who want priority support, custom tuning, and advanced configurations. Fine-tune strategy weights, adjust risk parameters, and get detailed performance analytics delivered to your inbox.",
    features: [
      "Everything in Starter",
      "Priority support (< 4hr response)",
      "Custom strategy weight tuning",
      "Advanced risk configuration",
      "Telegram & Discord trade alerts",
      "Weekly performance reports",
      "Strategy-level P&L attribution",
      "Custom confluence thresholds",
      "Regime-aware parameter adjustment",
    ],
    highlighted: true,
    cta: "Go Pro",
  },
  {
    name: "Elite",
    id: "elite",
    selfPrice: "199.99",
    hostedPrice: "249.99",
    tagline: "Maximum Edge. White Glove.",
    description:
      "The ultimate trading package. Run multiple bot instances, get dedicated infrastructure, custom strategy development, and direct access to our engineering team. Built for high-volume traders and firms.",
    features: [
      "Everything in Pro",
      "Up to 3 bot instances",
      "Dedicated VPS resources",
      "Custom strategy development",
      "1-on-1 onboarding call (60 min)",
      "SLA 99.9% uptime guarantee",
      "Direct Slack channel to team",
      "Priority feature requests",
      "Monthly strategy review sessions",
    ],
    highlighted: false,
    cta: "Go Elite",
  },
];

const comparisonFeatures = [
  { category: "Trading Engine", feature: "AI Trading Strategies", starter: "12", pro: "12", elite: "12 + Custom" },
  { category: "Trading Engine", feature: "Confluence Engine", starter: true, pro: true, elite: true },
  { category: "Trading Engine", feature: "Multi-Timeframe Analysis", starter: true, pro: true, elite: true },
  { category: "Trading Engine", feature: "Smart Exit System", starter: true, pro: true, elite: true },
  { category: "Trading Engine", feature: "Volatility Regime Detection", starter: true, pro: true, elite: true },
  { category: "Trading Engine", feature: "Custom Confluence Thresholds", starter: false, pro: true, elite: true },
  { category: "Trading Engine", feature: "Custom Strategy Dev", starter: false, pro: false, elite: true },
  { category: "Markets", feature: "Exchanges Supported", starter: "3", pro: "3", elite: "3" },
  { category: "Markets", feature: "Crypto Trading (24/7)", starter: true, pro: true, elite: true },
  { category: "Markets", feature: "US Stock Trading", starter: true, pro: true, elite: true },
  { category: "Markets", feature: "Bot Instances", starter: "1", pro: "1", elite: "Up to 3" },
  { category: "Dashboard & Analytics", feature: "Real-Time Dashboard", starter: true, pro: true, elite: true },
  { category: "Dashboard & Analytics", feature: "Live P&L Tracking", starter: true, pro: true, elite: true },
  { category: "Dashboard & Analytics", feature: "Trade History", starter: true, pro: true, elite: true },
  { category: "Dashboard & Analytics", feature: "Strategy Performance Breakdown", starter: true, pro: true, elite: true },
  { category: "Dashboard & Analytics", feature: "P&L Attribution Reports", starter: false, pro: true, elite: true },
  { category: "Dashboard & Analytics", feature: "Weekly Performance Reports", starter: false, pro: true, elite: true },
  { category: "Risk Management", feature: "Per-Trade Position Sizing", starter: true, pro: true, elite: true },
  { category: "Risk Management", feature: "Drawdown Limits", starter: true, pro: true, elite: true },
  { category: "Risk Management", feature: "Correlation Caps", starter: true, pro: true, elite: true },
  { category: "Risk Management", feature: "Advanced Risk Configuration", starter: false, pro: true, elite: true },
  { category: "Risk Management", feature: "Custom Strategy Weights", starter: false, pro: true, elite: true },
  { category: "Notifications & Alerts", feature: "Dashboard Notifications", starter: true, pro: true, elite: true },
  { category: "Notifications & Alerts", feature: "Email Alerts", starter: true, pro: true, elite: true },
  { category: "Notifications & Alerts", feature: "Telegram/Discord Alerts", starter: false, pro: true, elite: true },
  { category: "Support & Services", feature: "Email Support", starter: "< 24hr", pro: "< 4hr", elite: "< 1hr" },
  { category: "Support & Services", feature: "Priority Support", starter: false, pro: true, elite: true },
  { category: "Support & Services", feature: "1-on-1 Onboarding Call", starter: false, pro: false, elite: true },
  { category: "Support & Services", feature: "Direct Slack Channel", starter: false, pro: false, elite: true },
  { category: "Support & Services", feature: "Monthly Strategy Reviews", starter: false, pro: false, elite: true },
  { category: "Infrastructure", feature: "Dedicated Resources", starter: false, pro: false, elite: true },
  { category: "Infrastructure", feature: "SLA Uptime Guarantee", starter: false, pro: false, elite: "99.9%" },
  { category: "Infrastructure", feature: "Priority Feature Requests", starter: false, pro: false, elite: true },
];

const faqs = [
  {
    q: "What's the difference between self-hosted and Horizon-hosted?",
    a: "Self-hosted means you run the NovaPulse Docker container on your own VPS or server. You're responsible for the hardware, and we provide the software (Docker image, setup guide, config documentation). Horizon-hosted means we provision a dedicated bot instance on our infrastructure, monitor it 24/7, handle all updates, and guarantee uptime. Zero server management on your end — just connect your exchange API keys through the dashboard and you're live.",
  },
  {
    q: "What exchanges does Nova support?",
    a: "Currently Nova supports Kraken and Coinbase for cryptocurrency trading, plus Alpaca for US stock/equities trading. Each exchange runs its own dedicated engine with real-time WebSocket data feeds and sub-second order execution. All engines share a global risk aggregation layer so your exposure is managed across every market.",
  },
  {
    q: "Can I switch between self-hosted and Horizon-hosted?",
    a: "Absolutely. You can upgrade to Horizon-hosted or switch to self-hosted at any time from your account settings. We'll help migrate your bot configuration, strategy weights, and risk parameters. No downtime, no data loss. You'll only be charged the price difference on a prorated basis.",
  },
  {
    q: "How many trades does the bot make per day?",
    a: "It varies depending on market conditions and your configuration. The confluence engine requires multiple AI strategies to agree before executing any trade, so it's selective by design. In typical market conditions, expect anywhere from 5-20 trades per day across crypto and stocks combined. During high-volatility periods, trade frequency can increase. You can always adjust confluence thresholds, strategy weights, and cooldown periods to dial it up or down.",
  },
  {
    q: "Can I pause or stop trading at any time?",
    a: "Yes. Full control is always in your hands via the dashboard. You can pause trading instantly, close all open positions with one click, adjust risk parameters on the fly, or enable/disable individual strategies. The bot respects your settings immediately — there's no delay.",
  },
  {
    q: "Is my exchange API key safe?",
    a: "Your API keys are encrypted at rest and transmitted only over TLS. We recommend creating API keys with trade-only permissions (no withdrawal access) on your exchange. For self-hosted users, your keys never leave your own server. For managed users, keys are stored in isolated, encrypted vaults per-tenant. We never have withdrawal access to your funds.",
  },
  {
    q: "What kind of returns can I expect?",
    a: "We don't make return guarantees — no legitimate trading service can. Past performance doesn't guarantee future results. What we can tell you is that Nova uses institutional-grade risk management, position sizing, and multi-strategy confluence to maximize risk-adjusted returns. The dashboard shows real, transparent performance metrics including Sharpe ratio, drawdown, and win rate so you can evaluate for yourself.",
  },
  {
    q: "Do I need trading experience to use Nova?",
    a: "No. Nova is designed to work autonomously. You pick a plan, connect your exchange API keys, and the bot handles everything: scanning markets, identifying opportunities, sizing positions, managing risk, and executing trades. The dashboard gives you full visibility. That said, our Academy section has educational content if you want to understand the strategies better.",
  },
  {
    q: "What's your refund policy?",
    a: "We offer a 14-day money-back guarantee on all plans, no questions asked. If Nova isn't the right fit, email support@horizonsvc.com within 14 days of your subscription start date for a full refund. We believe in our product — if it's not working for you, we want to make it right.",
  },
  {
    q: "How do I get started?",
    a: "Click 'Get Started' on any plan above. You'll create an account, choose self-hosted or managed hosting, connect your exchange API keys through our secure onboarding flow, and your bot will be live in under 5 minutes. For managed hosting, we handle the infrastructure instantly. For self-hosted, you'll get a Docker image and step-by-step setup guide.",
  },
];

const whatsIncluded = [
  {
    icon: Bot,
    title: "Full NovaPulse Engine",
    desc: "Every plan gets the complete trading bot — no feature gating on strategies. All 12 AI strategies, confluence engine, smart exits, and adaptive risk sizing included.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    desc: "Live P&L tracking, open positions, trade history, strategy performance, risk metrics, and the AI's reasoning for every decision. Polls every 5 seconds.",
    color: "blue",
  },
  {
    icon: Globe,
    title: "3 Exchanges, 2 Markets",
    desc: "Trade crypto on Kraken and Coinbase 24/7, plus US stocks on Alpaca during market hours. One bot, automatic priority switching between markets.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "Institutional Risk Controls",
    desc: "Per-trade sizing, max drawdown limits, correlation-based exposure caps, consecutive loss pausing, volatility regime adaptation, and cross-engine risk aggregation.",
    color: "emerald",
  },
  {
    icon: Layers,
    title: "12 AI Strategies in Parallel",
    desc: "Keltner, Mean Reversion, VWAP, Market Structure, Funding Rate, Supertrend, Order Flow, Ichimoku, Stochastic Divergence, Volatility Squeeze, Trend, and Reversal.",
    color: "pink",
  },
  {
    icon: Cpu,
    title: "Confluence Engine",
    desc: "Trades only execute when multiple strategies agree on direction, timeframe, and confidence. Multi-timeframe confirmation filters out noise and false signals.",
    color: "amber",
  },
  {
    icon: TrendingUp,
    title: "Smart Exit System",
    desc: "Regime-aware trailing stops, adaptive take-profit tiers, and structural stop-loss placement based on swing points. Exits are as intelligent as entries.",
    color: "cyan",
  },
  {
    icon: Activity,
    title: "Regime Detection",
    desc: "Automatic detection of trending, ranging, and volatile market conditions. Strategy weights and risk parameters adapt in real-time to the current regime.",
    color: "purple",
  },
];

export function PricingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const [hosted, setHosted] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative isolate text-center overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/[0.05] blur-[120px] pointer-events-none -z-10" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400">
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-6xl lg:text-7xl leading-tight">
            Invest in your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              trading edge.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Every plan includes the <strong className="text-white">full NovaPulse AI engine</strong> — all 12 strategies, multi-exchange support,
            and real-time dashboard. No hidden fees. No feature gating. Pick your tier, pick your hosting.
          </p>
        </div>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-emerald-600/40 bg-emerald-500/5 p-4 text-sm text-emerald-200 text-center">
          <strong>Subscription activated!</strong> Your bot is being provisioned. Check your dashboard shortly.
        </div>
      )}
      {status === "cancel" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-600/40 bg-amber-500/5 p-4 text-sm text-amber-200 text-center">
          Checkout canceled. You can resume anytime — your selection is saved.
        </div>
      )}

      {/* ═══════════════ HOSTING TOGGLE ═══════════════ */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex items-center rounded-2xl border border-white/10 bg-slate-900/50 p-1.5 shadow-xl shadow-black/20">
          <button
            onClick={() => setHosted(false)}
            className={`relative z-10 flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold transition-all ${
              !hosted ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server size={16} />
            Self-Hosted
          </button>
          <button
            onClick={() => setHosted(true)}
            className={`relative z-10 flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold transition-all ${
              hosted ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cloud size={16} />
            Hosted by Horizon
          </button>
          <div
            className={`absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out ${
              hosted
                ? "left-[calc(50%+3px)] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                : "left-1.5 bg-white/10 border border-white/10"
            }`}
          />
        </div>

        {hosted ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-5 py-2 text-xs font-semibold text-cyan-400">
              <Zap size={12} />
              Recommended — We handle everything. Zero server management.
            </div>
            <p className="max-w-md text-center text-xs text-slate-500">
              Dedicated instance on our infrastructure. 24/7 monitoring, automatic updates, guaranteed uptime.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500">You provide the VPS. We provide the Docker image + setup guide.</p>
            <p className="max-w-md text-center text-xs text-slate-600">
              Requires a VPS with 2+ CPU cores, 4GB+ RAM, Docker installed. Ubuntu 22+ recommended.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════ TIER CARDS ═══════════════ */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const price = hosted ? tier.hostedPrice : tier.selfPrice;
          return (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                tier.highlighted
                  ? "border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.08] via-purple-500/[0.03] to-transparent shadow-2xl shadow-cyan-500/10 scale-[1.02]"
                  : "border border-white/10 bg-slate-900/30 hover:border-white/20"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-cyan-500/30">
                  Most Popular
                </div>
              )}

              <div className="text-sm font-bold uppercase tracking-wider text-slate-400">{tier.name}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">{tier.tagline}</div>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">${price.split(".")[0]}</span>
                <span className="text-xl font-bold text-white/60">.{price.split(".")[1]}</span>
                <span className="text-slate-400 text-lg">/mo</span>
              </div>

              {hosted && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400/70">
                  <Cloud size={12} />
                  Includes fully managed hosting
                </div>
              )}
              {!hosted && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Server size={12} />
                  Self-hosted on your server
                </div>
              )}

              <p className="mt-4 text-sm text-slate-400 leading-relaxed">{tier.description}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${tier.highlighted ? "text-cyan-400" : "text-slate-500"}`}
                    />
                    {feature}
                  </li>
                ))}
                {hosted && (
                  <>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80 pt-2 border-t border-white/5">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      Fully managed hosting
                    </li>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      24/7 uptime monitoring
                    </li>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      Automatic software updates
                    </li>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      Zero server management
                    </li>
                  </>
                )}
              </ul>

              <div className="mt-8">
                <button
                  onClick={() =>
                    router.push(`/onboarding?plan=${tier.id}&hosting=${hosted ? "managed" : "self-hosted"}`)
                  }
                  className={`group w-full flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-bold transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════ GUARANTEES ROW ═══════════════ */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
          <Shield size={22} className="shrink-0 text-emerald-400" />
          <div>
            <div className="text-sm font-bold text-emerald-400">14-Day Money-Back</div>
            <div className="text-xs text-slate-400">Full refund, no questions asked.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-4">
          <Lock size={22} className="shrink-0 text-cyan-400" />
          <div>
            <div className="text-sm font-bold text-cyan-400">Bank-Grade Security</div>
            <div className="text-xs text-slate-400">Encrypted keys, no withdrawal access.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-6 py-4">
          <RefreshCw size={22} className="shrink-0 text-purple-400" />
          <div>
            <div className="text-sm font-bold text-purple-400">Cancel Anytime</div>
            <div className="text-xs text-slate-400">No contracts, no lock-in period.</div>
          </div>
        </div>
      </div>

      {/* ═══════════════ WHAT'S INCLUDED ═══════════════ */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="mb-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Every Plan Includes
          </div>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            The full engine. <span className="text-cyan-400">No compromises.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
            Unlike other platforms that gate features behind higher tiers, every Nova plan ships with the complete trading engine.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whatsIncluded.map((item) => {
            const colorMap: Record<string, { border: string; icon: string; bg: string }> = {
              cyan: { border: "border-cyan-500/10 hover:border-cyan-500/25", icon: "text-cyan-400", bg: "bg-cyan-500/10" },
              blue: { border: "border-blue-500/10 hover:border-blue-500/25", icon: "text-blue-400", bg: "bg-blue-500/10" },
              purple: { border: "border-purple-500/10 hover:border-purple-500/25", icon: "text-purple-400", bg: "bg-purple-500/10" },
              emerald: { border: "border-emerald-500/10 hover:border-emerald-500/25", icon: "text-emerald-400", bg: "bg-emerald-500/10" },
              pink: { border: "border-pink-500/10 hover:border-pink-500/25", icon: "text-pink-400", bg: "bg-pink-500/10" },
              amber: { border: "border-amber-500/10 hover:border-amber-500/25", icon: "text-amber-400", bg: "bg-amber-500/10" },
            };
            const c = colorMap[item.color];
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group rounded-2xl border bg-slate-900/20 p-6 transition-all duration-300 hover:bg-slate-900/40 ${c.border}`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                  <Icon size={20} className={`${c.icon} transition-transform group-hover:scale-110`} />
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ FEATURE COMPARISON TABLE ═══════════════ */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">Full Feature Comparison</h2>
          <p className="mt-3 text-sm text-slate-400">See exactly what&apos;s included in every plan.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left font-bold text-white min-w-[240px]">Feature</th>
                <th className="px-6 py-4 text-center font-bold text-slate-400 min-w-[120px]">
                  <div>Starter</div>
                  <div className="text-xs font-normal text-slate-500 mt-0.5">
                    from ${hosted ? "99.99" : "49.99"}/mo
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-bold text-cyan-400 min-w-[120px]">
                  <div className="flex items-center justify-center gap-1.5">
                    Pro
                    <Star size={12} className="text-cyan-400" />
                  </div>
                  <div className="text-xs font-normal text-cyan-400/60 mt-0.5">
                    from ${hosted ? "149.99" : "99.99"}/mo
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-bold text-slate-400 min-w-[120px]">
                  <div>Elite</div>
                  <div className="text-xs font-normal text-slate-500 mt-0.5">
                    from ${hosted ? "249.99" : "199.99"}/mo
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let lastCategory = "";
                return comparisonFeatures.map((row, i) => {
                  const showCategory = row.category !== lastCategory;
                  lastCategory = row.category;
                  return (
                    <React.Fragment key={`row-${i}`}>
                      {showCategory && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={4} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                            {row.category}
                          </td>
                        </tr>
                      )}
                      <tr
                        className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                      >
                        <td className="px-6 py-3 text-slate-300">{row.feature}</td>
                        {(["starter", "pro", "elite"] as const).map((tier) => {
                          const val = row[tier];
                          return (
                            <td key={tier} className="px-6 py-3 text-center">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <Check size={16} className="mx-auto text-cyan-400" />
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )
                              ) : (
                                <span className="font-mono text-white text-xs">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════ HOSTED vs SELF-HOSTED DETAILS ═══════════════ */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">
            Hosting <span className="text-cyan-400">Options</span>
          </h2>
          <p className="mt-3 text-sm text-slate-400">Not sure which hosting option is right for you? Here&apos;s the breakdown.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                <Server size={22} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Self-Hosted</h3>
                <p className="text-xs text-slate-500">You manage the server</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-slate-500" />
                Full control over your infrastructure
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-slate-500" />
                API keys never leave your server
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-slate-500" />
                Docker image + setup guide provided
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-slate-500" />
                You handle updates and monitoring
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-slate-500" />
                Recommended: 2+ CPU, 4GB+ RAM, Ubuntu 22+
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 text-xs text-slate-500">
              Best for: developers, technical users, privacy-first traders
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/[0.04] to-transparent p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <Cloud size={22} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hosted by Horizon</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-cyan-400">We manage everything</p>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">RECOMMENDED</span>
                </div>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-cyan-400" />
                Dedicated instance on our infrastructure
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-cyan-400" />
                24/7 monitoring and automatic restarts
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-cyan-400" />
                Automatic software updates — always latest version
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-cyan-400" />
                Zero server management or DevOps required
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-cyan-400" />
                Live in under 5 minutes — connect keys and go
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-cyan-500/5 border border-cyan-500/10 px-4 py-3 text-xs text-cyan-400/80">
              Best for: non-technical users, hands-off traders, maximum uptime
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
      <div className="relative border-y border-cyan-500/10 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 py-10 -mx-6 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.04),transparent)]" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "2,847+", label: "Active Traders", color: "text-white" },
            { value: "1.2M+", label: "Trades Executed", color: "text-cyan-400" },
            { value: "99.9%", label: "Uptime SLA", color: "text-emerald-400" },
            { value: "< 50ms", label: "Execution Speed", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl font-extrabold md:text-4xl ${stat.color}`}>{stat.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ FAQ ═══════════════ */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-purple-400">
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Questions? <span className="text-purple-400">Answered.</span>
          </h2>
          <p className="mt-3 text-sm text-slate-400">Everything you need to know before getting started.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="rounded-xl border border-white/5 bg-slate-900/30 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-bold text-white pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="shrink-0 text-cyan-400" />
                ) : (
                  <ChevronDown size={18} className="shrink-0 text-slate-500" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-sm leading-relaxed text-slate-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="pt-16">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Ready to automate your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              trading?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Join thousands of traders running Nova. Plans start at $49.99/mo. 14-day money-back guarantee.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-10 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Choose Your Plan
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield size={12} className="text-emerald-400" />
              14-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="text-cyan-400" />
              Encrypted & secure
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-purple-400" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Headphones size={12} className="text-amber-400" />
              Support included
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
