import { LegalLayout } from "../components/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 12, 2026">
      <p className="lead text-xl text-slate-200">
        Your trading data is your edge. We don't sell it, we don't leak it, and we don't front-run it.
      </p>

      <h3>1. Data Collection Philosophy</h3>
      <p>
        Horizon Services collects the absolute minimum amount of data required to provide you with accurate, timely alerts. We define "Personal Data" strictly as information that can directly identify you (e.g., email address, UID). We do not collect behavioral advertising profiles.
      </p>

      <h3>2. What We Collect</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="mt-0 text-white">Identity & Access</h4>
          <p className="text-sm">Email address (for login/alerts) and a hashed password. We use Firebase Auth, so we never see your raw password.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="mt-0 text-white">Billing Info</h4>
          <p className="text-sm">Processed entirely by Stripe. We only store a customer ID (e.g., <code>cus_123</code>) and subscription status.</p>
        </div>
      </div>

      <h3>3. Signal Usage Data</h3>
      <p>
        We track which signals you view or "save" to your Portfolio within the app. This is used solely to:
      </p>
      <ul>
        <li>Improve our algorithm's relevance to your trading style.</li>
        <li>Calculate your personal performance metrics.</li>
        <li>Detect account sharing abuse.</li>
      </ul>

      <h3>4. Data Retention</h3>
      <p>
        <strong>Active Accounts:</strong> Data is retained indefinitely to maintain your trading journal and audit history.<br/>
        <strong>Deleted Accounts:</strong> When you request deletion, we hard-delete your personal identifiers within 30 days. Signal interaction logs are anonymized and kept for aggregate statistical modeling.
      </p>

      <h3>5. Third-Party Sharing</h3>
      <p>
        We do not sell data to hedge funds, HFT firms, or advertisers. We only share data with infrastructure providers (AWS, Vercel, Neon) necessary to run the code.
      </p>
    </LegalLayout>
  );
}