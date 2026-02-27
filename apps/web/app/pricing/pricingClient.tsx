"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Shield, Server, Cloud, Zap, ChevronDown, ChevronUp } from "lucide-react";

type Tier = {
  name: string;
  id: string;
  selfPrice: number;
  hostedPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    id: "starter",
    selfPrice: 29,
    hostedPrice: 79,
    description: "Perfect for getting started. Full bot access with all 12 AI strategies.",
    features: [
      "Full NovaPulse bot access",
      "12 AI trading strategies",
      "Multi-exchange (Kraken, Coinbase, Alpaca)",
      "Real-time dashboard",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    id: "pro",
    selfPrice: 79,
    hostedPrice: 129,
    description: "For serious traders. Priority support and custom strategy tuning.",
    features: [
      "Everything in Starter",
      "Priority support (< 4hr response)",
      "Custom strategy weight tuning",
      "Advanced risk configuration",
      "Telegram/Discord alerts",
      "Performance reports",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    id: "elite",
    selfPrice: 149,
    hostedPrice: 199,
    description: "Maximum edge. Multiple bots, dedicated resources, 1-on-1 onboarding.",
    features: [
      "Everything in Pro",
      "Up to 3 bot instances",
      "Dedicated VPS resources",
      "Custom strategy development",
      "1-on-1 onboarding call",
      "SLA uptime guarantee",
      "Direct Slack channel",
    ],
    highlighted: false,
  },
];

const comparisonFeatures = [
  { feature: "AI Trading Strategies", starter: "12", pro: "12", elite: "12 + Custom" },
  { feature: "Exchanges Supported", starter: "3", pro: "3", elite: "3" },
  { feature: "Bot Instances", starter: "1", pro: "1", elite: "Up to 3" },
  { feature: "Real-Time Dashboard", starter: true, pro: true, elite: true },
  { feature: "Custom Strategy Tuning", starter: false, pro: true, elite: true },
  { feature: "Priority Support", starter: false, pro: true, elite: true },
  { feature: "Telegram/Discord Alerts", starter: false, pro: true, elite: true },
  { feature: "Performance Reports", starter: false, pro: true, elite: true },
  { feature: "Dedicated Resources", starter: false, pro: false, elite: true },
  { feature: "1-on-1 Onboarding", starter: false, pro: false, elite: true },
  { feature: "SLA Guarantee", starter: false, pro: false, elite: true },
  { feature: "Custom Strategy Dev", starter: false, pro: false, elite: true },
];

const faqs = [
  {
    q: "What's the difference between self-hosted and Horizon-hosted?",
    a: "Self-hosted: you run the NovaPulse Docker container on your own VPS. You handle the server, we handle the software. Horizon-hosted: we provision, monitor, and maintain a dedicated bot instance for you on our infrastructure. Zero server management — just connect your exchange keys and go."
  },
  {
    q: "What exchanges does Nova support?",
    a: "Kraken and Coinbase for crypto trading, plus Alpaca for US stock trading. Each exchange runs its own engine with cross-exchange risk management."
  },
  {
    q: "Can I switch between self-hosted and managed?",
    a: "Yes. You can upgrade to Horizon-hosted or switch to self-hosted at any time from your settings. We'll help migrate your bot configuration."
  },
  {
    q: "How many trades does the bot make?",
    a: "It depends on market conditions. The confluence engine requires multiple AI strategies to agree before executing. In normal conditions, expect several trades per day across crypto and stocks."
  },
  {
    q: "Can I pause or stop trading?",
    a: "Absolutely. Full control via the dashboard — pause trading, close all positions, or adjust risk parameters at any time."
  },
  {
    q: "What's your refund policy?",
    a: "14-day money-back guarantee on all plans. If Nova isn't for you, email us within 14 days for a full refund. No questions asked."
  },
];

export function PricingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const [hosted, setHosted] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">Pricing</div>
        <h1 className="text-4xl font-extrabold text-white md:text-6xl leading-tight">
          Invest in your
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">edge.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Every plan includes the full NovaPulse AI engine. Pick your tier, pick your hosting.
        </p>
      </div>

      {status === "success" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-emerald-600/40 bg-emerald-500/5 p-4 text-sm text-emerald-200 text-center">
          Subscription activated! Your bot is being provisioned. Check your dashboard shortly.
        </div>
      )}
      {status === "cancel" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-600/40 bg-amber-500/5 p-4 text-sm text-amber-200 text-center">
          Checkout canceled. You can resume anytime.
        </div>
      )}

      {/* Hosting Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center rounded-2xl border border-white/10 bg-slate-900/50 p-1.5">
          <button
            onClick={() => setHosted(false)}
            className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
              !hosted ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server size={16} />
            Self-Hosted
          </button>
          <button
            onClick={() => setHosted(true)}
            className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
              hosted ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cloud size={16} />
            Hosted by Horizon
          </button>
          {/* Sliding background */}
          <div
            className={`absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out ${
              hosted
                ? "left-[calc(50%+3px)] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                : "left-1.5 bg-white/10 border border-white/10"
            }`}
          />
        </div>

        {hosted && (
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <Zap size={12} />
            Recommended — We handle everything. Zero server management.
          </div>
        )}
        {!hosted && (
          <p className="text-xs text-slate-500">You provide the VPS. We provide the Docker image + setup guide.</p>
        )}
      </div>

      {/* Tier Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const price = hosted ? tier.hostedPrice : tier.selfPrice;
          return (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 transition-all ${
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

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">${price}</span>
                <span className="text-slate-400 text-lg">/mo</span>
              </div>

              {hosted && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400/70">
                  <Cloud size={12} />
                  Includes managed hosting (+$50)
                </div>
              )}

              <p className="mt-4 text-sm text-slate-400 leading-relaxed">{tier.description}</p>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check size={16} className={`mt-0.5 shrink-0 ${tier.highlighted ? "text-cyan-400" : "text-slate-500"}`} />
                    {feature}
                  </li>
                ))}
                {hosted && (
                  <>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      Fully managed hosting
                    </li>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      24/7 uptime monitoring
                    </li>
                    <li className="flex items-start gap-3 text-sm text-cyan-300/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                      Automatic updates
                    </li>
                  </>
                )}
              </ul>

              <div className="mt-8">
                <button
                  onClick={() => router.push(`/onboarding?plan=${tier.id}&hosting=${hosted ? "managed" : "self"}`)}
                  className={`w-full rounded-xl px-4 py-4 text-sm font-bold transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guarantee */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-8 py-4">
          <Shield size={24} className="text-emerald-400" />
          <div className="text-left">
            <div className="text-sm font-bold text-emerald-400">14-Day Money-Back Guarantee</div>
            <div className="text-xs text-slate-400">Not satisfied? Full refund, no questions asked.</div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="mx-auto flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10"
        >
          {showComparison ? "Hide" : "Show"} Full Feature Comparison
          {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showComparison && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left font-bold text-white">Feature</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-400">Starter</th>
                  <th className="px-6 py-4 text-center font-bold text-cyan-400">Pro</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-400">Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                    <td className="px-6 py-3.5 text-slate-300">{row.feature}</td>
                    {(["starter", "pro", "elite"] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-6 py-3.5 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check size={16} className="mx-auto text-cyan-400" />
                            ) : (
                              <span className="text-slate-600">—</span>
                            )
                          ) : (
                            <span className="font-mono text-white">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white text-center mb-10">Questions? Answered.</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-white/5 bg-slate-900/30 overflow-hidden transition-all">
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
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
