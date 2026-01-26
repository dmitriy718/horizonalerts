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

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Pricing</h1>
        <p className="mt-2 text-slate-300">
          Transparent tiers with no promises of fixed win rates.
        </p>
      </div>
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
            <button className="mt-6 w-full rounded-md bg-horizon-500 px-4 py-2 text-sm font-semibold text-white">
              Start {tier.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
