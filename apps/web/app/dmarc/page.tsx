import { LegalLayout } from "../components/LegalLayout";

export default function DmarcPage() {
  return (
    <LegalLayout title="Email Security (DMARC)" lastUpdated="January 20, 2026">
      <p>
        Horizon Services enforces strict email security protocols to protect our members from phishing and spoofing attacks. We will never ask for your password or private keys via email.
      </p>

      <h3>1. Our Sending Domains</h3>
      <p>
        Official communication from Horizon Services will <strong>only</strong> originate from the following authenticated domains:
      </p>
      <ul>
        <li><code>@horizonsvc.com</code> (Transactional Alerts & Support)</li>
        <li><code>@horizonalerts.com</code> (Legacy/Redirects)</li>
      </ul>

      <h3>2. SPF, DKIM, and DMARC</h3>
      <p>
        We publish strict DMARC policies (<code>p=reject</code>). If you receive an email claiming to be from us that fails authentication, your email provider should automatically reject it.
      </p>

      <h3>3. Verify an Email</h3>
      <p>
        If you are unsure about the legitimacy of a message, look for the "Signed by: horizonsvc.com" header in your email client. If it is missing or says "via sendgrid.net" without our signature, treat it as suspicious.
      </p>

      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <h4 className="mt-0 text-red-400">🚨 Red Flags</h4>
        <ul className="mb-0 text-sm text-red-200">
          <li>We never attach .exe or .zip files.</li>
          <li>We never ask for crypto wallet seed phrases.</li>
          <li>We never demand "urgent" payment via obscure crypto addresses.</li>
        </ul>
      </div>

      <h3>4. Reporting Abuse</h3>
      <p>
        Please forward any suspicious emails referencing our brand to <a href="mailto:security@horizonsvc.com">security@horizonsvc.com</a>.
      </p>
    </LegalLayout>
  );
}
