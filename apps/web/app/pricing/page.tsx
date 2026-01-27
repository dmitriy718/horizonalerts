import { Suspense } from "react";
import { PricingClient } from "./pricingClient";

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <PricingClient />
      </Suspense>
    </div>
  );
}
