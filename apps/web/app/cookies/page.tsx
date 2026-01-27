import { LegalLayout } from "../components/LegalLayout";

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="January 15, 2026">
      <p>
        Horizon Services believes in minimal digital footprints. We use cookies strictly for authentication, security, and essential site functionality. We do not use third-party tracking pixels for advertising resale.
      </p>

      <h3>1. What Are Cookies?</h3>
      <p>
        Cookies are small text files stored on your device that allow us to recognize your session. They are the digital equivalent of a "handshake" between your browser and our server.
      </p>

      <h3>2. How We Use Them</h3>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for login (JWT tokens) and Stripe payment processing.</li>
        <li><strong>Security Cookies:</strong> Used by Cloudflare and our internal firewalls to detect botnets and rate-limit abuse.</li>
        <li><strong>Analytics:</strong> We use self-hosted PostHog instances to measure site performance. This data stays on our servers and is never shared with Google or Meta.</li>
      </ul>

      <h3>3. Managing Your Preferences</h3>
      <p>
        You can disable cookies in your browser settings, but please note that the <strong>Dashboard, Alerts, and Billing</strong> features will cease to function. The public marketing site will remain accessible.
      </p>

      <h3>4. Third-Party Processors</h3>
      <p>
        We rely on the following trusted partners who may set cookies during your interaction with specific features:
      </p>
      <ul>
        <li><strong>Stripe:</strong> For secure payment processing and fraud detection.</li>
        <li><strong>Firebase:</strong> For secure authentication and session management.</li>
      </ul>
    </LegalLayout>
  );
}
