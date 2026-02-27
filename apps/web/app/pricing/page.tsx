import { Suspense } from "react";
import { PricingClient } from "./pricingClient";

export const metadata = {
  title: "Pricing | Nova by Horizon",
  description: "AI trading bot plans — self-hosted from $49.99/mo or fully managed from $99.99/mo. All 12 AI strategies included. 14-day money-back guarantee.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-6xl px-6 space-y-20">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        }>
          <PricingClient />
        </Suspense>
      </div>
    </div>
  );
}
