import { baseLayout, ctaButton, escapeHtml, infoRow, warningBox } from "./base-layout.js";
import type { PasswordChangedData, FailedLoginData, AccountLockedData, PersonalInfoChangedData } from "./types.js";

const SITE = "https://horizonsvc.com";

/* ── 1. Verify Email ── */
export function verifyEmail(url: string, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: "Verify your email to access your Nova dashboard",
    title: "Verify Your Email",
    subtitle: "One step to unlock your dashboard",
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Thanks for joining <strong style="color:#4f46e5;">Nova by Horizon</strong>. To access your institutional dashboard and start receiving real-time trading signals, please verify your email address.
      </p>
      ${ctaButton("Verify Email Address", url)}
      <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
        If you didn't create an account, you can safely ignore this email. This link expires in 24 hours.
      </p>
    `,
  });
}

/* ── 2. Welcome Email ── */
export function welcomeEmail(firstName: string, unsubscribeUrl?: string): string {
  const safe = escapeHtml(firstName);
  return baseLayout({
    preheader: `Welcome aboard, ${safe}! Your dashboard is ready.`,
    title: "Welcome Aboard",
    subtitle: "Your dashboard is unlocked",
    headerStyle: "success",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your email is verified and your Nova dashboard is now fully unlocked. Here's what you can access:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="padding:12px 16px;background-color:#f0fdf4;border-radius:8px;border-left:4px solid #059669;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="padding:4px 0;font-size:14px;color:#065f46;font-weight:600;">Real-Time Trading Signals</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#065f46;font-weight:600;">Live Bot Dashboard & P&L Tracking</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#065f46;font-weight:600;">AI-Powered Strategy Analytics</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#065f46;font-weight:600;">Professional Screener Tools</td></tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
        If you have any questions, our support team responds within 15 minutes, 24/7.
      </p>
      ${ctaButton("Launch Dashboard", `${SITE}/dashboard`, "#059669")}
    `,
  });
}

/* ── 3. Password Changed ── */
export function passwordChanged(data: PasswordChangedData, unsubscribeUrl?: string): string {
  const safe = escapeHtml(data.firstName);
  return baseLayout({
    preheader: "Your Horizon account password was changed",
    title: "Password Changed",
    subtitle: "Your account security was updated",
    headerStyle: "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your account password was successfully changed. Here are the details:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("When", data.timestamp)}
        ${infoRow("IP Address", data.ipAddress)}
      </table>
      ${warningBox("If you did not make this change, please reset your password immediately and contact our support team at <a href=\"mailto:support@horizonsvc.com\" style=\"color:#92400e;font-weight:600;\">support@horizonsvc.com</a> or call <a href=\"tel:+18643053993\" style=\"color:#92400e;font-weight:600;\">+1 864-305-3993</a>.")}
    `,
  });
}

/* ── 4. Failed Login Warning ── */
export function failedLoginWarning(data: FailedLoginData, unsubscribeUrl?: string): string {
  const safe = escapeHtml(data.firstName);
  return baseLayout({
    preheader: `We detected ${data.attemptCount} failed login attempts on your account`,
    title: "Failed Login Attempts",
    subtitle: "Unusual activity detected",
    headerStyle: "warning",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        We detected <strong style="color:#b45309;">${data.attemptCount} failed login attempt${data.attemptCount > 1 ? "s" : ""}</strong> on your account. If this was you, you can disregard this email.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Attempts", String(data.attemptCount))}
        ${infoRow("Last Attempt", data.timestamp)}
        ${infoRow("IP Address", data.ipAddress)}
      </table>
      ${warningBox("If this wasn't you, we strongly recommend changing your password right away.")}
      ${ctaButton("Secure Your Account", `${SITE}/auth`, "#b45309")}
    `,
  });
}

/* ── 5. Account Locked ── */
export function accountLocked(data: AccountLockedData, unsubscribeUrl?: string): string {
  const safe = escapeHtml(data.firstName);
  return baseLayout({
    preheader: "Your Horizon account has been temporarily locked for your protection",
    title: "Account Locked",
    subtitle: "Temporarily locked for your protection",
    headerStyle: "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your account has been <strong style="color:#dc2626;">temporarily locked</strong> due to multiple failed login attempts. This is an automatic security measure to protect your account.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Locked At", data.timestamp)}
        ${infoRow("IP Address", data.ipAddress)}
        ${infoRow("Lock Duration", "30 minutes")}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#991b1b;">Need help? We're here 24/7.</p>
            <p style="margin:0 0 4px;font-size:13px;color:#991b1b;line-height:1.5;">
              Our support team responds within <strong>15 minutes</strong>.
            </p>
            <p style="margin:8px 0 0;font-size:13px;color:#991b1b;line-height:1.5;">
              Email: <a href="mailto:support@horizonsvc.com" style="color:#991b1b;font-weight:600;">support@horizonsvc.com</a><br/>
              Phone: <a href="tel:+18643053993" style="color:#991b1b;font-weight:600;">+1 864-305-3993</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
        Your account will automatically unlock after 30 minutes. If you believe this was an error, contact support and we'll resolve it immediately.
      </p>
    `,
  });
}

/* ── 6. Personal Info Changed ── */
export function personalInfoChanged(data: PersonalInfoChangedData, unsubscribeUrl?: string): string {
  const safe = escapeHtml(data.firstName);
  const fieldList = data.changedFields.map((f) => escapeHtml(f)).join(", ");
  return baseLayout({
    preheader: `Your account information (${fieldList}) was updated`,
    title: "Account Info Updated",
    subtitle: "Your personal information was changed",
    headerStyle: "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        The following account information was updated:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Fields Changed", fieldList)}
        ${infoRow("When", data.timestamp)}
        ${infoRow("IP Address", data.ipAddress)}
      </table>
      ${warningBox("If you did not make these changes, please contact our support team immediately at <a href=\"mailto:support@horizonsvc.com\" style=\"color:#92400e;font-weight:600;\">support@horizonsvc.com</a> or call <a href=\"tel:+18643053993\" style=\"color:#92400e;font-weight:600;\">+1 864-305-3993</a>.")}
    `,
  });
}

/* ── 7. Account Deactivated ── */
export function accountDeactivated(firstName: string, unsubscribeUrl?: string): string {
  const safe = escapeHtml(firstName);
  return baseLayout({
    preheader: "Your Horizon account has been deactivated",
    title: "Account Deactivated",
    subtitle: "We're sorry to see you go",
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your Horizon account has been deactivated as requested. We're sorry to see you go.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:#f3f4f6;border-radius:8px;padding:20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">What happens next:</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;line-height:1.5;">- Your data will be retained for 30 days in case you change your mind.</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;line-height:1.5;">- After 30 days, your data will be permanently deleted.</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">- To reactivate, simply contact our support team.</p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
        If you have any feedback or changed your mind, reach us at
        <a href="mailto:support@horizonsvc.com" style="color:#4f46e5;font-weight:600;">support@horizonsvc.com</a>
        or <a href="tel:+18643053993" style="color:#4f46e5;font-weight:600;">+1 864-305-3993</a>.
      </p>
    `,
  });
}
