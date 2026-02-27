"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    id: "starter",
    price: "$49",
    period: "/mo",
    description: "Self-hosted bot. You run it on your own server with your exchange keys.",
    features: [
      "Full NovaPulse bot access",
      "12 AI trading strategies",
      "Multi-exchange support",
      "Real-time dashboard",
      "Community support",
      "Self-hosted (your VPS)",
    ],
    cta: "Start Self-Hosted",
    highlighted: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$149",
    period: "/mo",
    description: "Managed bot instance. We host, monitor, and keep your bot running 24/7.",
    features: [
      "Everything in Starter",
      "Fully managed hosting",
      "24/7 uptime monitoring",
      "Automatic updates",
      "Priority support",
      "Custom strategy tuning",
    ],
    cta: "Get Managed Bot",
    highlighted: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    period: "",
    description: "Multiple bot instances, dedicated infrastructure, and white-glove onboarding.",
    features: [
      "Everything in Pro",
      "Multiple bot instances",
      "Dedicated VPS resources",
      "Custom strategy development",
      "1-on-1 onboarding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "What exchanges does Nova support?",
    a: "Nova currently supports Kraken and Coinbase for crypto trading, and Alpaca for US stock trading. Each exchange runs its own engine with shared risk management across all."
  },
  {
    q: "What's the difference between self-hosted and managed?",
    a: "Self-hosted means you run the NovaPulse bot on your own VPS (we provide the Docker image and setup guide). Managed means we host and monitor your bot instance on our infrastructure — zero server management on your end."
  },
  {
    q: "Can I see the bot's performance before subscribing?",
    a: "Yes. Once subscribed, your dashboard shows real-time P&L, win rate, Sharpe ratio, every trade with entry/exit prices, and the AI's reasoning for each decision. No simulated or hypothetical numbers."
  },
  {
    q: "How many trades does the bot make?",
    a: "It depends on market conditions. The bot uses a confluence engine that requires multiple AI strategies to agree before executing. In normal conditions, expect several trades per day across crypto and stocks."
  },
  {
    q: "Can I pause or stop the bot?",
    a: "Yes. You have full control via the dashboard — pause trading, close all positions, or adjust risk parameters at any time."
  },
];

export function PricingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          Simple, transparent pricing.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Every plan includes the full NovaPulse AI trading engine. Pick managed hosting or bring your own server.
        </p>
      </div>

      {status === "success" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-emerald-600/40 bg-emerald-500/5 p-4 text-sm text-emerald-200 text-center">
          Subscription activated! Your bot is being provisioned. Check your dashboard in a few minutes.
        </div>
      )}
      {status === "cancel" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-600/40 bg-amber-500/5 p-4 text-sm text-amber-200 text-center">
          Checkout canceled. You can resume anytime.
        </div>
      )}

      {/* Tiers */}
      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-8 transition-all ${
              tier.highlighted
                ? "border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/5 to-transparent shadow-lg shadow-cyan-500/10"
                : "border border-white/10 bg-slate-900/30"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-black uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="text-sm font-bold uppercase tracking-wider text-slate-400">{tier.name}</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              {tier.period && <span className="text-slate-400">{tier.period}</span>}
            </div>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">{tier.description}</p>

            <ul className="mt-6 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                onClick={() => {
                  if (tier.id === "enterprise") {
                    router.push("/contact");
                  } else {
                    router.push(`/onboarding?plan=${tier.id}`);
                  }
                }}
                className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-white/5 bg-slate-900/30 p-6">
              <h3 className="font-bold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
