"use client";

import { useSearchParams } from "next/navigation";
import { BillingButtons } from "../ui/BillingButtons";

const tiers = [
  {
    name: "Plain",
    price: "$0",
    description: "5 alerts per day, no customization, email verification required.",
    features: ["Delayed public feed", "Basic dashboard", "Email support"]
  },
  {
    name: "Pro",
    price: "$49/mo",
    description: "Unlimited alerts, full customization, playbook modes.",
    features: [
      "Unlimited alerts",
      "Scanner presets",
      "Options filters",
      "Portfolio tracking"
    ]
  }
];

export function PricingClient() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold text-white">Pricing</h1>
        <p className="mt-2 text-slate-300">
          Transparent tiers with no promises of fixed win rates.
        </p>
      </div>
      {status === "success" && (
        <div className="glass rounded-xl border border-emerald-600/40 p-4 text-sm text-emerald-200">
          Subscription activated. Check your email for confirmation.
        </div>
      )}
      {status === "cancel" && (
        <div className="glass rounded-xl border border-amber-600/40 p-4 text-sm text-amber-200">
          Checkout canceled. You can resume anytime.
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {tiers.map((tier) => (
          <div key={tier.name} className="glass rounded-2xl p-6">
            <div className="text-sm uppercase text-slate-400">{tier.name}</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {tier.price}
            </div>
            <p className="mt-2 text-sm text-slate-300">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {tier.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <div className="mt-6">
              {tier.name === "Pro" ? (
                <BillingButtons mode="checkout" />
              ) : (
                <button className="w-full rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200">
                  Start {tier.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
