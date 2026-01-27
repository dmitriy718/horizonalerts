import { Suspense } from "react";
import { PricingClient } from "./pricingClient";

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white md:text-6xl mb-6">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Pricing.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            One winning trade pays for the year. Stop paying "gurus" $200/mo for repainted charts. Get institutional data at a retail price.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        }>
          <PricingClient />
        </Suspense>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Manage your subscription directly from the Settings dashboard. No phone calls, no dark patterns." },
              { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for your first month. If it's not for you, just email us." },
              { q: "Is the data real-time?", a: "Pro members get <50ms latency alerts. Free members see the Public Feed which is delayed by 15 minutes." },
            ].map((faq, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <h4 className="font-bold text-white text-lg mb-2">{faq.q}</h4>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}