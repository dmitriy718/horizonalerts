import { baseLayout, ctaButton, escapeHtml } from "./base-layout.js";

const SITE = "https://horizonsvc.com";

/* ── 8. Bot Setup Started ── */
export function botSetupStarted(firstName: string, botLabel: string, unsubscribeUrl?: string): string {
  const safe = escapeHtml(firstName);
  const safeLabel = escapeHtml(botLabel);
  return baseLayout({
    preheader: `We're setting up your trading bot "${safeLabel}"`,
    title: "Bot Setup In Progress",
    subtitle: `Setting up "${safeLabel}"`,
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        We're provisioning your trading bot <strong style="color:#4f46e5;">${safeLabel}</strong>. Here's what's happening:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="padding:16px 20px;background-color:#eff6ff;border-radius:8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#1e40af;">
                  <strong style="display:inline-block;width:24px;height:24px;background-color:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">1</strong>
                  Provisioning dedicated server resources
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#1e40af;">
                  <strong style="display:inline-block;width:24px;height:24px;background-color:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">2</strong>
                  Configuring exchange connections & API keys
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#1e40af;">
                  <strong style="display:inline-block;width:24px;height:24px;background-color:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">3</strong>
                  Running initial strategy calibration
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#1e40af;">
                  <strong style="display:inline-block;width:24px;height:24px;background-color:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">4</strong>
                  Sending you credentials once everything is live
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
        You'll receive a confirmation email with your bot URL and API key once setup is complete. If you have questions, reach us at
        <a href="mailto:support@horizonsvc.com" style="color:#4f46e5;">support@horizonsvc.com</a>.
      </p>
    `,
  });
}

/* ── 9. Bot Setup Complete ── */
export function botSetupComplete(firstName: string, botLabel: string, dashboardUrl?: string, unsubscribeUrl?: string): string {
  const safe = escapeHtml(firstName);
  const safeLabel = escapeHtml(botLabel);
  const dash = dashboardUrl || `${SITE}/dashboard`;
  return baseLayout({
    preheader: `Your trading bot "${safeLabel}" is live and ready to trade!`,
    title: "Your Bot Is Live!",
    subtitle: `"${safeLabel}" is ready to trade`,
    headerStyle: "success",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your trading bot <strong style="color:#059669;">${safeLabel}</strong> has been successfully set up and is now live. Everything is configured and your bot is actively monitoring the markets.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;text-align:center;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#059669;">Status: Active</p>
            <p style="margin:0;font-size:12px;color:#6b7280;">Your bot is monitoring markets and ready to execute trades.</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">Next steps:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;line-height:1.5;">1. Connect your bot in <a href="${SITE}/settings" style="color:#4f46e5;">Settings &rarr; Trading Bot</a> using the credentials from your welcome email</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;line-height:1.5;">2. View live P&L, positions, and AI activity on your dashboard</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;line-height:1.5;">3. Configure your notification preferences to stay informed</td></tr>
      </table>
      ${ctaButton("Open Dashboard", dash, "#059669")}
    `,
  });
}
