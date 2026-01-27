import { LegalLayout } from "../components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 10, 2026">
      <p className="lead text-xl text-slate-200">
        By accessing Horizon Services, you agree to the following terms. Please read them carefully—they govern your subscription and our liability.
      </p>

      <h3>1. Educational Nature</h3>
      <p>
        <strong>Horizon Services is not a registered investment advisor.</strong> All content, signals, and data provided are for educational and informational purposes only. We do not provide personalized financial advice.
      </p>
      <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
        <p className="mb-0 text-sm text-blue-200">
          <strong>Trading Risk Warning:</strong> Trading financial assets involves a high degree of risk and the potential for significant loss. You should only trade with capital you can afford to lose.
        </p>
      </div>

      <h3>2. The "No-Repainting" Guarantee</h3>
      <p>
        We guarantee that historical signals displayed in our audit logs accurately reflect the data as it was generated at the time of the alert. We do not retroactively edit entry prices or timestamps to make performance look better ("repainting").
      </p>

      <h3>3. Subscription & Refunds</h3>
      <p>
        <strong>Billing:</strong> Subscriptions bill automatically in advance on a monthly or annual basis.<br/>
        <strong>Cancellation:</strong> You may cancel at any time via the Settings page. Access continues until the end of the billing cycle.<br/>
        <strong>Refunds:</strong> We offer a 7-day money-back guarantee for first-time subscribers.
      </p>

      <h3>4. Prohibited Conduct</h3>
      <ul>
        <li><strong>Redistribution:</strong> You may not scrape, forward, or resell our proprietary signals.</li>
        <li><strong>Account Sharing:</strong> Accounts are for single-user access only. Concurrent logins may trigger security locks.</li>
        <li><strong>Reverse Engineering:</strong> You may not attempt to decompile our signal engine logic.</li>
      </ul>

      <h3>5. Limitation of Liability</h3>
      <p>
        To the maximum extent permitted by law, Horizon Services shall not be liable for any direct, indirect, or consequential damages resulting from your use of the service. You are solely responsible for your trading decisions.
      </p>
    </LegalLayout>
  );
}