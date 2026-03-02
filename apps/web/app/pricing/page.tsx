import { Suspense } from "react";
import { PricingClient } from "./pricingClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "AI trading bot plans — self-hosted from $49.99/mo or fully managed from $99.99/mo. All 12 AI strategies included. 14-day money-back guarantee.",
  openGraph: {
    title: "Pricing | Nova by Horizon",
    description: "AI trading bot plans — self-hosted or fully managed. All 12 AI strategies included.",
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nova AI Trading Bot",
  "description": "Autonomous AI trading bot with 12 strategies for crypto and stocks.",
  "brand": { "@type": "Brand", "name": "Horizon Services" },
  "offers": [
    {
      "@type": "Offer",
      "name": "Self-Hosted",
      "price": "49.99",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      "name": "Pro (Managed)",
      "price": "99.99",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
    },
  ],
};

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
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
